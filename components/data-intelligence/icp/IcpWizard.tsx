"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import IndustryFilterSection from "@/components/data-intelligence/IndustryFilterSection";
import LocationFilterSection from "@/components/data-intelligence/LocationFilterSection";
import EmployeeRangeFilter from "@/components/data-intelligence/EmployeeRangeFilter";
import FinancialStatusFilter from "@/components/data-intelligence/FinancialStatusFilter";
import { FinancialStatus } from "@/lib/types/IndustryLeader";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { useDeriveIcpPreview, useCreateIcpProfile } from "@/lib/hooks/useIcpProfiles";
import { IcpDeriveResult } from "@/lib/types/icp";
import DealPickerModal from "./DealPickerModal";
import IcpAttributeBreakdownCard from "./IcpAttributeBreakdownCard";
import { Loader2 } from "lucide-react";

type WizardStep = "source" | "draft";

export default function IcpWizard() {
    const router = useRouter();
    const [step, setStep] = useState<WizardStep>("source");
    const [isDealPickerOpen, setIsDealPickerOpen] = useState(false);
    const [derived, setDerived] = useState<IcpDeriveResult | null>(null);

    const [industries, setIndustries] = useState<string[]>([]);
    const [locations, setLocations] = useState<string[]>([]);
    const [employeeRange, setEmployeeRange] = useState({ min: 0, max: 1000 });
    const [financialStatuses, setFinancialStatuses] = useState<FinancialStatus[]>([]);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const deriveMutation = useDeriveIcpPreview();
    const createMutation = useCreateIcpProfile();

    const runDerivation = async (dealIds: string[] | null) => {
        setIsDealPickerOpen(false);
        try {
            const result = await deriveMutation.mutateAsync({ deal_ids: dealIds ?? undefined });
            setDerived(result);
            setIndustries(result.draft_criteria.industries || []);
            setLocations(result.draft_criteria.locations || []);
            setEmployeeRange({
                min: result.draft_criteria.employee_min ?? 0,
                max: result.draft_criteria.employee_max ?? 1000,
            });
            setFinancialStatuses((result.draft_criteria.financial_status as FinancialStatus[]) || []);
            setName(`ICP - ${new Date().toLocaleDateString("id-ID")}`);
            setStep("draft");
        } catch (error: any) {
            const message = handleError(error, "Derive ICP");
            notify.error("Couldn't derive an ICP", { description: message });
        }
    };

    const handleSave = async () => {
        if (!derived) return;
        if (!name.trim()) {
            notify.warning("Validation Error", { description: "Please enter a name for this ICP." });
            return;
        }
        setIsSaving(true);
        try {
            const profile = await createMutation.mutateAsync({
                name: name.trim(),
                description: description.trim() || undefined,
                derived_criteria: {
                    industries,
                    locations,
                    employee_min: employeeRange.min,
                    employee_max: employeeRange.max,
                    financial_status: financialStatuses,
                    limit: 20,
                },
                attribute_breakdown: derived.attribute_breakdown,
                source_deal_ids: derived.source_deal_ids,
                sample_size: derived.sample_size,
                create_list: true,
            });
            notify.success("ICP Saved", { description: `"${profile.name}" is ready.` });
            router.push(`/data-intelligence/icp/${profile.id}`);
        } catch (error: any) {
            const message = handleError(error, "Save ICP Profile");
            notify.error("Error", { description: message });
        } finally {
            setIsSaving(false);
        }
    };

    if (step === "source") {
        return (
            <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center">
                <h2 className="text-lg font-bold text-gray-900">Build an ICP from your closed-won deals</h2>
                <p className="mt-2 text-sm text-gray-500">
                    We&apos;ll look at the companies behind your <strong>Closed - Won</strong> deals and derive a
                    target profile from their industry, location, size, and financial status.
                </p>
                <div className="mt-6 flex flex-col items-center gap-3">
                    <AppButton
                        variantStyle="primary"
                        onClick={() => runDerivation(null)}
                        disabled={deriveMutation.isPending}
                    >
                        {deriveMutation.isPending ? <Loader2 className="animate-spin" /> : "Use All Closed-Won Deals"}
                    </AppButton>
                    <button
                        onClick={() => setIsDealPickerOpen(true)}
                        className="text-sm font-medium text-[#5479EE] hover:underline"
                    >
                        Choose specific deals instead
                    </button>
                </div>

                <DealPickerModal
                    open={isDealPickerOpen}
                    onClose={() => setIsDealPickerOpen(false)}
                    onConfirm={runDerivation}
                />
            </div>
        );
    }

    if (!derived) return null;

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">
                        Derived From {derived.sample_size} Closed-Won Deal{derived.sample_size === 1 ? "" : "s"}
                    </h2>
                    <button
                        onClick={() => setStep("source")}
                        className="text-xs font-medium text-[#5479EE] hover:underline"
                    >
                        Change deals
                    </button>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <IcpAttributeBreakdownCard label="Industry" stat={derived.attribute_breakdown.industry} />
                    <IcpAttributeBreakdownCard label="Location" stat={derived.attribute_breakdown.location} />
                    <IcpAttributeBreakdownCard
                        label="Employee Range"
                        stat={derived.attribute_breakdown.employee_range}
                    />
                    <IcpAttributeBreakdownCard
                        label="Financial Status"
                        stat={derived.attribute_breakdown.financial_status}
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-400">
                    Adjust The Target Profile
                </h3>
                <IndustryFilterSection selectedIndustries={industries} onChange={setIndustries} />
                <div className="border-t border-gray-100 pt-4">
                    <LocationFilterSection selectedLocations={locations} onChange={setLocations} />
                </div>
                <div className="border-t border-gray-100 pt-4">
                    <EmployeeRangeFilter
                        min={employeeRange.min}
                        max={employeeRange.max}
                        onChange={setEmployeeRange}
                    />
                </div>
                <div className="border-t border-gray-100 pt-4">
                    <FinancialStatusFilter selectedStatuses={financialStatuses} onChange={setFinancialStatuses} />
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-400">Save This ICP</h3>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <AppInput isBgWhite fullWidth value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Description (optional)</label>
                    <AppInput
                        isBgWhite
                        fullWidth
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What is this ICP for?"
                    />
                </div>
                <div className="flex justify-end">
                    <AppButton onClick={handleSave} disabled={isSaving} variantStyle="primary">
                        {isSaving ? <Loader2 className="animate-spin" /> : "Save & Find Lookalikes"}
                    </AppButton>
                </div>
            </div>
        </div>
    );
}
