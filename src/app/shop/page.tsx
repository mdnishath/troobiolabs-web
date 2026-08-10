import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopClient } from "./ShopClient";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { provider } from "@/lib/api/provider";

export const metadata: Metadata = {
  title: "Shop All Compounds",
  description:
    "Research-grade peptide powders and blends, third-party tested to ≥98% purity.",
};

export default async function ShopPage() {
  /* server-seeded catalog: instant SSR grid, React Query keeps it fresh */
  const [products, categories] = await Promise.all([
    provider.getProducts(),
    provider.getCategories(),
  ]);

  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-[1440px] px-6 pt-[52px]">
          <ProductGridSkeleton count={8} />
        </main>
      }
    >
      <ShopClient initialData={{ products, categories }} />
    </Suspense>
  );
}
