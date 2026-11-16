import Image from "next/image";

interface BrandLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function BrandLogo({
  className = "",
  width = 135,
  height = 40,
}: BrandLogoProps) {
  return (
    <Image
      src="/logos/logo-1.v1.svg"
      alt="Premily"
      width={width}
      height={height}
      unoptimized
      className={`w-auto object-contain ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
}