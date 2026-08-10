import Link from "next/link";

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link href="/" className="block flex-shrink-0 text-ink no-underline">
      <div
        className="font-normal leading-none"
        style={
          small
            ? { fontSize: 24, letterSpacing: 7 }
            : { fontSize: 27, letterSpacing: 8, marginRight: -8 }
        }
      >
        TROO
      </div>
      <div
        className="flex items-center"
        style={{ gap: small ? 6 : 7, marginTop: 5 }}
      >
        <span
          className="rounded-[2px]"
          style={{
            width: small ? 18 : 20,
            height: 3,
            background: "linear-gradient(90deg,#D9368A,#8D43B8)",
          }}
        />
        <span
          className="font-semibold text-ink"
          style={
            small
              ? { fontSize: 8, letterSpacing: 3 }
              : { fontSize: 9, letterSpacing: 3.5 }
          }
        >
          BIO-LABS
        </span>
        <span
          className="rounded-[2px]"
          style={{
            width: small ? 18 : 20,
            height: 3,
            background: "linear-gradient(90deg,#F47B2A,#73B84A)",
          }}
        />
      </div>
    </Link>
  );
}
