import Image from "next/image";
import { assetPath } from "@/lib/asset-path";

type PnFinalLogoProps = {
  className?: string;
  priority?: boolean;
  variant?: "dark" | "light" | "goldenMaster";
};

export function PnFinalLogo({ className, priority = false, variant = "goldenMaster" }: PnFinalLogoProps) {
  let logoSrc = "/assets/brand/logo-prospectanicho-clean.png";
  if (variant === "light") {
    logoSrc = "/assets/brand/logo-pn-final-light.png";
  } else if (variant === "dark") {
    logoSrc = "/assets/brand/logo-pn-final-dark.png";
  }

  return (
    <Image
      className={className}
      src={assetPath(logoSrc)}
      alt="ProspectaNicho"
      width={400}
      height={58}
      priority={priority}
      unoptimized
    />
  );
}
