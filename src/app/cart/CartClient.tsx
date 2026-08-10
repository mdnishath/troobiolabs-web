"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart, FlaskConical, Shield, Truck } from "lucide-react";
import { useCart, cartCount, cartSubtotal } from "@/store/cart";
import { useMounted } from "@/hooks/useMounted";
import { fmt, FREE_SHIP_THRESHOLD, SHIP_COST } from "@/lib/utils";

export function CartClient() {
  const mounted = useMounted();
  const { items, updateQty, remove } = useCart();

  const raw = mounted ? items : [];
  const count = cartCount(raw);
  const sub = cartSubtotal(raw);
  const free = sub >= FREE_SHIP_THRESHOLD;
  const ship = raw.length === 0 ? 0 : free ? 0 : SHIP_COST;
  const pct = Math.min(100, (sub / FREE_SHIP_THRESHOLD) * 100);

  return (
    <main className="mx-auto max-w-[1440px] px-6 pt-[clamp(30px,4vw,52px)]">
      <h1 className="text-gradient-brand m-0 text-[clamp(28px,4vw,42px)] font-light tracking-[-.5px]">
        Your Cart{" "}
        {count > 0 && (
          <span className="text-[.5em] font-semibold text-faint [-webkit-text-fill-color:#7A8694]">
            ({count} items)
          </span>
        )}
      </h1>
      <div className="mb-[30px] mt-4 h-1 w-[150px] rounded-[2px] bg-gradient-brand" />

      {mounted && raw.length === 0 ? (
        <div className="px-5 pb-5 pt-[60px] text-center">
          <div className="mx-auto flex h-[84px] w-[84px] items-center justify-center rounded-full border-[1.5px] border-[#C9D4DE] text-icon">
            <ShoppingCart size={34} strokeWidth={1.6} />
          </div>
          <div className="mt-[22px] text-[19px] font-semibold">
            Your cart is empty
          </div>
          <p className="mb-0 mt-[10px] text-sm text-muted">
            Browse the catalog to add research compounds.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-full bg-gradient-cta px-9 py-[15px] text-xs font-semibold uppercase tracking-[1.8px] text-white no-underline shadow-[0_10px_24px_rgba(20,134,201,.25)]"
          >
            Shop All Compounds
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-7">
          {/* line items */}
          <div className="flex min-w-0 flex-col gap-[14px]">
            <AnimatePresence initial={false}>
              {raw.map((i, idx) => (
                <motion.div
                  key={`${i.productId}-${i.size}`}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-wrap items-center gap-4 rounded-[14px] border border-line-soft bg-white p-4 shadow-[0_4px_14px_rgba(21,40,60,.04)]"
                >
                  <div className="flex h-[78px] w-[78px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-surface-2">
                    {i.img ? (
                      <Image
                        src={i.img}
                        alt={i.name}
                        width={78}
                        height={78}
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <FlaskConical size={26} strokeWidth={1.6} className="text-icon" />
                    )}
                  </div>
                  <div className="min-w-[150px] flex-1">
                    <Link
                      href={`/product/${i.productId}`}
                      className="text-[14.5px] font-semibold text-ink no-underline"
                    >
                      {i.name}
                    </Link>
                    <div className="mt-[3px] text-[11px] font-semibold text-faint">
                      {i.size} · {fmt(i.price)} each
                    </div>
                  </div>
                  <div className="inline-flex items-center rounded-full border-[1.5px] border-line">
                    <button
                      onClick={() => updateQty(idx, -1)}
                      className="h-[38px] w-9 cursor-pointer text-[17px] text-brand-blue"
                    >
                      −
                    </button>
                    <span className="min-w-[26px] text-center text-[13.5px] font-semibold">
                      {i.qty}
                    </span>
                    <button
                      onClick={() => updateQty(idx, 1)}
                      className="h-[38px] w-9 cursor-pointer text-[15px] text-brand-blue"
                    >
                      +
                    </button>
                  </div>
                  <div className="min-w-[76px] text-right text-[15px] font-semibold">
                    {fmt(i.price * i.qty)}
                  </div>
                  <button
                    onClick={() => remove(idx)}
                    title="Remove"
                    className="h-[34px] w-[34px] cursor-pointer rounded-full bg-[#F4F6F8] text-[15px] text-faint transition-colors hover:bg-[#FBE9F2] hover:text-brand-pink"
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            <Link
              href="/shop"
              className="mt-[6px] text-xs font-semibold uppercase tracking-[1.5px] text-brand-blue no-underline"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* order summary */}
          <div className="w-full max-w-[440px] justify-self-end rounded-2xl border border-[#EAEEF3] bg-surface p-7">
            <div className="text-[15px] font-semibold uppercase tracking-[1px]">
              Order Summary
            </div>
            <div className="mb-[18px] mt-3 h-1 w-[120px] rounded-[2px] bg-gradient-brand" />
            <div className="text-xs font-semibold text-slate">
              {free
                ? "You’ve unlocked FREE standard shipping ✓"
                : `${fmt(FREE_SHIP_THRESHOLD - sub)} away from free US shipping`}
            </div>
            <div className="mb-5 mt-[10px] h-2 overflow-hidden rounded-full bg-line-soft">
              <div
                className="h-full rounded-full bg-gradient-brand transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between py-[9px] text-[13.5px]">
              <span className="font-semibold text-muted">Subtotal</span>
              <span className="font-semibold">{fmt(sub)}</span>
            </div>
            <div className="flex justify-between border-b border-line-soft py-[9px] text-[13.5px]">
              <span className="font-semibold text-muted">
                Shipping (Standard)
              </span>
              <span
                className="font-semibold"
                style={{ color: free ? "#4E8A2C" : "#151515" }}
              >
                {free ? "FREE" : fmt(ship)}
              </span>
            </div>
            <div className="flex justify-between pt-[14px] text-base">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">{fmt(sub + ship)}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-5 flex justify-center rounded-full bg-gradient-cta px-[30px] py-4 text-[13px] font-semibold uppercase tracking-[2px] text-white no-underline shadow-[0_10px_24px_rgba(20,134,201,.25)] hover:brightness-[1.06]"
            >
              Proceed to Checkout
            </Link>
            <div className="mt-5 flex justify-center gap-[22px] text-muted">
              <span className="inline-flex items-center gap-[7px] text-[10px] font-semibold uppercase tracking-[1px]">
                <Shield size={14} strokeWidth={2} /> Secure
              </span>
              <span className="inline-flex items-center gap-[7px] text-[10px] font-semibold uppercase tracking-[1px]">
                <FlaskConical size={14} strokeWidth={2} /> Tested
              </span>
              <span className="inline-flex items-center gap-[7px] text-[10px] font-semibold uppercase tracking-[1px]">
                <Truck size={14} strokeWidth={2} /> Fast
              </span>
            </div>
            <p className="mb-0 mt-[18px] text-center text-[11px] leading-[1.7] text-faint">
              All items are for laboratory research use only. By checking out
              you confirm you are a qualified researcher.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
