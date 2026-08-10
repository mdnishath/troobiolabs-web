/**
 * Seed a WordPress/WooCommerce store from src/data/catalog.json.
 *
 * Creates the product categories, then each product as a variable product with
 * a "Size" attribute, per-size variations (price + compare-at), and all
 * scientific metadata as product meta_data (matching the Shopify metafields).
 *
 * Requires env vars (e.g. in .env.local):
 *   WC_API_URL=https://your-wp-site.com
 *   WC_CONSUMER_KEY=ck_xxx
 *   WC_CONSUMER_SECRET=cs_xxx
 *
 * Run: npx tsx scripts/seed-woocommerce.ts [--dry-run]
 */
import * as fs from "node:fs";
import * as path from "node:path";

const DRY = process.argv.includes("--dry-run");

const catalog = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "..", "src", "data", "catalog.json"),
    "utf8",
  ),
) as {
  categories: { id: string; name: string; blurb: string }[];
  products: {
    id: string;
    name: string;
    sub: string;
    cat: string;
    featured: boolean;
    popular: boolean;
    rating: number;
    reviews: number;
    images: string[];
    sizes: { size: string; price: number; compareAt: number | null }[];
    shortDesc: string;
    longDescPlain: string;
    longDescSci: string;
    moaPlain: string;
    moaSci: string;
    researchStudies: string;
    references: string;
    applications: string[];
    specs: Record<string, string>;
    status: string;
  }[];
};

const BASE = (process.env.WC_API_URL ?? "").replace(/\/$/, "");
const KEY = process.env.WC_CONSUMER_KEY ?? "";
const SECRET = process.env.WC_CONSUMER_SECRET ?? "";

if (!DRY && (!BASE || !KEY || !SECRET)) {
  console.error(
    "Missing WC_API_URL / WC_CONSUMER_KEY / WC_CONSUMER_SECRET. " +
      "Set them in the environment or run with --dry-run to preview payloads.",
  );
  process.exit(1);
}

const AUTH = "Basic " + Buffer.from(`${KEY}:${SECRET}`).toString("base64");

async function wc<T>(
  method: "GET" | "POST" | "PUT",
  route: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE}/wp-json/wc/v3${route}`, {
    method,
    headers: { Authorization: AUTH, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`${method} ${route} -> ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

async function main() {
  /* 1. categories ---------------------------------------------------------- */
  const catIds = new Map<string, number>();
  for (const c of catalog.categories) {
    if (DRY) {
      console.log(`[dry] category ${c.id}: ${c.name}`);
      continue;
    }
    const existing = await wc<{ id: number; slug: string }[]>(
      "GET",
      `/products/categories?slug=${c.id}`,
    );
    const cat =
      existing[0] ??
      (await wc<{ id: number }>("POST", "/products/categories", {
        name: c.name,
        slug: c.id,
        description: c.blurb,
      }));
    catIds.set(c.id, cat.id);
    console.log(`category ${c.id} -> #${cat.id}`);
  }

  /* 2. products ------------------------------------------------------------ */
  for (const p of catalog.products) {
    const payload = {
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
        {
          name: "Size",
          visible: true,
          variation: true,
          options: p.sizes.map((s) => s.size),
        },
      ],
      meta_data: [
        { key: "sub_title", value: p.sub },
        { key: "popular", value: p.popular ? "1" : "0" },
        { key: "display_rating", value: String(p.rating) },
        { key: "display_reviews", value: String(p.reviews) },
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

    if (DRY) {
      console.log(`[dry] product ${p.id} (${p.sizes.length} variations)`);
      continue;
    }

    const existing = await wc<{ id: number }[]>(
      "GET",
      `/products?slug=${p.id}`,
    );
    const product = existing[0]
      ? await wc<{ id: number }>("PUT", `/products/${existing[0].id}`, payload)
      : await wc<{ id: number }>("POST", "/products", payload);

    for (const s of p.sizes) {
      const vPayload = {
        sku: `${p.id}-${s.size}`,
        regular_price: String(s.compareAt ?? s.price),
        sale_price: s.compareAt ? String(s.price) : undefined,
        attributes: [{ name: "Size", option: s.size }],
      };
      const vars = await wc<{ id: number; attributes: { option: string }[] }[]>(
        "GET",
        `/products/${product.id}/variations?per_page=50`,
      );
      const match = vars.find((v) =>
        v.attributes.some((a) => a.option === s.size),
      );
      if (match) {
        await wc("PUT", `/products/${product.id}/variations/${match.id}`, vPayload);
      } else {
        await wc("POST", `/products/${product.id}/variations`, vPayload);
      }
    }
    console.log(`product ${p.id} -> #${product.id} (${p.sizes.length} variations)`);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
