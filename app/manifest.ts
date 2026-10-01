import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.alternateName,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#061e3a",
    theme_color: "#0fa3a6",
    lang: "pt-BR",
    icons: [
      { src: "/assets/brand/favicon.png", sizes: "64x64", type: "image/png" },
      { src: "/assets/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
