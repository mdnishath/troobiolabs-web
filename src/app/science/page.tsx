import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Science & Research",
  description:
    "Peptides are precise signaling molecules — powerful model compounds across modern preclinical research.",
};

const AREAS = [
  { cat: "tissue", bar: "#D9368A", title: "Tissue Research", copy: "BPC-157, TB-500, GHK-Cu and KPV in wound-healing, angiogenesis and inflammation models." },
  { cat: "metabolic", bar: "#1486C9", title: "Metabolic Research", copy: "GLP-1, GIP and glucagon-receptor agonists as model systems for glycemic and appetite research." },
  { cat: "endocrine", bar: "#F47B2A", title: "Endocrine Research", copy: "GHRH analogs and secretagogues for pulsatility, receptor selectivity and endocrine studies." },
  { cat: "cellular", bar: "#73B84A", title: "Cellular Research", copy: "NAD+, L-Glutathione and MOTS-c in cellular-senescence, redox and energy-metabolism research." },
  { cat: "neural", bar: "#5A55D6", title: "Neural Research", copy: "Selank, semax and oxytocin in cognition, stress-response and social-behavior models." },
  { cat: "tissue", bar: "gradient", title: "Combined Protocols", copy: "Fixed-ratio blends like Wolverine and KLOW for multi-pathway repair studies in one vial." },
];

const PIPELINE = [
  { n: 1, color: "#D9368A", title: "Solid-Phase Synthesis", copy: "Sequences assembled residue-by-residue in GMP-compliant US facilities." },
  { n: 2, color: "#8D43B8", title: "Purification", copy: "Preparative RP chromatography removes truncated sequences and synthesis by-products." },
  { n: 3, color: "#1486C9", title: "Independent Verification", copy: "A third-party lab batch verifies ≥98% purity and confirms identity by mass spec." },
  { n: 4, color: "#73B84A", title: "Cold-Chain Dispatch", copy: "Lyophilized vials ship same-day with COA documents and storage guidance." },
];

const GLANCE: [string, string, string?][] = [
  ["Structure", "2–50 amino acids"],
  ["Synthesis", "Solid-phase (SPPS)"],
  ["Supplied As", "Lyophilized powder"],
  ["Reconstitution", "Bacteriostatic water"],
  ["Use", "In-vitro / lab research only", "#D9368A"],
];

