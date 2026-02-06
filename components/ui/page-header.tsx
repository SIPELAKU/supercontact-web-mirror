"use client";
import { PageHeaderProps } from "@/lib/types/Pipeline";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
// import LogoHeader from "@/assets/icons/headicon.png"

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  imageWidth = 160,
  imageHeight = 160,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "bg-[#DDE4FC] h-40 rounded-xl shadow-sm px-6 py-6",
        "flex flex-col sm:flex-row sm:items-center sm:justify-between",
        "gap-4 mb-6",
        className
      )}
    >
      <div className="flex-1">
        <h1 className="text-2xl font-semibold text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm mt-1 mb-2">
            {description}
          </p>
        )}

        <nav
          className="flex items-center gap-2 mt-1"
          aria-label="Breadcrumb"
        >
          {breadcrumbs.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              {item.href ? (
                <Link href={item.href} className="text-sm text-[#4C542F] hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span className="text-sm text-[#4C542F]">{item.label}</span>
              )}

              {i < breadcrumbs.length - 1 && (
                <span className="text-muted-foreground/40">•</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="hidden sm:block">
        <Image
          src={"/icons/headicon.png"}
          width={imageWidth}
          height={imageHeight}
          alt="Header illustration"
          className="object-contain mr-30 pt-9"
        />
      </div>

    </div>
  );
}