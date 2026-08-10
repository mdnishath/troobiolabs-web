/**
 * Data-source abstraction.
 *
 * Default source is the local catalog built from the client's Excel exports
 * (src/data/catalog.json). When a WordPress/WooCommerce backend is available,
 * set NEXT_PUBLIC_DATA_SOURCE=woo plus WC_API_URL / WC_CONSUMER_KEY /
 * WC_CONSUMER_SECRET and the same interface is served from the live store.
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
  slug: string;
  name: string;
  status: string;
  images: { src: string }[];
  categories: { slug: string }[];
  meta_data: { key: string; value: unknown }[];
  variations: number[];
  attributes: { name: string; options: string[] }[];
  price: string;
  regular_price: string;
  short_description: string;
}

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

const meta = (p: WooProduct, key: string): string => {
  const m = p.meta_data?.find((x) => x.key === key);
  return typeof m?.value === "string" ? m.value : "";
};

/** Map a WooCommerce product (created by scripts/seed-woocommerce.ts) to our model. */
function fromWoo(p: WooProduct, fallback: Product | null): Product {
  const base: Product =
    fallback ??
    ({
      id: p.slug,
      name: p.name,
      sub: "",
      cat: p.categories?.[0]?.slug ?? "cellular",
      featured: false,
      popular: false,
      images: p.images?.map((i) => i.src) ?? [],
      sizes: [],
      rating: 4.8,
      reviews: 0,
      shortDesc: p.short_description ?? "",
      longDescPlain: "",
      longDescSci: "",
      moaPlain: "",
      moaSci: "",
      researchStudies: "",
      references: "",
      applications: [],
      specs: {
        altNames: "",
        cas: "",
        form: "",
        formula: "",
        mw: "",
        purity: "",
        sequence: "",
        storage: "",
      },
      coa: null,
      status: p.status === "publish" ? "active" : "draft",
    } as Product);
  return {
    ...base,
    name: p.name || base.name,
    shortDesc: p.short_description || base.shortDesc,
    specs: { ...base.specs, cas: meta(p, "cas_number") || base.specs.cas },
    status: p.status === "publish" ? "active" : base.status,
  };
}

const woo: CatalogProvider = {
  async getCatalog() {
    return {
      categories: await woo.getCategories(),
      products: await woo.getProducts(),
    };
  },
  async getProducts() {
    const { base, headers } = wooAuth();
    const res = await fetch(`${base}/wp-json/wc/v3/products?per_page=100`, {
      headers,
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`WooCommerce products fetch failed: ${res.status}`);
    const list = (await res.json()) as WooProduct[];
    const localProducts = (catalogJson as Catalog).products;
    return list.map((p) =>
      fromWoo(p, localProducts.find((l) => l.id === p.slug) ?? null),
    );
  },
  async getProduct(id) {
    const all = await woo.getProducts();
    return all.find((p) => p.id === id) ?? null;
  },
  async getCategories() {
    return (catalogJson as Catalog).categories;
  },
};

export const provider: CatalogProvider =
  process.env.NEXT_PUBLIC_DATA_SOURCE === "woo" ? woo : local;
