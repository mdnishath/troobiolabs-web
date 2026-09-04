"use client";

import { useEffect, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/layout/Logo";

const STORAGE_KEY = "troo-age-verified";
const DECLINE_URL = "https://www.google.com/";

/* Tiny external store so the gate reads localStorage without a setState-in-effect. */
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const isVerified = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};
const markVerified = () => {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* ignore - gate will simply show again next visit */
  }
  listeners.forEach((cb) => cb());
};

/**
 * Age / research-professional verification modal shown once per browser.
 * "Yes" persists the choice in localStorage; "No" redirects to Google.
 */
export function AgeGate() {
  // Server snapshot is "verified" so nothing renders during SSR / hydration;
  // the client snapshot then reveals the gate for unverified visitors.
  const open = !useSyncExternalStore(subscribe, isVerified, () => true);

  // Lock page scroll while the gate is up.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const accept = () => markVerified();

  const decline = () => {
    window.location.replace(DECLINE_URL);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="age-gate"
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-gate-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[500] flex items-center justify-center bg-[rgba(21,40,60,.45)] px-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[500px] rounded-2xl bg-white px-[clamp(24px,5vw,48px)] py-[clamp(32px,5vw,48px)] text-center shadow-[0_24px_60px_rgba(0,0,0,.25)]"
          >
            <div className="flex justify-center">
              <Logo />
            </div>

            <h2
              id="age-gate-title"
              className="mb-3 mt-8 text-[26px] font-bold leading-tight text-ink"
            >
              Age Verification
            </h2>

            <p className="mx-auto mb-6 max-w-[400px] text-[13.5px] leading-[1.75] text-body">
              According to FDA guidelines, this website requires visitors to be
              at least 21 years old and licensed research professionals to
              proceed.
            </p>

            <p className="mx-auto mb-7 max-w-[400px] text-[13.5px] font-semibold leading-[1.7] text-slate">
              Are you over 21 years of age and part of the science/research
              industry?
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={accept}
                autoFocus
                className="cursor-pointer rounded-full bg-gradient-cta px-[38px] py-[14px] text-[11.5px] font-semibold uppercase tracking-[1.8px] text-white shadow-[0_8px_20px_rgba(20,134,201,.3)] transition hover:opacity-90"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={decline}
                className="cursor-pointer rounded-full border-[1.5px] border-line bg-white px-[38px] py-[14px] text-[11.5px] font-semibold uppercase tracking-[1.8px] text-brand-blue transition hover:border-brand-blue"
              >
                No
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
