import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

if (process.env.NODE_ENV === "development") {
  // Sets up local Cloudflare platform emulation (D1, KV, etc.) for npm run dev
  // Requires wrangler to be installed and wrangler.toml to be configured
  import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) => {
    initOpenNextCloudflareForDev();
  });
}

export default nextConfig;