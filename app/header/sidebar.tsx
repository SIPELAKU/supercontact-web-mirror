"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  BookOpen,
  NotebookTabs,
  Building2,
  Menu,
  Power,
  Home,
  Mail
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type MenuSubItem = {
  name: string;
  path: string;
};

type MenuChild = {
  name: string;
  icon?: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement> & React.RefAttributes<SVGSVGElement>>;
  path?: string;
  children?: MenuSubItem[];
};

type MenuSection = {
  item: string;
  children: MenuChild[];
};

const menu: MenuSection[] = [
  {
    item: "Home",
    children: [
      {
        name: "Modern",
        icon: Home,
        path: "/dashboard",
      },
    ],
  },
  {
    item: "Sales",
    children: [
      {
        name: "CRM",
        icon: BookOpen,
        children: [
          { name: "CRM", path: "/crm" },
        ],
      },
    ],
  },
  {
    item: "App",
    children: [
      {
        name: "Contact",
        icon: NotebookTabs,
        path: "/contact",
      },
      {
        name: "Email Marketing",
        icon: Mail,
        children: [
          { name: "Email", path: "/email" },
        ],
      },
    ],
  },
  {
    item: "Admin",
    children: [
      {
        name: "Company Profile",
        icon: Building2,
        path: "/company-profile"
      },
      {
        name: "Mail servers",
        icon: Mail,
        path: "/mail-servers"
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggleMenu = (name: string) => {
    setOpen((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside className="w-[320px] h-screen fixed flex flex-col bg-white border-r border-gray01 py-8 gap-8 text-black overflow-y-auto hide-scrollbar z-10">
      {/* Logo */}
      <div className="flex flex-row justify-between items-center px-5">
        <Image
          src="/assets/logo-supercontact.png"
          alt="Supercontact Logo"
          width={200}
          height={200}
        />
        <Menu className="w-6 stroke-black stroke-[1.5]" />
      </div>

      <nav className="flex flex-1 flex-col gap-5">
        {menu.map((section) => (
          <div key={section.item} className="flex flex-col gap-2">
            <p className="px-5 text-sm font-bold text-gray-500 uppercase">
              {section.item}
            </p>

            {section.children.map((child) => {
              const childKey = `${section.item}-${child.name}`;

              if (child.path && !child.children) {
                return (
                  <Link
                    key={childKey}
                    href={child.path}
                    className={cn(
                      "flex items-center text-black mx-5 gap-3 p-3 text-[16px] rounded-lg font-semibold transition hover:text-white hover:bg-primary",
                      pathname === child.path && "bg-primary text-white"
                    )}
                  >
                    {child.icon && <child.icon  className="stroke-[1.5]" />}
                    <span>{child.name}</span>
                  </Link>
                );
              }

              return (
                <div key={childKey} className="flex flex-col">
                  <button
                    onClick={() => toggleMenu(child.name)}
                    className="flex items-center text-black mx-5 gap-3 p-3 text-[16px] font-semibold rounded-lg transition"
                  >
                    {child.icon && <child.icon  className="stroke-[1.5]" />}
                    <span>{child.name}</span>

                    {child.children && (
                      <ChevronRight
                        size={24}
                        className={cn(
                          "ml-auto stroke-[1.5] transition-transform",
                          open[child.name] && "rotate-90"
                        )}
                      />
                    )}
                  </button>

                  {child.children && open[child.name] && (
                    <div className="flex flex-col mx-5 gap-2">
                      {child.children.map((sub) => {
                        const subKey = `${child.name}-${sub.path}`;
                        return (
                          <Link
                            key={subKey}
                            href={sub.path}
                            className={cn(
                              "flex p-3 pl-12 text-[16px] rounded-lg text-black transition hover:text-primary",
                              pathname === sub.path &&
                                "bg-blue01 text-primary font-semibold"
                            )}
                          >
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <button className="flex justify-around items-center p-2 bg-secondary mx-2 rounded-md">
        <Image
          src={"/assets/boy.png"}
          alt="User Avatar"
          width={40}
          height={40}
          className="rounded-full object-cover bg-white"
        />
        <div className="flex flex-col items-start w-full max-w-[150px]">
          <span className="font-semibold text-black truncate max-w-26">
            Ruben Amorim
          </span>

          <div className="flex gap-2 text-sm items-center">
            <span className="truncate max-w-20">
              Administrator
            </span>
            <span className="bg-gray-300 px-1 rounded-md">+ 2</span>
          </div>
        </div>
        <Power className="text-primary"/>
      </button>
    </aside>
  );
}
