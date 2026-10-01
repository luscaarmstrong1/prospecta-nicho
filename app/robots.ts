import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  if (process.env.NEXT_PUBLIC_DEPLOY_ENV === "preview") {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/compra/", "/pedido/", "/preview/"] }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
