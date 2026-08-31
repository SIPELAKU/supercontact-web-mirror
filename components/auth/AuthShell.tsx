"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { strings } from "@/lib/utils/strings";
import { useLanguage } from "@/lib/context/LanguageContext";

/**
 * Shared two-column shell for the auth pages (/login, /register):
 * a brand panel with the product value props on the left, the form column
 * (children) on the right. On mobile the panel collapses to a small
 * logo + wordmark above the form.
 */
export default function AuthShell({ children }: { children: React.ReactNode }) {
    useLanguage();
    const points = [
        strings.auth_panel_point_1,
        strings.auth_panel_point_2,
        strings.auth_panel_point_3,
    ];

    return (
        <main className="min-h-screen grid grid-cols-1 md:grid-cols-5">
            {/* Brand panel */}
            <section
                className="hidden md:flex md:col-span-3 flex-col justify-center gap-12 p-12 lg:p-20 text-white"
                style={{ background: "var(--gradient-brand)" }}
            >
                <div>
                    <p className="text-2xl font-bold">
                        Smart<span className="text-brand-green">Sales</span>
                    </p>
                    <h2 className="mt-6 text-3xl lg:text-4xl font-bold leading-tight max-w-xl">
                        {strings.auth_panel_title}
                    </h2>
                    <ul className="mt-8 space-y-4 text-base lg:text-lg">
                        {points.map((point) => (
                            <li key={point} className="flex items-center gap-3">
                                <CheckCircle2 size={22} className="shrink-0" />
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>
                <Image
                    src="/assets/logo3d.png"
                    alt=""
                    width={260}
                    height={260}
                    className="self-center opacity-90"
                    aria-hidden
                />
            </section>

            {/* Form column */}
            <section className="relative flex flex-col md:col-span-2 justify-center bg-white px-6 md:px-10 lg:px-16 py-10">
                <div className="absolute top-8 left-6 md:left-10 lg:left-16">
                    <Link
                        href="/"
                        className="group flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand transition-colors"
                    >
                        <ArrowLeft
                            size={20}
                            className="transition-transform group-hover:-translate-x-1"
                        />
                        {strings.auth_back_home}
                    </Link>
                </div>

                <div className="md:hidden mt-10 mb-6 text-center">
                    <Image
                        src="/assets/logo3d.png"
                        alt="SmartSales"
                        width={72}
                        height={72}
                        className="mx-auto"
                    />
                    <p className="mt-2 text-xl font-bold">
                        <span className="text-brand">Smart</span>
                        <span className="text-brand-green">Sales</span>
                    </p>
                </div>

                {children}
            </section>
        </main>
    );
}
