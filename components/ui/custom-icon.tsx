"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface CustomIconProps {
  src: string;
  alt: string;
  fallbackIcon: LucideIcon;
  className?: string;
  size?: number;
}

export default function CustomIcon({ 
  src, 
  alt, 
  fallbackIcon: FallbackIcon, 
  className,
  size = 20 
}: CustomIconProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  if (hasError) {
    return <FallbackIcon className={cn(`w-${size/4} h-${size/4}`, className)} />;
  }

  return (
    <div className={cn(`w-${size/4} h-${size/4} relative`, className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={cn(
          "w-full h-full object-contain transition-opacity",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        onLoad={() => setIsLoading(false)}
        unoptimized // Better for SVG files
      />
    </div>
  );
}