"use client";

import { useState } from "react";
import { TINTS } from "@/lib/home-data";
import type { LabBatchItem } from "@/lib/home-live";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CarouselNav } from "@/components/ui/CarouselNav";

const ROWS = "flex items-baseline gap-3 py-3";
const RLBL =
  "whitespace-nowrap text-[10px] font-semibold uppercase tracking-[1.6px] text-ghost";
const DOTFILL =
  "flex-1 -translate-y-[3px] border-b-2 border-dotted border-[#D5DCE3]";
const RVAL = "text-[12.5px] font-semibold tracking-[.5px]";

export function LabResultsCarousel({ batches }: { batches: LabBatchItem[] }) {
  const [idx, setIdx] = useState(0);
  if (!batches.length) return null;
  const L = batches[idx % batches.length];
  const t = TINTS[L.color] ?? TINTS["#8D43B8"];
  const purityNum = L.purity.replace(/%$/, "");

  return (
    <div className="mt-[clamp(64px,8vw,96px)]">
      <SectionHeading
        kicker="Every Batch Tested — See the Certificate"
        kickerColor="#1486C9"
        title="The Lab Results"
        rule={false}
      />
      <p className="mb-0 mt-3 max-w-[560px] text-[14.5px] leading-[1.75] text-body">
        This is the actual lab report for the batch you&apos;d receive — not a
        sample, not an average. Flip through the latest batches below.
      </p>
      <div className="mt-[18px] h-[2px] rounded-[2px] bg-gradient-brand opacity-55" />

      <div key={idx} className="hero-swap">
        <div className="mt-[26px] flex flex-wrap items-stretch overflow-hidden rounded-[20px] border border-line-soft bg-white shadow-[0_10px_30px_rgba(21,40,60,.06)]">
          {/* image panel */}
          <div
            className="flex w-[min(100%,300px)] flex-none flex-col items-center justify-center gap-[18px] border-r border-line-faint p-[clamp(24px,3vw,36px)]"
            style={{
              background: `linear-gradient(160deg,#FFFFFF,${t[0]} 60%,${t[1]})`,
            }}
          >
            <div
              className="h-[210px] w-full"
              style={{
                backgroundImage: `url('${L.img}')`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                filter: "drop-shadow(0 14px 18px rgba(21,40,60,.15))",
              }}
            />
            <div className="text-center">
              <div className="text-[9.5px] font-semibold uppercase tracking-[2px] text-ghost">
                Batch
              </div>
              <div className="mt-[6px] text-[15px] font-semibold tracking-[1.5px]">
                {L.lot}
              </div>
            </div>
          </div>

          {/* detail panel */}
          <div className="min-w-[min(100%,340px)] flex-1 p-[clamp(24px,3.5vw,44px)]">
            <div className="text-[clamp(22px,2.6vw,30px)] font-normal tracking-[-.3px]">
              {L.name}
            </div>
            <div className="mt-[14px] flex flex-wrap items-center gap-3">
              <span className="text-[9.5px] font-semibold uppercase tracking-[1.8px] text-ghost">
                Purity
              </span>
              <span
                className="inline-flex items-center gap-[7px] rounded-full bg-white px-[14px] py-[7px] text-[10px] font-semibold uppercase tracking-[1.6px]"
                style={{ color: L.color, border: `1px solid ${t[2]}` }}
              >
                ✓ 3rd-Party Tested
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-[6px]">
              <span className="text-[clamp(44px,5vw,62px)] font-light leading-none tracking-[-1px]">
                {purityNum}
              </span>
              <span className="text-xl font-semibold" style={{ color: L.color }}>
                %
              </span>
            </div>
            <div className="mt-[10px] text-[10.5px] font-semibold uppercase tracking-[1.2px] text-ghost">
              Verified on this production batch
            </div>
            <div className="mt-[22px]">
              <div className={`${ROWS} border-b border-[#F1F4F7]`}>
                <span className={RLBL}>Lot Number</span>
                <span className={DOTFILL} />
                <span className={RVAL}>{L.lot}</span>
              </div>
              <div className={`${ROWS} border-b border-[#F1F4F7]`}>
                <span className={RLBL}>Purity</span>
                <span className={DOTFILL} />
                <span className={RVAL}>{L.purity} · Batch Verified</span>
              </div>
              <div className={`${ROWS} border-b border-[#F1F4F7]`}>
                <span className={RLBL}>Tested By</span>
                <span className={DOTFILL} />
                <span className={RVAL}>Independent 3rd-party lab</span>
              </div>
              <div className={ROWS}>
                <span className={RLBL}>MS Identity</span>
                <span className={DOTFILL} />
                <span className={RVAL}>Confirmed ✓</span>
              </div>
            </div>
            <div className="mt-[18px] flex flex-wrap gap-6">
              <a
                href={L.file}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-brand-blue underline underline-offset-4"
              >
                View full certificate →
              </a>
              <a
                href={L.file}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-brand-blue underline underline-offset-4"
              >
                Download PDF
              </a>
            </div>
          </div>
        </div>
      </div>

      <CarouselNav
        labels={batches.map((b) => b.lot)}
        index={idx}
        onIndex={setIdx}
        noun="batch"
        className="mt-[30px]"
      />
      <div className="mt-[18px] flex justify-center">
        <a
          href="/lab-reports"
          className="text-[11px] font-semibold uppercase tracking-[1.8px] text-brand-blue no-underline"
        >
          Browse Every Batch&apos;s Lab Report →
        </a>
      </div>
    </div>
  );
}
