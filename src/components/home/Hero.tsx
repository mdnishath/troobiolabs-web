"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HERO_PRODUCTS } from "@/lib/home-data";
import { useCart } from "@/store/cart";
import { useUi } from "@/store/ui";

const EASE = "cubic-bezier(.22,.61,.36,1)";

const CHIPS: { mark: string; color: string; label: string }[] = [
  { mark: "✓", color: "#D9368A", label: "Lab Report With Every Batch" },
  { mark: "✓", color: "#1486C9", label: "3rd-Party Lab Tested" },
  { mark: "✓", color: "#73B84A", label: "≥98% Batch-Verified Purity Floor" },
];

export function Hero() {
  const [sel, setSel] = useState(0);
  const [touched, setTouched] = useState(false);
  const add = useCart((s) => s.add);
  const openCart = useUi((s) => s.openCart);

  useEffect(() => {
    if (touched) return;
    const t = setInterval(() => setSel((s) => (s + 1) % 5), 4500);
    return () => clearInterval(t);
  }, [touched]);

  const cur = HERO_PRODUCTS[sel];

  const doAdd = () => {
    add({
      productId: cur.id,
      name: cur.name,
      sub: cur.sub,
      size: cur.addSize,
      price: cur.addPrice,
      img: cur.img,
    });
    openCart();
  };

  return (
    <section className="relative overflow-hidden">
      {/* drifting radial blobs */}
      <div className="hero-blob-a pointer-events-none absolute -left-[90px] -top-[130px] h-[440px] w-[440px] rounded-full" />
      <div className="hero-blob-b pointer-events-none absolute -bottom-[150px] -right-[70px] h-[500px] w-[500px] rounded-full" />

      <div className="relative mx-auto grid min-h-[calc(100vh-160px)] max-w-[1440px] grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-center gap-12 px-6 pb-[clamp(56px,8vw,100px)] pt-[clamp(36px,5vw,64px)]">
        {/* Left column */}
        <div>
          <div className="hero-rise text-[11px] uppercase tracking-[3px] text-brand-purple [animation-delay:.05s]">
            Troo Bio-Labs · Research Compounds
          </div>
          <h1 className="text-gradient-brand hero-rise mb-0 mt-6 text-[clamp(38px,4.9vw,58px)] font-normal leading-[1.12] tracking-[-.5px] [animation-delay:.15s]">
            Premium peptides.
            <br />
            Proven science.
          </h1>
          <p className="hero-rise mb-0 mt-[22px] max-w-[460px] text-base leading-[1.75] text-body [animation-delay:.3s]">
            Every batch&apos;s third-party lab report is published before
            it&apos;s for sale. Look it up, read the numbers.
          </p>
          <div className="hero-rise mt-7 flex flex-wrap gap-[10px] [animation-delay:.45s]">
            {CHIPS.map((c) => (
              <span
                key={c.label}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-white px-4 py-[9px] text-[10px] uppercase tracking-[1.5px] text-slate"
              >
                <span className="font-semibold" style={{ color: c.color }}>
                  {c.mark}
                </span>
                {c.label}
              </span>
            ))}
          </div>
          <div className="hero-rise mt-[34px] flex flex-wrap items-center gap-x-[26px] gap-y-3 [animation-delay:.6s]">
            <Link
              href="/shop"
              className="inline-flex items-center rounded-full bg-gradient-cta px-8 py-[15px] text-xs font-semibold uppercase tracking-[1.5px] text-white no-underline shadow-[0_10px_24px_rgba(20,134,201,.22)] transition-[transform,box-shadow,filter] duration-[250ms] hover:-translate-y-[3px] hover:brightness-[1.06] hover:shadow-[0_16px_32px_rgba(20,134,201,.32)]"
            >
              Browse the Catalog
            </Link>
            <a
              href="#lab-results"
              className="text-[13px] tracking-[.5px] text-brand-blue underline decoration-[1.5px] underline-offset-[5px] hover:text-brand-pink"
            >
              See the lab results
            </a>
          </div>
        </div>

        {/* Right column — rotating vials */}
        <div className="hero-rise relative [animation-delay:.25s]">
          <div
            className="pointer-events-none absolute left-1/2 top-[34%] h-[min(80vw,400px)] w-[min(88%,460px)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[34px]"
            style={{
              background:
                "radial-gradient(closest-side,rgba(141,67,184,.16),rgba(20,134,201,.10),transparent 72%)",
            }}
          />
          <div className="relative min-h-[clamp(300px,34vw,390px)]">
            {HERO_PRODUCTS.map((p, i) => {
              const d = (i - sel + 5) % 5;
              const pos = d === 0 ? "c" : d === 1 ? "r" : d === 4 ? "l" : "h";
              const selOn = pos === "c";
              const vis = pos !== "h";
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSel(i);
                    setTouched(true);
                  }}
                  title={`${p.name} research vial`}
                  aria-label={`${p.name} research vial`}
                  className="absolute bottom-0 cursor-pointer border-none bg-transparent p-0"
                  style={{
                    transformOrigin: "bottom center",
                    left: pos === "c" ? "50%" : pos === "l" ? "19%" : pos === "r" ? "81%" : d === 2 ? "114%" : "-14%",
                    zIndex: selOn ? 3 : 2,
                    width: selOn ? "min(42%,210px)" : "min(28%,140px)",
                    transform:
                      "translateX(-50%) " +
                      (selOn
                        ? "translateY(-14px) rotate(0deg)"
                        : `translateY(0) rotate(${pos === "l" ? -7 : 7}deg)`),
                    opacity: vis ? (selOn ? 1 : 0.92) : 0,
                    pointerEvents: vis ? "auto" : "none",
                    transition: `left .65s ${EASE}, width .65s ${EASE}, transform .65s ${EASE}, opacity .5s`,
                  }}
                >
                  <span
                    className={selOn ? "hero-float" : undefined}
                    style={{
                      width: "100%",
                      aspectRatio: "400 / 700",
                      display: "block",
                      backgroundImage: `url('${p.img}')`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center bottom",
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Selected product info */}
          <div key={sel} className="hero-swap mt-[30px] text-center">
            <span
              className="inline-block text-[11px] font-semibold uppercase tracking-[3px]"
              style={{ color: cur.color }}
            >
              {cur.cat}
            </span>
            <div className="text-gradient-brand mt-[14px] text-[clamp(24px,2.9vw,32px)] font-normal leading-[1.15] tracking-[-.5px]">
              {cur.name}
            </div>
            <div className="mt-2 text-[14.5px] leading-[1.6] text-body">
              {cur.sub}
            </div>
            <div className="mt-[10px] text-[10.5px] font-semibold uppercase tracking-[1.5px] text-faint">
              Lot {cur.lot} · Purity {cur.purity} · In Stock
            </div>
            <div className="mt-[18px] flex flex-wrap items-center justify-center gap-x-[22px] gap-y-3">
              <span className="text-xl font-semibold text-ink">{cur.price}</span>
              <button
                onClick={doAdd}
                className="cursor-pointer rounded-full bg-gradient-cta-70 px-7 py-[13px] text-[11px] font-semibold uppercase tracking-[1.5px] text-white shadow-[0_8px_18px_rgba(20,134,201,.22)] hover:brightness-[1.08]"
              >
                Add to Cart
              </button>
              <Link
                href={`/product/${cur.id}`}
                className="text-[13px] font-semibold tracking-[.5px] text-brand-blue underline decoration-[1.5px] underline-offset-[5px] hover:text-brand-pink"
              >
                Full details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
