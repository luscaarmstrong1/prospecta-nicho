import { ProspectaWebPage } from "@/components/prospecta-web/ProspectaWebPage";
import { createMetadata } from "@/lib/seo";

const description = "Sites e landing pages profissionais para fortalecer a presença digital e criar caminhos claros de conversão.";
export const metadata = createMetadata({ title: "Sites e landing pages", description, path: "/sites", noIndex: true });

export default function SitesLandingPagesRoute() {
  return <ProspectaWebPage />;
}
