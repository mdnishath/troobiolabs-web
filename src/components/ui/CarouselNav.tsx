"use client";

const NAVBTN =
  "flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-full border border-line bg-white pb-[2px] text-[19px] leading-none text-ink transition-colors hover:border-[#9B8FE8] hover:text-brand-purple";

/** Shared ‹ dots › control for the home-page carousels. */
export function CarouselNav({
  labels,
  index,
  onIndex,
  noun,
  className = "",
}: {
  /** one label per slide — used for the dot's accessible name */
  labels: string[];
  index: number;
  onIndex: (i: number) => void;
  /** what a slide is, e.g. "batch" — reads as "Next batch" */
  noun: string;
  className?: string;
}) {
  const n = labels.length;
  if (n < 2) return null;

  return (
    <div className={`flex items-center justify-center gap-5 ${className}`}>
      <button
        onClick={() => onIndex((index - 1 + n) % n)}
        aria-label={`Previous ${noun}`}
        className={NAVBTN}
      >
        ‹
      </button>
      <div className="flex items-center gap-[7px]">
        {labels.map((l, i) => (
          <button
            key={`${l}-${i}`}
            onClick={() => onIndex(i)}
            aria-label={`Go to ${noun} ${l}`}
            aria-current={i === index}
            className="cursor-pointer rounded-full border-none p-0 transition-[width] duration-300"
            style={{
              width: i === index ? 22 : 8,
              height: 8,
              background:
                i === index
                  ? "linear-gradient(90deg,#D9368A,#8D43B8,#1486C9)"
                  : "#D5DCE3",
            }}
          />
        ))}
      </div>
      <button
        onClick={() => onIndex((index + 1) % n)}
        aria-label={`Next ${noun}`}
        className={NAVBTN}
      >
        ›
      </button>
    </div>
  );
}
