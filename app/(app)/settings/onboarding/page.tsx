"use client";

import { useState } from "react";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import BlueprintWizard from "@/components/admin/blueprints/BlueprintWizard";
import ActivationChecklist from "@/components/admin/blueprints/ActivationChecklist";
import InstalledBlueprints from "@/components/admin/blueprints/InstalledBlueprints";

type Tab = "wizard" | "checklist" | "history";

const TABS: Array<{ id: Tab; label: string }> = [
    { id: "wizard", label: "Pasang Paket Industri" },
    { id: "checklist", label: "Checklist Aktivasi" },
    { id: "history", label: "Riwayat" },
];

export default function SettingsOnboardingPage() {
    const [tab, setTab] = useState<Tab>("wizard");

    return (
        <div className="flex w-full flex-col gap-4">
            <SettingsPageHeader
                title="Setup Cepat"
                breadcrumbs={[
                    { label: "Settings", href: "/settings" },
                    { label: "Setup Cepat" },
                ]}
            />

            <div className="flex flex-wrap gap-1 border-b">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`-mb-px border-b-2 px-4 py-2 text-sm transition ${
                            tab === t.id
                                ? "border-primary font-medium text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Switching to the checklist right after an install is the common
                path, so the wizard nudges the tab rather than leaving the
                tenant to find it. */}
            {tab === "wizard" && <BlueprintWizard onInstalled={() => setTab("checklist")} />}
            {tab === "checklist" && <ActivationChecklist />}
            {tab === "history" && <InstalledBlueprints />}
        </div>
    );
}
