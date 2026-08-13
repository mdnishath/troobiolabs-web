import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";

/* next.config can evaluate before .env.local is applied — load it explicitly
   so the WordPress hostname is always whitelisted for next/image. */
loadEnvConfig(process.cwd());

type RemotePattern = NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
>[number];

/* Local WordPress (Local by Flywheel) — always allowed in dev. */
const remotePatterns: RemotePattern[] = [
  { protocol: "http", hostname: "wp-connector.local" },
];

/* Production/staging WordPress host derived from WC_API_URL. */
const wpUrl = process.env.WC_API_URL;
if (wpUrl) {
  try {
    const u = new URL(wpUrl);
    if (u.hostname !== "wp-connector.local") {
      remotePatterns.push({
        protocol: u.protocol.replace(":", "") as "http" | "https",
        hostname: u.hostname,
      });
    }
  } catch {
    /* invalid WC_API_URL — keep defaults */
  }
}

/* Local-by-Flywheel hosts (*.local) resolve to 127.0.0.1, which Next 16's
   SSRF guard blocks by default. Only relax it for local WP hosts — a real
   production WP domain keeps the protection on. */
const wpIsLocal = remotePatterns.every(
  (p) => p.hostname?.endsWith(".local") || p.hostname === "localhost",
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
    ...(wpIsLocal ? { dangerouslyAllowLocalIP: true } : {}),
  },
  /* Prerendering 60 pages across 11 workers made WP Engine return the odd 504,
     which failed the whole build. Fewer workers ease the burst, and a page-level
     retry covers the one that still slips through. */
  experimental: {
    staticGenerationMinPagesPerWorker: 30,
    staticGenerationRetryCount: 2,
  },
};

export default nextConfig;
