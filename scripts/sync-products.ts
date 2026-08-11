/**
 * One-by-one product sync: catalog.json (built from "All Products.xlsx") ->
 * WooCommerce, with per-product read-back verification (up to 3 attempts).
 *
 * For each product, in catalog order:
 *   1. upsert the product (all fields + scientific meta) and its Size variations
 *   2. upload/attach the optimized webp images (product gallery + per-size
 *      variation images) and the COA PDF meta
 *   3. re-fetch everything from WooCommerce and compare field-by-field;
 *      on mismatch, re-apply and re-verify (max 3 attempts)
 *
 * Usage:
 *   npx tsx scripts/sync-products.ts                 # sync + verify all
 *   npx tsx scripts/sync-products.ts --verify-only   # compare only, no writes
 *   npx tsx scripts/sync-products.ts --slugs a,b,c   # limit to specific handles
 *
 * Env: WC_API_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET
 */
import * as fs from "node:fs";
import * as path from "node:path";

const APP = path.resolve(__dirname, "..");
const BASE = (process.env.WC_API_URL ?? "").replace(/\/$/, "");
const KEY = process.env.WC_CONSUMER_KEY ?? "";
const SECRET = process.env.WC_CONSUMER_SECRET ?? "";
const VERIFY_ONLY = process.argv.includes("--verify-only");
const slugsArg = process.argv.find((a) => a.startsWith("--slugs"));
const ONLY = slugsArg
  ? (process.argv[process.argv.indexOf(slugsArg) + 1] ?? slugsArg.split("=")[1] ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : null;

if (!BASE || !KEY || !SECRET) {
  console.error("Missing WC_API_URL / WC_CONSUMER_KEY / WC_CONSUMER_SECRET");
  process.exit(1);
}

const AUTH = "Basic " + Buffer.from(`${KEY}:${SECRET}`).toString("base64");

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt >= 4) throw e;
      await new Promise((r) => setTimeout(r, 700 * attempt));
    }
  }
}

