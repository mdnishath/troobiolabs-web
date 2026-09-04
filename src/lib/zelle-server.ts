import "server-only";
import { createHmac } from "node:crypto";
import { wpFetch } from "@/lib/api/wp";
import { isZelleGateway, type ZelleDetails } from "@/lib/zelle";

/**
 * One-time proof token the TROO Zelle Gateway plugin checks before accepting a
 * screenshot. Derived from the order id so the pay page never has to carry it
 * around; the plugin deletes its copy once proof is stored, so it can't be
 * replayed.
 */
export function zelleProofToken(orderId: number): string {
  const s = process.env.AUTH_SECRET || process.env.REVALIDATE_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return createHmac("sha256", s).update(`zelle-proof:${orderId}`).digest("hex");
}

interface WooGateway {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  order: number | string;
  settings?: Record<string, { id: string; label: string; value: string }>;
}

/*
 * The TROO Zelle Gateway plugin (wordpress/plugins/troo-zelle) keeps the
 * option keys of the older "Checkout with Zelle" plugin. Read those first and
 * fall back to matching on field labels for any other Zelle gateway.
 */
export function zelleFromSettings(
  settings: WooGateway["settings"] | undefined,
): ZelleDetails | null {
  if (!settings) return null;
  const byKey = (key: string) => settings[key]?.value?.trim();
  const byLabel = (re: RegExp) =>
    Object.values(settings).find((f) => re.test(f.label))?.value?.trim();

  const name = byKey("ReceiverZelleOwner") ?? byLabel(/name/i) ?? "";
  const email = byKey("ReceiverZELLEEmail") ?? byLabel(/email/i) ?? "";
  const phone = byKey("ReceiverZELLENo") ?? byLabel(/phone/i) ?? "";
  const qrEnabled = byKey("enableQRCode") ?? byLabel(/^qr\s*code$/i);
  const qrUrl = byKey("ZelleQRCode") ?? byLabel(/qr.*(url|image)/i) ?? "";
  if (!name && !email && !phone) return null;
  return {
    name,
    email,
    phone,
    qrUrl: qrEnabled === "yes" && qrUrl ? qrUrl : null,
  };
}

/** Receiving details for the enabled Zelle gateway, or null if none. */
export async function fetchZelleDetails(): Promise<ZelleDetails | null> {
  const list = await wpFetch<WooGateway[]>("/wc/v3/payment_gateways");
  if (!list.ok) return null;
  const gw = list.data.find((g) => g.enabled && isZelleGateway(g));
  if (!gw) return null;
  const one = await wpFetch<WooGateway>(
    `/wc/v3/payment_gateways/${encodeURIComponent(gw.id)}`,
  );
  return one.ok ? zelleFromSettings(one.data.settings) : null;
}
