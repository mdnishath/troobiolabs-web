"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Check } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthGate } from "@/components/auth/AuthGate";
import { CardBrands } from "@/components/ui/CardBrands";
import { useCart, cartSubtotal } from "@/store/cart";
import { useMounted } from "@/hooks/useMounted";
import { fmt, FREE_SHIP_THRESHOLD, SHIP_COST, cn } from "@/lib/utils";

const INPUT =
  "w-full rounded-[10px] border-[1.5px] border-line px-[18px] py-[13px] text-[13.5px] text-ink outline-none placeholder:text-icon focus:border-brand-blue";
const CARD =
  "rounded-[14px] border border-line-soft bg-white p-6 shadow-[0_4px_14px_rgba(21,40,60,.04)]";
const HEAD = "mb-4 text-[13px] font-semibold uppercase tracking-[1.5px]";

const EXPRESS_COST = 24.95;

export function CheckoutClient() {
  const mounted = useMounted();
  const qc = useQueryClient();
  const { items, clear } = useCart();
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    organization: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [method, setMethod] = useState<"standard" | "express">("standard");
  const [payment, setPayment] = useState<string | null>(null);
  const [ack, setAck] = useState(false);
  const [terms, setTerms] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [placed, setPlaced] = useState<{ orderId: string; email: string } | null>(null);

  /* prefill from the signed-in customer's saved details */
  const me = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      const data = (await res.json()) as {
        id?: number;
        email: string;
        firstName: string;
        lastName: string;
        billing: Record<string, string> | null;
      };
      return data?.id ? data : null;
    },
    retry: false,
  });

  /* one-time prefill, applied during render when the profile arrives */
  const [prefilled, setPrefilled] = useState(false);
  if (me.data && !prefilled) {
    setPrefilled(true);
    const m = me.data;
    setForm((f) => ({
      email: f.email || m.email || "",
      firstName: f.firstName || m.firstName || "",
      lastName: f.lastName || m.lastName || "",
      organization: f.organization || m.billing?.company || "",
      address: f.address || m.billing?.address_1 || "",
      city: f.city || m.billing?.city || "",
      state: f.state || m.billing?.state || "",
      zip: f.zip || m.billing?.postcode || "",
    }));
  }

  /* enabled payment gateways straight from WooCommerce */
  const gateways = useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const res = await fetch("/api/payment-methods");
      if (!res.ok) return { methods: [] as { id: string; title: string; description: string }[] };
      return res.json() as Promise<{
        methods: { id: string; title: string; description: string }[];
      }>;
    },
  });
  const methods = gateways.data?.methods ?? [];
  const selectedPayment =
    methods.find((m) => m.id === payment) ?? (methods.length === 1 ? methods[0] : undefined);

  const raw = mounted ? items : [];
  const sub = cartSubtotal(raw);
  const freeStd = sub >= FREE_SHIP_THRESHOLD;
  const shipCost = method === "express" ? EXPRESS_COST : freeStd ? 0 : SHIP_COST;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const valid =
    raw.length > 0 &&
    !!me.data &&
    form.email.includes("@") &&
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    form.address.trim() !== "" &&
    form.city.trim() !== "" &&
    form.state.trim() !== "" &&
    form.zip.trim() !== "" &&
    (methods.length === 0 || !!selectedPayment) &&
    ack &&
    terms;

  const placeOrder = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          method,
          payment: selectedPayment
            ? { id: selectedPayment.id, title: selectedPayment.title }
            : undefined,
          items: raw,
        }),
      });
      if (!res.ok) throw new Error("Order failed");
      return res.json() as Promise<{ orderId: string }>;
    },
    onSuccess: (data) => {
      setPlaced({ orderId: data.orderId, email: form.email });
      clear();
      window.scrollTo(0, 0);
    },
  });

  if (placed) {
    return (
      <main className="mx-auto max-w-[1440px] px-6 pt-[clamp(30px,4vw,52px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-[620px] pb-[10px] pt-10 text-center"
        >
          <div
            className="mx-auto flex h-[92px] w-[92px] items-center justify-center rounded-full shadow-[0_16px_40px_rgba(20,134,201,.3)]"
            style={{
              background: "linear-gradient(120deg,#14B8C9,#1486C9 60%,#2E5BD7)",
            }}
          >
            <Check size={40} strokeWidth={2.6} className="text-white" />
          </div>
          <h1 className="text-gradient-brand mb-0 mt-7 text-[clamp(26px,4vw,38px)] font-light tracking-[-.5px]">
            Order Confirmed
          </h1>
          <div className="mt-[14px] inline-block rounded-full border-[1.5px] border-[#BFDCEF] px-5 py-[9px] text-[13px] font-semibold tracking-[1.5px] text-brand-blue">
            {placed.orderId}
          </div>
          <p className="mb-0 mt-5 text-[14.5px] leading-[1.8] text-body">
            A confirmation is on its way to <strong>{placed.email}</strong>.
            Your order ships from our USA lab within 24 hours, with
            batch-specific COA documents included.
          </p>
          <div className="mx-auto my-[26px] h-1 w-[150px] rounded-[2px] bg-gradient-brand" />
          <div className="flex flex-wrap justify-center gap-[14px]">
            <Link
              href="/account"
              className="inline-flex rounded-full bg-gradient-cta px-[30px] py-[14px] text-xs font-semibold uppercase tracking-[1.8px] text-white no-underline"
            >
              Track in My Account
            </Link>
            <Link
              href="/shop"
              className="inline-flex rounded-full border-2 border-brand-blue px-[30px] py-[14px] text-xs font-semibold uppercase tracking-[1.8px] text-brand-blue no-underline"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1440px] px-6 pt-[clamp(30px,4vw,52px)]">
      <h1 className="text-gradient-brand m-0 text-[clamp(28px,4vw,42px)] font-light tracking-[-.5px]">
        Checkout
      </h1>
      <div className="mt-[14px] flex flex-wrap items-center gap-[10px] text-[10.5px] font-semibold uppercase tracking-[1.5px]">
        <Link href="/cart" className="text-brand-blue no-underline">
          Cart
        </Link>
        <span className="text-[#B6C0CB]">→</span>
        <span className="text-ink">Details &amp; Payment</span>
        <span className="text-[#B6C0CB]">→</span>
        <span className="text-icon">Confirmation</span>
      </div>
      <div className="mb-[30px] mt-4 h-1 w-[150px] rounded-[2px] bg-gradient-brand" />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] items-start gap-7">
        {/* form column — ordering requires a signed-in research account */}
        {me.isLoading ? (
          <div className="flex flex-col gap-4">
            <div className="h-32 animate-pulse rounded-[14px] bg-surface-2" />
            <div className="h-64 animate-pulse rounded-[14px] bg-surface-2" />
          </div>
        ) : !me.data ? (
          <div>
            <div className="mb-4 rounded-[14px] border border-[#EAEEF3] bg-surface px-5 py-4 text-[12.5px] leading-[1.7] text-body">
              <strong>Sign in to place your order.</strong> A research account
              is required for purchasing — your cart is saved and will be here
              after you sign in.
            </div>
            <AuthGate
              note="Ordering requires a registered research account. Your order history and COA documentation stay linked to it."
              onDone={() => qc.invalidateQueries({ queryKey: ["me"] })}
            />
          </div>
        ) : (
        <div className="flex flex-col gap-4">
          <div className={CARD}>
            <div className={HEAD}>
              <span className="text-brand-blue">01</span> · Contact
            </div>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="Work email address *"
              className={INPUT}
            />
          </div>

          <div className={CARD}>
            <div className={HEAD}>
              <span className="text-brand-blue">02</span> · Shipping Address
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-3">
              <input placeholder="First name *" value={form.firstName} onChange={set("firstName")} className={INPUT} />
              <input placeholder="Last name *" value={form.lastName} onChange={set("lastName")} className={INPUT} />
            </div>
            <input placeholder="Organization / lab (optional)" value={form.organization} onChange={set("organization")} className={cn(INPUT, "mt-3")} />
            <input placeholder="Street address *" value={form.address} onChange={set("address")} className={cn(INPUT, "mt-3")} />
            <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(min(100%,120px),1fr))] gap-3">
              <input placeholder="City *" value={form.city} onChange={set("city")} className={INPUT} />
              <input placeholder="State *" value={form.state} onChange={set("state")} className={INPUT} />
              <input placeholder="ZIP *" value={form.zip} onChange={set("zip")} className={INPUT} />
            </div>
          </div>

          <div className={CARD}>
            <div className={HEAD}>
              <span className="text-brand-blue">03</span> · Shipping Method
            </div>
            <div className="flex flex-col gap-[10px]">
              {(
                [
                  { id: "standard", name: "Standard Shipping", eta: "3–5 business days · tracked", cost: freeStd ? "FREE" : fmt(SHIP_COST) },
                  { id: "express", name: "Express Cold-Chain", eta: "1–2 business days · gel pack", cost: fmt(EXPRESS_COST) },
                ] as const
              ).map((m) => {
                const sel = method === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className="flex w-full cursor-pointer items-center justify-between gap-[14px] rounded-xl px-[18px] py-[15px]"
                    style={{
                      background: sel ? "#EAF5FC" : "#fff",
                      border: sel ? "2px solid #1486C9" : "1.5px solid #DCE3EA",
                    }}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className="inline-block h-[18px] w-[18px] flex-shrink-0 rounded-full bg-white"
                        style={{
                          border: sel ? "5px solid #1486C9" : "2px solid #C3CFDA",
                        }}
                      />
                      <span className="text-left">
                        <span className="block text-[13.5px] font-semibold">
                          {m.name}
                        </span>
                        <span className="mt-[2px] block text-[11px] font-semibold text-faint">
                          {m.eta}
                        </span>
                      </span>
                    </span>
                    <span className="text-[13.5px] font-semibold">{m.cost}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={CARD}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="text-[13px] font-semibold uppercase tracking-[1.5px]">
                <span className="text-brand-blue">04</span> · Payment
              </div>
              <span className="inline-flex items-center gap-[7px] text-[10px] font-semibold uppercase tracking-[1px] text-brand-leaf">
                <Lock size={13} strokeWidth={2} />
                256-bit SSL
              </span>
            </div>
            {gateways.isLoading ? (
              <div className="flex flex-col gap-[10px]">
                <div className="h-[52px] animate-pulse rounded-xl bg-surface-2" />
                <div className="h-[52px] animate-pulse rounded-xl bg-surface-2" />
              </div>
            ) : methods.length === 0 ? (
              <p className="mb-0 text-[12.5px] leading-[1.7] text-faint">
                No online payment methods are enabled yet — the order will be
                placed as pending and our team will contact you to arrange
                payment.
              </p>
            ) : (
              <div className="flex flex-col gap-[10px]">
                {methods.map((m) => {
                  const sel = selectedPayment?.id === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setPayment(m.id)}
                      className="flex w-full cursor-pointer items-center justify-between gap-[14px] rounded-xl px-[18px] py-[15px] text-left"
                      style={{
                        background: sel ? "#EAF5FC" : "#fff",
                        border: sel ? "2px solid #1486C9" : "1.5px solid #DCE3EA",
                      }}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className="inline-block h-[18px] w-[18px] flex-shrink-0 rounded-full bg-white"
                          style={{
                            border: sel ? "5px solid #1486C9" : "2px solid #C3CFDA",
                          }}
                        />
                        <span>
                          <span className="block text-[13.5px] font-semibold">
                            {m.title}
                          </span>
                          {m.description && (
                            <span className="mt-[2px] block text-[11px] font-semibold text-faint">
                              {m.description}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => setAck((a) => !a)}
            className="flex cursor-pointer items-start gap-[14px] rounded-[14px] border-[1.5px] border-[#EAEEF3] bg-surface px-5 py-[18px] text-left"
          >
            <span
              className="inline-flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-[6px]"
              style={{
                background: ack ? "#1486C9" : "#fff",
                border: ack ? "2px solid #1486C9" : "2px solid #C3CFDA",
              }}
            >
              {ack && <Check size={12} strokeWidth={3.5} className="text-white" />}
            </span>
            <span className="text-xs leading-[1.7] text-slate">
              <strong>Research-use acknowledgment (required).</strong> I confirm
              these materials are purchased for laboratory research only, will
              not be used in humans or animals, and I am qualified to handle
              them.
            </span>
          </button>

          <button
            onClick={() => setTerms((t) => !t)}
            aria-pressed={terms}
            className="flex cursor-pointer items-start gap-[14px] rounded-[14px] border-[1.5px] border-[#EAEEF3] bg-surface px-5 py-[18px] text-left"
          >
            <span
              className="inline-flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-[6px]"
              style={{
                background: terms ? "#1486C9" : "#fff",
                border: terms ? "2px solid #1486C9" : "2px solid #C3CFDA",
              }}
            >
              {terms && <Check size={12} strokeWidth={3.5} className="text-white" />}
            </span>
            <span className="text-xs leading-[1.7] text-slate">
              <strong>Terms &amp; Conditions (required).</strong> I have read
              and agree to the{" "}
              <Link
                href="/policies#terms"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-brand-blue"
              >
                Terms &amp; Conditions
              </Link>
              ,{" "}
              <Link
                href="/policies#privacy"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-brand-blue"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/policies#returns"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-brand-blue"
              >
                Returns Policy
              </Link>
              .
            </span>
          </button>
        </div>
        )}

        {/* summary column */}
        <div className="w-full max-w-[460px] justify-self-end rounded-2xl border border-[#EAEEF3] bg-surface p-7">
          <div className="text-[15px] font-semibold uppercase tracking-[1px]">
            Order Summary
          </div>
          <div className="mb-2 mt-3 h-1 w-[120px] rounded-[2px] bg-gradient-brand" />
          {raw.map((i) => (
            <div
              key={`${i.productId}-${i.size}`}
              className="flex justify-between gap-[14px] border-b border-[#E9EDF2] py-[11px] text-[12.5px]"
            >
              <span className="font-semibold text-slate">
                {i.name} · {i.size} × {i.qty}
              </span>
              <span className="whitespace-nowrap font-semibold">
                {fmt(i.price * i.qty)}
              </span>
            </div>
          ))}
          {mounted && raw.length === 0 && (
            <div className="py-[14px] text-[12.5px] text-faint">
              Your cart is empty — <Link href="/shop">browse compounds</Link>.
            </div>
          )}

          {/* coupon */}
          <div className="mt-3 flex gap-2">
            <input
              value={coupon}
              onChange={(e) => {
                setCoupon(e.target.value);
                setCouponMsg(null);
              }}
              placeholder="Coupon code"
              className="min-w-0 flex-1 rounded-full border-[1.5px] border-line bg-white px-4 py-[10px] text-xs text-ink outline-none placeholder:text-icon"
            />
            <button
              onClick={() =>
                setCouponMsg(
                  coupon.trim()
                    ? "Coupon codes are validated at payment."
                    : null,
                )
              }
              className="cursor-pointer rounded-full border-2 border-brand-blue bg-white px-5 py-[10px] text-[10.5px] font-semibold uppercase tracking-[1.5px] text-brand-blue hover:bg-[#EAF5FC]"
            >
              Apply
            </button>
          </div>
          {couponMsg && (
            <div className="mt-2 text-[11px] font-semibold text-faint">
              {couponMsg}
            </div>
          )}

          <div className="flex justify-between pt-3 text-[13.5px]">
            <span className="font-semibold text-muted">Subtotal</span>
            <span className="font-semibold">{fmt(sub)}</span>
          </div>
          <div className="flex justify-between border-b border-line-soft py-[9px] text-[13.5px]">
            <span className="font-semibold text-muted">Shipping</span>
            <span className="font-semibold">
              {raw.length ? (shipCost === 0 ? "FREE" : fmt(shipCost)) : "—"}
            </span>
          </div>
          <div className="flex justify-between pt-[14px] text-[17px]">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">
              {fmt(sub + (raw.length ? shipCost : 0))}
            </span>
          </div>
          <button
            onClick={() => valid && placeOrder.mutate()}
            disabled={!valid || placeOrder.isPending}
            className={cn(
              "mt-5 block w-full rounded-full bg-gradient-cta px-[30px] py-4 text-[13px] font-semibold uppercase tracking-[2px] text-white shadow-[0_10px_24px_rgba(20,134,201,.25)]",
              valid ? "cursor-pointer" : "cursor-not-allowed opacity-45",
            )}
          >
            {!me.data && !me.isLoading
              ? "Sign In to Place Order"
              : placeOrder.isPending
                ? "Placing Order…"
                : "Place Order"}
          </button>
          {placeOrder.isError && (
            <div className="mt-3 text-center text-xs font-semibold text-brand-pink">
              Something went wrong placing the order — please try again.
            </div>
          )}
          <p className="mb-0 mt-4 text-center text-[11px] leading-[1.7] text-faint">
            Every shipment includes batch COAs and cold-chain packaging where
            required.
          </p>
          <div className="mt-4 flex flex-col items-center gap-2">
            <span className="text-[9.5px] font-semibold uppercase tracking-[1.8px] text-ghost">
              We Accept
            </span>
            <CardBrands />
          </div>
        </div>
      </div>
    </main>
  );
}
