import { COA_PANEL } from "@/lib/home-data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

const ROW =
  "grid grid-cols-[minmax(150px,2fr)_1fr_1.1fr] items-center gap-[10px] px-[22px]";

export function CoaPanel() {
  return (
    <section className="mx-auto mt-[clamp(56px,7vw,84px)] max-w-[1440px] px-6">
      <Reveal>
        <SectionHeading
          kicker="The Full-Panel COA"
          title="Most Certificates Stop at Purity."
          size="lg"
          body="A typical research-peptide certificate reports one number. Every TROO COA documents six — the quiet things that ruin an experiment months later."
        />
      </Reveal>
      <Reveal delay={0.1}>
        <div className="mt-[30px] overflow-hidden rounded-2xl border border-line-soft bg-white shadow-[0_6px_20px_rgba(21,40,60,.05)]">
          <div className={`${ROW} border-b border-line-soft bg-surface py-4`}>
            <span className="text-[10px] font-semibold uppercase tracking-[1.8px] text-muted">
              Test
            </span>
            <span className="text-center text-[10px] font-semibold uppercase tracking-[1.8px] text-muted">
              Typical COA
            </span>
            <span className="text-center">
              <span className="inline-block whitespace-nowrap rounded-full bg-gradient-brand px-[14px] py-[6px] text-[10px] font-semibold uppercase tracking-[1.8px] text-white">
                Troo COA
              </span>
            </span>
          </div>
          {COA_PANEL.map((t) => (
            <div key={t.name} className={`${ROW} border-b border-[#F1F4F7] py-[15px]`}>
              <span>
                <span className="block text-[13.5px] font-semibold">{t.name}</span>
                <span className="mt-[3px] block text-[11px] font-semibold text-faint">
                  {t.method}
                </span>
              </span>
              <span
                className="whitespace-nowrap text-center text-xs font-semibold"
                style={{
                  color: t.ok
                    ? "#4E8A2C"
                    : t.typ === "Sometimes"
                      ? "#C77714"
                      : "#B6C0CB",
                }}
              >
                {t.typ}
              </span>
              <span className="whitespace-nowrap text-center text-xs font-semibold text-brand-leaf">
                Reported ✓
              </span>
            </div>
          ))}
          <div className={`${ROW} bg-surface py-4`}>
            <span className="text-xs font-semibold uppercase tracking-[1px]">
              What you get
            </span>
            <span className="text-center text-[12.5px] font-semibold text-faint">
              1 of 6
            </span>
            <span className="text-center text-[12.5px] font-semibold text-brand-blue">
              6 of 6
            </span>
          </div>
        </div>
      </Reveal>
      <p className="mb-0 mt-[14px] text-center text-xs text-faint">
        Identity, appearance, net content, storage and sign-off rarely appear on
        a typical research-peptide certificate.
      </p>
    </section>
  );
}
