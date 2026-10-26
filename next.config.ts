import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't auto-generate AGENTS.md when next dev detects an AI coding agent
  agentRules: false,
  // Send only the origin as Referer, even same-site. Pages like
  // /create-password?token= and /reset-password?token= would otherwise leak
  // their tokens via the Referer header on follow-up requests (and into logs).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Referrer-Policy", value: "strict-origin" }],
      },
    ];
  },
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