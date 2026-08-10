import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  FlaskConical,
  Award,
  Eye,
  Lightbulb,
  Heart,
} from "lucide-react";
import catalog from "@/data/catalog.json";
import type { Catalog } from "@/lib/types";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "TROO Bio-Labs combines premium US synthesis, independent analytical testing, and radical documentation transparency.",
};

const VALUES = [
  { icon: FlaskConical, color: "#D9368A", label: "Science First" },
  { icon: Award, color: "#8D43B8", label: "Premium Quality" },
  { icon: Eye, color: "#1486C9", label: "Transparency" },
  { icon: Lightbulb, color: "#F47B2A", label: "Innovation" },
  { icon: Heart, color: "#73B84A", label: "Wellness" },
];

export default function AboutPage() {
  const { products } = catalog as Catalog;
  const count = products.filter(
    (p) => p.status === "active" && p.cat !== "supplies",
  ).length;

  const stats = [
    { v: String(count), c: "#D9368A", l: "Catalog Compounds" },
    { v: "100%", c: "#1486C9", l: "Lots Third-Party Tested" },
    { v: "4.8★", c: "#F47B2A", l: "Average Verified Rating" },
    { v: "24h", c: "#73B84A", l: "Order to Dispatch" },
  ];

  return (
    <main className="mx-auto max-w-[1440px] px-6 pt-[clamp(30px,4vw,52px)]">
      <div className="max-w-[760px]">
        <div className="text-[11px] font-semibold uppercase tracking-[2.5px] text-brand-purple">
          About TrooBioLabs
        </div>
        <h1 className="text-gradient-brand mb-0 mt-[14px] text-[clamp(30px,4.4vw,48px)] font-light leading-[1.12] tracking-[-.5px]">
          Advancing Research Through Science
        </h1>
        <p className="mb-0 mt-[18px] text-[15.5px] leading-[1.85] text-slate">
          TROO Bio-Labs exists to give researchers compounds they never have to
          second-guess. We combine premium US synthesis, independent analytical
          testing, and radical documentation transparency — so the material in
          your vial is exactly what the label says, every lot, every time.
        </p>
        <div className="mt-[22px] h-1 w-[150px] rounded-[2px] bg-gradient-brand" />
      </div>

      <StaggerGrid className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,155px),1fr))] gap-[14px]">
        {VALUES.map((v) => (
          <StaggerItem key={v.label}>
            <div className="rounded-[14px] border border-line-soft bg-white px-[14px] py-6 text-center">
              <div
                className="mx-auto flex h-[52px] w-[52px] items-center justify-center rounded-full border-[1.5px] border-[#C9D4DE]"
                style={{ color: v.color }}
              >
                <v.icon size={21} strokeWidth={1.8} />
              </div>
              <div className="mt-3 text-[11px] font-semibold uppercase tracking-[1.5px]">
                {v.label}
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerGrid>

      <div className="mt-14 grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-center gap-9">
        <Reveal>
          <div className="relative h-[340px] overflow-hidden rounded-2xl">
            <Image
              src="/images/lab-hand.jpg"
              alt="TROO Bio-Labs laboratory"
              fill
              sizes="(max-width: 800px) 100vw, 700px"
              className="object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-gradient-brand m-0 text-[clamp(22px,3vw,30px)] font-light tracking-[-.5px]">
            Built by Researchers, for Researchers
          </h2>
          <p className="mb-0 mt-4 text-[14.5px] leading-[1.9] text-slate">
            TrooBioLabs was founded after one too many failed assays traced
            back to under-documented source material. We set a simple rule: if
            a lot can&apos;t be verified by an independent lab, it doesn&apos;t
            ship. That rule became our five-stage quality pipeline — US
            synthesis, in-house QC, third-party Batch Verified and mass-spec
            verification, published COAs, and cold-chain fulfillment.
          </p>
          <p className="mb-0 mt-[14px] text-[14.5px] leading-[1.9] text-slate">
            Today we supply university labs, CROs and independent researchers
            across the country, with a catalog spanning tissue-repair,
            metabolic, endocrine, longevity and neuro research compounds.
          </p>
          <div className="mt-[22px] flex flex-wrap gap-3">
            <Link
              href="/quality"
              className="inline-flex rounded-full bg-gradient-cta px-7 py-[13px] text-[11.5px] font-semibold uppercase tracking-[1.8px] text-white no-underline"
            >
              Our Quality Pipeline
            </Link>
            <Link
              href="/contact"
              className="inline-flex rounded-full border-2 border-brand-blue px-7 py-[13px] text-[11.5px] font-semibold uppercase tracking-[1.8px] text-brand-blue no-underline hover:bg-[#EAF5FC]"
            >
              Talk to Us
            </Link>
          </div>
        </Reveal>
      </div>

      <div className="mt-14 grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-4">
        {stats.map((s) => (
          <div
            key={s.l}
            className="rounded-[14px] border border-[#EAEEF3] bg-surface p-[26px] text-center"
          >
            <div className="text-[32px] font-light" style={{ color: s.c }}>
              {s.v}
            </div>
            <div className="mt-2 text-[10.5px] font-semibold uppercase tracking-[1.6px] text-muted">
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
