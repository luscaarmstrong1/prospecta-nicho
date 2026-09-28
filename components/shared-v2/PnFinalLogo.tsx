import Image from "next/image";
import { assetPath } from "@/lib/asset-path";

type PnFinalLogoProps = {
  className?: string;
  priority?: boolean;
};

export function PnFinalLogo({ className, priority = false }: PnFinalLogoProps) {
  return (
    <Image
      className={className}
      src={assetPath("/assets/brand/logo-pn-final-dark.png")}
      alt="ProspectaNicho"
      width={2172}
      height={724}
      priority={priority}
      unoptimized
    />
  );
}
