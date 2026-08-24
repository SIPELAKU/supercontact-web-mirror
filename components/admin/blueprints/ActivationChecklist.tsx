"use client";

import Link from "next/link";
import { CheckCircle2, ExternalLink, RefreshCw } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { EmptyState } from "@/components/ui/empty-state";
import { useActivationChecklist } from "@/lib/hooks/useIndustryBlueprints";
import type { ChecklistItem, ChecklistKind } from "@/lib/types/IndustryBlueprint";

/** Where a tenant actually goes to switch each thing on. A checklist that only
 *  names the problem makes someone hunt for the screen; naming the screen is
 *  most of the value. */
const DESTINATION: Record<ChecklistKind, { label: string; href: string }> = {
    ticket_sla_policy: { label: "SLA tiket", href: "/settings/support/sla" },
    conversation_sla_policy: {
        label: "SLA percakapan",
        href: "/settings/support/conversation-sla",
    },
    ticket_automation_rule: {
        label: "Automation",
        href: "/settings/support/automation",
    },
    flow: { label: "Alur percakapan", href: "/support/flows" },
    conversation_queue: {
        label: "Antrean",
        href: "/settings/support/routing",
    },
    automation_mode: {
        label: "Mode automation akun",
        href: "/settings/web-widget",
    },
    kb_article: {
        // The article LIST lives at /knowledge-base itself. There is no
        // articles/page.tsx - that path only holds [id] and new - so
        // /knowledge-base/articles is a 404.
        label: "Knowledge Base",
        href: "/knowledge-base",
    },
};

export default function ActivationChecklist() {
    const { data, isLoading, isError, refetch, isFetching } = useActivationChecklist();
    const checklist = data?.data;

    if (isLoading) {
        return <div className="py-10 text-center text-sm text-muted-foreground">Memuat checklist…</div>;
    }
    if (isError) {
        return (
            <EmptyState
                title="Gagal memuat checklist"
                description="Coba muat ulang."
                action={{ label: "Coba lagi", onClick: () => refetch() }}
            />
        );
    }

    if (!checklist || checklist.pending === 0) {
        return (
            <EmptyState
                icon={CheckCircle2}
                title="Tidak ada yang menunggu diaktifkan"
                description="Semua yang dipasang sudah menyala, atau memang belum ada blueprint yang dipasang."
            />
        );
    }

    const grouped = checklist.items.reduce<Record<string, ChecklistItem[]>>(
        (acc, item) => {
            (acc[item.kind] ||= []).push(item);
            return acc;
        },
        {}
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="rounded-lg border-l-4 border-l-sky-500 bg-sky-50 p-3 text-sm dark:bg-sky-950/30">
                    <p className="font-medium">{checklist.pending} hal masih non-aktif.</p>
                    <p className="mt-0.5 text-muted-foreground">
                        Semuanya sengaja dipasang mati: SLA yang langsung menyala akan
                        memulai timer pada tiket yang <em>sudah</em> berjalan, dan automation
                        akan langsung menembak tiket lama. Tinjau dulu, baru nyalakan.
                    </p>
                </div>
                <AppButton variantStyle="outline" onClick={() => refetch()} disabled={isFetching}>
                    <RefreshCw className={`mr-1.5 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                    Muat ulang
                </AppButton>
            </div>

            {Object.entries(grouped).map(([kind, items]) => {
                const dest = DESTINATION[kind as ChecklistKind];
                return (
                    <section key={kind} className="rounded-lg border">
                        <header className="flex items-center justify-between border-b bg-muted/40 px-4 py-2.5">
                            <h3 className="text-sm font-medium">
                                {/* An aggregated kind (kb_article) is ONE row standing
                                    for many, so items.length would read "(1)" next to a
                                    row that says "32 artikel". Prefer the real total. */}
                                {dest?.label || kind} (
                                {items.reduce((sum, i) => sum + (i.count ?? 1), 0)})
                            </h3>
                            {dest && (
                                <Link
                                    href={dest.href}
                                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                                >
                                    Buka halamannya
                                    <ExternalLink className="h-3 w-3" />
                                </Link>
                            )}
                        </header>
                        <ul className="divide-y">
                            {items.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm"
                                >
                                    <span className="font-medium">{item.name || item.id}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {item.action}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                );
            })}

            <p className="text-xs text-muted-foreground">
                Daftar ini dibaca dari keadaan sebenarnya, bukan dari catatan pemasangan —
                jadi sebuah item hilang dari sini begitu Anda menyalakannya.
            </p>
        </div>
    );
}
