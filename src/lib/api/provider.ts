/**
 * Data-source abstraction.
 *
 * Default source is the local catalog built from the client's Excel exports
 * (src/data/catalog.json). With NEXT_PUBLIC_DATA_SOURCE=woo plus WC_API_URL /
 * WC_CONSUMER_KEY / WC_CONSUMER_SECRET, everything — names, prices, sizes,
 * images, rich descriptions, scientific specs, COA links — is served live
 * from WordPress/WooCommerce (seeded by scripts/seed-woocommerce.ts +
 * scripts/upload-media.ts, editable in wp-admin via the ACF field group).
 */
import "server-only";
import type { Catalog, Category, Product } from "@/lib/types";
import catalogJson from "@/data/catalog.json";

export interface CatalogProvider {
  getCatalog(): Promise<Catalog>;
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  getCategories(): Promise<Category[]>;
}

/* ------------------------------- local provider ------------------------------ */

const local: CatalogProvider = {
  async getCatalog() {
    return catalogJson as Catalog;
  },
  async getProducts() {
    return (catalogJson as Catalog).products.filter(
      (p) => p.status === "active",
    );
  },
  async getProduct(id) {
    return (
      (catalogJson as Catalog).products.find((p) => p.id === id) ?? null
    );
  },
  async getCategories() {
    return (catalogJson as Catalog).categories;
  },
};

/* ---------------------------- WooCommerce provider --------------------------- */

interface WooProduct {
  id: number;
  slug: string;
  name: string;
  status: string;
  type: string;
  featured: boolean;
  average_rating: string;
  rating_count: number;
  description: string;
  short_description: string;
  images: { src: string }[];
  categories: { slug: string }[];
  meta_data: { key: string; value: unknown }[];
}

interface WooVariation {
  id: number;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  attributes: { option: string }[];
  image?: { src: string } | null;
}

const REVALIDATE = 60;

function wooAuth() {
  const url = process.env.WC_API_URL;
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;
  if (!url || !key || !secret) {
    throw new Error(
      "WooCommerce data source selected but WC_API_URL / WC_CONSUMER_KEY / WC_CONSUMER_SECRET are not set",
    );
  }
  return {
    base: url.replace(/\/$/, ""),
    headers: {
      Authorization:
        "Basic " + Buffer.from(`${key}:${secret}`).toString("base64"),
    },
  };
}

async function wooGet<T>(route: string): Promise<T> {
  const { base, headers } = wooAuth();
  const res = await fetch(`${base}/wp-json/wc/v3${route}`, {
    headers,
    next: { revalidate: REVALIDATE, tags: ["catalog"] },
  });
  if (!res.ok) {
    throw new Error(`WooCommerce fetch ${route} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

const meta = (p: WooProduct, key: string): string => {
  const m = p.meta_data?.find((x) => x.key === key);
  return typeof m?.value === "string" ? m.value : "";
};

const stripTags = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8211;/g, "–")
    .replace(/\s+/g, " ")
    .trim();

const KNOWN_CATS = new Set(
  (catalogJson as Catalog).categories.map((c) => c.id),
);

const truthy = (v: string) => v === "1" || v === "yes" || v === "true";

function toProduct(p: WooProduct, variations: WooVariation[]): Product {
  const sizes = variations.map((v) => ({
    size: v.attributes[0]?.option ?? "",
    price: parseFloat(v.price || v.regular_price || "0") || 0,
    compareAt:
      v.sale_price && v.regular_price
        ? parseFloat(v.regular_price) || null
        : null,
    image: v.image?.src ?? null,
  }));

  const applications = meta(p, "research_applications")
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*-\s*/, "").trim())
    .filter(Boolean);

  const hasReviews = p.rating_count > 0;
  const coaFile = meta(p, "coa_file");

  return {
    id: p.slug,
    name: p.name,
    sub: meta(p, "sub_title"),
    cat:
      p.categories?.map((c) => c.slug).find((s) => KNOWN_CATS.has(s)) ??
      "cellular",
    featured: p.featured,
    popular: truthy(meta(p, "popular")),
    images: p.images?.map((i) => i.src) ?? [],
    sizes: sizes.length
      ? sizes
      : [{ size: "", price: 0, compareAt: null, image: null }],
    rating: hasReviews
      ? parseFloat(p.average_rating) || 4.8
      : parseFloat(meta(p, "display_rating")) || 4.8,
    reviews: hasReviews
      ? p.rating_count
      : parseInt(meta(p, "display_reviews"), 10) || 24,
    shortDesc: stripTags(p.short_description ?? ""),
    longDescPlain: p.description ?? "",
    longDescSci: meta(p, "long_description_scientific"),
    moaPlain: meta(p, "mechanism_of_action_plain"),
    moaSci: meta(p, "mechanism_of_action_scientific"),
    researchStudies: meta(p, "research_studies"),
    references: meta(p, "references"),
    applications,
    specs: {
      altNames: meta(p, "alternate_names_synonyms"),
      cas: meta(p, "cas_number"),
      form: meta(p, "form"),
      formula: meta(p, "molecular_formula"),
      mw: meta(p, "molecular_weight_mw"),
      purity: meta(p, "purity"),
      sequence: meta(p, "sequence"),
      storage: meta(p, "storage_conditions"),
    },
    coa: coaFile ? { file: coaFile, label: meta(p, "coa_label") } : null,
    status: p.status === "publish" ? "active" : "draft",
  };
}

async function variationsFor(p: WooProduct): Promise<WooVariation[]> {
  if (p.type !== "variable") return [];
  /* orderby=id asc = seed order = size order */
  return wooGet<WooVariation[]>(
    `/products/${p.id}/variations?per_page=100&orderby=id&order=asc`,
  );
}

const woo: CatalogProvider = {
  async getCatalog() {
    return {
      categories: await woo.getCategories(),
      products: await woo.getProducts(),
    };
  },
  async getProducts() {
    const list = await wooGet<WooProduct[]>(
      "/products?per_page=100&status=publish",
    );
    const withVars = await Promise.all(
      list.map(async (p) => toProduct(p, await variationsFor(p))),
    );
    /* keep the catalog's curated ordering where possible */
    const order = new Map(
      (catalogJson as Catalog).products.map((p, i) => [p.id, i]),
    );
    return withVars.sort(
      (a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99),
    );
  },
  async getProduct(id) {
    const list = await wooGet<WooProduct[]>(
      `/products?slug=${encodeURIComponent(id)}`,
    );
    if (!list.length) return null;
    return toProduct(list[0], await variationsFor(list[0]));
  },
  async getCategories() {
    /* category colors/blurbs are design tokens; ids/names mirror the WP terms */
    return (catalogJson as Catalog).categories;
  },
};

export const provider: CatalogProvider =
  process.env.NEXT_PUBLIC_DATA_SOURCE === "woo" ? woo : local;
