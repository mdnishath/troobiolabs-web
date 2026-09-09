/**
 * One size for every product vial on the home page — the five research
 * discipline cards and the lab-results panel show their vial at the same size,
 * on desktop and on mobile.
 *
 * Two kinds of art feed this and they are framed differently, so each gets the
 * box that lands the glass at the same size:
 *
 *  - "section": public/images/sections/*.png, trimmed tight to the vial.
 *  - "catalog": the product photos — all 31 sit on a 1600x2000 canvas with the
 *    vial filling 61% of the width and 94% of the height, flush to the bottom.
 *    The wider box is that transparent margin; the glass inside comes out the
 *    same size, and the nudge re-centres it against the canvas's top-only
 *    padding.
 *
 * The glass lands at 240px wide from md up and 168px (30% smaller) below that,
 * where a full-width vial reads as far too big for the card. Narrower than
 * ~250px of content and both kinds scale down together rather than overflow.
 */
const ART = {
  section: {
    ratio: "356 / 668",
    box: "w-[min(100%,168px)] md:w-[min(100%,240px)]",
    nudge: "",
  },
  catalog: {
    ratio: "1600 / 2000",
    box: "w-[min(160%,275px)] md:w-[min(160%,383px)]",
    nudge: "-translate-y-[3%]",
  },
} as const;

export function VialImage({
  src,
  alt,
  art = "section",
  /** drop-shadow alpha — the dark purple card needs a heavier one */
  shadow = ".18",
}: {
  src: string;
  alt: string;
  art?: keyof typeof ART;
  shadow?: string;
}) {
  const a = ART[art];

  return (
    <span
      className={`relative block ${a.box} ${a.nudge}`}
      style={{
        aspectRatio: a.ratio,
        filter: `drop-shadow(0 24px 26px rgba(21,40,60,${shadow}))`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-contain object-center"
      />
    </span>
  );
}