export default function SciencePage() {
  return (
    <main className="mx-auto max-w-[1440px] px-6 pt-[clamp(30px,4vw,52px)]">
      <h1 className="text-gradient-brand m-0 text-[clamp(30px,4.4vw,48px)] font-light leading-[1.1] tracking-[-.5px]">
        Science &amp; Research
      </h1>
      <p className="mb-0 mt-[14px] max-w-[700px] text-[15px] leading-[1.8] text-body">
        Peptides are short chains of amino acids — the same building blocks as
        proteins — that act as precise signaling molecules in biological
        systems. Their specificity makes them powerful model compounds across
        modern preclinical research.
      </p>
      <div className="mb-9 mt-[18px] h-1 w-[150px] rounded-[2px] bg-gradient-brand" />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-start gap-7">
        <Reveal>
          <h2 className="text-gradient-brand m-0 text-[clamp(20px,2.6vw,26px)] font-light tracking-[-.5px]">
            What Are Research Peptides?
          </h2>
          <p className="mb-0 mt-4 text-[14.5px] leading-[1.9] text-slate">
            Research peptides are synthetic analogs of naturally occurring
            signaling molecules, manufactured by solid-phase peptide synthesis
            (SPPS) and purified chromatographically. Because each peptide binds
            defined receptors or pathways, researchers use them to isolate a
            single biological mechanism — tissue repair, incretin signaling,
            growth-hormone release — inside a controlled experiment.
          </p>
          <p className="mb-0 mt-[14px] text-[14.5px] leading-[1.9] text-slate">
            All compounds in our catalog are supplied as lyophilized
            (freeze-dried) powders. Lyophilization locks the molecule in a
            stable, inert state until it is reconstituted at the bench — which
            is why proper cold-chain handling and verified purity matter so
            much to reproducible results.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-[#EAEEF3] bg-surface p-[30px]">
            <div className="text-[11px] font-semibold uppercase tracking-[2px] text-muted">
              At a Glance
            </div>
            <div className="mb-[6px] mt-3 h-1 w-[120px] rounded-[2px] bg-gradient-brand" />
            {GLANCE.map(([k, v, color], i) => (
              <div
                key={k}
                className={`flex justify-between gap-[18px] py-[13px] ${i < GLANCE.length - 1 ? "border-b border-line-soft" : ""}`}
              >
                <span className="text-[11px] font-semibold uppercase tracking-[1.2px] text-muted">
                  {k}
                </span>
                <span
                  className="text-right text-[13px] font-semibold"
                  style={color ? { color } : undefined}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <h2 className="text-gradient-brand mb-0 mt-14 text-[clamp(22px,3vw,30px)] font-light tracking-[-.5px]">
        Research Areas We Supply
      </h2>
      <div className="mb-[26px] mt-[14px] h-1 w-[150px] rounded-[2px] bg-gradient-brand" />
      <StaggerGrid className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,270px),1fr))] gap-[18px]">
        {AREAS.map((a) => (
          <StaggerItem key={a.title} className="h-full">
            <Link
              href={`/shop?cat=${a.cat}`}
              className="block h-full rounded-[14px] border border-line-soft bg-white p-[26px] text-ink no-underline shadow-[0_6px_20px_rgba(21,40,60,.05)] transition-shadow hover:shadow-[0_14px_32px_rgba(21,40,60,.12)]"
            >
              <span
                className={`block h-[6px] w-[34px] rounded-[3px] ${a.bar === "gradient" ? "bg-gradient-brand" : ""}`}
                style={a.bar !== "gradient" ? { background: a.bar } : undefined}
              />
              <div className="mt-4 text-base font-semibold">{a.title}</div>
              <p className="mb-0 mt-[10px] text-[13px] leading-[1.8] text-body">
                {a.copy}
              </p>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGrid>

      <h2 className="text-gradient-brand mb-0 mt-14 text-[clamp(22px,3vw,30px)] font-light tracking-[-.5px]">
        From Synthesis to Your Bench
      </h2>
      <div className="mb-[26px] mt-[14px] h-1 w-[150px] rounded-[2px] bg-gradient-brand" />
      <StaggerGrid className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-[18px]">
        {PIPELINE.map((s) => (
          <StaggerItem key={s.n} className="h-full">
            <div className="h-full rounded-[14px] border border-[#EAEEF3] bg-surface p-[26px]">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full text-[15px] font-semibold text-white"
                style={{ background: s.color }}
              >
                {s.n}
              </div>
              <div className="mt-4 text-[14.5px] font-semibold">{s.title}</div>
              <p className="mb-0 mt-2 text-[12.5px] leading-[1.8] text-body">
                {s.copy}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGrid>

      <div className="mt-14 rounded-[18px] border border-[#F0E4F1] bg-gradient-wash p-[clamp(28px,4vw,44px)] text-center">
        <h2 className="text-gradient-brand m-0 text-[clamp(22px,3vw,30px)] font-light tracking-[-.5px]">
          Go Deeper
        </h2>
        <p className="mx-auto mb-0 mt-3 max-w-[520px] text-sm leading-[1.8] text-slate">
          Compound-by-compound literature reviews, protocol notes and testing
          explainers live on our research blog.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-[14px]">
          <Link
            href="/blog"
            className="inline-flex rounded-full bg-gradient-cta px-8 py-[14px] text-xs font-semibold uppercase tracking-[1.8px] text-white no-underline shadow-[0_10px_24px_rgba(20,134,201,.25)] hover:brightness-[1.06]"
          >
            Read the Blog
          </Link>
          <Link
            href="/quality"
            className="inline-flex rounded-full border-2 border-brand-blue px-8 py-[14px] text-xs font-semibold uppercase tracking-[1.8px] text-brand-blue no-underline hover:bg-[#EAF5FC]"
          >
            Our Testing Standards
          </Link>
        </div>
      </div>
    </main>
  );
}
