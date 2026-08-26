"use client";

import { format } from 'date-fns';
import { useMemo, useState } from "react";
import { Plus, FileClock } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { SuperTable, MRT_ColumnDef } from "@/components/ui/super-table";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { DeleteButton } from "@/components/ui/app-action-buttons-table";
import ComplianceTabs from "@/components/data-intelligence/compliance/ComplianceTabs";
import CreateDsrRequestModal from "@/components/data-intelligence/compliance/CreateDsrRequestModal";
import { useDeleteDsrRequest, useDsrRequests, useUpdateDsrRequestStatus } from "@/lib/hooks/useCompliance";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { DsrRequestItem, DsrRequestStatus } from "@/lib/types/compliance";

const TYPE_LABELS: Record<string, string> = {
    access: "Access",
    deletion: "Deletion",
    correction: "Correction",
};

const TYPE_OPTIONS = [
    { value: "access", label: "Access" },
    { value: "deletion", label: "Deletion" },
    { value: "correction", label: "Correction" },
];

const STATUS_OPTIONS: { value: DsrRequestStatus; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "rejected", label: "Rejected" },
];

export default function DsrRequestsPage() {
    const { data: response, isLoading, isError, refetch } = useDsrRequests();
    const requests = response?.data || [];
    const [openCreate, setOpenCreate] = useState(false);
    const updateStatus = useUpdateDsrRequestStatus();
    const deleteRequest = useDeleteDsrRequest();
    const { confirm, confirmationPopup } = useConfirmationPopup();

    const handleDelete = (id: string) => {
        confirm({
            variant: "danger",
            title: "Delete Request",
            description: "Delete this data subject request? This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            onConfirm: async () => {
                try {
                    await deleteRequest.mutateAsync(id);
                    notify.success("Deleted", { description: "Request removed." });
                } catch (err: any) {
                    notify.error("Error", { description: handleError(err, "Delete DSR Request") });
                }
            },
        });
    };

    const applyStatusChange = async (id: string, status: DsrRequestStatus) => {
        try {
            await updateStatus.mutateAsync({ id, status });
            notify.success("Status Updated");
        } catch (err: any) {
            notify.error("Error", { description: handleError(err, "Update DSR Status") });
        }
    };

    const handleStatusChange = (id: string, status: DsrRequestStatus, requestType: string) => {
        if (status === "completed" && requestType === "deletion") {
            confirm({
                variant: "warning",
                title: "Complete Deletion Request",
                description:
                    "Marking this deletion request completed will add the subject to your suppression list, so future searches and CRM saves exclude them. Continue?",
                confirmText: "Continue",
                cancelText: "Cancel",
                onConfirm: () => applyStatusChange(id, status),
            });
            return;
        }
        applyStatusChange(id, status);
    };

    const columns = useMemo<MRT_ColumnDef<DsrRequestItem>[]>(
        () => [
            {
                accessorKey: "subject_name",
                header: "Subject",
                enableColumnFilter: false,
                Cell: ({ row }) => (
                    <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-gray-900">
                            {row.original.subject_name}
                        </span>
                        <span className="text-xs text-gray-500">
                            {row.original.subject_email_or_phone}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: "request_type",
                header: "Type",
                filterVariant: "select",
                filterSelectOptions: TYPE_OPTIONS,
                filterFn: "equals",
                Cell: ({ cell }) => (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {TYPE_LABELS[cell.getValue<string>()] || cell.getValue<string>()}
                    </span>
                ),
            },
            {
                accessorKey: "created_at",
                header: "Received",
                enableColumnFilter: false,
                Cell: ({ cell }) => (
                    <span className="text-sm text-gray-600">
                        {format(new Date(cell.getValue<string>()), "dd MMM yyyy, HH:mm")}
                    </span>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                filterVariant: "select",
                filterSelectOptions: STATUS_OPTIONS,
                filterFn: "equals",
                size: 200,
                Cell: ({ row }) => (
                    <AppSelect
                        value={row.original.status}
                        onChange={(e) =>
                            handleStatusChange(
                                row.original.id,
                                e.target.value as DsrRequestStatus,
                                row.original.request_type
                            )
                        }
                        options={STATUS_OPTIONS}
                        height="34px"
                        isBgWhite
                    />
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return (
        <div className="w-full flex flex-col gap-4 p-4 md:p-8">
            <PageHeader
                title="Compliance · Data Subject Requests"
                breadcrumbs={[
                    { label: "Data Intelligence" },
                    { label: "Compliance" },
                    { label: "Data Subject Requests" },
                ]}
                actions={
                    <AppButton
                        onClick={() => setOpenCreate(true)}
                        variantStyle="primary"
                        startIcon={<Plus size={16} />}
                    >
                        Log Request
                    </AppButton>
                }
            />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[300px]">
                <ComplianceTabs />

                <section className="px-6 pt-5">
                    <p className="max-w-lg text-sm text-gray-500">
                        Log and track access, deletion, and correction requests from data subjects.
                        Completing a deletion request auto-suppresses the subject going forward.
                    </p>
                </section>

                <div className="mx-6 my-6">
                    <SuperTable<DsrRequestItem>
                        tableId="dsr-requests-table"
                        urlKey=""
                        columns={columns}
                        data={requests}
                        isLoading={isLoading}
                        isError={isError}
                        errorMessage="Failed to load data subject requests. Please try again."
                        onRetry={() => refetch()}
                        renderRowActions={({ row }) => (
                            <DeleteButton onClick={() => handleDelete(row.original.id)} />
                        )}
                        renderEmptyState={() => (
                            <EmptyState
                                icon={FileClock}
                                title="No requests logged yet"
                                description="Access, deletion, and correction requests from data subjects will appear here."
                                action={{ label: "Log Request", onClick: () => setOpenCreate(true), icon: <Plus size={16} /> }}
                            />
                        )}
                        initialState={{ sorting: [{ id: "created_at", desc: true }] }}
                        features={{
          urlSync: true,
                            globalFilter: true,
                            columnFilters: true,
                            pagination: true,
                        }}
                    />
                </div>
            </div>

            <CreateDsrRequestModal open={openCreate} onClose={() => setOpenCreate(false)} />
            {confirmationPopup}
        </div>
    );
}
