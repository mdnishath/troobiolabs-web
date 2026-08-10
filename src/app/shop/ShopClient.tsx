"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useCatalog } from "@/hooks/useCatalog";
import { minPrice, type Product } from "@/lib/types";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { RuoBanner } from "@/components/ui/RuoBanner";

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

const score = (p: Product) =>
  (p.featured ? 2 : 0) + (p.popular ? 1 : 0) + p.rating;

export function ShopClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading } = useCatalog();
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<SortKey>("featured");

  /* sync category from ?cat= (footer/area links) */
  useEffect(() => {
    const q = searchParams.get("cat");
    if (q) setCat(q);
  }, [searchParams]);

  const categories = data?.categories ?? [];
  const products = data?.products ?? [];

  const pick = (id: string) => {
    setCat(id);
    router.replace(id === "all" ? "/shop" : `/shop?cat=${id}`, {
      scroll: false,
    });
  };

  let list = products.filter((p) => cat === "all" || p.cat === cat);
  list = [...list].sort((a, b) => {
    if (sort === "price-asc") return minPrice(a) - minPrice(b);
    if (sort === "price-desc") return minPrice(b) - minPrice(a);
    if (sort === "name") return a.name.localeCompare(b.name);
    return score(b) - score(a);
  });

  const chips = [
    { id: "all", name: "All Compounds", color: "#151515" },
    ...categories,
  ];

  return (
    <main className="mx-auto max-w-[1440px] px-6 pt-[clamp(30px,4vw,52px)]">
      <h1 className="text-gradient-brand m-0 text-[clamp(30px,4.4vw,48px)] font-light leading-[1.1] tracking-[-.5px]">
        Shop All Compounds
      </h1>
      <p className="mb-0 mt-[14px] max-w-[640px] text-[15px] leading-[1.75] text-body">
        Research-grade peptide powders and blends, third-party tested to ≥98%
        purity. Every product links to its batch-specific Certificate of
        Analysis.
      </p>
      <div className="mb-7 mt-[18px] h-1 w-[150px] rounded-[2px] bg-gradient-brand" />

      {/* chips + sort */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-[9px]">
          {chips.map((c) => {
            const selected = cat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => pick(c.id)}
                className="cursor-pointer rounded-full border-[1.5px] px-[19px] py-[10px] text-[10.5px] font-semibold uppercase tracking-[1.4px] transition-colors"
                style={
                  selected
                    ? {
                        background: c.color,
                        borderColor: c.color,
                        color: "#fff",
                      }
                    : {
                        background: "#fff",
                        borderColor: "#DCE3EA",
                        color: "#3D4753",
                      }
                }
              >
                {c.name}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-[10px]">
          <span className="text-[10.5px] font-semibold uppercase tracking-[1.5px] text-muted">
            Sort
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="cursor-pointer rounded-full border-[1.5px] border-line bg-white px-4 py-[10px] text-xs font-semibold text-ink outline-none"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </div>

      <div className="mb-4 mt-[22px] text-[11px] font-semibold uppercase tracking-[1.5px] text-faint">
        {isLoading ? "Loading catalog…" : `${list.length} compounds`}
      </div>

      {isLoading ? (
        <ProductGridSkeleton count={8} />
      ) : (
        <motion.div
          key={cat + sort}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.045 } },
          }}
          className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,245px),1fr))] gap-[22px]"
        >
          {list.map((p) => (
            <motion.div
              key={p.id}
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] },
                },
              }}
            >
              <ProductCard
                product={p}
                category={categories.find((c) => c.id === p.cat)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <RuoBanner className="mt-11" />
    </main>
  );
}
