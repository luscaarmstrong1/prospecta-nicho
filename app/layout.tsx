import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { assetPath } from "@/lib/asset-path";
import { site } from "@/lib/site";
import { serializeJsonLd } from "@/lib/structured-data";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "ProspectaNicho | Bases B2B segmentadas",
    template: "%s | ProspectaNicho",
  },
  description: site.description,
  icons: {
    icon: assetPath("/assets/brand/favicon.png"),
    apple: assetPath("/assets/brand/apple-touch-icon.png"),
  },
  openGraph: {
    title: "ProspectaNicho",
    description: site.description,
    type: "website",
    url: site.url,
    images: [`${site.url}/assets/brand/og-image.png`],
  },
  robots: process.env.NEXT_PUBLIC_DEPLOY_ENV === "preview" ? { index: false, follow: false } : undefined,
  twitter: {
    card: "summary_large_image",
    title: "ProspectaNicho",
    description: site.description,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    contactPoint: [{ "@type": "ContactPoint", contactType: "sales", email: site.email }],
    logo: `${site.url}/assets/brand/logo-horizontal.png`,
  };

  return (
    <html lang="pt-BR">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(organization) }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
