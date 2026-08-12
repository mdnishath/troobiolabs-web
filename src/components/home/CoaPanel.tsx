import { COA_PANEL } from "@/lib/home-data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

const ROW =
  "grid grid-cols-[minmax(0,1.5fr)_1fr_1.1fr] items-center gap-2 px-3 sm:grid-cols-[minmax(150px,2fr)_1fr_1.1fr] sm:gap-[10px] sm:px-[22px]";

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
            <span className="text-[9px] font-semibold uppercase tracking-[1px] text-muted sm:text-[10px] sm:tracking-[1.8px]">
              Test
            </span>
            <span className="text-center text-[9px] font-semibold uppercase tracking-[1px] text-muted sm:text-[10px] sm:tracking-[1.8px]">
              Typical COA
            </span>
            <span className="text-center">
              <span className="inline-block whitespace-nowrap rounded-full bg-gradient-brand px-[8px] py-[5px] text-[9px] font-semibold uppercase tracking-[.4px] text-white sm:px-[14px] sm:py-[6px] sm:text-[10px] sm:tracking-[1.8px]">
                Troo COA
              </span>
            </span>
          </div>
          {COA_PANEL.map((t) => (
            <div key={t.name} className={`${ROW} border-b border-[#F1F4F7] py-[15px]`}>
              <span>
                <span className="block text-[12.5px] font-semibold sm:text-[13.5px]">
                  {t.name}
                </span>
                <span className="mt-[3px] block text-[10px] font-semibold text-faint sm:text-[11px]">
                  {t.method}
                </span>
              </span>
              <span
                className="text-center text-[11px] font-semibold sm:whitespace-nowrap sm:text-xs"
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
              <span className="text-center text-[11px] font-semibold text-brand-leaf sm:whitespace-nowrap sm:text-xs">
                Reported ✓
              </span>
            </div>
          ))}
          <div className={`${ROW} bg-surface py-4`}>
            <span className="text-[11px] font-semibold uppercase tracking-[.6px] sm:text-xs sm:tracking-[1px]">
              What you get
            </span>
            <span className="text-center text-[11.5px] font-semibold text-faint sm:text-[12.5px]">
              1 of 6
            </span>
            <span className="text-center text-[11.5px] font-semibold text-brand-blue sm:text-[12.5px]">
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
