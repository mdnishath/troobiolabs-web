/** Accepted card brand badges (Visa, Discover, American Express) — inline SVG, no external assets. */
export function CardBrands({
  className = "",
  height = 26,
}: {
  className?: string;
  height?: number;
}) {
  const w = Math.round(height * (40 / 26));
  return (
    <span
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label="We accept Visa, Discover and American Express"
      role="img"
    >
      {/* Visa */}
      <svg width={w} height={height} viewBox="0 0 40 26" aria-hidden="true">
        <rect width="40" height="26" rx="4" fill="#fff" stroke="#DCE3EA" />
        <text
          x="20"
          y="17.5"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="12.5"
          fontWeight="700"
          fontStyle="italic"
          fill="#1A1F71"
          letterSpacing="-0.3"
        >
          VISA
        </text>
      </svg>

      {/* Discover */}
      <svg width={w} height={height} viewBox="0 0 40 26" aria-hidden="true">
        <rect width="40" height="26" rx="4" fill="#fff" stroke="#DCE3EA" />
        <text
          x="17"
          y="16.5"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="7"
          fontWeight="700"
          fill="#231F20"
          letterSpacing="0.2"
        >
          DISCOVER
        </text>
        <circle cx="33" cy="13" r="3.4" fill="#F58220" />
      </svg>

      {/* American Express */}
      <svg width={w} height={height} viewBox="0 0 40 26" aria-hidden="true">
        <rect width="40" height="26" rx="4" fill="#2E77BC" />
        <text
          x="20"
          y="11.5"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="6.2"
          fontWeight="700"
          fill="#fff"
          letterSpacing="0.3"
        >
          AMERICAN
        </text>
        <text
          x="20"
          y="19"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="6.2"
          fontWeight="700"
          fill="#fff"
          letterSpacing="0.3"
        >
          EXPRESS
        </text>
      </svg>
    </span>
  );
}
