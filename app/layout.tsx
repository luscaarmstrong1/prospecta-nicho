import type { Metadata, Viewport } from "next";
import { Sora, Manrope } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { assetPath } from "@/lib/asset-path";
import { site } from "@/lib/site";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-sora",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-manrope",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Prospecta Nicho | Leads B2B, Sites, Landing Pages e Automação",
    template: "%s | Prospecta Nicho",
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  alternates: { canonical: "/" },
  icons: {
    icon: assetPath("/assets/brand/favicon.png"),
    apple: assetPath("/assets/brand/apple-touch-icon.png"),
  },
  openGraph: {
    title: "Prospecta Nicho | Leads B2B, Sites, Landing Pages e Automação",
    description: site.description,
    type: "website",
    url: site.url,
    siteName: site.name,
    locale: "pt_BR",
    images: [{ url: `${site.url}/assets/brand/og-image.png`, width: 1200, height: 630, alt: site.name }],
  },
  robots: process.env.NEXT_PUBLIC_DEPLOY_ENV === "preview"
    ? { index: false, follow: false }
    : { index: true, follow: true, googleBot: { index: true, follow: true } },
  twitter: {
    card: "summary_large_image",
    title: "Prospecta Nicho | Leads B2B, Sites, Landing Pages e Automação",
    description: site.description,
    images: [`${site.url}/assets/brand/og-image.png`],
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.url}/#organization`,
    name: site.name,
    alternateName: site.alternateName,
    url: site.url,
    description: site.description,
    slogan: site.slogan,
    contactPoint: [{ "@type": "ContactPoint", contactType: "sales", email: site.email }],
    logo: `${site.url}/assets/brand/logo-pn-final-dark.png`,
  };

  return (
    <html lang="pt-BR" className={`${sora.variable} ${manrope.variable}`}>
      <body className={manrope.className}>
        <JsonLd data={organization} />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
