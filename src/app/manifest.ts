import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "By Bitter Flame — AI Fantasy Adventure",
    short_name: "By Bitter Flame",
    description:
      "An AI-powered Fantasy Adventure. Create a character and explore a fading world by torchlight.",
    start_url: "/",
    display: "standalone",
    background_color: "#1c1917",
    theme_color: "#1c1917",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}