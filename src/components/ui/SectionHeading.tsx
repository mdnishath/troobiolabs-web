import { cn } from "@/lib/utils";

export function SectionHeading({
  kicker,
  kickerColor = "#8D43B8",
  title,
  body,
  size = "md",
  rule = true,
  className,
}: {
  kicker: string;
  kickerColor?: string;
  title: string;
  body?: React.ReactNode;
  size?: "md" | "lg";
  rule?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-[720px]", className)}>
      <div
        className="text-[10.5px] font-semibold uppercase tracking-[2.2px]"
        style={{ color: kickerColor }}
      >
        {kicker}
      </div>
      <h2
        className={cn(
          "text-gradient-brand mb-0 mt-[10px] font-light tracking-[-.5px]",
          size === "lg"
            ? "text-[clamp(24px,3.4vw,34px)]"
            : "text-[clamp(24px,3.2vw,32px)]",
        )}
      >
        {title}
      </h2>
      {rule && (
        <div className="mt-4 h-1 w-[150px] rounded-[2px] bg-gradient-brand" />
      )}
      {body && (
        <p className="mb-0 mt-3 text-[15px] leading-[1.8] text-slate">{body}</p>
      )}
    </div>
  );
}
