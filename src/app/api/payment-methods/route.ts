import { NextResponse } from "next/server";
import { wpFetch } from "@/lib/api/wp";
import { isZelleGateway } from "@/lib/zelle";

interface WooGateway {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  order: number | string;
}

/** Enabled WooCommerce payment gateways — drives the checkout's payment step. */
export async function GET() {
  try {
    const res = await wpFetch<WooGateway[]>("/wc/v3/payment_gateways");
    if (!res.ok) throw new Error(`gateways ${res.status}`);
    const methods = res.data
      .filter((g) => g.enabled)
      .sort((a, b) => Number(a.order) - Number(b.order))
      .map((g) => ({
        id: g.id,
        title: g.title,
        description: g.description.replace(/<[^>]+>/g, "").trim(),
        /* Zelle continues on its own payment page after the order is placed */
        zelle: isZelleGateway(g),
      }));
    return NextResponse.json({ methods });
  } catch {
    /* local/catalog mode or backend down — checkout falls back gracefully */
    return NextResponse.json({ methods: [] });
  }
}
