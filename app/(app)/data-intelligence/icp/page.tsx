"use client";

import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import IcpWizard from "@/components/data-intelligence/icp/IcpWizard";
import { useDeleteIcpProfile, useIcpProfiles } from "@/lib/hooks/useIcpProfiles";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { Loader2, Trash2 } from "lucide-react";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";

export default function IcpBuilderPage() {
    const [isCreating, setIsCreating] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
    const { data, isLoading } = useIcpProfiles({ page: 1, limit: 50 });
    const deleteMutation = useDeleteIcpProfile();

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteMutation.mutateAsync(deleteTarget.id);
            notify.success("ICP profile deleted");
            setDeleteTarget(null);
        } catch (error: any) {
            notify.error("Error", { description: handleError(error, "Delete ICP Profile") });
        }
    };

    return (
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
            <PageHeader
                title="ICP Builder"
                breadcrumbs={[{ label: "Data Intelligence" }, { label: "ICP Builder" }]}
            />

            {isCreating ? (
                <div className="space-y-4">
                    <button
                        onClick={() => setIsCreating(false)}
                        className="text-sm font-medium text-[#5479EE] hover:underline"
                    >
                        &larr; Back to ICP profiles
                    </button>
                    <IcpWizard />
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <p className="max-w-2xl text-sm text-gray-500">
                            Derive an Ideal Customer Profile from your closed-won deals, then score your company
                            database for lookalikes - with a transparent, per-attribute breakdown.
                        </p>
                        <AppButton variantStyle="primary" onClick={() => setIsCreating(true)}>
                            New ICP
                        </AppButton>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="animate-spin text-gray-400" />
                        </div>
                    ) : !data || data.data.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center text-sm text-gray-500">
                            No ICP profiles yet. Create one from your closed-won deals to get started.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {data.data.map((profile) => (
                                <div
                                    key={profile.id}
                                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                                >
                                    <div className="flex items-start justify-between">
                                        <Link
                                            href={`/data-intelligence/icp/${profile.id}`}
                                            className="font-semibold text-gray-900 hover:text-[#5479EE]"
                                        >
                                            {profile.name}
                                        </Link>
                                        <button
                                            onClick={() => setDeleteTarget({ id: profile.id, name: profile.name })}
                                            className="text-gray-300 hover:text-red-500"
                                            aria-label="Delete ICP profile"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    {profile.description && (
                                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{profile.description}</p>
                                    )}
                                    <div className="mt-3 text-xs text-gray-400">
                                        Derived from {profile.sample_size} closed-won deal
                                        {profile.sample_size === 1 ? "" : "s"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            <ConfirmationPopup
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                title="Delete ICP Profile"
                description={`Delete "${deleteTarget?.name ?? ""}"? The generated list will not be deleted.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
