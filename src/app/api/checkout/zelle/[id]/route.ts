import { NextResponse } from "next/server";
import { wpConfig, wpFetch } from "@/lib/api/wp";
import { getSession } from "@/lib/session";
import { isZelleGateway, MAX_PROOF_BYTES, type ZelleProof } from "@/lib/zelle";
import { fetchZelleDetails, zelleProofToken } from "@/lib/zelle-server";

interface WooOrder {
  id: number;
  number: string;
  status: string;
  total: string;
  currency: string;
  customer_id: number;
  payment_method: string;
  payment_method_title: string;
  billing: { email: string };
}

/** Loads the customer's own pending Zelle order, or explains why it can't. */
async function loadOrder(id: string) {
  const session = await getSession();
  if (!session) {
    return { error: "Please sign in to continue.", status: 401 } as const;
  }
  if (!/^\d+$/.test(id)) {
    return { error: "Order not found.", status: 404 } as const;
  }
  if (!wpConfig()) {
    return { error: "Online payments are not configured.", status: 503 } as const;
  }
  const res = await wpFetch<WooOrder>(`/wc/v3/orders/${id}`);
  if (!res.ok || !res.data?.id) {
    return { error: "Order not found.", status: 404 } as const;
  }
  const order = res.data;
  if (order.customer_id !== session.uid) {
    return { error: "Order not found.", status: 404 } as const;
  }
  if (!isZelleGateway({ id: order.payment_method, title: order.payment_method_title })) {
    return { error: "This order is not paid by Zelle.", status: 400 } as const;
  }
  return { order } as const;
}

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/checkout/zelle/[id]">,
) {
  const { id } = await ctx.params;
  const r = await loadOrder(id);
  if ("error" in r) {
    return NextResponse.json({ error: r.error }, { status: r.status });
  }
  const { order } = r;
  const details = await fetchZelleDetails().catch(() => null);
  return NextResponse.json({
    orderId: `Order TROO-${order.id}`,
    total: Number(order.total),
    currency: order.currency,
    email: order.billing.email,
    /* anything past Pending means proof has already been submitted */
    proofSubmitted: order.status !== "pending",
    cancelled: order.status === "cancelled" || order.status === "failed",
    details,
  });
}

export async function POST(
  req: Request,
  ctx: RouteContext<"/api/checkout/zelle/[id]">,
) {
  const { id } = await ctx.params;
  const r = await loadOrder(id);
  if ("error" in r) {
    return NextResponse.json({ error: r.error }, { status: r.status });
  }
  const { order } = r;
  if (order.status !== "pending") {
    return NextResponse.json(
      { error: "Payment proof has already been submitted for this order." },
      { status: 409 },
    );
  }

  const proof = (await req.json().catch(() => null)) as ZelleProof | null;
  if (!proof?.senderName?.trim() || !proof.screenshot?.startsWith("data:image/")) {
    return NextResponse.json(
      { error: "Please add the sender name and a screenshot of your Zelle payment." },
      { status: 400 },
    );
  }
  if (proof.screenshot.length > MAX_PROOF_BYTES) {
    return NextResponse.json({ error: "Payment screenshot is too large." }, { status: 413 });
  }

  /* hand the proof to the TROO Zelle Gateway plugin, which moves the order to Processing */
  const cfg = wpConfig()!;
  const res = await fetch(`${cfg.base}/wp-json/troo/v1/zelle/proof`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      order_id: order.id,
      token: zelleProofToken(order.id),
      sender: proof.senderName.trim(),
      reference: proof.reference?.trim() ?? "",
      screenshot: proof.screenshot,
    }),
  }).catch(() => null);

  if (!res?.ok) {
    const data = (await res?.json().catch(() => null)) as { message?: string } | null;
    /* leave the order Pending; flag it for staff */
    await wpFetch(`/wc/v3/orders/${order.id}/notes`, {
      method: "POST",
      json: {
        note: `Zelle proof upload FAILED (${res?.status ?? "network"}) — is the TROO Zelle Gateway plugin v1.1+ active? Sender: ${proof.senderName.trim()}${proof.reference ? ` · Ref: ${proof.reference.trim()}` : ""}.`,
      },
    }).catch(() => null);
    return NextResponse.json(
      {
        error:
          data?.message ??
          "We couldn't save your screenshot. Please try again or email it to support@troobiolabs.org with your order number.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, orderId: `Order TROO-${order.id}` });
}
