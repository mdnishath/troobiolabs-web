import { NextResponse } from "next/server";

interface CheckoutBody {
  email: string;
  firstName: string;
  lastName: string;
  organization?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  method: "standard" | "express";
  items: { productId: string; name: string; size: string; price: number; qty: number }[];
}

/**
 * Creates the order. With WooCommerce credentials configured the order is
 * created in the store (status: pending payment — the gateway completes it);
 * otherwise a simulated order id is returned so the flow works end-to-end
 * against the local catalog.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as CheckoutBody;

  if (!body.items?.length || !body.email?.includes("@")) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }

  const base = process.env.WC_API_URL?.replace(/\/$/, "");
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;

  if (base && key && secret) {
    const auth = "Basic " + Buffer.from(`${key}:${secret}`).toString("base64");
    const res = await fetch(`${base}/wp-json/wc/v3/orders`, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "pending",
        billing: {
          first_name: body.firstName,
          last_name: body.lastName,
          company: body.organization ?? "",
          address_1: body.address,
          city: body.city,
          state: body.state,
          postcode: body.zip,
          country: "US",
          email: body.email,
        },
        shipping: {
          first_name: body.firstName,
          last_name: body.lastName,
          address_1: body.address,
          city: body.city,
          state: body.state,
          postcode: body.zip,
          country: "US",
        },
        shipping_lines: [
          body.method === "express"
            ? { method_id: "flat_rate", method_title: "Express Cold-Chain", total: "24.95" }
            : { method_id: "flat_rate", method_title: "Standard Shipping", total: "8.95" },
        ],
        line_items: body.items.map((i) => ({
          name: `${i.name} — ${i.size}`,
          quantity: i.qty,
          total: (i.price * i.qty).toFixed(2),
        })),
        meta_data: [{ key: "research_use_acknowledged", value: "yes" }],
      }),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `WooCommerce order failed (${res.status})` },
        { status: 502 },
      );
    }
    const order = (await res.json()) as { id: number };
    return NextResponse.json({ orderId: `Order TROO-${order.id}` });
  }

  /* local fallback — matches the design prototype's confirmation */
  const id = `TROO-26-${Math.floor(1000 + Math.random() * 9000)}`;
  return NextResponse.json({ orderId: `Order ${id}` });
}
