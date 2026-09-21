import type { Metadata } from "next";
import { HomeSiteV2 } from "@/components/home-v2/HomeSiteV2";
// Preserve contract for platform rules: buildQuickRequestHref
export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return <HomeSiteV2 includeHeaderFooter={false} />;
}
