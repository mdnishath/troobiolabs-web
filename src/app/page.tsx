import { provider } from "@/lib/api/provider";
import { AREAS } from "@/lib/home-data";
import { buildHomeData } from "@/lib/home-live";
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

export const revalidate = 300;

export default async function Home() {
  const [products, categories] = await Promise.all([
    provider.getProducts(),
    provider.getCategories(),
  ]);
  /* the full catalog in the carousel — products with photos lead */
  const active = products.filter((p) => p.status === "active");
  const collection = [
    ...active.filter((p) => p.images.length > 0),
    ...active.filter((p) => p.images.length === 0),
  ];
  const compoundCount = active.filter((p) => p.cat !== "supplies").length;
  const live = buildHomeData(products, categories);

  return (
    <main>
      <Hero products={live.hero} />
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
        <LabResultsCarousel batches={live.labBatches} />
        {AREAS.slice(1).map((a) => (
          <AreaCard key={a.key} area={a} />
        ))}
      </section>

      <Promises />
      <LatestCoas compoundCount={compoundCount} items={live.latestCoas} />
      <CoaPanel />
      <TraceLot />
      <Logistics />
      <HomeFaq />
      <Outro thumbs={live.thumbs} />
    </main>
  );
}
