"use client";

import { AlertTriangle, CheckCircle2, Cpu, Globe, Loader2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { CompanyProfile360 } from "@/lib/types/company-intelligence";

interface WebsiteIntelligenceCardProps {
    profile: CompanyProfile360;
    // The crawl needs both a cache row to write onto and a known domain to
    // crawl - false when either is missing (a saved company's cache link is
    // severed, or the company's website was never discovered).
    canCrawl: boolean;
    isCrawling: boolean;
    onCrawl: () => void;
}

function formatDateTime(value?: string | null): string | null {
    if (!value) return null;
    try {
        return new Date(value).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    } catch {
        return value;
    }
}

/**
 * "Website Intelligence" card for the Company 360 Overview tab.
 *
 * Surfaces the on-demand crawl introduced alongside
 * POST /company-intelligence/{cacheId}/crawl-website: crawl status (queued
 * while the Celery job runs, completed/failed once it settles), which fields
 * it filled, and the technology signals it detected on the company's own
 * website (WordPress, AWS, SAP, ...) - all heuristic public signals, not
 * certified facts, so they're rendered as plain chips rather than anything
 * implying verification.
 *
 * Hidden entirely when there's nothing to show and nothing actionable: no
 * domain known, no cache row to crawl with, and no prior crawl result.
 */
export default function WebsiteIntelligenceCard({
    profile,
    canCrawl,
    isCrawling,
    onCrawl,
}: WebsiteIntelligenceCardProps) {
    const crawl = profile.websiteCrawl;
    if (!profile.domain && !crawl && !canCrawl) return null;

    const isQueued = isCrawling || crawl?.status === "queued";
    const technologySignals = crawl?.technologySignals ?? [];
    const fieldsFilled = crawl?.fieldsFilled ?? [];

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-xs font-bold uppercase text-gray-400">Website Intelligence</h4>
                {canCrawl && (
                    <AppButton
                        variantStyle="outline"
                        color="gray"
                        size="small"
                        startIcon={<Globe size={14} />}
                        onClick={onCrawl}
                        isLoading={isQueued}
                        disabled={isQueued}
                    >
                        {isQueued ? "Crawling..." : "Crawl website"}
                    </AppButton>
                )}
            </div>

            {profile.domain && (
                <a
                    href={`https://${profile.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#5479EE] hover:underline"
                >
                    <Globe size={14} className="shrink-0 text-gray-400" />
                    {profile.domain}
                </a>
            )}

            {!crawl && !isQueued && (
                <p className="text-sm text-gray-400">
                    {canCrawl
                        ? "Not crawled yet — click \"Crawl website\" to look for published contact details and technology signals."
                        : "No website domain known for this company yet."}
                </p>
            )}

            {isQueued && !crawl?.technologySignals && (
                <p className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Loader2 size={14} className="animate-spin" />
                    Crawling the company&apos;s website (robots.txt honored, up to 5 pages)...
                </p>
            )}

            {crawl?.status === "failed" && (
                <p className="flex items-center gap-1.5 text-sm text-rose-600">
                    <AlertTriangle size={14} className="shrink-0" />
                    Crawl failed{crawl.error ? `: ${crawl.error}` : "."}
                </p>
            )}

            {crawl?.status === "completed" && (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                            <CheckCircle2 size={13} />
                            Crawled {formatDateTime(crawl.crawledAt) ?? "recently"}
                        </span>
                        {crawl.pagesCrawled != null && <span>{crawl.pagesCrawled} page(s) checked</span>}
                        {fieldsFilled.length > 0 && (
                            <span>Filled: {fieldsFilled.join(", ")}</span>
                        )}
                    </div>

                    {technologySignals.length > 0 ? (
                        <div>
                            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                                <Cpu size={13} />
                                Technology signals detected
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {technologySignals.map((signal) => (
                                    <span
                                        key={signal}
                                        className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                                    >
                                        {signal}
                                    </span>
                                ))}
                            </div>
                            <p className="mt-2 text-[11px] text-gray-400">
                                Public signals from the company&apos;s own website — not a verified
                                or complete technology inventory.
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">No technology signals detected on the crawled pages.</p>
                    )}
                </div>
            )}
        </div>
    );
}
