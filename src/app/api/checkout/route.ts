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

interface WooProductRef {
  id: number;
  type: string;
}

interface WooVariationRef {
  id: number;
  sku: string;
  attributes: { option: string }[];
}

/**
 * Creates the order. With WooCommerce credentials configured, each cart line
 * is resolved live against the store — product by slug, variation by its Size
 * attribute — so products/sizes the client adds or edits in wp-admin work
 * without any code involvement. Prices/totals are computed by WooCommerce.
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
    const headers = {
      Authorization:
        "Basic " + Buffer.from(`${key}:${secret}`).toString("base64"),
      "Content-Type": "application/json",
    };
    const wc = async <T>(route: string, init?: RequestInit): Promise<T> => {
      const res = await fetch(`${base}/wp-json/wc/v3${route}`, {
        ...init,
        headers,
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`WooCommerce ${route} -> ${res.status}`);
      }
      return res.json() as Promise<T>;
    };

    try {
      /* resolve each cart line to a live product/variation */
      const lineItems: {
        product_id: number;
        variation_id?: number;
        quantity: number;
      }[] = [];

      for (const item of body.items) {
        const found = await wc<WooProductRef[]>(
          `/products?slug=${encodeURIComponent(item.productId)}`,
        );
        if (!found.length) {
          return NextResponse.json(
            { error: `Product no longer available: ${item.name}` },
            { status: 409 },
          );
        }
        const product = found[0];
        const line: (typeof lineItems)[number] = {
          product_id: product.id,
          quantity: item.qty,
        };
        if (product.type === "variable") {
          const variations = await wc<WooVariationRef[]>(
            `/products/${product.id}/variations?per_page=100`,
          );
          const match =
            variations.find((v) =>
              v.attributes.some(
                (a) => a.option.toLowerCase() === item.size.toLowerCase(),
              ),
            ) ??
            variations.find((v) => v.sku === `${item.productId}-${item.size}`);
          if (!match) {
            return NextResponse.json(
              { error: `Size ${item.size} no longer available: ${item.name}` },
              { status: 409 },
            );
          }
          line.variation_id = match.id;
        }
        lineItems.push(line);
      }

      const order = await wc<{ id: number }>("/orders", {
        method: "POST",
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
          line_items: lineItems,
          meta_data: [{ key: "research_use_acknowledged", value: "yes" }],
        }),
      });
      return NextResponse.json({ orderId: `Order TROO-${order.id}` });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Order failed" },
        { status: 502 },
      );
    }
  }

  /* local fallback — matches the design prototype's confirmation */
  const id = `TROO-26-${Math.floor(1000 + Math.random() * 9000)}`;
  return NextResponse.json({ orderId: `Order ${id}` });
}
