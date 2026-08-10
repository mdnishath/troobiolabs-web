import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopClient } from "./ShopClient";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Shop All Compounds",
  description:
    "Research-grade peptide powders and blends, third-party tested to ≥98% purity.",
};

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-[1440px] px-6 pt-[52px]">
          <ProductGridSkeleton count={8} />
        </main>
      }
    >
      <ShopClient />
    </Suspense>
  );
}
