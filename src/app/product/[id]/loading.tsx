import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductLoading() {
  return (
    <main className="mx-auto max-w-[1440px] px-6 pt-[26px]">
      <Skeleton className="h-4 w-56" />
      <div className="mt-[22px] grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-11">
        <Skeleton className="min-h-[420px] rounded-[18px]" />
        <div>
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="mt-3 h-6 w-1/2" />
          <div className="mt-4 flex gap-[10px]">
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          <Skeleton className="mt-5 h-20 w-full" />
          <div className="mt-6 flex gap-3">
            <Skeleton className="h-[52px] w-28 rounded-full" />
            <Skeleton className="h-[52px] w-28 rounded-full" />
          </div>
          <Skeleton className="mt-6 h-[56px] w-full rounded-full" />
        </div>
      </div>
      <div className="mx-auto mt-16 max-w-[900px]">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="mt-3 h-14 w-full" />
        ))}
      </div>
    </main>
  );
}
