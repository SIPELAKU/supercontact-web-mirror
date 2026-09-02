"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { CircularProgress } from "@mui/material";
import { Layers, PlugZap, RefreshCw } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/lib/context/AuthContext";
import { getSourcesStatus } from "@/lib/api/company-intelligence";
import { SourcesStatusResponse } from "@/lib/types/company-intelligence";
import { sourceGroup } from "@/lib/data/source-groups";

const formatDate = (value: string | null) =>
    value ? format(new Date(value), "dd MMM yyyy, HH:mm") : "-";

// Read-only status board for everything that feeds the intelligence cache:
// which provider clients are configured (booleans only - the API never sends
// key material), what the cache holds per source, and when the registry
// loader CLIs last completed.
export default function DataSourcesClient() {
    const { getToken } = useAuth();

    const [status, setStatus] = useState<SourcesStatusResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = await getToken();
            setStatus(await getSourcesStatus(token));
        } catch (err: any) {
            setError(err.message || "Failed to load data sources status");
        } finally {
            setIsLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    return (
        <div className="w-full flex flex-col gap-4 p-4 md:p-8">
            <PageHeader
                title="Data Sources"
                breadcrumbs={[{ label: "Data Intelligence" }, { label: "Data Sources" }]}
                actions={
                    <AppButton
                        variantStyle="outline"
                        onClick={fetchStatus}
                        startIcon={<RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />}
                    >
                        Refresh
                    </AppButton>
                }
            />

            {isLoading && !status ? (
                <div className="flex justify-center rounded-2xl border border-gray-200 bg-white py-20 shadow-sm">
                    <CircularProgress size={28} />
                </div>
            ) : error && !status ? (
                <div className="rounded-2xl border border-gray-200 bg-white py-10 shadow-sm">
                    <EmptyState
                        icon={PlugZap}
                        title="Could not load data sources"
                        description={error}
                        action={{ label: "Retry", onClick: fetchStatus, icon: <RefreshCw size={16} /> }}
                    />
                </div>
            ) : status ? (
                <>
                    {/* Providers */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">Providers</h2>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            External clients the platform can call. A gray dot means the provider
                            is not configured on this environment - features that depend on it
                            quietly skip it.
                        </p>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {status.providers.map((provider) => (
                                <div
                                    key={provider.key}
                                    className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4"
                                >
                                    <span
                                        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                                            provider.configured ? "bg-green-500" : "bg-gray-300"
                                        }`}
                                        title={provider.configured ? "Configured" : "Not configured"}
                                    />
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-medium text-gray-900">{provider.label}</span>
                                            {/* Data-driven: Fase E adds kind:"enricher"
                                                rows and they must render without a
                                                web change. */}
                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium capitalize text-gray-500">
                                                {provider.kind}
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-xs text-gray-500">
                                            {provider.detail ||
                                                (provider.configured ? "Configured" : "Not configured")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Cache coverage */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">
                                    Cache by Source
                                </h2>
                                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                    Companies visible to your workspace (shared platform data plus
                                    your own), grouped by where each record came from.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3">
                                <Layers size={18} className="text-[#5479EE]" />
                                <div>
                                    <div className="text-lg font-bold leading-tight text-gray-900">
                                        {status.kbli_map_count.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500">KBLI industry mappings</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 overflow-x-auto rounded-lg border border-gray-100">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3 text-left font-medium text-gray-700">Source</th>
                                        <th className="p-3 text-right font-medium text-gray-700">Companies</th>
                                        <th className="p-3 text-right font-medium text-gray-700">Last Added</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {status.cache_by_source.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="p-6 text-center text-gray-400">
                                                The cache is empty.
                                            </td>
                                        </tr>
                                    ) : (
                                        status.cache_by_source.map((row, idx) => {
                                            const group = sourceGroup(row.source);
                                            const Icon = group.icon;
                                            return (
                                                <tr
                                                    key={row.source || "legacy"}
                                                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                                >
                                                    <td className="p-3">
                                                        <span
                                                            className="inline-flex items-center gap-1.5 text-gray-700"
                                                            title={row.source || group.label}
                                                        >
                                                            <Icon size={14} className="shrink-0 text-gray-400" />
                                                            {group.label}
                                                            <span className="text-xs text-gray-400">
                                                                {row.source || "(none)"}
                                                            </span>
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-right font-medium text-gray-900">
                                                        {row.count.toLocaleString()}
                                                    </td>
                                                    <td className="p-3 text-right text-gray-600">
                                                        {formatDate(row.last_created_at)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Registry loader runs */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">
                            Registry Loader Runs
                        </h2>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Government-registry loaders (PSE Komdigi, Kemenperin) run as platform
                            CLI jobs - this shows each registry&apos;s most recent completed job.
                            Large loads are chunked into multiple jobs, so a run&apos;s total can
                            be higher than the latest job&apos;s row count.
                        </p>

                        {status.loader_last_runs.length === 0 ? (
                            <p className="mt-4 text-sm text-gray-400">No completed loader runs yet.</p>
                        ) : (
                            <div className="mt-4 overflow-x-auto rounded-lg border border-gray-100">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-3 text-left font-medium text-gray-700">Registry</th>
                                            <th className="p-3 text-right font-medium text-gray-700">Last Completed</th>
                                            <th className="p-3 text-right font-medium text-gray-700">Rows Created (latest job)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {status.loader_last_runs.map((run, idx) => {
                                            const group = sourceGroup(run.source);
                                            const Icon = group.icon;
                                            return (
                                                <tr
                                                    key={run.source}
                                                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                                >
                                                    <td className="p-3">
                                                        <span
                                                            className="inline-flex items-center gap-1.5 text-gray-700"
                                                            title={run.source}
                                                        >
                                                            <Icon size={14} className="shrink-0 text-gray-400" />
                                                            {group.label}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-right text-gray-600">
                                                        {formatDate(run.last_completed_at)}
                                                    </td>
                                                    <td className="p-3 text-right font-medium text-gray-900">
                                                        {run.last_job_created_rows?.toLocaleString() ?? "-"}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            ) : null}
        </div>
    );
}
