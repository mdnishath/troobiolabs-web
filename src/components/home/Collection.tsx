"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { minPrice, priceLabel } from "@/lib/types";
import { useCart } from "@/store/cart";
import { useUi } from "@/store/ui";
import { useMounted } from "@/hooks/useMounted";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { SectionHeading } from "@/components/ui/SectionHeading";

const EASE = "cubic-bezier(.22,.61,.36,1)";
/* pedestal tint (design uses the purple family for every stand) */
const T = ["#F5F4FC", "#EFEEFA", "#E2E0F4"];

/* placeholder vial render for products without their own photo */
const FALLBACK_BY_CAT: Record<string, string> = {
  tissue: "/images/sections/tissue.png",
  metabolic: "/images/sections/metabolic.png",
  endocrine: "/images/sections/endocrine.png",
  cellular: "/images/sections/cellular.png",
  neural: "/images/sections/neural.png",
  supplies: "/images/sections/cellular.png",
};

export function Collection({ products }: { products: Product[] }) {
  const [active, setActive] = useState(0);
  const [touchX, setTouchX] = useState<number | null>(null);
  const add = useCart((s) => s.add);
  const items = useCart((s) => s.items);
  const openCart = useUi((s) => s.openCart);
  const mounted = useMounted();
  /* phones get wider spacing, center-only labels and a counter instead of 30 dots */
  const mobile = useMediaQuery("(max-width: 640px)");
  const N = products.length;

  /* ✓ reflects the real cart — removing the item in the drawer flips it back to + */
  const inCart = (id: string) =>
    mounted && items.some((i) => i.productId === id);

  const tap = (p: Product) => {
    const v = p.sizes[0];
    add({
      productId: p.id,
      name: p.name,
      sub: p.sub,
      size: v.size,
      price: v.price,
      img: p.images[0] ?? null,
    });
    openCart();
  };

  const navBtn = (on: boolean) =>
    `flex h-[42px] w-[42px] items-center justify-center rounded-full border border-line bg-white pb-[2px] text-[19px] leading-none text-ink transition-colors hover:border-[#9B8FE8] hover:text-brand-purple ${on ? "cursor-pointer" : "cursor-default opacity-35"}`;

  return (
    <section className="mx-auto mt-[clamp(56px,7vw,84px)] max-w-[1440px] px-6">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <SectionHeading kicker="Selected Works" title="The Troo Collection" />
      </div>

      <div className="relative mb-[50px] mt-[50px]">
        <div
          className="relative h-[clamp(330px,36vw,450px)] touch-pan-y overflow-hidden"
          onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (dx < -40) setActive((a) => Math.min(N - 1, a + 1));
            if (dx > 40) setActive((a) => Math.max(0, a - 1));
            setTouchX(null);
          }}
        >
          {products.map((p, i) => {
            const off = i - active;
            const ao = Math.abs(off);
            const vis = ao <= (mobile ? 1 : 2);
            const s = [1, 0.86, 0.72][Math.min(ao, 2)];
            const isAdded = inCart(p.id);
            const showLabels = !mobile || off === 0;
            return (
              <div
                key={p.id}
                className="absolute bottom-0 flex flex-col items-center text-ink"
                style={{
                  left: `${50 + off * (mobile ? 40 : 19)}%`,
                  transform: "translateX(-50%)",
                  width: mobile
                    ? off === 0
                      ? "min(52vw,210px)"
                      : "min(34vw,140px)"
                    : `clamp(105px,${(24 * s).toFixed(1)}%,${Math.round(252 * s)}px)`,
                  zIndex: 10 - ao,
                  opacity: vis ? 1 : 0,
                  pointerEvents: vis ? "auto" : "none",
                  transition: `left .6s ${EASE}, width .6s ${EASE}, opacity .45s`,
                }}
              >
                <span
                  className="relative z-[2] flex w-full items-end justify-center"
                  style={{
                    height: mobile
                      ? `calc(clamp(170px,48vw,240px) * ${off === 0 ? 1 : 0.72})`
                      : `calc(clamp(140px,20vw,288px) * ${s})`,
                    transition: `height .6s ${EASE}`,
                  }}
                >
                  <Link
                    href={`/product/${p.id}`}
                    className="relative z-[2] block h-full max-w-full"
                    
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        p.images[0] ??
                        FALLBACK_BY_CAT[p.cat] ??
                        "/images/sections/tissue.png"
                      }
                      alt={p.name}
                      className="h-full w-full object-contain"
                    />
                  </Link>
                  <button
                    onClick={() => tap(p)}
                    title="Add to cart"
                    aria-label="Add to cart"
                    className="absolute -top-2 right-0 z-[3] flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-none shadow-[0_6px_18px_rgba(21,40,60,.14)] transition-colors duration-[250ms]"
                    style={{
                      background: isAdded
                        ? "linear-gradient(120deg,#D9368A,#8D43B8 45%,#1486C9)"
                        : "#fff",
                      color: isAdded ? "#fff" : "#151515",
                      fontSize: isAdded ? 15 : 18,
                    }}
                  >
                    {isAdded ? "✓" : "+"}
                  </button>
                </span>
                {/* pedestal */}
                <span className="relative z-[1] -mt-[11px] flex w-[96%] flex-col">
                  <span
                    className="block"
                    style={{
                      height: mobile ? 10 : 15,
                      background: `linear-gradient(180deg,#FFFFFF,${T[0]})`,
                      clipPath: "polygon(6% 0,94% 0,100% 100%,0 100%)",
                      border: `1px solid ${T[2]}`,
                    }}
                  />
                  <span
                    className="block"
                    style={{
                      height: mobile ? 22 : 37,
                      background: `linear-gradient(180deg,${T[0]},${T[1]})`,
                      border: `1px solid ${T[2]}`,
                      boxShadow: "0 18px 30px rgba(96,90,180,.10)",
                    }}
                  />
                </span>
                {showLabels && (
                  <>
                    <span className="mt-4 line-clamp-2 max-w-full text-center text-[clamp(13px,1.3vw,16px)] font-medium leading-[1.3] tracking-[.2px]">
                      {p.name}
                    </span>
                    <span
                      className="mt-[9px] whitespace-nowrap rounded-full bg-white px-4 py-[7px] text-[12.5px] font-semibold text-slate"
                      style={{ border: `1px solid ${T[2]}` }}
                    >
                      {p.sizes.length > 1 ? priceLabel(p) : `$${minPrice(p).toFixed(2)}`}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-[34px] flex items-center justify-center gap-5">
          <button
            onClick={() => setActive((a) => Math.max(0, a - 1))}
            aria-label="Previous products"
            className={navBtn(active > 0)}
          >
            ‹
          </button>
          {mobile ? (
            <span className="min-w-[64px] text-center text-[12.5px] font-semibold tracking-[1px] text-muted">
              {active + 1} / {N}
            </span>
          ) : (
            <div className="flex max-w-[60vw] flex-wrap items-center justify-center gap-[7px]">
              {products.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setActive(i)}
                  aria-label={`Go to ${p.name}`}
                  className="cursor-pointer rounded-full border-none p-0 transition-[width,background] duration-300"
                  style={{
                    width: i === active ? 22 : 7,
                    height: 7,
                    background: i === active ? "#9B8FE8" : "#D5DCE3",
                  }}
                />
              ))}
            </div>
          )}
          <button
            onClick={() => setActive((a) => Math.min(N - 1, a + 1))}
            aria-label="Next products"
            className={navBtn(active < N - 1)}
          >
            ›
          </button>
        </div>

        <div className="mt-5 flex justify-end">
          <Link
            href="/shop"
            className="text-xs font-semibold uppercase tracking-[1.8px] text-brand-blue no-underline"
          >
            View the Full Catalogue →
          </Link>
        </div>
      </div>
    </section>
  );
}
