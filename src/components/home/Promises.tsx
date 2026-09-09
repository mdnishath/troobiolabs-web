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
        <div className="mt-[34px]">
          <StaggerGrid className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>
      </div>
    </section>
  );
}
