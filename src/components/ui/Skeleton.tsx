import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-surface-2", className)}
      aria-hidden
    />
  );
}

/** Skeleton matching the shop/product-grid card layout. */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[14px] border border-line-soft bg-white shadow-[0_6px_20px_rgba(21,40,60,.05)]">
      <div className="h-[5px] bg-gradient-brand opacity-30" />
      <div className="mx-4 mt-4">
        <Skeleton className="h-[200px] rounded-[10px]" />
      </div>
      <div className="flex flex-1 flex-col px-[18px] pb-5 pt-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-4 w-3/4" />
        <Skeleton className="mt-2 h-3 w-1/2" />
        <div className="mt-auto flex items-center justify-between pt-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-10 w-[88px] rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,245px),1fr))] gap-[22px]">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
