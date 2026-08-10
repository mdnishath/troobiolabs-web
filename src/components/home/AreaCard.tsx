import Link from "next/link";
import { TINTS, type Area } from "@/lib/home-data";
import { Reveal } from "@/components/motion/Reveal";

export function AreaCard({ area }: { area: Area }) {
  const t = TINTS[area.color] ?? TINTS["#8D43B8"];
  const dk = area.dark;

  return (
    <Reveal>
      <div
        className="mt-[26px] flex flex-wrap items-stretch overflow-hidden rounded-[20px]"
        style={{
          background: dk
            ? "linear-gradient(140deg,#7C36A8,#8D43B8 55%,#A055CC)"
            : `linear-gradient(140deg,#FFFFFF 0%,${t[0]} 45%,${t[1]} 100%)`,
          border: `1px solid ${dk ? "#7C36A8" : t[2]}`,
        }}
      >
        <div
          className="flex min-w-[min(100%,420px)] flex-[1.15] flex-col items-start p-[clamp(28px,4vw,52px)]"
          style={{ order: area.flip ? 2 : 1 }}
        >
          <div
            className="text-[10px] font-semibold uppercase tracking-[2.4px]"
            style={{ color: dk ? "rgba(255,255,255,.7)" : area.color }}
          >
            Research Area {area.key} — {area.folder}
          </div>
          <div
            className="mb-0 mt-[14px] text-[clamp(26px,3vw,38px)] font-light leading-[1.12] tracking-[-.5px]"
            style={{ color: dk ? "#fff" : "#151515" }}
          >
            {area.title}
          </div>
          <p
            className="mb-0 mt-[14px] max-w-[460px] text-[14.5px] leading-[1.75]"
            style={{ color: dk ? "rgba(255,255,255,.82)" : "#4C5866" }}
          >
            {area.blurb}
          </p>
          <div className="mt-6 flex flex-col gap-4">
            {area.points.map(([title, copy]) => (
              <div key={title}>
                <span
                  className="inline-block rounded-full px-[14px] py-[7px] text-[10px] font-semibold uppercase tracking-[1.4px]"
                  style={{
                    color: dk ? "#fff" : area.color,
                    background: dk ? "rgba(255,255,255,.13)" : "#fff",
                    border: `1px solid ${dk ? "rgba(255,255,255,.35)" : t[2]}`,
                  }}
                >
                  {title}
                </span>
                <p
                  className="mb-0 mt-2 max-w-[430px] text-[12.5px] leading-[1.7]"
                  style={{ color: dk ? "rgba(255,255,255,.75)" : "#4C5866" }}
                >
                  {copy}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {area.comps.map((c) => (
              <span
                key={c}
                className="whitespace-nowrap rounded-full px-[13px] py-[6px] text-[10.5px] font-semibold tracking-[.8px]"
                style={{
                  color: dk ? "#fff" : "#3D4753",
                  border: `1px solid ${dk ? "rgba(255,255,255,.3)" : "#DCE3EA"}`,
                  background: dk ? "rgba(255,255,255,.1)" : "rgba(255,255,255,.75)",
                }}
              >
                {c}
              </span>
            ))}
          </div>
          <Link
            href={`/shop?cat=${area.catId}`}
            className="mt-7 inline-flex rounded-full px-7 py-[13px] text-[11px] font-semibold uppercase tracking-[1.8px] no-underline hover:brightness-[1.06]"
            style={{
              background: dk ? "#fff" : area.color,
              color: dk ? "#7C36A8" : "#fff",
            }}
          >
            Shop {area.folder} Research →
          </Link>
        </div>
        <div
          className="relative flex min-w-[min(100%,300px)] flex-[.85] items-end justify-center overflow-hidden px-[clamp(20px,3vw,40px)] pt-[clamp(24px,3vw,40px)]"
          style={{ order: area.flip ? 1 : 2 }}
        >
          <span
            className="pointer-events-none absolute bottom-[-10%] left-1/2 w-[130%] -translate-x-1/2 rounded-full blur-[30px]"
            style={{
              aspectRatio: "1",
              background: `radial-gradient(closest-side,${area.color}${dk ? "66" : "2E"},transparent 70%)`,
            }}
          />
          <span
            className="relative block w-[min(62%,240px)]"
            style={{
              aspectRatio: area.ar,
              filter: `drop-shadow(0 24px 26px rgba(21,40,60,${dk ? ".35" : ".18"}))`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={area.img}
              alt={`${area.title} research vial`}
              className="h-full w-full object-contain object-bottom"
            />
          </span>
        </div>
      </div>
    </Reveal>
  );
}
