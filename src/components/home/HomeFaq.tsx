"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HOME_FAQ } from "@/lib/home-data";
import { SectionHeading } from "@/components/ui/SectionHeading";

const COLORS = ["#D9368A", "#8D43B8", "#1486C9", "#F47B2A", "#73B84A", "#5A55D6"];

export function HomeFaq() {
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });

  return (
    <section className="mx-auto mt-[clamp(56px,7vw,84px)] max-w-[1440px] px-6">
      <SectionHeading
        kicker="Before You Order"
        title="Questions Researchers Ask"
        size="lg"
        body={
          <>
            Purity, verification, storage and shipping — answered plainly. The
            full list lives on the <Link href="/faq">FAQ page</Link>.
          </>
        }
      />
      <div className="mt-[26px] border-t border-line-soft">
        {HOME_FAQ.map((f, i) => (
          <div key={f.q} className="border-b border-line-soft">
            <button
              onClick={() => setOpen((s) => ({ ...s, [i]: !s[i] }))}
              className="flex w-full cursor-pointer items-center justify-between gap-4 border-none bg-transparent px-[2px] py-[19px] text-left text-[15px] font-semibold text-ink"
            >
              <span className="flex items-center gap-[14px]">
                <span
                  className="h-[9px] w-[9px] flex-shrink-0 rounded-full"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                {f.q}
              </span>
              <span className="flex-shrink-0 text-[21px] font-normal text-muted">
                {open[i] ? "−" : "+"}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open[i] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="max-w-[760px] pb-[22px] pl-[25px] pr-[2px] text-[13.5px] leading-[1.9] text-slate">
                    {f.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      <div className="mt-[26px] flex flex-wrap gap-3">
        <Link
          href="/faq"
          className="inline-flex rounded-full bg-gradient-cta px-7 py-[13px] text-[11.5px] font-semibold uppercase tracking-[1.8px] text-white no-underline"
        >
          Read the Full FAQ
        </Link>
        <Link
          href="/contact"
          className="inline-flex rounded-full border-2 border-brand-blue px-7 py-[13px] text-[11.5px] font-semibold uppercase tracking-[1.8px] text-brand-blue no-underline hover:bg-[#EAF5FC]"
        >
          Talk to Support
        </Link>
      </div>
    </section>
  );
}
