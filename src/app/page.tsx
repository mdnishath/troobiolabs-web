import catalog from "@/data/catalog.json";
import type { Catalog } from "@/lib/types";
import { AREAS } from "@/lib/home-data";
import { Hero } from "@/components/home/Hero";
import { Collection } from "@/components/home/Collection";
import { AreaCard } from "@/components/home/AreaCard";
import { LabResultsCarousel } from "@/components/home/LabResultsCarousel";
import { Promises } from "@/components/home/Promises";
import { LatestCoas } from "@/components/home/LatestCoas";
import { CoaPanel } from "@/components/home/CoaPanel";
import { TraceLot } from "@/components/home/TraceLot";
import { Logistics } from "@/components/home/Logistics";
import { HomeFaq } from "@/components/home/HomeFaq";
import { Outro } from "@/components/home/Outro";
import { SectionHeading } from "@/components/ui/SectionHeading";
import Link from "next/link";

const COLLECTION_IDS = [
  "wolverine-blend-bpc-157-tb-500",
  "glp-1-s",
  "tb-500",
  "klow-blend",
  "bpc-157",
  "glow-blend",
  "ghk-cu",
  "glp-3-r",
  "nad-plus",
  "cjc-1295-no-dac-plus-ipamorelin",
];

export default function Home() {
  const { products } = catalog as Catalog;
  const collection = COLLECTION_IDS.map(
    (id) => products.find((p) => p.id === id)!,
  ).filter(Boolean);
  const compoundCount = products.filter(
    (p) => p.status === "active" && p.cat !== "supplies",
  ).length;

  return (
    <main>
      <Hero />
      <Collection products={collection} />

      {/* Five research disciplines, with the lab-results carousel inset after the first */}
      <section className="mx-auto mt-[clamp(56px,7vw,84px)] max-w-[1440px] px-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <SectionHeading
            kicker="Find Your Compound"
            kickerColor="#1486C9"
            title="Five Research Disciplines"
          />
          <Link
            href="/shop"
            className="text-xs font-semibold uppercase tracking-[1.5px] text-brand-blue no-underline"
          >
            All Compounds →
          </Link>
        </div>
        <AreaCard area={AREAS[0]} />
        <LabResultsCarousel />
        {AREAS.slice(1).map((a) => (
          <AreaCard key={a.key} area={a} />
        ))}
      </section>

      <Promises />
      <LatestCoas compoundCount={compoundCount} />
      <CoaPanel />
      <TraceLot />
      <Logistics />
      <HomeFaq />
      <Outro />
    </main>
  );
}
