import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "XYZ-For-Now",
    short_name: "XYZ",
    description:
      "Enterprise carbon management for measurement, capture, and compliance.",
    start_url: "/",
    display: "standalone",
    background_color: "#050A14",
    theme_color: "#050A14",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
