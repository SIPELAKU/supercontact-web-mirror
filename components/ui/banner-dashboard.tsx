import Image from "next/image"
import { BannerDashboardProps } from "@/lib/models/types"
import { getCleanPath } from "@/lib/utils"

export default function BannerDashboard({pathname}: BannerDashboardProps){
    const cleanpath = getCleanPath(pathname)
    return(
        <section className="w-full bg-[#DDE4FC] rounded-2xl p-6 md:py-6 md:px-12 flex justify-between items-center relative overflow-hidden">
          <div className="flex flex-col gap-2">
            <span className="text-xl font-semibold">{cleanpath}</span>
            <span className="flex gap-4 text-sm text-gray-600">
              <span>Dashboard</span>
              <span>&bull;</span>
              <span>{cleanpath}</span>
            </span>
          </div>
          <div className="w-28 h-28 md:w-40 md:h-40">
            <Image
              src="/assets/logo-company.png"
              alt="Logo Company"
              width={250}
              height={250}
              className="object-cover absolute bottom-0 right-20"
            />
          </div>
        </section>
    )
}