"use client";

import Link from "next/link";
import Image from "next/image";
import { FlaskConical } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { minPrice, priceLabel } from "@/lib/types";
import { useCart } from "@/store/cart";
import { useUi } from "@/store/ui";

export function ProductCard({
  product: p,
  category,
}: {
  product: Product;
  category?: Category;
}) {
  const add = useCart((s) => s.add);
  const openCart = useUi((s) => s.openCart);

  const doAdd = () => {
    if (!p.inStock) return;
    const cheapest = p.sizes.reduce((a, b) => (b.price < a.price ? b : a));
    add({
      productId: p.id,
      name: p.name,
      sub: p.sub,
      size: cheapest.size,
      price: cheapest.price,
      img: p.images[0] ?? null,
    });
    openCart();
  };

  const badge = p.featured ? "Featured" : p.popular ? "Popular" : "";

  return (
    <div className="flex flex-col overflow-hidden rounded-[14px] border border-line-soft bg-white shadow-[0_6px_20px_rgba(21,40,60,.05)] transition-shadow duration-300 hover:shadow-[0_14px_32px_rgba(21,40,60,.12)]">
      <div className="h-[5px] bg-gradient-brand" />
      <Link
        href={`/product/${p.id}`}
        className="relative mx-4 mt-4 block h-[200px] overflow-hidden rounded-[10px] bg-surface-2"
      >
        {p.images[0] ? (
          <Image
            src={p.images[0]}
            alt={p.name}
            fill
            sizes="(max-width: 640px) 100vw, 245px"
            className="object-contain p-[10px]"
          />
        ) : (
          <span className="flex h-full items-center justify-center">
            <FlaskConical size={44} strokeWidth={1.2} className="text-icon" />
          </span>
        )}
        {badge && (
          <span
            className="absolute left-3 top-3 rounded-full px-[13px] py-[6px] text-[9.5px] font-semibold uppercase tracking-[1.5px] text-white"
            style={{ background: p.featured ? "#D9368A" : "#F47B2A" }}
          >
            {badge}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col px-[18px] pb-5 pt-4">
        <span
          className="text-[9.5px] font-semibold uppercase tracking-[1.6px]"
          style={{ color: category?.color ?? "#5A6572" }}
        >
          {category?.name ?? ""}
        </span>
        <Link
          href={`/product/${p.id}`}
          className="mt-[10px] text-base font-semibold leading-[1.35] text-ink no-underline"
        >
          {p.name}
        </Link>
        <div className="mt-1 text-xs font-semibold text-muted">{p.sub}</div>
        <div className="mt-2 text-xs tracking-[2px] text-brand-blue">
          ★★★★★{" "}
          <span className="text-[11px] font-semibold tracking-normal text-faint">
            {p.rating.toFixed(1)} ({p.reviews})
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-[10px] pt-4">
          <span>
            <span className="block text-[9.5px] font-semibold uppercase tracking-[1.2px] text-faint">
              {p.sizes.map((s) => s.size).join(" / ")}
            </span>
            <span className="text-[15.5px] font-semibold">
              {p.sizes.length > 1 ? priceLabel(p) : `$${minPrice(p).toFixed(2)}`}
            </span>
          </span>
          <button
            onClick={doAdd}
            disabled={!p.inStock}
            className={
              p.inStock
                ? "cursor-pointer rounded-full border-none bg-gradient-cta-70 px-[22px] py-[11px] text-[11px] font-semibold uppercase tracking-[1.5px] text-white hover:brightness-[1.08]"
                : "cursor-not-allowed rounded-full border-none bg-gradient-cta-70 px-[22px] py-[11px] text-[11px] font-semibold uppercase tracking-[1.5px] text-white opacity-45"
            }
          >
            {p.inStock ? "Add" : "Sold Out"}
          </button>
        </div>
      </div>
    </div>
  );
}
