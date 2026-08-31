"use client";

import Image from "next/image";
import Link from "next/link";
import {
    ArrowLeft,
    LifeBuoy,
    MessagesSquare,
    TrendingUp,
} from "lucide-react";
import { strings } from "@/lib/utils/strings";
import { useLanguage } from "@/lib/context/LanguageContext";

/**
 * Shared two-column shell for the auth pages (/login, /register):
 * an inset rounded brand panel with the product value props on the left,
 * the form column (children) on the right. On mobile the panel collapses
 * to a small logo + wordmark above the form.
 *
 * `wide` widens the form column's content (register's two-column grid).
 */
export default function AuthShell({
    children,
    wide = false,
}: {
    children: React.ReactNode;
    wide?: boolean;
}) {
    useLanguage();
    const points = [
        { icon: TrendingUp, label: strings.auth_panel_point_1 },
        { icon: MessagesSquare, label: strings.auth_panel_point_2 },
        { icon: LifeBuoy, label: strings.auth_panel_point_3 },
    ];

    return (
        <main className="min-h-screen grid grid-cols-1 md:grid-cols-5 bg-surface-alt">
            {/* Brand panel — inset rounded card on the page surface */}
            <section className="hidden md:block md:col-span-3 p-4 lg:p-5">
                <div
                    className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl p-10 lg:p-14 text-white"
                    style={{ background: "var(--gradient-deep)" }}
                >
                    {/* Decorative depth: soft glows + a thin ring */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -bottom-36 -left-28 h-96 w-96 rounded-full bg-brand/40 blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute top-16 right-12 h-44 w-44 rounded-full border border-white/10"
                    />
                    {/* Floating 3D arrow mark (transparent PNG) */}
                    <Image
                        src="/assets/logo3d.png"
                        alt=""
                        width={200}
                        height={200}
                        aria-hidden
                        className="pointer-events-none absolute -bottom-6 -right-4 -rotate-12 opacity-90 drop-shadow-2xl lg:w-[240px]"
                    />

                    <p className="relative text-2xl font-bold tracking-tight">
                        Smart<span className="text-brand-green">Sales</span>
                    </p>

                    <div className="relative max-w-xl">
                        <h2 className="text-3xl lg:text-[2.6rem] font-bold leading-tight">
                            {strings.auth_panel_title}
                        </h2>
                        <ul className="mt-10 space-y-3.5">
                            {points.map(({ icon: PointIcon, label }) => (
                                <li
                                    key={label}
                                    className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-5 py-3.5 backdrop-blur-sm"
                                >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                                        <PointIcon size={20} />
                                    </span>
                                    <span className="font-medium lg:text-lg">{label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p className="relative text-sm font-medium tracking-wide text-white/60">
                        {strings.auth_panel_footer}
                    </p>
                </div>
            </section>

            {/* Form column */}
            <section className="relative flex flex-col md:col-span-2 justify-center bg-white px-6 md:px-10 lg:px-14 py-10">
                <div className="absolute top-8 left-6 md:left-10 lg:left-14">
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

                <div className={`mx-auto w-full ${wide ? "max-w-lg" : "max-w-md"}`}>
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
                </div>
            </section>
        </main>
    );
}
