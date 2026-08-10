"use client";

import Link from "next/link";
import { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS = [
  {
    color: "#D9368A",
    grad: "linear-gradient(#D9368A,#1486C9)",
    title: "Every batch gets its own lot code",
    copy: "Assigned and registered while the batch is still in production — long before any of it ships.",
  },
  {
    color: "#1486C9",
    grad: "linear-gradient(#1486C9,#73B84A)",
    title: "The code is printed on the label",
    copy: "On the vial and on the box — the same lot number that appears on the published certificate.",
  },
  {
    color: "#73B84A",
    grad: null,
    title: "The code opens that batch's certificate",
    copy: "Type the lot in and you get the report for the batch in your hand — not an average, not a sample.",
  },
];

export function TraceLot() {
  const [lot, setLot] = useState("");
  const href = `/lab-reports${lot.trim() ? `#lot=${encodeURIComponent(lot.trim())}` : ""}`;

  return (
    <section className="mt-[clamp(56px,7vw,84px)] bg-surface px-6 py-[clamp(48px,6vw,72px)]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-center gap-11">
        <div>
          <SectionHeading
            kicker="From the Certificate to the Vial in Your Hand"
            kickerColor="#F47B2A"
            title="Trace It Back."
            size="lg"
            className="mb-6"
          />
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex gap-[18px]">
              <div className="flex flex-col items-center">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[12.5px] font-semibold text-white"
                  style={{ background: s.color }}
                >
                  {i + 1}
                </div>
                {s.grad && (
                  <div className="w-[3px] flex-1" style={{ background: s.grad }} />
                )}
              </div>
              <div className={s.grad ? "pb-[22px]" : undefined}>
                <div className="text-[14.5px] font-semibold">{s.title}</div>
                <p className="mb-0 mt-[6px] text-[12.5px] leading-[1.8] text-body">
                  {s.copy}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-line-soft bg-white p-[clamp(24px,3vw,34px)] shadow-[0_10px_30px_rgba(21,40,60,.06)]">
          <div className="text-[11px] font-semibold uppercase tracking-[2px] text-muted">
            The Code Opens the Certificate — Try It
          </div>
          <div className="mb-5 mt-3 h-1 w-[120px] rounded-[2px] bg-gradient-brand" />
          <div className="flex flex-wrap gap-[10px]">
            <input
              value={lot}
              onChange={(e) => setLot(e.target.value)}
              placeholder="Lot code from your vial — e.g. AARLL-3548854-P"
              className="min-w-[200px] flex-1 rounded-full border-[1.5px] border-line px-5 py-[14px] text-[13px] text-ink outline-none"
            />
            <Link
              href={href}
              className="inline-flex items-center whitespace-nowrap rounded-full bg-gradient-cta px-[26px] py-[14px] text-[11.5px] font-semibold uppercase tracking-[1.5px] text-white no-underline hover:brightness-[1.06]"
            >
              Look It Up →
            </Link>
          </div>
          <p className="mb-0 mt-4 text-xs leading-[1.8] text-faint">
            Printed on the vial and the box. Every search lands on the
            batch-specific Certificate of Analysis in the{" "}
            <Link href="/lab-reports">report library</Link>.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-[14px] rounded-xl border border-[#EAEEF3] bg-surface px-5 py-4">
            <span className="whitespace-nowrap rounded-full border border-[#E2E8EE] bg-white px-[14px] py-[7px] text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">
              Lot AARLL-3548854-P
            </span>
            <span className="text-xs font-semibold text-body">
              → BPC-157 · ≥99% · Batch Verified
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
