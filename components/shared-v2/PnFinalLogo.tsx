import Image from "next/image";
import { assetPath } from "@/lib/asset-path";

type PnFinalLogoProps = {
  className?: string;
  priority?: boolean;
  variant?: "dark" | "light" | "goldenMaster" | "nav";
};

export function PnFinalLogo({ className, priority = false, variant = "goldenMaster" }: PnFinalLogoProps) {
  let logoSrc = "/assets/brand/logo-prospectanicho-clean.png";
  if (variant === "nav") {
    logoSrc = "/assets/brand/logo-prospectanicho-nav-transparent.png";
  } else if (variant === "light") {
    logoSrc = "/assets/brand/logo-pn-final-light.webp";
  } else if (variant === "dark") {
    logoSrc = "/assets/brand/logo-pn-final-dark.webp";
  }

  return (
    <Image
      className={className}
      src={assetPath(logoSrc)}
      alt="ProspectaNicho"
      width={400}
      height={variant === "nav" ? 50 : 58}
      priority={priority}
      unoptimized
    />
  );
}
