import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isZelleGateway } from "@/lib/zelle";
import { zelleProofToken } from "@/lib/zelle-server";

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
  payment?: { id: string; title: string };
  /** coupon code previewed at checkout — WooCommerce re-validates it */
  coupon?: string;
  /** set when that coupon grants free shipping */
  freeShipping?: boolean;
  items: { productId: string; name: string; size: string; price: number; qty: number }[];
}

/* offline gateways get their conventional WooCommerce status */
const STATUS_BY_GATEWAY: Record<string, string> = {
  cod: "processing",
  bacs: "on-hold",
  cheque: "on-hold",
};

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
 *
 * Zelle orders are created Pending and the customer is sent to
 * /checkout/zelle/<id>, where the TROO Zelle Gateway plugin receives the
 * sender details + screenshot and moves the order to Processing. An order
 * that never gets proof stays Pending — never confirmed.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as CheckoutBody;

  if (!body.items?.length || !body.email?.includes("@")) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }

  /* ordering requires a signed-in research account */
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Please sign in to place your order." },
      { status: 401 },
    );
  }

  const zelle = !!body.payment && isZelleGateway(body.payment);

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
        /* surface Woo's own wording — it explains a rejected coupon */
        const detail = (await res
          .json()
          .catch(() => null)) as { message?: string } | null;
        throw new Error(
          detail?.message ?? `WooCommerce ${route} -> ${res.status}`,
        );
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
          status:
            body.payment && !zelle
              ? (STATUS_BY_GATEWAY[body.payment.id] ?? "pending")
              : "pending",
          payment_method: body.payment?.id ?? "",
          payment_method_title: body.payment?.title ?? "",
          customer_id: session.uid,
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
            body.freeShipping
              ? { method_id: "free_shipping", method_title: "Free Shipping", total: "0.00" }
              : body.method === "express"
                ? { method_id: "flat_rate", method_title: "Express Cold-Chain", total: "24.95" }
                : { method_id: "flat_rate", method_title: "Standard Shipping", total: "8.95" },
          ],
          line_items: lineItems,
          /* Woo validates the code and computes the discount itself — an
             invalid one fails the order rather than being ignored */
          ...(body.coupon ? { coupon_lines: [{ code: body.coupon }] } : {}),
          meta_data: [
            { key: "research_use_acknowledged", value: "yes" },
            { key: "terms_accepted", value: "yes" },
          ],
        }),
      });

      if (zelle) {
        /* arm the order with the proof token the gateway plugin will check */
        await wc(`/orders/${order.id}`, {
          method: "PUT",
          body: JSON.stringify({
            meta_data: [{ key: "_troo_zelle_token", value: zelleProofToken(order.id) }],
          }),
        });
        return NextResponse.json({
          orderId: `Order TROO-${order.id}`,
          payUrl: `/checkout/zelle/${order.id}`,
        });
      }

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
