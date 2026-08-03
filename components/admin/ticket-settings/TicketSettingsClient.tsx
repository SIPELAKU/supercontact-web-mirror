"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Box, Tabs, Tab } from "@mui/material";
import PageHeader from "@/components/ui/page-header";
import CategoriesSettingsTab from "./CategoriesSettingsTab";
import CustomFieldsSettingsTab from "./CustomFieldsSettingsTab";
import SlaPolicySettingsTab from "./SlaPolicySettingsTab";
import BusinessHoursSettingsTab from "./BusinessHoursSettingsTab";
import MacrosSettingsTab from "./MacrosSettingsTab";
import AutomationRulesSettingsTab from "./AutomationRulesSettingsTab";

type SettingsTab =
    | "categories"
    | "custom-fields"
    | "sla-policies"
    | "business-hours"
    | "macros"
    | "automation-rules";
const VALID_TABS: SettingsTab[] = [
    "categories",
    "custom-fields",
    "sla-policies",
    "business-hours",
    "macros",
    "automation-rules",
];

export function TicketSettingsClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
        const requested = searchParams.get("tab") as SettingsTab | null;
        return requested && VALID_TABS.includes(requested) ? requested : "categories";
    });

    const handleTabChange = (tab: SettingsTab) => {
        setActiveTab(tab);
        router.replace(`/admin/ticket-settings?tab=${tab}`, { scroll: false });
    };

    return (
        <div className="w-full flex flex-col gap-4 p-4 md:p-8">
            <PageHeader
                title="Ticket Settings"
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Admin" },
                    { label: "Ticket Settings" },
                ]}
            />

            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, val) => handleTabChange(val)}
                    sx={{
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontWeight: 500,
                            fontSize: "14px",
                            minWidth: "auto",
                            padding: "10px 4px",
                            marginRight: "28px",
                            color: "#6B7280",
                        },
                        "& .Mui-selected": { color: "#5479EE!important" },
                        "& .MuiTabs-indicator": { backgroundColor: "#5479EE" },
                    }}
                >
                    <Tab label="Categories" value="categories" disableRipple />
                    <Tab label="Custom Fields" value="custom-fields" disableRipple />
                    <Tab label="SLA Policies" value="sla-policies" disableRipple />
                    <Tab label="Business Hours" value="business-hours" disableRipple />
                    <Tab label="Macros" value="macros" disableRipple />
                    <Tab label="Automation Rules" value="automation-rules" disableRipple />
                </Tabs>
            </Box>

            {activeTab === "categories" && <CategoriesSettingsTab />}
            {activeTab === "custom-fields" && <CustomFieldsSettingsTab />}
            {activeTab === "sla-policies" && <SlaPolicySettingsTab />}
            {activeTab === "business-hours" && <BusinessHoursSettingsTab />}
            {activeTab === "macros" && <MacrosSettingsTab />}
            {activeTab === "automation-rules" && <AutomationRulesSettingsTab />}
        </div>
    );
}