async function api<T>(method: string, route: string, body?: unknown): Promise<T> {
  return withRetry(async () => {
    const res = await fetch(`${BASE}/wp-json${route}`, {
      method,
      headers: { Authorization: AUTH, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      throw new Error(`${method} ${route} -> ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
    return res.json() as Promise<T>;
  });
}

/* ------------------------------- catalog types ------------------------------- */

interface CatVariant {
  size: string;
  price: number;
  compareAt: number | null;
  image: string | null;
}
interface CatProduct {
  id: string;
  name: string;
  sub: string;
  vendor: string;
  cat: string;
  featured: boolean;
  popular: boolean;
  images: string[];
  sizes: CatVariant[];
  rating: number;
  reviews: number;
  shortDesc: string;
  seoDesc: string;
  longDescPlain: string;
  longDescSci: string;
  moaPlain: string;
  moaSci: string;
  researchStudies: string;
  references: string;
  applications: string[];
  specs: Record<string, string>;
  coa: { file: string; label: string } | null;
  status: string;
}

const catalog = JSON.parse(
  fs.readFileSync(path.join(APP, "src", "data", "catalog.json"), "utf8"),
) as { categories: { id: string; name: string; blurb: string }[]; products: CatProduct[] };

/* ------------------------------- woo helpers -------------------------------- */

interface WooProduct {
  id: number;
  slug: string;
  name: string;
  status: string;
  type: string;
  featured: boolean;
  description: string;
  short_description: string;
  images: { id: number; src: string }[];
  categories: { id: number; slug: string }[];
  meta_data: { key: string; value: unknown }[];
}
interface WooVariation {
  id: number;
  price: string;
  regular_price: string;
  sale_price: string;
  attributes: { option: string }[];
  image?: { id: number; src: string } | null;
}
interface Media {
  id: number;
  slug: string;
  source_url: string;
}

const metaOf = (p: WooProduct, key: string): string => {
  const m = p.meta_data?.find((x) => x.key === key);
  return typeof m?.value === "string" ? m.value : "";
};

const textNorm = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;| /g, " ")
    .replace(/&#(\d+);/g, (_m, n: string) => String.fromCodePoint(Number(n)))
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[\s]+/g, " ")
    .trim();

/* mirrors WP sanitize_title: lowercase, non-alphanumerics collapse to single dashes */
const mediaSlug = (localPath: string) =>
  path
    .basename(decodeURIComponent(localPath), path.extname(localPath))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

async function ensureMedia(local: string): Promise<Media> {
  const slug = mediaSlug(local);
  const existing = await api<Media[]>("GET", `/wp/v2/media?slug=${slug}&per_page=1`);
  if (existing.length) return existing[0];
  const file = path.join(APP, "public", decodeURIComponent(local));
  const data = fs.readFileSync(file);
  const ext = path.extname(file).toLowerCase();
  const type = ext === ".webp" ? "image/webp" : ext === ".png" ? "image/png" : "application/pdf";
  return withRetry(async () => {
    const res = await fetch(`${BASE}/wp-json/wp/v2/media`, {
      method: "POST",
      headers: {
        Authorization: AUTH,
        "Content-Type": type,
        "Content-Disposition": `attachment; filename="${slug}${ext}"`,
      },
      body: new Uint8Array(data),
    });
    if (!res.ok) throw new Error(`media ${slug} -> ${res.status}`);
    return res.json() as Promise<Media>;
  });
}

/* --------------------------------- payloads ---------------------------------- */

function productPayload(p: CatProduct, catIds: Map<string, number>) {
  return {
    name: p.name,
    slug: p.id,
    sku: p.id,
    type: "variable",
    status: p.status === "active" ? "publish" : "draft",
    featured: p.featured,
    short_description: p.shortDesc,
    description: p.longDescPlain,
    categories: catIds.has(p.cat) ? [{ id: catIds.get(p.cat)! }] : [],
    attributes: [
      { name: "Size", visible: true, variation: true, options: p.sizes.map((s) => s.size) },
    ],
    meta_data: [
      { key: "sub_title", value: p.sub },
      { key: "vendor", value: p.vendor },
      { key: "popular", value: p.popular ? "1" : "0" },
      { key: "display_rating", value: String(p.rating) },
      { key: "display_reviews", value: String(p.reviews) },
      { key: "seo_title", value: "" },
      { key: "seo_description", value: p.seoDesc },
      { key: "additional_notes", value: "" },
      { key: "long_description_scientific", value: p.longDescSci },
      { key: "mechanism_of_action_plain", value: p.moaPlain },
      { key: "mechanism_of_action_scientific", value: p.moaSci },
      { key: "research_studies", value: p.researchStudies },
      { key: "references", value: p.references },
      { key: "research_applications", value: p.applications.join("\n") },
      { key: "alternate_names_synonyms", value: p.specs.altNames },
      { key: "cas_number", value: p.specs.cas },
      { key: "form", value: p.specs.form },
      { key: "molecular_formula", value: p.specs.formula },
      { key: "molecular_weight_mw", value: p.specs.mw },
      { key: "purity", value: p.specs.purity },
      { key: "sequence", value: p.specs.sequence },
      { key: "storage_conditions", value: p.specs.storage },
    ],
  };
}

/* ---------------------------------- verify ----------------------------------- */

async function verify(p: CatProduct, productId: number): Promise<string[]> {
  const problems: string[] = [];
  const w = await api<WooProduct>("GET", `/wc/v3/products/${productId}`);
  const vars = await api<WooVariation[]>(
    "GET",
    `/wc/v3/products/${productId}/variations?per_page=100&orderby=id&order=asc`,
  );

  if (w.name !== p.name) problems.push(`name: '${w.name}' != '${p.name}'`);
  if (w.slug !== p.id) problems.push(`slug: '${w.slug}' != '${p.id}'`);
  const expStatus = p.status === "active" ? "publish" : "draft";
  if (w.status !== expStatus) problems.push(`status: ${w.status} != ${expStatus}`);
  if (w.featured !== p.featured) problems.push(`featured: ${w.featured} != ${p.featured}`);
  if (!w.categories.some((c) => c.slug === p.cat)) problems.push(`category missing: ${p.cat}`);

  /* sizes */
  if (vars.length !== p.sizes.length) {
    problems.push(`variations: ${vars.length} != ${p.sizes.length}`);
  } else {
    for (const s of p.sizes) {
      const v = vars.find((x) => x.attributes[0]?.option === s.size);
      if (!v) {
        problems.push(`size missing: ${s.size}`);
        continue;
      }
      if (parseFloat(v.price) !== s.price)
        problems.push(`${s.size} price: ${v.price} != ${s.price}`);
      const expRegular = s.compareAt ?? s.price;
      if (parseFloat(v.regular_price) !== expRegular)
        problems.push(`${s.size} regular: ${v.regular_price} != ${expRegular}`);
      if (s.image) {
        const expSlug = mediaSlug(s.image);
        if (!v.image?.src?.includes(expSlug))
          problems.push(`${s.size} image: '${v.image?.src ?? "none"}' !~ ${expSlug}`);
      }
    }
  }

  /* images */
  if (p.images.length) {
    if (w.images.length !== p.images.length) {
      problems.push(`images: ${w.images.length} != ${p.images.length}`);
    } else {
      p.images.forEach((img, i) => {
        const expSlug = mediaSlug(img);
        if (!w.images[i]?.src?.includes(expSlug))
          problems.push(`image[${i}]: '${w.images[i]?.src}' !~ ${expSlug}`);
      });
    }
  }

  /* text content (normalized) */
  if (textNorm(w.short_description) !== textNorm(p.shortDesc))
    problems.push(`short_description text differs`);
  if (textNorm(w.description) !== textNorm(p.longDescPlain))
    problems.push(`description text differs`);

  /* exact meta */
  const metaChecks: [string, string][] = [
    ["sub_title", p.sub],
    ["vendor", p.vendor],
    ["popular", p.popular ? "1" : "0"],
    ["display_rating", String(p.rating)],
    ["display_reviews", String(p.reviews)],
    ["long_description_scientific", p.longDescSci],
    ["mechanism_of_action_plain", p.moaPlain],
    ["mechanism_of_action_scientific", p.moaSci],
    ["research_studies", p.researchStudies],
    ["references", p.references],
    ["research_applications", p.applications.join("\n")],
    ["alternate_names_synonyms", p.specs.altNames],
    ["cas_number", p.specs.cas],
    ["form", p.specs.form],
    ["molecular_formula", p.specs.formula],
    ["molecular_weight_mw", p.specs.mw],
    ["purity", p.specs.purity],
    ["sequence", p.specs.sequence],
    ["storage_conditions", p.specs.storage],
  ];
  for (const [key, expected] of metaChecks) {
    const got = metaOf(w, key);
    if (textNorm(got) !== textNorm(expected))
      problems.push(`meta ${key}: '${got.slice(0, 50)}' != '${expected.slice(0, 50)}'`);
  }

  /* coa */
  if (p.coa) {
    if (metaOf(w, "coa_label") !== p.coa.label)
      problems.push(`coa_label: '${metaOf(w, "coa_label")}' != '${p.coa.label}'`);
    if (!/\.pdf$/i.test(metaOf(w, "coa_file")))
      problems.push(`coa_file not set`);
  }

  return problems;
}

/* ----------------------------------- apply ------------------------------------ */

async function apply(p: CatProduct, catIds: Map<string, number>): Promise<number> {
  const existing = await api<WooProduct[]>("GET", `/wc/v3/products?slug=${p.id}&status=any`);
  const payload = productPayload(p, catIds);
  const product = existing[0]
    ? await api<WooProduct>("PUT", `/wc/v3/products/${existing[0].id}`, payload)
    : await api<WooProduct>("POST", "/wc/v3/products", payload);

  /* variations */
  const vars = await api<WooVariation[]>(
    "GET",
    `/wc/v3/products/${product.id}/variations?per_page=100&orderby=id&order=asc`,
  );
  /* remove variations whose size no longer exists */
  for (const v of vars) {
    if (!p.sizes.some((s) => s.size === v.attributes[0]?.option)) {
      await api("DELETE", `/wc/v3/products/${product.id}/variations/${v.id}?force=true`);
    }
  }
  for (const s of p.sizes) {
    const vPayload: Record<string, unknown> = {
      sku: `${p.id}-${s.size}`,
      regular_price: String(s.compareAt ?? s.price),
      sale_price: s.compareAt ? String(s.price) : "",
      attributes: [{ name: "Size", option: s.size }],
    };
    if (s.image) {
      const media = await ensureMedia(s.image);
      vPayload.image = { id: media.id };
    }
    const match = vars.find((v) => v.attributes[0]?.option === s.size);
    if (match) {
      await api("PUT", `/wc/v3/products/${product.id}/variations/${match.id}`, vPayload);
    } else {
      await api("POST", `/wc/v3/products/${product.id}/variations`, vPayload);
    }
  }

  /* product gallery */
  if (p.images.length) {
    const media = [];
    for (const img of p.images) media.push(await ensureMedia(img));
    await api("PUT", `/wc/v3/products/${product.id}`, {
      images: media.map((m) => ({ id: m.id })),
    });
  }

  /* coa pdf */
  if (p.coa) {
    const pdf = await ensureMedia(p.coa.file);
    await api("PUT", `/wc/v3/products/${product.id}`, {
      meta_data: [
        { key: "coa_file", value: pdf.source_url },
        { key: "coa_label", value: p.coa.label },
      ],
    });
  }

  return product.id;
}

/* ------------------------------------ main ------------------------------------ */

async function main() {
  /* categories */
  const catIds = new Map<string, number>();
  for (const c of catalog.categories) {
    const found = await api<{ id: number; slug: string }[]>(
      "GET",
      `/products/categories?slug=${c.id}`.replace("/products", "/wc/v3/products"),
    );
    const cat =
      found[0] ??
      (await api<{ id: number }>("POST", "/wc/v3/products/categories", {
        name: c.name,
        slug: c.id,
        description: c.blurb,
      }));
    catIds.set(c.id, cat.id);
  }

  const targets = catalog.products.filter((p) => !ONLY || ONLY.includes(p.id));
  const failures: string[] = [];
  let ok = 0;

  for (const p of targets) {
    if (VERIFY_ONLY) {
      const existing = await api<WooProduct[]>("GET", `/wc/v3/products?slug=${p.id}&status=any`);
      if (!existing.length) {
        console.log(`MISSING  ${p.id}`);
        failures.push(`${p.id}: not in WooCommerce`);
        continue;
      }
      const problems = await verify(p, existing[0].id);
      if (problems.length) {
        console.log(`MISMATCH ${p.id}:`);
        problems.forEach((x) => console.log(`   - ${x}`));
        failures.push(`${p.id}: ${problems.length} mismatches`);
      } else {
        console.log(`OK       ${p.id}`);
        ok++;
      }
      continue;
    }

    let done = false;
    for (let attempt = 1; attempt <= 3 && !done; attempt++) {
      const productId = await apply(p, catIds);
      const problems = await verify(p, productId);
      if (!problems.length) {
        console.log(`OK  ${p.id} -> #${productId}${attempt > 1 ? ` (attempt ${attempt})` : ""}`);
        ok++;
        done = true;
      } else if (attempt === 3) {
        console.log(`FAIL ${p.id} after 3 attempts:`);
        problems.forEach((x) => console.log(`   - ${x}`));
        failures.push(`${p.id}: ${problems.join("; ").slice(0, 200)}`);
      }
    }
  }

  console.log(`\n${ok}/${targets.length} verified OK${failures.length ? `, ${failures.length} FAILED` : ""}`);
  if (failures.length) {
    failures.forEach((f) => console.log("  ! " + f));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
