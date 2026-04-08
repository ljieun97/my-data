"use client";

export default function ProviderLogo({
  src,
  alt,
  size = "md",
}: {
  src: string;
  alt: string;
  size?: "sm" | "md";
}) {
  const className =
    size === "sm"
      ? "h-8 w-8 rounded-md border border-white/70 object-cover shadow-sm"
      : "h-9 w-9 rounded-xl object-cover shadow-sm";

  return <img src={src} alt={alt} className={className} />;
}
