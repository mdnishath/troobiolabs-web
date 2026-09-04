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

/* Settings keys vary between Zelle plugins, so match on the field label instead. */
function zelleFromSettings(
  settings: WooGateway["settings"] | undefined,
): ZelleDetails | null {
  if (!settings) return null;
  const find = (re: RegExp) =>
    Object.values(settings).find((f) => re.test(f.label) || re.test(f.id));
  const name = find(/name/i)?.value?.trim() ?? "";
  const email = find(/email/i)?.value?.trim() ?? "";
  const phone = find(/phone/i)?.value?.trim() ?? "";
  const qrEnabled = find(/^qr\s*code$|qr.*(enable|show)/i)?.value;
  const qrUrl = find(/qr.*(url|image)/i)?.value?.trim() ?? "";
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
