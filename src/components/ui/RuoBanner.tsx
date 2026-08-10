import Link from "next/link";

export function RuoBanner({
  text = "All compounds are supplied for laboratory and in-vitro research by qualified professionals. Not for human or veterinary use.",
  className = "",
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-4 rounded-[14px] border border-[#EAEEF3] bg-surface px-[26px] py-[22px] ${className}`}
    >
      <span className="whitespace-nowrap rounded-full border-[1.5px] border-brand-pink px-[14px] py-[6px] text-[10px] font-semibold uppercase tracking-[1.8px] text-brand-pink">
        Research Use Only
      </span>
      <span className="min-w-[260px] flex-1 text-[12.5px] leading-[1.7] text-body">
        {text}
      </span>
      <Link
        href="/policies#disclaimer"
        className="whitespace-nowrap text-xs font-semibold uppercase tracking-[1px] text-brand-blue no-underline"
      >
        Read Disclaimer →
      </Link>
    </div>
  );
}
