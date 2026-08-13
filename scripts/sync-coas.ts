/**
 * Push every published COA (scripts/coa-map.ts) to WordPress.
 *
 * For each product handle it resolves each report PDF in the Media Library
 * (uploading it from ../pdf only if it is not there yet) and writes:
 *   coa_reports — one line per report: LOT | URL | PURITY | IDENTITY | NOTE
 *   coa_file    — primary (first) report URL   \ kept for older readers
 *   coa_label   — primary report lot           /
 * Then it reads the product back and verifies every line.
 *
 * Usage:
 *   npx tsx scripts/sync-coas.ts                 # sync + verify
 *   npx tsx scripts/sync-coas.ts --verify-only   # compare only, no writes
 *   npx tsx scripts/sync-coas.ts --slugs a,b     # limit to specific handles
 *
 * Env: WC_API_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { COA_REPORTS, type CoaReport } from "./coa-map";

const APP = path.resolve(__dirname, "..");
const PDF_DIR = path.resolve(APP, "..", "pdf");
const BASE = (process.env.WC_API_URL ?? "").replace(/\/$/, "");
const KEY = process.env.WC_CONSUMER_KEY ?? "";
const SECRET = process.env.WC_CONSUMER_SECRET ?? "";
const VERIFY_ONLY = process.argv.includes("--verify-only");
const slugsArg = process.argv.indexOf("--slugs");
const ONLY =
  slugsArg >= 0
    ? (process.argv[slugsArg + 1] ?? "").split(",").map((s) => s.trim()).filter(Boolean)
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

interface WooProduct {
  id: number;
  slug: string;
  name: string;
  meta_data: { key: string; value: unknown }[];
}
interface Media {
  id: number;
  source_url: string;
}

const metaOf = (p: WooProduct, key: string): string => {
  const m = p.meta_data?.find((x) => x.key === key);
  return typeof m?.value === "string" ? m.value : "";
};

/** "AARLL-3548854-P - BPC-157 - Purity.pdf" -> "aarll-3548854-p-bpc-157-purity" */
const normalize = (file: string) =>
  path
    .basename(file, path.extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* ------------------------------ media resolution ----------------------------- */

/** normalized basename -> media, oldest upload wins (that is the one already linked) */
async function loadPdfMedia(): Promise<Map<string, Media>> {
  const byName = new Map<string, Media>();
  for (let page = 1; ; page++) {
    const batch = await api<Media[]>(
      "GET",
      `/wp/v2/media?mime_type=application/pdf&per_page=100&orderby=id&order=asc&page=${page}`,
    );
    for (const m of batch) {
      const key = normalize(new URL(m.source_url).pathname);
      if (!byName.has(key)) byName.set(key, m);
    }
    if (batch.length < 100) break;
  }
  return byName;
}

async function uploadPdf(pdf: string): Promise<Media> {
  const file = path.join(PDF_DIR, pdf);
  const data = fs.readFileSync(file);
  return withRetry(async () => {
    const res = await fetch(`${BASE}/wp-json/wp/v2/media`, {
      method: "POST",
      headers: {
        Authorization: AUTH,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${normalize(pdf)}.pdf"`,
      },
      body: new Uint8Array(data),
    });
    if (!res.ok) throw new Error(`media ${pdf} -> ${res.status}`);
    return res.json() as Promise<Media>;
  });
}

/* --------------------------------- meta value -------------------------------- */

const line = (r: CoaReport, url: string) =>
  [r.lot, url, r.purity, r.identity, r.note ?? ""].join(" | ").replace(/\s+\|\s*$/, "");

/* ----------------------------------- main ------------------------------------ */

async function main() {
  const media = await loadPdfMedia();
  console.log(`Media library: ${media.size} PDFs`);

  const handles = Object.keys(COA_REPORTS).filter((h) => !ONLY || ONLY.includes(h));
  let ok = 0;
  const failed: string[] = [];

  for (const handle of handles) {
    const reports = COA_REPORTS[handle];
    const found = await api<WooProduct[]>("GET", `/wc/v3/products?slug=${handle}`);
    const product = found[0];
    if (!product) {
      console.log(`✗ ${handle}: no such product`);
      failed.push(handle);
      continue;
    }

    const lines: string[] = [];
    for (const r of reports) {
      let m = media.get(normalize(r.pdf));
      if (!m) {
        if (VERIFY_ONLY) {
          console.log(`  ! ${handle}: ${r.pdf} not in media library`);
          continue;
        }
        m = await uploadPdf(r.pdf);
        media.set(normalize(r.pdf), m);
        console.log(`  + uploaded ${r.pdf}`);
      }
      lines.push(line(r, m.source_url));
    }
    const value = lines.join("\n");

    if (!VERIFY_ONLY && metaOf(product, "coa_reports") !== value) {
      await api("PUT", `/wc/v3/products/${product.id}`, {
        meta_data: [
          { key: "coa_reports", value },
          { key: "coa_file", value: lines[0]?.split(" | ")[1] ?? "" },
          { key: "coa_label", value: reports[0]?.lot ?? "" },
        ],
      });
    }

    /* read back */
    const after = (await api<WooProduct>("GET", `/wc/v3/products/${product.id}`));
    const live = metaOf(after, "coa_reports");
    if (live === value) {
      console.log(`✓ ${handle}: ${lines.length} report(s)`);
      ok++;
    } else {
      console.log(`✗ ${handle}: meta mismatch\n    want: ${value.replace(/\n/g, "\n          ")}\n    got:  ${live.replace(/\n/g, "\n          ")}`);
      failed.push(handle);
    }
  }

  console.log(`\n${ok}/${handles.length} products verified${failed.length ? ` — failed: ${failed.join(", ")}` : ""}`);
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
