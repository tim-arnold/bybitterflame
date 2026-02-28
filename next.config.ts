import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Exclude @vercel/og from bundle tracing — we use a static OG image URL,
    // not dynamic ImageResponse generation, so this saves ~2 MB from the
    // Cloudflare Worker bundle.
    outputFileTracingExcludes: {
      "*": ["./node_modules/next/dist/compiled/@vercel/og/**/*"],
    },
  },
};

if (process.env.NODE_ENV === "development") {
  // Sets up local Cloudflare platform emulation (D1, KV, etc.) for npm run dev
  // Requires wrangler to be installed and wrangler.toml to be configured
  import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) => {
    initOpenNextCloudflareForDev();
  });
}

export default nextConfig;