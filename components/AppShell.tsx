"use client";

import { usePathname } from "next/navigation";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PreviewBanner } from "@/components/PreviewBanner";
import { WhatsAppFloatingButton } from "@/components/WhatsAppFloatingButton";
import { SiteHeader } from "@/components/shared-v2/SiteHeader";
import { SiteFooter } from "@/components/shared-v2/SiteFooter";

const v2MarketingRoutes = new Set<string>([
  "/solucoes",
  "/segmentos",
  "/planos",
  "/conteudo",
  "/sobre",
]);

const legacyRoutes = new Set<string>([]);

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  if (pathname.startsWith("/preview/site-v2")) {
    return <div className="shell shell--preview-v2">{children}</div>;
  }

  // Home uses its own embedded HomeHeader and SiteFooter inside HomeSiteV2
  if (pathname === "/") {
    return (
      <div className="shell shell--home-v2">
        {children}
        <WhatsAppFloatingButton />
        <CookieBanner />
      </div>
    );
  }

  // V2 Internal Marketing Pages share the global SiteHeader and SiteFooter
  if (v2MarketingRoutes.has(pathname) || Array.from(v2MarketingRoutes).some(r => pathname.startsWith(r))) {
    return (
      <div className="shell shell--home-v2">
        <SiteHeader currentPath={pathname} />
        {children}
        <SiteFooter />
        <WhatsAppFloatingButton />
        <CookieBanner />
      </div>
    );
  }

  if (legacyRoutes.has(pathname)) {
    return <div className="shell shell--legacy">{children}</div>;
  }

  return (
    <div className="shell">
      <Header />
      <main>{children}</main>
      <Footer />
      <PreviewBanner />
      <WhatsAppFloatingButton />
      <CookieBanner />
    </div>
  );
}
