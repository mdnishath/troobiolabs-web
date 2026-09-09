"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShoppingCart,
  FileText,
  ShieldCheck,
  FlaskConical,
  Flag,
  Truck,
} from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { useCart } from "@/store/cart";
import { useUi } from "@/store/ui";
import { cn, fmt } from "@/lib/utils";
import { Chromatogram } from "./Chromatogram";
import { ZoomImage } from "./ZoomImage";
import { Reveal } from "@/components/motion/Reveal";

const REVIEWS = [
  { stars: "★★★★★", text: "COA matched the lot on the label and the verification report was clean. Reconstituted without residue — exactly what our protocol needs.", name: "Dr. M. Okafor", meta: "Verified Buyer · Jul 2026" },
  { stars: "★★★★★", text: "Fast shipping, cold pack intact, documentation thorough. The batch-specific reporting is why we reorder here.", name: "S. Whitfield", meta: "Verified Buyer · Jun 2026" },
  { stars: "★★★★☆", text: "Consistent between lots, which matters more than anything for repeat assays. Would like larger vial options.", name: "R. Delgado", meta: "Verified Buyer · Jun 2026" },
];

function SizePills({
  product,
  size,
  setSize,
}: {
  product: Product;
  size: string;
  setSize: (s: string) => void;
}) {
  return (
    <>
      {product.sizes.map((v) => {
        const sel = v.size === size;
        return (
          <button
            key={v.size}
            onClick={() => setSize(v.size)}
            className="cursor-pointer rounded-full px-8 py-[13px] text-[13px] font-semibold tracking-[1px]"
            style={
              sel
                ? {
                    border: "2px solid transparent",
                    background:
                      "linear-gradient(90deg,#14B8C9,#1486C9 70%,#2E5BD7)",
                    color: "#fff",
                    boxShadow: "0 8px 20px rgba(20,134,201,.28)",
                  }
                : {
                    border: "2px solid #CFE0EE",
                    background: "#fff",
                    color: "#1486C9",
                  }
            }
          >
            {v.size.toUpperCase()}
          </button>
        );
      })}
    </>
  );
}

