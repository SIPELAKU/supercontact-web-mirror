// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import Navbar from "@/components/header/navbar";
// import Sidebar from "@/components/header/sidebar";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen">
          {/* <Sidebar /> */}
          <div className="flex-1 flex flex-col">
            {/* <Navbar /> */}
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}

