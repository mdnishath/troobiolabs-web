import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * Cache-purge endpoint. WooCommerce webhooks (product created/updated/deleted)
 * call this so wp-admin edits appear on the storefront within seconds instead
 * of waiting out the ISR window.
 *
 * Guarded by REVALIDATE_SECRET (?secret= query param).
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || url.searchParams.get("secret") !== secret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }
  /* immediate expiry: the next request blocks on fresh data (webhook-driven,
     so wp-admin edits are visible right away, not stale-while-revalidate) */
  revalidateTag("catalog", { expire: 0 });
  return NextResponse.json({ revalidated: true, at: Date.now() });
}

/* WooCommerce sends a GET ping when a webhook is first activated. */
export async function GET(req: Request) {
  return POST(req);
}
