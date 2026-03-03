import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle .md files as raw strings so they work in Cloudflare Workers
  // (Workers have no filesystem; readFileSync with process.cwd() fails at runtime)
  webpack(config) {
    config.module.rules.push({ test: /\.md$/, type: "asset/source" });
    return config;
  },
  turbopack: {
    rules: {
      "*.md": { loaders: ["raw-loader"], as: "*.js" },
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