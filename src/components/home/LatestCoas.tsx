import Link from "next/link";
import { LATEST_COAS } from "@/lib/home-data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/motion/Reveal";

export function LatestCoas({ compoundCount }: { compoundCount: number }) {
  const stats = [
    { v: "Every batch", c: "#D9368A", l: "Gets its own lab report" },
    { v: "3rd-party", c: "#1486C9", l: "Independent US lab" },
    { v: String(compoundCount), c: "#F47B2A", l: "Compounds in the catalog" },
    { v: "≥98%", c: "#73B84A", l: "Purity floor, every lot" },
  ];
  return (
    <section
      id="lab-results"
      className="mx-auto mt-[clamp(56px,7vw,84px)] max-w-[1440px] px-6"
    >
      <Reveal>
        <SectionHeading
          kicker="Every Batch Tested — See the Certificate"
          kickerColor="#73B84A"
          title="The Latest Lab Results"
          size="lg"
          body="These are the actual reports for the batches on sale right now — not samples, not averages. Flip through the newest lots below."
        />
      </Reveal>
      <StaggerGrid className="mt-[30px] grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-[22px]">
        {LATEST_COAS.map((r) => (
          <StaggerItem key={r.lot} className="h-full">
            <div className="flex h-full flex-col rounded-[14px] border border-line-soft bg-white p-[26px] shadow-[0_6px_20px_rgba(21,40,60,.05)]">
              <div className="flex items-center justify-between gap-3">
                <div className="text-base font-semibold">{r.name}</div>
                <span className="whitespace-nowrap rounded-full bg-[#EFF7E8] px-3 py-[6px] text-[9.5px] font-semibold uppercase tracking-[1.2px] text-brand-leaf">
                  3rd-Party Tested
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-[10px]">
                <span className="text-[40px] font-light leading-none text-brand-blue">
                  {r.purity}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
                  Batch Verified
                </span>
              </div>
              <div className="mb-1 mt-4 h-1 w-[120px] rounded-[2px] bg-gradient-brand" />
              <div className="flex justify-between gap-[14px] border-b border-[#F1F4F7] py-[11px] text-[12.5px]">
                <span className="font-semibold text-muted">Lot number</span>
                <span className="font-semibold">{r.lot}</span>
              </div>
              <div className="flex justify-between gap-[14px] border-b border-[#F1F4F7] py-[11px] text-[12.5px]">
                <span className="font-semibold text-muted">Report date</span>
                <span className="font-semibold">{r.date}</span>
              </div>
              <div className="flex justify-between gap-[14px] py-[11px] text-[12.5px]">
                <span className="font-semibold text-muted">Tested by</span>
                <span className="font-semibold">Independent 3rd-party lab</span>
              </div>
              <div className="mt-auto flex flex-wrap gap-[10px] pt-4">
                <Link
                  href="/lab-reports"
                  className="inline-flex flex-1 justify-center whitespace-nowrap rounded-full bg-gradient-cta-70 px-[18px] py-3 text-[10.5px] font-semibold uppercase tracking-[1.5px] text-white no-underline"
                >
                  View Certificate
                </Link>
                <a
                  href={r.pdf ?? "/lab-reports"}
                  target={r.pdf ? "_blank" : undefined}
                  rel={r.pdf ? "noopener noreferrer" : undefined}
                  className="inline-flex justify-center whitespace-nowrap rounded-full border-2 border-brand-blue px-[18px] py-3 text-[10.5px] font-semibold uppercase tracking-[1.5px] text-brand-blue no-underline hover:bg-[#EAF5FC]"
                >
                  PDF ↓
                </a>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerGrid>
      <div className="mt-[22px] grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-4">
        {stats.map((s) => (
          <div
            key={s.l}
            className="rounded-[14px] border border-[#EAEEF3] bg-surface p-[22px] text-center"
          >
            <div className="text-[26px] font-light" style={{ color: s.c }}>
              {s.v}
            </div>
            <div className="mt-[6px] text-[10.5px] font-semibold uppercase tracking-[1.6px] text-muted">
              {s.l}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link
          href="/lab-reports"
          className="text-xs font-semibold uppercase tracking-[1.5px] text-brand-blue no-underline"
        >
          Browse Every Batch&apos;s Lab Report →
        </Link>
      </div>
    </section>
  );
}