export function ProductDetail({
  product: p,
  category,
  related,
}: {
  product: Product;
  category?: Category;
  related: Product[];
}) {
  const [size, setSize] = useState(p.sizes[0]?.size ?? "");
  const [qty, setQty] = useState(1);
  const [acc, setAcc] = useState<Record<number, boolean>>({ 0: true });
  const add = useCart((s) => s.add);
  const openCart = useUi((s) => s.openCart);

  const cur = p.sizes.find((v) => v.size === size) ?? p.sizes[0];
  const galleryImg =
    cur?.image ?? p.images[0] ?? null;
  const available = p.inStock && cur.inStock;

  const doAdd = () => {
    if (!available) return;
    add(
      {
        productId: p.id,
        name: p.name,
        sub: p.sub,
        size: cur.size,
        price: cur.price,
        img: p.images[0] ?? null,
      },
      qty,
    );
    openCart();
  };

  const accordions = [
    { title: "Product Description", html: p.longDescPlain },
    { title: "Product Description (Scientific)", html: p.longDescSci },
    { title: "Mechanism of Action", html: p.moaPlain },
    { title: "Mechanism of Action (Scientific)", html: p.moaSci },
    {
      title: "Research Applications",
      html: p.applications.length
        ? `<ul>${p.applications.map((a) => `<li>${a}</li>`).join("")}</ul>`
        : "",
    },
    { title: "Research Studies", html: p.researchStudies },
    { title: "References", html: p.references },
    {
      title: "Additional Notes",
      html: p.additionalNotes
        ? p.additionalNotes.startsWith("<")
          ? p.additionalNotes
          : `<p>${p.additionalNotes}</p>`
        : "",
    },
  ].filter((a) => a.html);

  const specs: [string, string][] = (
    [
      ["Brand", p.vendor],
      ["Form", p.specs.form || "Lyophilized Powder"],
      ["Purity", p.specs.purity ? `${p.specs.purity} (Batch Verified)` : ""],
      ["Molecular Formula", p.specs.formula],
      ["Molecular Weight", p.specs.mw],
      ["Sequence", p.specs.sequence],
      ["CAS Number", p.specs.cas],
      ["Storage (Unreconstituted)", p.specs.storage || "Store at −20°C, protect from light"],
      ["Storage (Reconstituted)", "Refrigerate at 2–8°C, use within 2–4 weeks"],
      ["Alternate Names", p.specs.altNames],
    ] as [string, string][]
  ).filter(([, v]) => v);

  return (
    <>
      <main className="mx-auto max-w-[1440px] px-6 pt-[26px]">
        {/* breadcrumb */}
        <div className="mb-[22px] text-[11px] font-semibold uppercase tracking-[2px] text-muted">
          <Link href="/shop" className="text-brand-blue no-underline">
            All Compounds
          </Link>
          <span className="mx-2 text-[#B6C0CB]">/</span>
          <span>{p.name}</span>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-11">
          {/* gallery */}
          <div>
            <div
              /* square on phones — a 560px-tall well left the vial floating
                 in empty space; from sm up the tall well is the design */
              className="relative flex aspect-square items-center justify-center rounded-[18px] p-4 sm:aspect-auto sm:min-h-[560px] sm:p-[clamp(24px,3vw,44px)]"
              style={{ background: "linear-gradient(160deg,#F0F2F5,#E7EAEF)" }}
            >
              {p.featured && (
                <div className="absolute left-4 top-4 flex items-center gap-[10px] sm:left-6 sm:top-6">
                  <span className="h-[22px] w-1 rounded-[2px] bg-brand-pink" />
                  <span className="text-[11px] font-semibold uppercase tracking-[2.5px] text-brand-pink">
                    Featured
                  </span>
                </div>
              )}
              <AnimatePresence mode="wait">
                <motion.span
                  key={galleryImg ?? "none"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="relative m-auto block h-full max-h-full w-auto max-w-full aspect-[4/5] sm:aspect-[203/386] sm:h-[min(74vw,540px)] sm:max-w-[92%]"
                  style={{
                    filter: "drop-shadow(0 24px 26px rgba(21,40,60,.2))",
                  }}
                >
                  {galleryImg ? (
                    <ZoomImage src={galleryImg} alt={p.name} />
                  ) : (
                    <span className="flex h-full items-center justify-center">
                      <FlaskConical size={80} strokeWidth={1} className="text-icon" />
                    </span>
                  )}
                </motion.span>
              </AnimatePresence>
              <span className="absolute bottom-4 right-4 rounded-full border border-[#E2E8EE] bg-white px-[14px] py-[7px] text-[10px] font-semibold uppercase tracking-[1.5px] text-muted sm:bottom-6 sm:right-6">
                {p.coa ? `Lot ${p.coa.label}` : "Batch Verified"}
              </span>
            </div>
            {p.images.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {p.images.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => {
                      const match = p.sizes.find((s) => s.image === img);
                      if (match) setSize(match.size);
                    }}
                    className="relative h-20 w-16 cursor-pointer overflow-hidden rounded-[10px] border-2 bg-surface-2 p-1"
                    style={{
                      borderColor: galleryImg === img ? "#1486C9" : "#E6EBF1",
                    }}
                    aria-label={`View image ${i + 1}`}
                  >
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* info */}
          <div>
            <h1 className="text-gradient-brand m-0 text-[clamp(34px,4.6vw,52px)] font-light leading-[1.06] tracking-[-.5px]">
              {p.name}
            </h1>
            {p.sub && (
              <div className="mt-[6px] text-[clamp(19px,2.4vw,24px)] font-semibold text-brand-blue">
                {p.sub}
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-[10px]">
              {category && (
                <span
                  className="rounded-full px-[18px] py-2 text-[11px] font-semibold uppercase tracking-[1.5px] text-white"
                  style={{ background: category.color }}
                >
                  {category.name}
                </span>
              )}
              {p.popular && (
                <span className="rounded-full bg-[#E9A21B] px-[18px] py-2 text-[11px] font-semibold uppercase tracking-[1.5px] text-white">
                  Popular
                </span>
              )}
            </div>
            {p.shortDesc && (
              <p className="mb-0 mt-[18px] text-base font-semibold leading-[1.75] text-[#1F2933]">
                {p.shortDesc}
              </p>
            )}
            <div className="my-6 h-1 rounded-[2px] bg-gradient-brand" />

            <div className="text-[11px] font-semibold uppercase tracking-[2px] text-muted">
              Size
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              <SizePills product={p} size={size} setSize={setSize} />
            </div>

            <div className="mt-[22px] flex flex-wrap items-stretch gap-3">
              <div className="inline-flex items-center overflow-hidden rounded-full border-2 border-line">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-full min-h-[52px] w-11 cursor-pointer bg-white text-xl text-brand-blue"
                >
                  −
                </button>
                <span className="min-w-[34px] text-center text-[15px] font-semibold">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="h-full min-h-[52px] w-11 cursor-pointer bg-white text-lg text-brand-blue"
                >
                  +
                </button>
              </div>
              <button
                onClick={doAdd}
                disabled={!available}
                className={cn(
                  "inline-flex min-w-[260px] flex-1 items-center justify-center gap-3 rounded-full bg-gradient-cta px-[30px] py-4 text-sm font-semibold uppercase tracking-[1.5px] text-white shadow-[0_10px_24px_rgba(20,134,201,.25)]",
                  available
                    ? "cursor-pointer hover:brightness-[1.06]"
                    : "cursor-not-allowed opacity-45",
                )}
              >
                <ShoppingCart size={17} strokeWidth={2} />
                <span>
                  {available
                    ? `Add to Cart — ${fmt(cur.price * qty)}`
                    : "Out of Stock"}
                </span>
                {available && cur.compareAt && (
                  <span className="font-semibold line-through opacity-65">
                    {fmt(cur.compareAt * qty)}
                  </span>
                )}
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-[26px] gap-y-[10px] text-[12.5px] font-semibold text-slate">
              <span className="inline-flex items-center gap-[7px]">
                <span className="font-semibold text-brand-green">✓</span>
                Purity {p.specs.purity || "≥98%"} (batch verified)
              </span>
              {available ? (
                <span className="inline-flex items-center gap-[7px]">
                  <span className="font-semibold text-brand-green">✓</span>
                  In stock — ships same day
                </span>
              ) : (
                <span className="inline-flex items-center gap-[7px] text-brand-pink">
                  ✕ Currently out of stock
                </span>
              )}
              <a
                href={p.coa?.file ?? "/lab-reports"}
                target={p.coa ? "_blank" : undefined}
                rel={p.coa ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-[7px] font-semibold text-brand-blue no-underline"
              >
                <FileText size={14} strokeWidth={2} />
                Lab Report (COA PDF)
              </a>
            </div>

            <div className="mt-[30px] grid max-w-[520px] grid-cols-4 gap-[10px]">
              {[
                { icon: ShieldCheck, label: <>Secure<br />Checkout</> },
                { icon: FlaskConical, label: <>3rd-Party<br />Tested</> },
                { icon: Flag, label: <>Made in<br />USA</> },
                { icon: Truck, label: <>Fast<br />Shipping</> },
              ].map((b, i) => (
                <div key={i} className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-[1.5px] border-[#C9D4DE] text-[#1F2933]">
                    <b.icon size={22} strokeWidth={1.8} />
                  </div>
                  <div className="mt-2 text-[10px] font-semibold uppercase leading-[1.5] tracking-[1px]">
                    {b.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* accordions */}
        <div className="mx-auto mt-16 max-w-[900px]">
          {accordions.map((a, i) => (
            <div
              key={a.title}
              className="border-t border-line-soft last:border-b"
            >
              <button
                onClick={() => setAcc((s) => ({ ...s, [i]: !s[i] }))}
                className="flex w-full cursor-pointer items-center justify-between gap-4 bg-transparent px-[2px] py-5 text-left text-[16.5px] font-semibold text-ink"
              >
                {a.title}
                <span className="text-[22px] font-normal text-muted">
                  {acc[i] ? "−" : "+"}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {acc[i] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div
                      className="rich-text px-[2px] pb-6 text-[14.5px] leading-[1.9] text-slate"
                      dangerouslySetInnerHTML={{ __html: a.html }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* storage & form */}
        <div className="mx-auto mt-10 max-w-[900px] rounded-[14px] border border-[#EAEEF3] bg-surface p-[clamp(22px,3vw,34px)]">
          <div className="text-[15px] font-semibold uppercase tracking-[1px]">
            Storage &amp; Form
          </div>
          <div className="mb-[6px] mt-3 h-1 w-[150px] rounded-[2px] bg-gradient-brand" />
          {specs.map(([k, v], i) => (
            <div
              key={k}
              className={`flex flex-wrap justify-between gap-5 py-[14px] ${i < specs.length - 1 ? "border-b border-line-soft" : ""}`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
                {k}
              </span>
              <span className="text-right text-[13.5px] font-semibold">
                {v}
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* purity / chromatogram */}
      <section className="mt-[72px] bg-surface px-6 py-16">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-11">
          <Reveal>
            <h2
              className="m-0 text-[clamp(24px,3.2vw,32px)] font-light tracking-[-.5px]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg,#8D43B8,#1486C9 45%,#F47B2A 75%,#73B84A)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Purity You Can Verify
            </h2>
            <p className="mb-0 mt-[18px] text-[14.5px] leading-[1.9] text-slate">
              Every batch undergoes independent analytical testing to verify
              purity and identity. Independent chromatography measures purity,
              while Mass Spectrometry (MS) confirms molecular weight.
            </p>
            <p className="mb-0 mt-[14px] text-[14.5px] leading-[1.9] text-slate">
              Results are documented in a batch-specific Certificate of Analysis
              (COA) that includes the compound name, lot number, batch-verified
              purity, MS confirmation, appearance, and storage recommendations.
              Each COA is available on the corresponding product page before
              purchase.
            </p>
            <div className="my-[22px] h-1 w-[150px] rounded-[2px] bg-gradient-brand" />
            <div className="flex flex-wrap gap-3">
              <a
                href={p.coa?.file ?? "/lab-reports"}
                target={p.coa ? "_blank" : undefined}
                rel={p.coa ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-[10px] rounded-full border-2 border-brand-blue px-7 py-[13px] text-xs font-semibold uppercase tracking-[1.5px] text-brand-blue no-underline hover:bg-[#EAF5FC]"
              >
                <FileText size={15} strokeWidth={2} />
                View Full COA (PDF)
              </a>
              <Link
                href="/lab-reports"
                className="inline-flex items-center rounded-full bg-gradient-cta px-7 py-[13px] text-xs font-semibold uppercase tracking-[1.5px] text-white no-underline"
              >
                All Lab Reports
              </Link>
            </div>
            {p.coas.length > 1 && (
              <div className="mt-[18px] flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px]">
                <span className="font-semibold uppercase tracking-[1.2px] text-icon">
                  Other lots
                </span>
                {p.coas.slice(1).map((c) => (
                  <a
                    key={c.file}
                    href={c.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand-blue no-underline hover:underline"
                  >
                    {c.lot}
                    {c.note ? ` · ${c.note}` : ""}
                  </a>
                ))}
              </div>
            )}
          </Reveal>
          <Reveal delay={0.12}>
            <div className="rounded-[14px] border border-line-soft bg-white p-[clamp(18px,2.5vw,28px)] shadow-[0_10px_30px_rgba(21,40,60,.06)]">
              <div className="text-[10.5px] font-semibold uppercase tracking-[1.8px] text-muted">
                Batch Verification · {p.name}
                {p.coa ? ` · Lot ${p.coa.label}` : ""}
              </div>
              <div className="mt-2 text-[15px] font-semibold tracking-[1px] text-brand-blue">
                PURITY {p.specs.purity || "≥98%"}
              </div>
              <Chromatogram compound={p.name} />
              <div className="mt-4 flex flex-col gap-2">
                <span className="inline-flex items-center gap-[10px] text-[10.5px] font-semibold uppercase tracking-[1.5px] text-slate">
                  <span className="h-[3px] w-[26px] rounded-[2px] bg-brand-blue" />
                  Troo Bio-Labs · This Batch
                </span>
                <span className="inline-flex items-center gap-[10px] text-[10.5px] font-semibold uppercase tracking-[1.5px] text-slate">
                  <span className="h-[3px] w-[26px] rounded-[2px] bg-brand-purple" />
                  Typical Research-Grade Sample
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* related */}
      <section className="mx-auto mt-[72px] max-w-[1440px] px-6">
        <h2 className="text-gradient-brand m-0 text-[clamp(24px,3.2vw,32px)] font-light tracking-[-.5px]">
          Related Compounds
        </h2>
        <p className="mb-0 mt-[10px] text-[15px] text-body">
          Our most popular compounds
        </p>
        <div className="mb-[30px] mt-4 h-1 w-[150px] rounded-[2px] bg-gradient-brand" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,235px),1fr))] gap-[22px]">
          {related.map((r) => (
            <Link
              key={r.id}
              href={`/product/${r.id}`}
              className="block overflow-hidden rounded-[14px] border border-line-soft bg-white text-ink no-underline shadow-[0_6px_20px_rgba(21,40,60,.05)] transition-shadow hover:shadow-[0_14px_32px_rgba(21,40,60,.12)]"
            >
              <div className="h-[5px] bg-gradient-brand" />
              <div className="relative mx-4 mt-4 flex h-[190px] items-center justify-center overflow-hidden rounded-[10px] bg-surface-2">
                {r.images[0] ? (
                  <Image
                    src={r.images[0]}
                    alt={r.name}
                    fill
                    sizes="235px"
                    className="object-contain p-[10px]"
                  />
                ) : (
                  <FlaskConical size={40} strokeWidth={1.2} className="text-icon" />
                )}
              </div>
              <div className="px-[18px] pb-5 pt-4">
                <div className="text-base font-semibold leading-[1.35]">
                  {r.name}
                </div>
                <div className="mt-1 text-xs font-semibold text-muted">
                  {r.sub}
                </div>
                <div className="mt-[14px] flex items-center justify-between gap-[10px]">
                  <span className="text-[15px] font-semibold text-brand-blue">
                    {r.sizes.length > 1 ? "From " : ""}$
                    {Math.min(...r.sizes.map((s) => s.price)).toFixed(2)}
                  </span>
                  <span className="rounded-full border-[1.5px] border-[#BFDCEF] px-[14px] py-[6px] text-[10.5px] font-semibold uppercase tracking-[1.5px] text-brand-blue">
                    View
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* reviews */}
      <section className="mx-auto mt-[72px] max-w-[1440px] px-6 text-center">
        <h2 className="text-gradient-brand m-0 text-[clamp(24px,3.2vw,32px)] font-light tracking-[-.5px]">
          Customer Reviews
        </h2>
        <div className="mx-auto mb-[26px] mt-4 h-1 w-[150px] rounded-[2px] bg-gradient-brand" />
        <div className="inline-flex flex-wrap items-center justify-center gap-[18px]">
          <span className="text-[56px] font-light leading-none">
            {p.rating.toFixed(1)}
          </span>
          <span className="text-left">
            <span className="block text-[22px] tracking-[3px] text-brand-blue">
              ★★★★★
            </span>
            <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
              Based on {p.reviews} verified reviews
            </span>
          </span>
        </div>
        <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-5 text-left">
          {REVIEWS.map((r) => (
            <div
              key={r.name}
              className="rounded-[14px] border border-line-soft bg-white p-6 shadow-[0_6px_20px_rgba(21,40,60,.05)]"
            >
              <div className="flex items-center justify-between gap-[10px]">
                <span className="text-[15px] tracking-[2px] text-brand-blue">
                  {r.stars}
                </span>
                <span className="rounded-full bg-[#EFF7E8] px-[11px] py-[5px] text-[10px] font-semibold uppercase tracking-[1.2px] text-brand-leaf">
                  Verified
                </span>
              </div>
              <p className="mb-0 mt-[14px] text-[13.5px] leading-[1.85] text-slate">
                {r.text}
              </p>
              <div className="mt-4 text-[13px] font-semibold">{r.name}</div>
              <div className="mt-[2px] text-[11px] text-faint">{r.meta}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto mt-[72px] max-w-[900px] px-6">
        <div className="rounded-[18px] border border-[#F0E4F1] bg-gradient-wash p-[clamp(30px,4vw,48px)] text-center">
          <div className="text-xs font-semibold uppercase tracking-[2.5px] text-brand-blue">
            Ready to Begin Your Research?
          </div>
          <h2 className="text-gradient-brand mb-0 mt-[14px] text-[clamp(26px,3.6vw,38px)] font-light tracking-[-.5px]">
            Get {p.name} Today
          </h2>
          <p className="mx-auto mb-0 mt-[14px] max-w-[420px] text-[15px] leading-[1.7] text-slate">
            Third-party tested. {p.specs.purity || "≥98%"} purity. Shipped fast
            from our USA lab.
          </p>
          <div className="mx-auto my-[22px] h-1 w-[150px] rounded-[2px] bg-gradient-brand" />
          <div className="flex flex-wrap justify-center gap-3">
            <SizePills product={p} size={size} setSize={setSize} />
          </div>
          <div className="mt-5 text-[clamp(34px,5vw,46px)] font-light">
            {fmt(cur.price)}
          </div>
          <button
            onClick={doAdd}
            className="mt-[18px] w-[min(420px,100%)] cursor-pointer rounded-full bg-gradient-cta px-[30px] py-[17px] text-sm font-semibold uppercase tracking-[2px] text-white shadow-[0_10px_24px_rgba(20,134,201,.25)] hover:brightness-[1.06]"
          >
            Add to Cart
          </button>
          <div className="mt-[30px] flex flex-wrap justify-center gap-[clamp(18px,4vw,38px)]">
            {[
              { bg: "#D9368A", label: <>Lab<br />Verified</> },
              { bg: "#1486C9", label: <>USA<br />Made</> },
              { bg: "#F47B2A", label: <>Purity<br />Assured</> },
              { bg: "#73B84A", label: <>Fast<br />Shipping</> },
            ].map((b, i) => (
              <span key={i} className="text-center">
                <span
                  className="mx-auto flex h-[46px] w-[46px] items-center justify-center rounded-full text-white"
                  style={{ background: b.bg }}
                >
                  <ShieldCheck size={20} strokeWidth={2} />
                </span>
                <span className="mt-2 block text-[9.5px] font-semibold uppercase leading-[1.5] tracking-[1px] text-ink">
                  {b.label}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* RUO card */}
      <section className="mx-auto mt-10 max-w-[900px] px-6">
        <div className="rounded-[14px] border border-line-soft bg-white p-[clamp(22px,3vw,32px)] shadow-[0_6px_20px_rgba(21,40,60,.05)]">
          <div className="text-xs font-semibold uppercase tracking-[2px] text-brand-pink">
            Research Use Only
          </div>
          <p className="mb-0 mt-3 text-[13.5px] leading-[1.9] text-slate">
            This product is intended solely for laboratory and in-vitro
            research purposes. It is not intended for human or veterinary use,
            diagnostic or therapeutic use, or for any purpose that would
            classify it as a food, drug, cosmetic, or medical device. The
            purchaser assumes full responsibility for legal and compliant use
            of this compound.
          </p>
        </div>
      </section>
    </>
  );
}
