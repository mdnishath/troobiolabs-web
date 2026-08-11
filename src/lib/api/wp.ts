import "server-only";

/** Server-side helpers for talking to the WordPress backend. */

export function wpConfig() {
  const base = process.env.WC_API_URL?.replace(/\/$/, "");
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;
  if (!base || !key || !secret) return null;
  return {
    base,
    auth: "Basic " + Buffer.from(`${key}:${secret}`).toString("base64"),
  };
}

/** Call a WP REST route with the storefront's server credentials. */
export async function wpFetch<T>(
  route: string,
  init?: RequestInit & { json?: unknown },
): Promise<{ ok: boolean; status: number; data: T }> {
  const cfg = wpConfig();
  if (!cfg) throw new Error("WordPress backend is not configured");
  const res = await fetch(`${cfg.base}/wp-json${route}`, {
    ...init,
    headers: {
      Authorization: cfg.auth,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
    cache: "no-store",
  });
  const data = (await res.json().catch(() => null)) as T;
  return { ok: res.ok, status: res.status, data };
}
