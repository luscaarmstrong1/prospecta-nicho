import type { Metadata } from "next";
import { GeminiPreviewSite } from "@/components/preview-v2-gemini/GeminiPreviewSite";

export const metadata: Metadata = {
  title: "ProspectaNicho — Preview V2 Gemini (Design Candidato)",
  description: "Candidata Preview V2 criada pelo Gemini/Antigravity com fidelidade estrita aos mockups oficiais.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PreviewSiteV2GeminiPage() {
  return <GeminiPreviewSite />;
}
