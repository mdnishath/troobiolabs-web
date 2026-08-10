"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const DATA = [
  { c: "Products & Purity", q: "What does ≥98% purity actually mean?", a: "Purity is the percentage of the total verified chromatogram area attributable to the target peptide at UV 220nm. A 99.2% result means impurities — truncated sequences, salts, residual solvents — account for less than 1% of detected material. No TrooBioLabs lot ships below 98%." },
  { c: "Products & Purity", q: "Are your compounds really third-party tested?", a: "Yes. Every production lot is sent to an independent US analytical laboratory for batch-verified purity and identity confirmation. The resulting COA is published on our Lab Reports page before the lot goes on sale — you can verify before you buy." },
  { c: "Products & Purity", q: "Do vials ship with bacteriostatic water?", a: "No. All compounds are supplied as lyophilized powder only. Reconstitution solvents are standard laboratory supplies and should be sourced according to your protocol." },
  { c: "Ordering & Shipping", q: "How quickly do orders ship?", a: "Orders placed before 2pm ET ship the same business day from our US facility. Standard tracked shipping takes 3–5 business days and is free on orders over $150. Express cold-chain (1–2 days, gel pack) is available at checkout." },
  { c: "Ordering & Shipping", q: "Do you ship internationally?", a: "We currently ship within the United States only. Institutional researchers outside the US can contact our team to discuss compliant options for their jurisdiction." },
  { c: "Ordering & Shipping", q: "What payment methods do you accept?", a: "All major credit and debit cards. ACH transfer and purchase orders are available for universities and registered institutions — contact support to set up institutional billing." },
  { c: "Storage & Handling", q: "How should I store lyophilized peptides?", a: "Unreconstituted vials are stable for years stored at −20°C, protected from light and moisture. Short periods at room temperature during transit do not degrade lyophilized material." },
  { c: "Storage & Handling", q: "What about after reconstitution?", a: "Reconstituted solutions should be refrigerated at 2–8°C and used within 2–4 weeks. Avoid repeated freeze-thaw cycles; aliquot if your protocol requires longer timelines." },
  { c: "Storage & Handling", q: "Will summer heat damage my order in transit?", a: "Lyophilized peptides tolerate transit temperatures well. For maximum caution, choose Express Cold-Chain at checkout — 1–2 day delivery with a gel pack." },
  { c: "Compliance", q: "Are these products for human use?", a: "No — absolutely not. Every compound is sold strictly for laboratory and in-vitro research. They are not for human or veterinary use, and are not dietary supplements, drugs or cosmetics. Checkout requires an explicit research-use acknowledgment." },
  { c: "Compliance", q: "Who is eligible to purchase?", a: "Qualified researchers, laboratories and institutions. By ordering you confirm you are equipped to handle research chemicals safely and that your use complies with all applicable laws and institutional policies." },
  { c: "Compliance", q: "What is your return policy?", a: "Unopened, unaltered vials may be returned within 30 days for a refund. For quality concerns, contact us with your lot number — verified issues are replaced or refunded in full. See Returns & Refunds for details." },
];

const COLORS: Record<string, string> = {
  "Products & Purity": "#1486C9",
  "Ordering & Shipping": "#F47B2A",
  "Storage & Handling": "#73B84A",
  Compliance: "#D9368A",
};

const CATS = ["All", "Products & Purity", "Ordering & Shipping", "Storage & Handling", "Compliance"];

export function FaqClient() {
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });

  const items = DATA.map((f, i) => ({ f, i })).filter(
    (x) => cat === "All" || x.f.c === cat,
  );

  return (
    <main className="mx-auto max-w-[1440px] px-6 pt-[clamp(30px,4vw,52px)]">
      <h1 className="text-gradient-brand m-0 text-[clamp(30px,4.4vw,48px)] font-light tracking-[-.5px]">
        Frequently Asked Questions
      </h1>
      <p className="mb-0 mt-[14px] text-[15px] leading-[1.8] text-body">
        Purity, ordering, storage and compliance — answered. Can&apos;t find it
        here? <Link href="/contact">Contact support</Link> or open a ticket.
      </p>
      <div className="mb-[26px] mt-[18px] h-1 w-[150px] rounded-[2px] bg-gradient-brand" />

      <div className="flex flex-wrap gap-[9px]">
        {CATS.map((c) => {
          const sel = cat === c;
          const color = COLORS[c] ?? "#151515";
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              className="cursor-pointer rounded-full border-[1.5px] px-[19px] py-[10px] text-[10.5px] font-semibold uppercase tracking-[1.4px] transition-colors"
              style={
                sel
                  ? { background: color, borderColor: color, color: "#fff" }
                  : { background: "#fff", borderColor: "#DCE3EA", color: "#3D4753" }
              }
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="mt-[26px] border-t border-line-soft">
        {items.map(({ f, i }) => (
          <div key={f.q} className="border-b border-line-soft">
            <button
              onClick={() => setOpen((s) => ({ ...s, [i]: !s[i] }))}
              className="flex w-full cursor-pointer items-center justify-between gap-4 bg-transparent px-[2px] py-[19px] text-left text-[15px] font-semibold text-ink"
            >
              <span className="flex items-center gap-[14px]">
                <span
                  className="h-[9px] w-[9px] flex-shrink-0 rounded-full"
                  style={{ background: COLORS[f.c] }}
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
                  transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
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

      <div className="mt-11 flex flex-wrap items-center justify-between gap-6 rounded-[18px] border border-[#F0E4F1] bg-gradient-wash p-[clamp(26px,4vw,40px)]">
        <div className="max-w-[520px]">
          <h2 className="text-gradient-brand m-0 text-[clamp(19px,2.6vw,26px)] font-light tracking-[-.5px]">
            Still Need Help?
          </h2>
          <p className="mb-0 mt-[10px] text-[13.5px] leading-[1.8] text-slate">
            Live chat Mon–Fri 9–5 ET, or open a support ticket and our team
            replies within one business day.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="inline-flex rounded-full bg-gradient-cta px-[30px] py-[14px] text-[11.5px] font-semibold uppercase tracking-[1.8px] text-white no-underline"
          >
            Contact Us
          </Link>
          <Link
            href="/contact#ticket"
            className="inline-flex rounded-full border-2 border-brand-blue px-[30px] py-[14px] text-[11.5px] font-semibold uppercase tracking-[1.8px] text-brand-blue no-underline hover:bg-[#EAF5FC]"
          >
            Open a Ticket
          </Link>
        </div>
      </div>
    </main>
  );
}
