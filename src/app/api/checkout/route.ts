import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getSession } from "@/lib/session";
import { isZelleGateway, MAX_PROOF_BYTES, type ZelleProof } from "@/lib/zelle";

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
  items: { productId: string; name: string; size: string; price: number; qty: number }[];
  /** required when paying with Zelle — collected before the order is created */
  zelle?: ZelleProof;
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
 */
export async function POST(req: Request) {
  const body = (await req.json()) as CheckoutBody;

  if (!body.items?.length || !body.email?.includes("@")) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }

  /* Zelle: no proof, no order */
  const zelle = body.payment && isZelleGateway(body.payment);
  if (zelle) {
    const z = body.zelle;
    if (!z?.senderName?.trim() || !z.screenshot?.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Please add the sender name and a screenshot of your Zelle payment." },
        { status: 400 },
      );
    }
    if (z.screenshot.length > MAX_PROOF_BYTES) {
      return NextResponse.json(
        { error: "Payment screenshot is too large." },
        { status: 413 },
      );
    }
  }

  /* ordering requires a signed-in research account */
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Please sign in to place your order." },
      { status: 401 },
    );
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

      /*
       * Zelle: the order is created Pending with a one-time token; the TROO
       * Zelle Gateway plugin's proof endpoint verifies the token, stores the
       * screenshot and moves the order to Processing. No proof, no
       * confirmation.
       */
      const proofToken = zelle ? randomBytes(24).toString("hex") : null;

      const order = await wc<{ id: number }>("/orders", {
        method: "POST",
        body: JSON.stringify({
          status: body.payment && !zelle
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
            body.method === "express"
              ? { method_id: "flat_rate", method_title: "Express Cold-Chain", total: "24.95" }
              : { method_id: "flat_rate", method_title: "Standard Shipping", total: "8.95" },
          ],
          line_items: lineItems,
          meta_data: [
            { key: "research_use_acknowledged", value: "yes" },
            { key: "terms_accepted", value: "yes" },
            ...(proofToken ? [{ key: "_troo_zelle_token", value: proofToken }] : []),
          ],
        }),
      });

      /* hand the Zelle screenshot + sender details to the gateway plugin */
      let zelleProofSaved = false;
      if (zelle && body.zelle && proofToken) {
        const proofRes = await fetch(`${base}/wp-json/troo/v1/zelle/proof`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            order_id: order.id,
            token: proofToken,
            sender: body.zelle.senderName.trim(),
            reference: body.zelle.reference?.trim() ?? "",
            screenshot: body.zelle.screenshot,
          }),
        }).catch(() => null);
        zelleProofSaved = !!proofRes?.ok;

        if (!zelleProofSaved) {
          /* order stays Pending; make the missing proof obvious to staff */
          await wc(`/orders/${order.id}/notes`, {
            method: "POST",
            body: JSON.stringify({
              note: `Zelle proof upload FAILED (${proofRes?.status ?? "network"}) — is the TROO Zelle Gateway plugin v1.1+ active? Sender: ${body.zelle.senderName.trim()}${body.zelle.reference ? ` · Ref: ${body.zelle.reference.trim()}` : ""}. Ask the customer to email the screenshot.`,
            }),
          }).catch(() => null);
        }
      }

      return NextResponse.json({
        orderId: `Order TROO-${order.id}`,
        zelle: zelle ? (zelleProofSaved ? "confirmed" : "proof-failed") : undefined,
      });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Order failed" },
        { status: 502 },
      );
    }
  }

  /* local fallback — matches the design prototype's confirmation */
  const id = `TROO-26-${Math.floor(1000 + Math.random() * 9000)}`;
  return NextResponse.json({
    orderId: `Order ${id}`,
    zelle: zelle ? "confirmed" : undefined,
  });
}
