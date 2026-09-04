import { NextResponse } from "next/server";
import { wpFetch } from "@/lib/api/wp";
import { isZelleGateway, type ZelleDetails } from "@/lib/zelle";

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
function zelleFromSettings(
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

/** Enabled WooCommerce payment gateways — drives the checkout's payment step. */
export async function GET() {
  try {
    const res = await wpFetch<WooGateway[]>("/wc/v3/payment_gateways");
    if (!res.ok) throw new Error(`gateways ${res.status}`);
    const enabled = res.data
      .filter((g) => g.enabled)
      .sort((a, b) => Number(a.order) - Number(b.order));

    const methods = await Promise.all(
      enabled.map(async (g) => {
        const base = {
          id: g.id,
          title: g.title,
          description: g.description.replace(/<[^>]+>/g, "").trim(),
        };
        if (!isZelleGateway(g)) return base;
        /* the list endpoint omits settings; fetch the single gateway for them */
        const one = await wpFetch<WooGateway>(
          `/wc/v3/payment_gateways/${encodeURIComponent(g.id)}`,
        );
        return {
          ...base,
          zelle: one.ok ? zelleFromSettings(one.data.settings) : null,
        };
      }),
    );
    return NextResponse.json({ methods });
  } catch {
    /* local/catalog mode or backend down — checkout falls back gracefully */
    return NextResponse.json({ methods: [] });
  }
}
