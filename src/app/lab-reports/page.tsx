import type { Metadata } from "next";
import { Suspense } from "react";
import { LabReportsClient } from "./LabReportsClient";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Lab Reports",
  description:
    "Batch-specific Certificates of Analysis for every TROO Bio-Labs compound — published before purchase.",
};

export default function LabReportsPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-[1440px] px-6 pt-[52px]">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="mb-3 h-20 w-full" />
          ))}
        </main>
      }
    >
      <LabReportsClient />
    </Suspense>
  );
}
