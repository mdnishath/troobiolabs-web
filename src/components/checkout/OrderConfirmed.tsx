"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

/** Post-order panel shared by the checkout and the Zelle payment page. */
export function OrderConfirmed({
  orderId,
  email,
  zelle = false,
}: {
  orderId: string;
  email: string;
  /** true once Zelle proof has been received — copy mentions verification */
  zelle?: boolean;
}) {
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
          {orderId}
        </div>
        {zelle ? (
          <p className="mb-0 mt-5 text-[14.5px] leading-[1.8] text-body">
            Thanks — your Zelle payment proof has been received. A confirmation
            is on its way to <strong>{email}</strong>. We verify the transfer,
            then your order ships from our USA lab within 24 hours with
            batch-specific COA documents included.
          </p>
        ) : (
          <p className="mb-0 mt-5 text-[14.5px] leading-[1.8] text-body">
            A confirmation is on its way to <strong>{email}</strong>. Your
            order ships from our USA lab within 24 hours, with batch-specific
            COA documents included.
          </p>
        )}
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
