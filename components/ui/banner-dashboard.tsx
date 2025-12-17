import Image from "next/image";
import { BannerDashboardProps } from "@/lib/models/types";

export default function BannerDashboard({
  title,
  breadcrumbs = [],
}: BannerDashboardProps) {
  return (
    <section
      className="
        w-full
        bg-[#DDE4FC]
        min-h-[140px] md:min-h-[180px]
        rounded-2xl
        relative
        overflow-hidden
        flex items-center
      "
    >
      {/* Content wrapper */}
      <div className="flex justify-between items-center w-full p-6 md:px-12">
        <div className="flex flex-col gap-2 z-10">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>

          {breadcrumbs.length > 0 && (
            <nav
              aria-label="Breadcrumb"
              className="flex gap-2 text-sm text-gray-600 flex-wrap"
            >
              {breadcrumbs.map((item, idx) => (
                <span key={idx} className="flex items-center gap-2">
                  <span>{item}</span>
                  {idx < breadcrumbs.length - 1 && (
                    <span aria-hidden="true">&bull;</span>
                  )}
                </span>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* Decorative logo – flush bottom */}
      <Image
        src="/assets/logo-company.png"
        alt="Logo Company"
        width={250}
        height={250}
        priority
        className="
          absolute
          bottom-0
          right-6 md:right-20
          translate-y-2 md:translate-y-4
          w-28 h-28
          md:w-40 md:h-40
          object-contain
          pointer-events-none
        "
      />
    </section>
  );
}
