import type { Metadata } from "next";
import { HealthClient } from "@/app/health/HealthClient";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Health",
  robots: { index: false, follow: false },
};

export default function HealthPage() {
  return <HealthClient />;
}
