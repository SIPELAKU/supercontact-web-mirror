"use client";

import { useMemo, useState } from "react";
import { Paper, Typography } from "@mui/material";
import PageHeader from "@/components/ui/page-header";
import { AppSelect } from "@/components/ui/app-select";
import { AppTabs } from "@/components/ui/app-tabs";
import { usePermission } from "@/lib/hooks/usePermission";
import { SupportAnalyticsParams } from "@/lib/api/support-analytics";
import { TicketDashboardPanel } from "@/components/support/tickets/dashboard/TicketDashboardClient";
import { ConversationsTab } from "./ConversationsTab";
import { AgentsTab } from "./AgentsTab";
import { CsatTab } from "./CsatTab";

type TabValue = "tickets" | "conversations" | "agents" | "csat";

// Per-tab permission gates (any-of). A tab a user cannot see is hidden
// entirely - the page never renders a 403.
const TAB_DEFS: { value: TabValue; label: string; permission: string[] }[] = [
    { value: "tickets", label: "Tickets", permission: ["tickets:reports:view", "tickets"] },
    {
        value: "conversations",
        label: "Conversations",
        permission: ["conversations:reports:view", "omnichannel:use", "omnichannel:setup"],
    },
    {
        value: "agents",
        label: "Agents",
        permission: ["tickets:reports:view", "conversations:reports:view", "omnichannel:use"],
    },
    { value: "csat", label: "CSAT", permission: ["support:csat:view"] },
];

const RANGE_OPTIONS = [
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 90 days" },
];

// Local-date ISO (YYYY-MM-DD) - toISOString() would shift the calendar day
// for anyone east of UTC.
function toIsoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export function SupportAnalyticsClient() {
    const { can } = usePermission();
    const visibleTabs = TAB_DEFS.filter((tab) => can(tab.permission));

    const [selectedTab, setSelectedTab] = useState<TabValue | null>(null);
    // Default to the first visible tab; also fall back there if the selected
    // tab ever stops being visible (e.g. permissions refreshed).
    const activeTab =
        selectedTab && visibleTabs.some((tab) => tab.value === selectedTab)
            ? selectedTab
            : visibleTabs[0]?.value;

    const [rangeDays, setRangeDays] = useState("30");
    const params: SupportAnalyticsParams = useMemo(() => {
        const days = parseInt(rangeDays, 10);
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - (days - 1));
        return { date_from: toIsoDate(from), date_to: toIsoDate(to) };
    }, [rangeDays]);

    return (
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
            <PageHeader
                title="Support Analytics"
                breadcrumbs={[{ label: "Support" }, { label: "Analytics" }]}
            />

            {visibleTabs.length === 0 ? (
                <Paper sx={{ p: 4, borderRadius: "12px", boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        You don&apos;t have access to any analytics reports. Ask an administrator for a
                        reporting permission.
                    </Typography>
                </Paper>
            ) : (
                <>
                    <AppTabs<TabValue>
                        value={activeTab as TabValue}
                        onChange={setSelectedTab}
                        tabs={visibleTabs.map(({ value, label }) => ({ value, label }))}
                    />

                    {/* The Tickets tab keeps the existing dashboard's own scope
                        control; the shared preset range applies to the rest. */}
                    {activeTab !== "tickets" && (
                        <div className="flex justify-end">
                            <div className="w-48">
                                <AppSelect
                                    isBgWhite
                                    fullWidth
                                    value={rangeDays}
                                    options={RANGE_OPTIONS}
                                    onChange={(e) => setRangeDays(e.target.value as string)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Only the active tab is mounted, so hidden/inactive tabs
                        never fire their queries (TanStack cache keeps data warm
                        across switches). */}
                    {activeTab === "tickets" && <TicketDashboardPanel />}
                    {activeTab === "conversations" && <ConversationsTab params={params} />}
                    {activeTab === "agents" && <AgentsTab params={params} />}
                    {activeTab === "csat" && <CsatTab params={params} />}
                </>
            )}
        </div>
    );
}
