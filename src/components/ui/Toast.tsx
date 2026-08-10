"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUi } from "@/store/ui";

/** "Added to cart" pill toast (fixed, bottom-center) — matches the design prototype. */
export function Toast() {
  const toast = useUi((s) => s.toast);
  const hideToast = useUi((s) => s.hideToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hideToast, 3500);
    return () => clearTimeout(t);
  }, [toast, hideToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 16, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 16, x: "-50%" }}
          className="fixed bottom-[26px] left-1/2 z-[300] flex items-center gap-[14px] whitespace-nowrap rounded-full bg-ink px-[26px] py-[14px] text-white shadow-[0_16px_40px_rgba(0,0,0,.3)]"
        >
          <span className="font-semibold text-brand-green">✓</span>
          <span className="text-[13px] font-semibold">{toast}</span>
          <Link
            href="/cart"
            className="text-xs font-semibold uppercase tracking-[1px] text-brand-sky no-underline"
          >
            View Cart
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
