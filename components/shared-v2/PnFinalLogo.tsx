import Image from "next/image";
import { assetPath } from "@/lib/asset-path";

type PnFinalLogoProps = {
  className?: string;
  priority?: boolean;
  variant?: "dark" | "light";
};

export function PnFinalLogo({ className, priority = false, variant = "light" }: PnFinalLogoProps) {
  const logoSrc = variant === "light" 
    ? "/assets/brand/logo-pn-final-light.png" 
    : "/assets/brand/logo-pn-final-dark.png";

  return (
    <Image
      className={className}
      src={assetPath(logoSrc)}
      alt="ProspectaNicho"
      width={2172}
      height={724}
      priority={priority}
      unoptimized
    />
  );
}
