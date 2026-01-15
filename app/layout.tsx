import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout"
import { ConfirmationProvider } from "@/components/ui-mui/confirm-modal"
import { AuthProvider } from "@/lib/context/AuthContext"
import ReactQueryProvider from "@/lib/ReactQueryProvider"
import { Poppins } from "next/font/google"
import type React from "react"
import { Toaster } from "react-hot-toast"
import "./globals.css"

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
      <head>
        {/* Preload critical SVG icons */}
        <link rel="preload" href="/assets/sales-icon-sb.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="/assets/omnichannel.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="/assets/sc-logo.png" as="image" />
      </head>
      <body className="font-sans antialiased min-h-screen bg-[#ffffff]">
        <Toaster position="top-right" />
        <ConfirmationProvider>
          <AuthProvider>
            <ReactQueryProvider>
              <AuthenticatedLayout>
                {children}
              </AuthenticatedLayout>
            </ReactQueryProvider>
          </AuthProvider>
        </ConfirmationProvider>
      </body>
    </html>
  )
}
