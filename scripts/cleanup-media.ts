/**
 * Removes orphaned media created by earlier sync rounds: attachments matching
 * our upload patterns (troo-*, coa-*, aarll-*, <handle>-<n>) that are no longer
 * referenced by any product gallery, variation image, or coa_file meta.
 *
 * Env: WC_API_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET
 * Run: npx tsx scripts/cleanup-media.ts [--dry-run]
 */
const BASE = (process.env.WC_API_URL ?? "").replace(/\/$/, "");
const AUTH =
  "Basic " +
  Buffer.from(
    `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`,
  ).toString("base64");
const DRY = process.argv.includes("--dry-run");

async function api<T>(method: string, route: string): Promise<T> {
  const res = await fetch(`${BASE}/wp-json${route}`, {
    method,
    headers: { Authorization: AUTH },
  });
  if (!res.ok) throw new Error(`${method} ${route} -> ${res.status}`);
  return res.json() as Promise<T>;
}

interface WooProduct {
  id: number;
  images: { src: string }[];
  meta_data: { key: string; value: unknown }[];
}
interface WooVariation {
  image?: { src: string } | null;
}
interface Media {
  id: number;
  slug: string;
  source_url: string;
}

async function main() {
  const referenced = new Set<string>();
  const products = await api<WooProduct[]>(
    "GET",
    "/wc/v3/products?per_page=100&status=any",
  );
  for (const p of products) {
    p.images?.forEach((i) => referenced.add(i.src));
    const coa = p.meta_data?.find((m) => m.key === "coa_file");
    if (typeof coa?.value === "string" && coa.value) referenced.add(coa.value);
    const vars = await api<WooVariation[]>(
      "GET",
      `/wc/v3/products/${p.id}/variations?per_page=100`,
    );
    vars.forEach((v) => v.image?.src && referenced.add(v.image.src));
  }
  console.log(`referenced media urls: ${referenced.size}`);

  const ours = /^(troo-|coa-|aarll|[a-z0-9-]+-\d$)/;
  let removed = 0;
  for (let page = 1; ; page++) {
    const media = await api<Media[]>(
      "GET",
      `/wp/v2/media?per_page=100&page=${page}`,
    ).catch(() => [] as Media[]);
    if (!media.length) break;
    for (const m of media) {
      if (!ours.test(m.slug)) continue;
      if (referenced.has(m.source_url)) continue;
      if (DRY) {
        console.log(`[dry] would delete #${m.id} ${m.slug}`);
      } else {
        await api("DELETE", `/wp/v2/media/${m.id}?force=true`);
        console.log(`deleted #${m.id} ${m.slug}`);
      }
      removed++;
    }
    if (media.length < 100) break;
  }
  console.log(`${DRY ? "would remove" : "removed"} ${removed} orphaned media items`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
