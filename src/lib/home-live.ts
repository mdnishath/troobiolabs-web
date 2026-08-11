import type { Category, Product } from "@/lib/types";
import { minPrice, priceLabel } from "@/lib/types";

/** Live homepage data derived from the catalog (no hardcoded products). */

export interface HeroItem {
  id: string;
  name: string;
  sub: string;
  img: string;
  catName: string;
  color: string;
  lotText: string;
  price: string;
  addSize: string;
  addPrice: number;
}

export interface LabBatchItem {
  name: string;
  img: string;
  color: string;
  purity: string;
  lot: string;
  file: string;
}

export interface CoaCardItem {
  name: string;
  lot: string;
  purity: string;
  pdf: string;
}

export interface HomeLiveData {
  hero: HeroItem[];
  labBatches: LabBatchItem[];
  latestCoas: CoaCardItem[];
  thumbs: string[];
  promoImg: string | null;
}

const HERO_CAT_ORDER = ["cellular", "endocrine", "metabolic", "neural", "tissue"];

export function buildHomeData(
  products: Product[],
  categories: Category[],
): HomeLiveData {
  const active = products.filter((p) => p.status === "active");
  const catOf = (id: string) => categories.find((c) => c.id === id);

  /* hero: one photographed product per research discipline */
  const hero: HeroItem[] = HERO_CAT_ORDER.flatMap((catId) => {
    const p =
      active.find((x) => x.cat === catId && x.featured && x.images.length) ??
      active.find((x) => x.cat === catId && x.popular && x.images.length) ??
      active.find((x) => x.cat === catId && x.images.length);
    if (!p) return [];
    const cat = catOf(catId);
    const v = p.sizes[0];
    return [
      {
        id: p.id,
        name: p.name,
        sub: [p.sub, v?.size ? `${v.size} vial` : ""].filter(Boolean).join(" · "),
        img: p.images[0],
        catName: cat?.name ?? "",
        color: cat?.color ?? "#1486C9",
        lotText: p.coa
          ? `Lot ${p.coa.label} · Purity ${p.specs.purity || "≥98%"} · In Stock`
          : `Purity ${p.specs.purity || "≥98%"} · Batch Verified · In Stock`,
        price: priceLabel(p),
        addSize: v?.size ?? "",
        addPrice: v?.price ?? minPrice(p),
      },
    ];
  });

  /* lab-results carousel: photographed products with a published COA */
  const labBatches: LabBatchItem[] = active
    .filter((p) => p.coa && p.images.length)
    .slice(0, 5)
    .map((p) => ({
      name: `${p.name} · ${p.sizes[0]?.size ?? ""}`,
      img: p.images[0],
      color: catOf(p.cat)?.color ?? "#1486C9",
      purity: p.specs.purity || "≥98%",
      lot: p.coa!.label,
      file: p.coa!.file,
    }));

  /* latest COA cards */
  const latestCoas: CoaCardItem[] = active
    .filter((p) => p.coa)
    .slice(0, 3)
    .map((p) => ({
      name: `${p.name} · ${p.sizes[0]?.size ?? ""}`,
      lot: p.coa!.label,
      purity: p.specs.purity || "≥98%",
      pdf: p.coa!.file,
    }));

  /* outro thumbnails + promises visual */
  const withImages = active.filter((p) => p.images.length);
  const thumbs = withImages.slice(0, 5).map((p) => p.images[0]);
  const promo =
    withImages.find((p) => p.id === "klow-blend") ??
    withImages.find((p) => p.featured) ??
    withImages[0];

  return { hero, labBatches, latestCoas, thumbs, promoImg: promo?.images[0] ?? null };
}
