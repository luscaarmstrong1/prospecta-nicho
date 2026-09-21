import type { Metadata } from "next";
import { PreviewSiteV2 } from "@/components/preview-v2/PreviewSiteV2";

export const metadata: Metadata = {
  title: "ProspectaNicho V2 | Prévia visual",
  description: "Demonstração visual isolada da nova experiência ProspectaNicho.",
  robots: { index: false, follow: false },
};

export default function PreviewSiteV2Page() {
  return <PreviewSiteV2 />;
}
