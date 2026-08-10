import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Quality & Testing",
  description:
    "Every TrooBioLabs lot passes a five-stage quality pipeline before it can ship — and the evidence is published for anyone to inspect.",
};

const STATS = [
  { v: "≥98%", c: "#1486C9", l: "Purity floor — no lot ships below it" },
  { v: "GMP", c: "#8D43B8", l: "Compliant US synthesis facilities" },
  { v: "Lot-level", c: "#F47B2A", l: "Full batch traceability, vial to COA" },
  { v: "Public", c: "#73B84A", l: "COAs published before purchase" },
];

const STAGES = [
  { n: 1, color: "#D9368A", grad: "linear-gradient(#D9368A,#8D43B8)", title: "US Synthesis", copy: "Solid-phase synthesis in GMP-compliant facilities; every reagent lot logged." },
  { n: 2, color: "#8D43B8", grad: "linear-gradient(#8D43B8,#1486C9)", title: "In-House QC", copy: "Appearance, solubility and net-content checks on every production run." },
  { n: 3, color: "#1486C9", grad: "linear-gradient(#1486C9,#F47B2A)", title: "Independent Lab Testing", copy: "Batch-verified purity plus MS identity confirmation, run by a third-party analytical lab with no stake in the result." },
  { n: 4, color: "#F47B2A", grad: "linear-gradient(#F47B2A,#73B84A)", title: "COA Publication", copy: "Results documented per lot and published to the Lab Reports page before sale." },
  { n: 5, color: "#73B84A", grad: null, title: "Cold-Chain Fulfillment", copy: "Climate-controlled storage, same-day dispatch, gel packs where required." },
];

const COA_ROWS: [string, string, string?][] = [
  ["Compound", "BPC-157 (10mg)"],
  ["Lot Number", "AARLL-3548854-P"],
  ["Batch-Verified Purity", "≥99%", "#1486C9"],
  ["MS Found / Theoretical", "1419.5 / 1419.6 Da"],
  ["Appearance", "White lyophilized powder"],
  ["Result", "PASS ✓", "#4E8A2C"],
];

export default function QualityPage() {
  return (
    <main className="mx-auto max-w-[1440px] px-6 pt-[clamp(30px,4vw,52px)]">
      <h1 className="text-gradient-brand m-0 text-[clamp(30px,4.4vw,48px)] font-light leading-[1.1] tracking-[-.5px]">
        Quality &amp; Testing
      </h1>
      <p className="mb-0 mt-[14px] max-w-[700px] text-[15px] leading-[1.8] text-body">
        Reproducible research starts with material you can trust. Every
        TrooBioLabs lot passes a five-stage quality pipeline before it can ship
        — and the evidence is published for anyone to inspect.
      </p>
      <div className="mb-9 mt-[18px] h-1 w-[150px] rounded-[2px] bg-gradient-brand" />

      <StaggerGrid className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-4">
        {STATS.map((s) => (
          <StaggerItem key={s.l} className="h-full">
            <div className="h-full rounded-[14px] border border-line-soft bg-white p-6 shadow-[0_6px_20px_rgba(21,40,60,.05)]">
              <div className="text-[30px] font-light" style={{ color: s.c }}>
                {s.v}
              </div>
              <div className="mt-2 text-[10.5px] font-semibold uppercase tracking-[1.6px] text-muted">
                {s.l}
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerGrid>

      <div className="mt-14 grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-start gap-10">
        <Reveal>
          <h2 className="text-gradient-brand m-0 text-[clamp(22px,3vw,30px)] font-light tracking-[-.5px]">
            The Five-Stage Pipeline
          </h2>
          <div className="mb-[26px] mt-[14px] h-1 w-[150px] rounded-[2px] bg-gradient-brand" />
          {STAGES.map((s) => (
            <div key={s.n} className="flex gap-5">
              <div className="flex flex-col items-center">
                <div
                  className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
                  style={{ background: s.color }}
                >
                  {s.n}
                </div>
                {s.grad && (
                  <div className="w-[3px] flex-1" style={{ background: s.grad }} />
                )}
              </div>
              <div className={s.grad ? "pb-[26px]" : undefined}>
                <div className="text-[15px] font-semibold">{s.title}</div>
                <p className="mb-0 mt-[6px] text-[13px] leading-[1.8] text-body">
                  {s.n === 4 ? (
                    <>
                      Results documented per lot and published to the{" "}
                      <Link href="/lab-reports">Lab Reports</Link> page before
                      sale.
                    </>
                  ) : (
                    s.copy
                  )}
                </p>
              </div>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.12}>
          <div className="rounded-2xl border border-[#EAEEF3] bg-surface p-[clamp(24px,3vw,34px)]">
            <div className="text-[11px] font-semibold uppercase tracking-[2px] text-muted">
              Anatomy of Our COA
            </div>
            <div className="mb-[18px] mt-3 h-1 w-[120px] rounded-[2px] bg-gradient-brand" />
            <div className="rounded-xl border border-line-soft bg-white p-[26px] shadow-[0_8px_24px_rgba(21,40,60,.07)]">
              <div className="flex items-center justify-between gap-3 border-b-2 border-ink pb-[14px]">
                <span className="text-[13px] font-semibold tracking-[2px]">
                  CERTIFICATE OF ANALYSIS
                </span>
                <span className="text-[9px] font-semibold tracking-[1.5px] text-faint">
                  TROO BIO-LABS
                </span>
              </div>
              {COA_ROWS.map(([k, v, color], i) => (
                <div
                  key={k}
                  className={`flex justify-between gap-[14px] py-[11px] text-xs ${i < COA_ROWS.length - 1 ? "border-b border-[#EEF1F5]" : ""}`}
                >
                  <span className="font-semibold text-muted">{k}</span>
                  <span
                    className="font-semibold"
                    style={color ? { color } : undefined}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
            <p className="mb-0 mt-4 text-xs leading-[1.8] text-muted">
              Every field above appears on the real document, stamped with the
              analyst&apos;s signature and test date.{" "}
              <Link href="/lab-reports">Browse all current COAs →</Link>
            </p>
          </div>
        </Reveal>
      </div>

      <div className="mt-14 flex flex-wrap items-center justify-between gap-6 rounded-[18px] border border-[#F0E4F1] bg-gradient-wash p-[clamp(28px,4vw,44px)]">
        <div className="max-w-[560px]">
          <h2 className="text-gradient-brand m-0 text-[clamp(20px,2.8vw,28px)] font-light tracking-[-.5px]">
            Questions About a Specific Lot?
          </h2>
          <p className="mb-0 mt-[10px] text-sm leading-[1.8] text-slate">
            Our QC team answers raw-data requests, archived COA lookups and
            methodology questions within one business day.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex rounded-full bg-gradient-cta px-[34px] py-[15px] text-xs font-semibold uppercase tracking-[1.8px] text-white no-underline shadow-[0_10px_24px_rgba(20,134,201,.25)] hover:brightness-[1.06]"
        >
          Contact QC
        </Link>
      </div>
    </main>
  );
}
