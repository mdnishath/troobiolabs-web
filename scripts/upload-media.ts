/**
 * Uploads product images and COA PDFs to the WordPress Media Library and
 * attaches them to the seeded WooCommerce products/variations.
 *
 * - Product images (public/images/products/<handle>/*.webp) -> product gallery
 *   (first image = featured) and per-size variation images
 * - COA PDFs (public/docs/coa/*.pdf) -> media library; product meta coa_file
 *   (URL) + coa_label (lot number)
 *
 * Idempotent: media is looked up by slug before uploading.
 *
 * Env: WC_API_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET (see .env.local)
 * Run: npx tsx scripts/upload-media.ts
 */
import * as fs from "node:fs";
import * as path from "node:path";

const APP = path.resolve(__dirname, "..");
const BASE = (process.env.WC_API_URL ?? "").replace(/\/$/, "");
const KEY = process.env.WC_CONSUMER_KEY ?? "";
const SECRET = process.env.WC_CONSUMER_SECRET ?? "";

if (!BASE || !KEY || !SECRET) {
  console.error("Missing WC_API_URL / WC_CONSUMER_KEY / WC_CONSUMER_SECRET");
  process.exit(1);
}

const AUTH = "Basic " + Buffer.from(`${KEY}:${SECRET}`).toString("base64");

/** Retry transient local-server connection drops. */
async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt >= 4) throw e;
      console.warn(`  retry ${attempt} for ${label}…`);
      await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }
}

async function api<T>(
  method: string,
  route: string,
  body?: unknown,
): Promise<T> {
  return withRetry(async () => {
    const res = await fetch(`${BASE}/wp-json${route}`, {
      method,
      headers: { Authorization: AUTH, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      throw new Error(`${method} ${route} -> ${res.status}: ${(await res.text()).slice(0, 300)}`);
    }
    return res.json() as Promise<T>;
  }, `${method} ${route}`);
}

interface Media {
  id: number;
  slug: string;
  source_url: string;
}

/** Upload a file to the media library, reusing an existing attachment by slug. */
async function ensureMedia(filePath: string, slugBase: string): Promise<Media> {
  const existing = await api<Media[]>(
    "GET",
    `/wp/v2/media?slug=${encodeURIComponent(slugBase)}&per_page=1`,
  );
  if (existing.length) return existing[0];

  const data = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const type =
    ext === ".webp" ? "image/webp" : ext === ".png" ? "image/png" : "application/pdf";
  return withRetry(async () => {
    const res = await fetch(`${BASE}/wp-json/wp/v2/media`, {
      method: "POST",
      headers: {
        Authorization: AUTH,
        "Content-Type": type,
        "Content-Disposition": `attachment; filename="${slugBase}${ext}"`,
      },
      body: new Uint8Array(data),
    });
    if (!res.ok) {
      throw new Error(`media upload ${slugBase} -> ${res.status}: ${(await res.text()).slice(0, 300)}`);
    }
    return res.json() as Promise<Media>;
  }, `upload ${slugBase}`);
}

interface WooProduct {
  id: number;
  slug: string;
}

interface WooVariation {
  id: number;
  sku: string;
}

const catalog = JSON.parse(
  fs.readFileSync(path.join(APP, "src", "data", "catalog.json"), "utf8"),
) as {
  products: {
    id: string;
    images: string[];
    sizes: { size: string; image: string | null }[];
    coa: { file: string; label: string } | null;
  }[];
};

async function main() {
  const wooProducts = await api<WooProduct[]>(
    "GET",
    "/wc/v3/products?per_page=100",
  );
  const bySlug = new Map(wooProducts.map((p) => [p.slug, p.id]));

  for (const p of catalog.products) {
    const productId = bySlug.get(p.id);
    if (!productId) {
      console.warn(`! no woo product for ${p.id}`);
      continue;
    }

    /* ---- images -> media -> product gallery --------------------------- */
    const mediaByLocal = new Map<string, Media>();
    for (let i = 0; i < p.images.length; i++) {
      const local = p.images[i];
      const file = path.join(APP, "public", local);
      if (!fs.existsSync(file)) continue;
      const media = await ensureMedia(file, `${p.id}-${i + 1}`);
      mediaByLocal.set(local, media);
    }
    if (mediaByLocal.size) {
      await api("PUT", `/wc/v3/products/${productId}`, {
        images: [...mediaByLocal.values()].map((m) => ({ id: m.id })),
      });
    }

    /* ---- variation images --------------------------------------------- */
    const withVariantImages = p.sizes.filter(
      (s) => s.image && mediaByLocal.has(s.image),
    );
    if (withVariantImages.length) {
      const variations = await api<WooVariation[]>(
        "GET",
        `/wc/v3/products/${productId}/variations?per_page=100`,
      );
      for (const s of withVariantImages) {
        const v = variations.find((x) => x.sku === `${p.id}-${s.size}`);
        if (!v) continue;
        await api("PUT", `/wc/v3/products/${productId}/variations/${v.id}`, {
          image: { id: mediaByLocal.get(s.image!)!.id },
        });
      }
    }

    /* ---- COA pdf -------------------------------------------------------- */
    let coaNote = "";
    if (p.coa) {
      const pdfLocal = decodeURIComponent(p.coa.file); // "/docs/coa/<name>.pdf"
      const pdfFile = path.join(APP, "public", pdfLocal);
      if (fs.existsSync(pdfFile)) {
        const media = await ensureMedia(pdfFile, `coa-${p.id}`);
        await api("PUT", `/wc/v3/products/${productId}`, {
          meta_data: [
            { key: "coa_file", value: media.source_url },
            { key: "coa_label", value: p.coa.label },
          ],
        });
        coaNote = ` coa:${p.coa.label}`;
      }
    }

    console.log(
      `${p.id} -> #${productId} imgs:${mediaByLocal.size} varImgs:${withVariantImages.length}${coaNote}`,
    );
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
