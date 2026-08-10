"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const POSTS = [
  { id: "bpc-review", title: "BPC-157: A Review of the Current Research Literature", cat: "Research Reviews", color: "#D9368A", date: "Jul 28, 2026", read: "9 min read", excerpt: "What three decades of preclinical work do — and do not — tell us about the body-protection compound." },
  { id: "hplc", title: "How Batch Purity Verification Actually Works", cat: "Quality & Testing", color: "#1486C9", date: "Jul 14, 2026", read: "6 min read", excerpt: "Retention time, UV detection, and why one number on a COA represents an entire chromatogram." },
  { id: "storage", title: "Reconstitution & Storage: Best Practice for the Lab", cat: "Lab Protocols", color: "#73B84A", date: "Jun 30, 2026", read: "5 min read", excerpt: "Bacteriostatic water, cold-chain discipline, and keeping lyophilized peptides stable." },
  { id: "glp1-review", title: "GLP-1 Receptor Agonists in Metabolic Research", cat: "Research Reviews", color: "#8D43B8", date: "Jun 18, 2026", read: "8 min read", excerpt: "From exendin-4 to triple agonists: the incretin pathway as a model system." },
  { id: "coa", title: "How to Read a Certificate of Analysis", cat: "Quality & Testing", color: "#F47B2A", date: "Jun 02, 2026", read: "4 min read", excerpt: "Lot numbers, MS identity confirmation, and the fields to check before any experiment." },
  { id: "nad-review", title: "NAD+ Decline and Cellular Senescence Models", cat: "Research Reviews", color: "#73B84A", date: "May 20, 2026", read: "7 min read", excerpt: "Why one redox coenzyme became central to longevity research programs worldwide." },
];

const CATS = ["All", "Research Reviews", "Quality & Testing", "Lab Protocols"];

export function BlogClient() {
  const [cat, setCat] = useState("All");

  const all = POSTS.filter((p) => cat === "All" || p.cat === cat);
  const rest = all.filter((p) => !(cat === "All" && p.id === "bpc-review"));

  return (
    <main className="mx-auto max-w-[1440px] px-6 pt-[clamp(30px,4vw,52px)]">
      <h1 className="text-gradient-brand m-0 text-[clamp(30px,4.4vw,48px)] font-light leading-[1.1] tracking-[-.5px]">
        The Research Blog
      </h1>
      <p className="mb-0 mt-[14px] max-w-[640px] text-[15px] leading-[1.8] text-body">
        Literature reviews, testing explainers and lab protocol notes from the
        TrooBioLabs research desk. Written for working researchers —
        referenced, and free of hype.
      </p>
      <div className="mb-[26px] mt-[18px] h-1 w-[150px] rounded-[2px] bg-gradient-brand" />

      <div className="flex flex-wrap gap-[9px]">
        {CATS.map((c) => {
          const sel = cat === c;
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              className="cursor-pointer rounded-full border-[1.5px] px-[19px] py-[10px] text-[10.5px] font-semibold uppercase tracking-[1.4px] transition-colors"
              style={
                sel
                  ? { background: "#151515", borderColor: "#151515", color: "#fff" }
                  : { background: "#fff", borderColor: "#DCE3EA", color: "#3D4753" }
              }
            >
              {c}
            </button>
          );
        })}
      </div>

      {cat === "All" && (
        <a
          href="#"
          className="mt-7 block rounded-[18px] border border-[#F0E4F1] bg-gradient-wash p-[clamp(26px,4vw,44px)] text-ink no-underline transition-shadow hover:shadow-[0_16px_40px_rgba(21,40,60,.1)]"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-brand-pink px-[13px] py-[6px] text-[9.5px] font-semibold uppercase tracking-[1.8px] text-white">
              Research Reviews
            </span>
            <span className="rounded-full border-[1.5px] border-[#DCC8E8] px-3 py-[5px] text-[9.5px] font-semibold uppercase tracking-[1.8px] text-brand-purple">
              Featured
            </span>
          </div>
          <div className="mt-[18px] max-w-[760px] text-[clamp(22px,3.2vw,32px)] font-semibold leading-[1.3]">
            BPC-157: A Review of the Current Research Literature
          </div>
          <p className="mb-0 mt-[14px] max-w-[680px] text-sm leading-[1.85] text-slate">
            Three decades of preclinical work have made BPC-157 one of the most
            cited compounds in tissue-repair research. Here&apos;s what the
            models actually show — gastric protection, tendon-to-bone healing,
            angiogenesis — and where the evidence stops.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-[18px]">
            <span className="text-[11px] font-semibold text-faint">
              Jul 28, 2026 · 9 min read
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-brand-blue">
              Read Article →
            </span>
          </div>
        </a>
      )}

      <motion.div
        key={cat}
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
        className="mt-7 grid grid-cols-[repeat(auto-fit,minmax(min(100%,290px),1fr))] gap-[22px]"
      >
        {rest.map((b) => (
          <motion.a
            key={b.id}
            href="#"
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
            }}
            className="flex flex-col overflow-hidden rounded-[14px] border border-line-soft bg-white text-ink no-underline shadow-[0_6px_20px_rgba(21,40,60,.05)] transition-shadow hover:shadow-[0_14px_32px_rgba(21,40,60,.12)]"
          >
            <div className="h-[6px]" style={{ background: b.color }} />
            <div className="flex flex-1 flex-col px-[26px] pb-[26px] pt-6">
              <span
                className="self-start rounded-full border-[1.5px] px-3 py-[5px] text-[9.5px] font-semibold uppercase tracking-[1.8px]"
                style={{ color: b.color, borderColor: `${b.color}55` }}
              >
                {b.cat}
              </span>
              <div className="mt-[14px] text-[16.5px] font-semibold leading-[1.45]">
                {b.title}
              </div>
              <p className="mb-0 mt-[10px] flex-1 text-[13px] leading-[1.8] text-body">
                {b.excerpt}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold text-faint">
                  {b.date} · {b.read}
                </span>
                <span className="text-[10.5px] font-semibold uppercase tracking-[1.5px] text-brand-blue">
                  Read →
                </span>
              </div>
            </div>
          </motion.a>
        ))}
      </motion.div>
    </main>
  );
}
