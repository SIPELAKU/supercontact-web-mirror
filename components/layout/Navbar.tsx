"use client";
import { Bell, Moon } from "lucide-react";
import Image from "next/image";
import { Menu } from "lucide-react";

export default function Navbar() {
  return (
    <header className="bg-white px-6 py-4 flex justify-between items-center">
      <Menu className="w-6 stroke-black stroke-[1.5]" />
      <div className="flex items-center space-x-3">
        <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100">
          <Bell className="w-6 h-6 text-yellow-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <button>
          <Moon className="w-8 h-8"/>
        </button>

        <div className="flex items-center space-x-2">
          <Image
            src={"/assets/boy.png"}
            alt="User Avatar"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}