// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Query, QueryClientProvider } from "@tanstack/react-query";
import ReactQueryProvider from "@/lib/ReactQueryProvider";
// import Sidebar from "./header/sidebar";
// import Navbar from "./header/navbar";

import Navbar from "@/components/header/navbar";
import Sidebar from "@/components/header/sidebar";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-full">
          {/* <Sidebar /> */}
          <div className="flex-1 flex flex-col">
            {/* <Navbar /> */}
            <ReactQueryProvider>
            {children}
            </ReactQueryProvider>
          </div>
        </div>
      </body>
    </html>
  )
}

