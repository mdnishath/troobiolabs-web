"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart, FlaskConical } from "lucide-react";
import { useCart, cartCount, cartSubtotal } from "@/store/cart";
import { useUi } from "@/store/ui";
import { fmt, FREE_SHIP_THRESHOLD, SHIP_COST, cn } from "@/lib/utils";

export function CartDrawer() {
  const open = useUi((s) => s.cartOpen);
  const closeCart = useUi((s) => s.closeCart);
  const { items, updateQty, remove } = useCart();

  const count = cartCount(items);
  const sub = cartSubtotal(items);
  const freeShip = sub >= FREE_SHIP_THRESHOLD;
  const shipCost = items.length ? (freeShip ? 0 : SHIP_COST) : 0;
  const pct = Math.min(100, (sub / FREE_SHIP_THRESHOLD) * 100);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 z-[900] bg-[rgba(13,22,34,.44)]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.38, ease: [0.22, 0.61, 0.36, 1] }}
            className="fixed bottom-0 right-0 top-0 z-[901] flex w-[min(420px,94vw)] flex-col bg-white shadow-[-24px_0_60px_rgba(13,22,34,.25)]"
          >
            {/* Head */}
            <div className="flex items-center justify-between gap-3 border-b border-line-faint px-[22px] py-[18px]">
              <div className="flex items-center gap-[10px]">
                <ShoppingCart size={16} strokeWidth={2} className="text-brand-blue" />
                <span className="text-sm font-semibold tracking-[.5px]">Cart</span>
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-purple px-[6px] text-[11px] font-semibold text-white">
                  {count}
                </span>
              </div>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="h-[34px] w-[34px] cursor-pointer rounded-full border border-line bg-white text-[13px] text-muted"
              >
                ✕
              </button>
            </div>

            {/* RUO + free-shipping meter */}
            <div className="border-b border-line-faint px-[22px] pb-[14px] pt-3">
              <p className="m-0 text-[10.5px] leading-relaxed text-ghost">
                For Research Use Only. Not for human consumption. Not a drug,
                supplement, or food product.
              </p>
              <div className="mt-[10px] text-[11.5px] font-semibold text-slate">
                {items.length === 0
                  ? "Free US shipping on orders over $150"
                  : freeShip
                    ? "You’ve unlocked FREE standard shipping ✓"
                    : `${fmt(FREE_SHIP_THRESHOLD - sub)} away from free shipping`}
              </div>
              <div className="mt-2 h-[6px] overflow-hidden rounded-full bg-line-soft">
                <div
                  className="h-full rounded-full bg-gradient-brand transition-[width] duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Items */}
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-[22px] py-[14px]">
              {items.length === 0 && (
                <div className="px-[10px] py-11 text-center text-[13px] leading-loose text-ghost">
                  Your cart is empty.
                  <br />
                  Browse the catalog to add compounds.
                </div>
              )}
              {items.map((i, idx) => (
                <div
                  key={`${i.productId}-${i.size}`}
                  className="flex items-center gap-3 rounded-xl border border-line-faint bg-surface px-3 py-[10px]"
                >
                  <div className="flex h-[66px] w-[52px] flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line-faint bg-white">
                    {i.img ? (
                      <Image
                        src={i.img}
                        alt={i.name}
                        width={52}
                        height={66}
                        className="max-h-[88%] max-w-[82%] object-contain"
                      />
                    ) : (
                      <FlaskConical size={20} strokeWidth={1.6} className="text-icon" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-semibold leading-[1.35]">
                      {i.name}
                    </div>
                    <div className="mt-[2px] text-[10.5px] text-ghost">{i.size}</div>
                    <div className="mt-2 inline-flex items-center rounded-full border border-line bg-white">
                      <button
                        onClick={() => updateQty(idx, -1)}
                        className="h-[26px] w-[26px] cursor-pointer text-[13px] text-brand-blue"
                      >
                        −
                      </button>
                      <span className="min-w-5 text-center text-xs font-semibold">
                        {i.qty}
                      </span>
                      <button
                        onClick={() => updateQty(idx, 1)}
                        className="h-[26px] w-[26px] cursor-pointer text-xs text-brand-blue"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-[10px]">
                    <span className="whitespace-nowrap text-[13px] font-semibold">
                      {fmt(i.price * i.qty)}
                    </span>
                    <button
                      onClick={() => remove(idx)}
                      title="Remove"
                      className="cursor-pointer p-0 text-xs text-icon transition-colors hover:text-brand-pink"
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border-t border-line-faint px-[22px] pb-5 pt-4">
              <div className="flex justify-between py-1 text-[12.5px]">
                <span className="font-semibold text-muted">Subtotal</span>
                <span className="font-semibold">{fmt(sub)}</span>
              </div>
              <div className="flex justify-between py-1 text-[12.5px]">
                <span className="font-semibold text-muted">Shipping</span>
                <span className="font-semibold">
                  {items.length ? (freeShip ? "FREE" : fmt(SHIP_COST)) : "—"}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-[15px]">
                <span className="font-semibold">Estimated Total</span>
                <span className="font-semibold">{fmt(sub + shipCost)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className={cn(
                  "mt-[14px] flex justify-center rounded-full bg-gradient-cta px-[26px] py-[14px] text-xs font-semibold uppercase tracking-[1.8px] text-white no-underline",
                  items.length === 0 && "pointer-events-none opacity-45",
                )}
              >
                Continue to Checkout
              </Link>
              <div className="mt-3 flex items-center justify-between">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="text-[10.5px] font-semibold uppercase tracking-[1.5px] text-brand-blue no-underline"
                >
                  View Full Cart
                </Link>
                <span className="text-[10px] tracking-[.5px] text-ghost">
                  Secure checkout · SSL
                </span>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
