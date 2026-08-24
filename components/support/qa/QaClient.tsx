"use client";

import { useState } from "react";
import { Plus, ShieldAlert } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppTabs } from "@/components/ui/app-tabs";
import { AppButton } from "@/components/ui/app-button";
import { usePermission } from "@/lib/hooks/usePermission";
import { QaSummaryTab } from "./QaSummaryTab";
import { QaReviewsTab } from "./QaReviewsTab";
import { QaReviewFormDialog } from "./QaReviewFormDialog";

type QaTab = "summary" | "reviews";

/** QA Reviews surface (Phase 8D): a per-agent summary + the paginated review
 *  list, plus the create-review dialog for support:qa:review holders. */
export default function QaClient() {
    const { can } = usePermission();
    const canView = can(["support:qa:view", "support:qa:review", "support:qa:manage"]);
    const canReview = can("support:qa:review");

    const [activeTab, setActiveTab] = useState<QaTab>("summary");
    const [isNewOpen, setIsNewOpen] = useState(false);

    if (!canView) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
                <ShieldAlert className="h-8 w-8 text-gray-300" />
                <h1 className="text-lg font-semibold text-gray-900">Access denied</h1>
                <p className="max-w-sm text-sm text-gray-500">
                    You need a QA permission (view, review, or manage) to open this page. Ask an
                    administrator if you believe you should have access.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
            <PageHeader
                title="QA Reviews"
                description="Grade tickets and conversations against scorecards, and track per-agent quality."
                breadcrumbs={[{ label: "Support" }, { label: "QA Reviews" }]}
                actions={
                    canReview ? (
                        <AppButton onClick={() => setIsNewOpen(true)} startIcon={<Plus size={16} />}>
                            New review
                        </AppButton>
                    ) : undefined
                }
            />

            <AppTabs<QaTab>
                value={activeTab}
                onChange={setActiveTab}
                tabs={[
                    { value: "summary", label: "Summary" },
                    { value: "reviews", label: "Reviews" },
                ]}
            />

            {activeTab === "summary" && <QaSummaryTab />}
            {activeTab === "reviews" && <QaReviewsTab />}

            <QaReviewFormDialog isOpen={isNewOpen} onClose={() => setIsNewOpen(false)} />
        </div>
    );
}
