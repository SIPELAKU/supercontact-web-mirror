"use client";

import { History, RefreshCw } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { EmptyState } from "@/components/ui/empty-state";
import { useInstalledBlueprints } from "@/lib/hooks/useIndustryBlueprints";

export default function InstalledBlueprints() {
    const { data, isLoading, isError, refetch, isFetching } = useInstalledBlueprints();
    const installs = data?.data || [];

    if (isLoading) {
        return <div className="py-10 text-center text-sm text-muted-foreground">Memuat riwayat…</div>;
    }
    if (isError) {
        return (
            <EmptyState
                title="Gagal memuat riwayat"
                description="Coba muat ulang."
                action={{ label: "Coba lagi", onClick: () => refetch() }}
            />
        );
    }
    if (installs.length === 0) {
        return (
            <EmptyState
                icon={History}
                title="Belum ada blueprint yang dipasang"
                description="Pasang paket industri untuk menyiapkan kategori, antrean, SLA, dan tahapan penjualan sekaligus."
            />
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex justify-end">
                <AppButton variantStyle="outline" onClick={() => refetch()} disabled={isFetching}>
                    <RefreshCw className={`mr-1.5 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                    Muat ulang
                </AppButton>
            </div>
            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[640px] text-sm">
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="px-3 py-2 font-medium">Blueprint</th>
                            <th className="px-3 py-2 font-medium">Dipasang</th>
                            <th className="px-3 py-2 font-medium">Modul</th>
                            <th className="px-3 py-2 font-medium">Hasil</th>
                        </tr>
                    </thead>
                    <tbody>
                        {installs.map((row) => (
                            <tr key={row.id} className="border-t align-top">
                                <td className="px-3 py-2">
                                    <div className="font-medium">{row.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        versi {row.installed_version}
                                        {row.update_available && (
                                            <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-900 dark:bg-sky-900/40 dark:text-sky-200">
                                                versi {row.current_version} tersedia
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-3 py-2 text-muted-foreground">
                                    {new Date(row.installed_at).toLocaleString("id-ID")}
                                </td>
                                <td className="px-3 py-2 text-xs text-muted-foreground">
                                    {row.modules ? `${row.modules.length} dipilih` : "semua modul"}
                                </td>
                                <td className="px-3 py-2 text-xs text-muted-foreground">
                                    {row.totals
                                        ? `${row.totals.created} dibuat, ${row.totals.skipped} dilewati`
                                        : "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-muted-foreground">
                Memasang ulang blueprint yang sama aman: yang sudah ada dilewati, tidak
                digandakan.
            </p>
        </div>
    );
}
