import type { NextConfig } from "next";

/* Allow next/image to serve media from the WordPress site (WC_API_URL). */
const wpUrl = process.env.WC_API_URL;
const remotePatterns: NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> = [];
if (wpUrl) {
  try {
    const u = new URL(wpUrl);
    remotePatterns.push({
      protocol: u.protocol.replace(":", "") as "http" | "https",
      hostname: u.hostname,
    });
  } catch {
    /* invalid WC_API_URL — image domains stay local-only */
  }
}

const nextConfig: NextConfig = {
  images: { remotePatterns },
};

export default nextConfig;
