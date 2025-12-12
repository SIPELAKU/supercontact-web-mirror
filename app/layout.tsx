import type React from "react"
import "./globals.css"
import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"
import { SidebarProvider } from "@/lib/context/SidebarContext"
import { Poppins } from "next/font/google"
import ReactQueryProvider from "@/lib/ReactQueryProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans antialiased min-h-screen bg-[#ffffff] flex">

        <SidebarProvider>
          <Sidebar />

          <div className="flex-1 flex flex-col overflow-x-hidden">
            <Topbar />
            <ReactQueryProvider>
            <main className="flex-1">{children}</main>
            </ReactQueryProvider>
          </div>
        </SidebarProvider>

      </body>
    </html>
  )
}
