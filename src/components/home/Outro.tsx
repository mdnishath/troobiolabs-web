import Link from "next/link";
import { RuoBanner } from "@/components/ui/RuoBanner";
import { Reveal } from "@/components/motion/Reveal";

const THUMBS = [
  "/images/products/wolverine-blend-bpc-157-tb-500/troo-wolverine-transparent.webp",
  "/images/products/glp-1-s/troo-gpl1-s-transparent.webp",
  "/images/products/tb-500/troo-tb500-transparent.webp",
  "/images/products/klow-blend/troo-klow-transparent.webp",
  "/images/products/bpc-157/troo-bpc157-5mg-transparent.webp",
];

export function Outro() {
  return (
    <section className="mx-auto mt-[clamp(56px,7vw,84px)] max-w-[1440px] px-6">
      <Reveal>
        <div className="rounded-[18px] border border-[#F0E4F1] bg-gradient-wash p-[clamp(32px,5vw,56px)] text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[2.5px] text-brand-purple">
            Private View
          </div>
          <h2 className="text-gradient-brand mb-0 mt-[14px] text-[clamp(26px,3.8vw,40px)] font-light tracking-[-.5px]">
            The Collection Is Open.
          </h2>
          <p className="mx-auto mb-0 mt-[14px] max-w-[460px] text-[15px] leading-[1.8] text-slate">
            Every lot photographed, tested and documented — browse the catalog
            or start from the certificates.
          </p>
          <div className="mt-[26px] flex flex-wrap justify-center gap-[14px]">
            {THUMBS.map((t) => (
              <div
                key={t}
                className="relative h-[104px] w-[104px] overflow-hidden rounded-[14px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t}
                  alt="TROO product"
                  className="h-full w-full object-contain"
                />
              </div>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-[14px]">
            <Link
              href="/shop"
              className="inline-flex rounded-full bg-gradient-cta px-[34px] py-[15px] text-xs font-semibold uppercase tracking-[1.8px] text-white no-underline shadow-[0_10px_24px_rgba(20,134,201,.25)] hover:brightness-[1.06]"
            >
              Enter the Catalog
            </Link>
            <Link
              href="/lab-reports"
              className="inline-flex rounded-full border-2 border-brand-blue px-[34px] py-[15px] text-xs font-semibold uppercase tracking-[1.8px] text-brand-blue no-underline hover:bg-[#EAF5FC]"
            >
              View Certificates
            </Link>
          </div>
        </div>
      </Reveal>
      <RuoBanner
        className="mt-[22px]"
        text="Not for human consumption. All products are intended solely for laboratory and in-vitro research by qualified professionals — not drugs, supplements or food products."
      />
    </section>
  );
}
