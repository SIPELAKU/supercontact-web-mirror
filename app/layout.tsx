import type React from "react"
import "./globals.css"
import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"
import { SidebarProvider } from "@/lib/context/SidebarContext"
import { AuthProvider } from "@/lib/context/AuthContext"
import { Poppins } from "next/font/google"
import ReactQueryProvider from "@/lib/ReactQueryProvider"
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";

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
      <body className="font-sans antialiased min-h-screen bg-[#ffffff]">
        <AuthProvider>
          <ReactQueryProvider>
            <AuthenticatedLayout>
              {children}
            </AuthenticatedLayout>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
