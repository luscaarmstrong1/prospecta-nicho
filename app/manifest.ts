import type { MetadataRoute } from "next";
import { assetPath } from "@/lib/asset-path";
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
      { src: assetPath("/favicon-96x96.png"), sizes: "96x96", type: "image/png" },
      { src: assetPath("/apple-touch-icon.png"), sizes: "180x180", type: "image/png" },
    ],
  };
}
