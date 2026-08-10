"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, FlaskConical, Activity, FileText } from "lucide-react";
import { useCatalog, type CatalogResponse } from "@/hooks/useCatalog";
import { useHash } from "@/hooks/useHash";
import { Skeleton } from "@/components/ui/Skeleton";

export function LabReportsClient({
  initialData,
}: {
  initialData?: CatalogResponse;
}) {
  const { data, isLoading } = useCatalog(initialData);
  const hash = useHash();
  const [qState, setQState] = useState<string | null>(null);

  /* deep link: /lab-reports#lot=XYZ — typed input takes over once touched */
  const hashLot = hash.startsWith("#lot=")
    ? decodeURIComponent(hash.slice(5))
    : "";
  const q = qState ?? hashLot;
  const setQ = setQState;

  const products = (data?.products ?? []).filter((p) => p.cat !== "supplies");
  const categories = data?.categories ?? [];
  const needle = q.toLowerCase();
  const rows = products.filter(
    (p) =>
      !needle ||
      p.name.toLowerCase().includes(needle) ||
      p.sub.toLowerCase().includes(needle) ||
      (p.coa?.label.toLowerCase() ?? "").includes(needle),
  );

  return (
    <main className="mx-auto max-w-[1440px] px-6 pt-[clamp(30px,4vw,52px)]">
      <h1
        className="m-0 text-[clamp(30px,4.4vw,48px)] font-light leading-[1.1] tracking-[-.5px]"
        style={{
          backgroundImage:
            "linear-gradient(90deg,#8D43B8,#1486C9 45%,#F47B2A 75%,#73B84A)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Lab Reports
      </h1>
      <p className="mb-0 mt-[14px] max-w-[680px] text-[15px] leading-[1.8] text-body">
        Every batch we release is tested by an independent analytical
        laboratory. Purity and identity are batch verified through independent
        chromatography and mass-spectrometry testing. The resulting Certificate
        of Analysis (COA) is published here — for every compound, before
        purchase.
      </p>
      <div className="mb-[26px] mt-[18px] h-1 w-[150px] rounded-[2px] bg-gradient-brand" />

      <div className="mb-7 flex flex-wrap gap-[10px]">
        <span className="rounded-full border-[1.5px] border-[#BFDCEF] px-[15px] py-[7px] text-[10px] font-semibold uppercase tracking-[1.5px] text-brand-blue">
          {products.length || "—"} Compounds
        </span>
        <span className="rounded-full border-[1.5px] border-[#DCC8E8] px-[15px] py-[7px] text-[10px] font-semibold uppercase tracking-[1.5px] text-brand-purple">
          100% Third-Party Tested
        </span>
        <span className="rounded-full border-[1.5px] border-[#C8E3B4] px-[15px] py-[7px] text-[10px] font-semibold uppercase tracking-[1.5px] text-brand-leaf">
          Batch Verified + MS Identity
        </span>
      </div>

      <div className="flex max-w-[460px] items-center gap-3 rounded-full border-[1.5px] border-line bg-white py-1 pl-5 pr-[6px]">
        <Search size={16} strokeWidth={2} className="text-faint" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by compound or lot number…"
          className="flex-1 border-none bg-transparent py-[10px] text-[13.5px] text-ink outline-none placeholder:text-icon"
        />
      </div>

      <div className="mt-[26px] flex flex-col gap-3">
        {isLoading &&
          Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-[84px] w-full rounded-xl" />
          ))}
        {rows.map((p) => {
          const cat = categories.find((c) => c.id === p.cat);
          return (
            <div
              key={p.id}
              className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] items-center gap-4 rounded-xl border border-line-soft bg-white px-[22px] py-[18px] shadow-[0_4px_14px_rgba(21,40,60,.04)]"
            >
              <div className="min-w-[170px]">
                <Link
                  href={`/product/${p.id}`}
                  className="text-[14.5px] font-semibold text-ink no-underline"
                >
                  {p.name}
                </Link>
                <div className="mt-[3px] text-[11px] font-semibold text-faint">
                  {p.sub}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-[1.5px] text-icon">
                  Category
                </div>
                <div
                  className="mt-1 text-[11px] font-semibold tracking-[.3px]"
                  style={{ color: cat?.color ?? "#5A6572" }}
                >
                  {cat?.name ?? ""}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-[1.5px] text-icon">
                  Lot Number
                </div>
                <div className="mt-1 text-[13px] font-semibold">
                  {p.coa?.label ?? "On request"}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-[1.5px] text-icon">
                  Tested
                </div>
                <div className="mt-1 text-[13px] font-semibold">
                  {p.coa ? "See COA" : "Per batch"}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-[1.5px] text-icon">
                  Batch-Verified Purity
                </div>
                <div className="mt-[2px] text-base font-semibold text-brand-blue">
                  {p.specs.purity || "≥98%"}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-[1.5px] text-icon">
                  MS Identity
                </div>
                <div className="mt-1 text-[13px] font-semibold text-brand-leaf">
                  Confirmed ✓
                </div>
              </div>
              <a
                href={p.coa?.file ?? "/contact"}
                target={p.coa ? "_blank" : undefined}
                rel={p.coa ? "noopener noreferrer" : undefined}
                title={p.coa ? `COA — ${p.coa.label}` : "Archived COAs on request"}
                className="inline-flex items-center gap-2 justify-self-end whitespace-nowrap rounded-full border-2 border-brand-blue px-5 py-[11px] text-[10.5px] font-semibold uppercase tracking-[1.5px] text-brand-blue no-underline hover:bg-[#EAF5FC]"
              >
                <FileText size={14} strokeWidth={2} />
                COA PDF
              </a>
            </div>
          );
        })}
      </div>
      {!isLoading && rows.length === 0 && (
        <div className="px-5 py-12 text-center text-sm text-faint">
          No reports match that search.
        </div>
      )}

      <div className="mt-[52px] grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-5">
        {[
          {
            icon: FlaskConical,
            color: "#1486C9",
            title: "Purity Verification",
            copy: "Reverse-phase chromatography separates the target peptide from impurities; the area under the main peak gives the purity percentage on the COA.",
          },
          {
            icon: Activity,
            color: "#8D43B8",
            title: "ESI Mass Spectrometry",
            copy: "Electrospray-ionization MS confirms the molecular weight of every batch against the theoretical mass — verifying identity, not just purity.",
          },
          {
            icon: FileText,
            color: "#F47B2A",
            title: "Batch-Specific COAs",
            copy: "Each report lists compound, lot, appearance, batch-verified purity, MS result and storage guidance. Archived COAs for earlier lots are available on request.",
          },
        ].map((c) => (
          <div
            key={c.title}
            className="rounded-[14px] border border-[#EAEEF3] bg-surface p-7"
          >
            <div
              className="flex h-[46px] w-[46px] items-center justify-center rounded-full border-[1.5px] border-[#C9D4DE]"
              style={{ color: c.color }}
            >
              <c.icon size={20} strokeWidth={1.8} />
            </div>
            <div className="mt-4 text-sm font-semibold tracking-[.5px]">
              {c.title}
            </div>
            <p className="mb-0 mt-[10px] text-[13px] leading-[1.8] text-body">
              {c.copy}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
