import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/motion/Reveal";

const PROMISES = [
  {
    n: 1,
    color: "#D9368A",
    title: "The report before the sale",
    body: (
      <>
        Every batch is tested by an independent lab and its COA is published
        before the lot goes on sale.{" "}
        <Link href="/lab-reports">Read the reports →</Link>
      </>
    ),
  },
  {
    n: 2,
    color: "#8D43B8",
    title: "The floor is ≥98% Batch Verified",
    body: "Every batch of every compound clears it — a standing specification, not a marketing target.",
  },
  {
    n: 3,
    color: "#1486C9",
    title: "Sealed & tracked",
    body: "Sealed, room-temperature-stable packaging with tracking from the moment it leaves the lab.",
  },
  {
    n: 4,
    color: "#73B84A",
    title: "Made in the USA",
    body: "Synthesized in US-based GMP-compliant facilities, with every reagent lot logged.",
  },
];

export function Promises() {
  return (
    <section className="mt-[clamp(56px,7vw,84px)] bg-surface px-6 py-[clamp(48px,6vw,72px)]">
      <div className="mx-auto max-w-[1440px]">
        <Reveal>
          <SectionHeading
            kicker="Four Promises, In Writing"
            kickerColor="#D9368A"
            title="Every Vendor Says Tested. We Put It in Writing."
            size="lg"
            body="Pure, tested, safe — anyone can claim it. Each TROO promise is backed by a document you can read before you order."
          />
        </Reveal>
        <div className="mt-[34px] grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-stretch gap-7">
          <StaggerGrid className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-4">
            {PROMISES.map((p) => (
              <StaggerItem key={p.n}>
                <div className="h-full rounded-[14px] border border-line-soft bg-white p-6">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold text-white"
                    style={{ background: p.color }}
                  >
                    {p.n}
                  </div>
                  <div className="mt-[14px] text-[14.5px] font-semibold">
                    {p.title}
                  </div>
                  <p className="mb-0 mt-2 text-[12.5px] leading-[1.8] text-body">
                    {p.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
          <Reveal delay={0.15}>
            <div className="relative flex min-h-[340px] items-center justify-center rounded-[18px] p-[clamp(24px,3vw,44px)]"
              style={{ background: "linear-gradient(160deg,#F0F2F5,#E7EAEF)" }}
            >
              <span
                className="relative m-auto block max-w-[80%] self-center"
                style={{
                  height: "min(60vw,330px)",
                  aspectRatio: "201/382",
                  filter: "drop-shadow(0 22px 24px rgba(21,40,60,.22))",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/products/klow-blend/1.webp"
                  alt="KLOW Blend vial"
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="absolute bottom-[22px] right-[22px] rounded-full border border-[#E2E8EE] bg-white px-[14px] py-[7px] text-[9.5px] font-semibold uppercase tracking-[1.8px] text-muted">
                The Guarantee, Executed
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
