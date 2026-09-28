import Image from "next/image";
import Link from "next/link";
import { assetPath } from "@/lib/asset-path";

type BrandLogoProps = {
  variant?: "header" | "footer" | "symbol" | "compact";
  priority?: boolean;
  linked?: boolean;
};

const logoByVariant = {
  header: "/assets/brand/logo-pn-final-dark.png",
  footer: "/assets/brand/logo-pn-final-light.png",
  compact: "/assets/brand/logo-pn-final-dark.png",
  symbol: "/assets/brand/logo-pn-final-symbol.png",
};

const imageSizeByVariant = {
  header: { width: 2172, height: 724, sizes: "(max-width: 720px) 178px, 250px" },
  footer: { width: 2172, height: 724, sizes: "230px" },
  compact: { width: 2172, height: 724, sizes: "178px" },
  symbol: { width: 1280, height: 1280, sizes: "44px" },
};

export function BrandLogo({ variant = "header", priority = variant === "header", linked = true }: BrandLogoProps) {
  const src = assetPath(logoByVariant[variant]);
  const size = imageSizeByVariant[variant];
  const image = (
    <Image
      src={src}
      alt="ProspectaNicho"
      width={size.width}
      height={size.height}
      priority={priority}
      sizes={size.sizes}
    />
  );

  if (!linked) return <span className={`brand brand--${variant}`}>{image}</span>;

  return (
    <Link className={`brand brand--${variant}`} href="/" aria-label="ProspectaNicho início">
      {image}
    </Link>
  );
}
