import { Clock, Truck, PackageCheck } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/motion/Reveal";

const CARDS = [
  {
    icon: Clock,
    color: "#D9368A",
    kicker: "Processing Cutoff",
    title: "Order by 2:00pm ET",
    copy: "Same-day dispatch on business days; later orders ship the next business day.",
  },
  {
    icon: Truck,
    color: "#1486C9",
    kicker: "Estimated Delivery",
    title: "3–5 business days, tracked",
    copy: "Express cold-chain (1–2 days, gel pack) available at checkout.",
  },
  {
    icon: PackageCheck,
    color: "#73B84A",
    kicker: "Free Shipping",
    title: "On orders over $150",
    copy: "Applied automatically at checkout on qualifying US orders.",
  },
];

export function Logistics() {
  return (
    <section className="mx-auto mt-[clamp(56px,7vw,84px)] max-w-[1440px] px-6">
      <Reveal>
        <SectionHeading
          kicker="Notes & Logistics"
          kickerColor="#1486C9"
          title="From Our Lab to Yours"
          size="lg"
        />
      </Reveal>
      <StaggerGrid className="mt-[30px] grid grid-cols-[repeat(auto-fit,minmax(min(100%,270px),1fr))] gap-[18px]">
        {CARDS.map((c) => (
          <StaggerItem key={c.kicker} className="h-full">
            <div className="h-full rounded-[14px] border border-line-soft bg-white p-[26px] shadow-[0_6px_20px_rgba(21,40,60,.05)]">
              <div
                className="flex h-[46px] w-[46px] items-center justify-center rounded-full border-[1.5px] border-[#C9D4DE]"
                style={{ color: c.color }}
              >
                <c.icon size={19} strokeWidth={1.8} />
              </div>
              <div className="mt-4 text-[10px] font-semibold uppercase tracking-[1.8px] text-muted">
                {c.kicker}
              </div>
              <div className="mt-[6px] text-base font-semibold">{c.title}</div>
              <p className="mb-0 mt-2 text-[12.5px] leading-[1.8] text-body">
                {c.copy}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGrid>
      <p className="mb-0 mt-[18px] text-[12.5px] leading-[1.8] text-faint">
        As shipped, lyophilized material is stable at room temperature — keep it
        sealed, dry and out of direct light. Reconstituted, it goes in the
        fridge at 2–8°C.
      </p>
    </section>
  );
}
