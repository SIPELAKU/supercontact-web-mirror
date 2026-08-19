"use client";

import { ReactElement, ReactNode } from "react";
import { Box, Tabs, Tab } from "@mui/material";

export interface AppTabItem<T extends string | number = string> {
    value: T;
    label: ReactNode;
    icon?: ReactElement;
}

interface AppTabsProps<T extends string | number> {
    value: T;
    onChange: (value: T) => void;
    tabs: AppTabItem<T>[];
}

/**
 * Brand-standard underline tab bar (shared by detail pages and list surfaces).
 * Wraps MUI Tabs/Tab with the app's tab styling: 14px/500 labels, #5479EE
 * selected color + indicator, 28px gap between tabs.
 *
 * Not for the segmented-pill tab surfaces (profile settings, lead-management
 * view switch) or route-based tabs - those are a deliberately different pattern.
 */
export function AppTabs<T extends string | number>({ value, onChange, tabs }: AppTabsProps<T>) {
    return (
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
                value={value}
                onChange={(_, val) => onChange(val)}
                variant="scrollable"
                scrollButtons={false}
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
                {tabs.map((tab) => (
                    <Tab
                        key={String(tab.value)}
                        label={tab.label}
                        value={tab.value}
                        icon={tab.icon}
                        iconPosition="start"
                        disableRipple
                    />
                ))}
            </Tabs>
        </Box>
    );
}
