"use client";

import { format } from 'date-fns';
import { useState } from "react";
import { CircularProgress, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Plus, FileClock } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { useConfirmation } from "@/components/ui/confirm-modal";
import ComplianceTabs from "@/components/data-intelligence/compliance/ComplianceTabs";
import CreateDsrRequestModal from "@/components/data-intelligence/compliance/CreateDsrRequestModal";
import { useDsrRequests, useUpdateDsrRequestStatus } from "@/lib/hooks/useCompliance";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { DsrRequestStatus } from "@/lib/types/compliance";

const TYPE_LABELS: Record<string, string> = {
    access: "Access",
    deletion: "Deletion",
    correction: "Correction",
};

const STATUS_OPTIONS: { value: DsrRequestStatus; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "rejected", label: "Rejected" },
];

export default function DsrRequestsPage() {
    const { data: response, isLoading } = useDsrRequests();
    const requests = response?.data || [];
    const [openCreate, setOpenCreate] = useState(false);
    const updateStatus = useUpdateDsrRequestStatus();
    const { showConfirmation } = useConfirmation();

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
            showConfirmation({
                type: "warning",
                title: "Complete Deletion Request",
                message:
                    "Marking this deletion request completed will add the subject to your suppression list, so future searches and CRM saves exclude them. Continue?",
                confirmText: "Continue",
                cancelText: "Cancel",
                onConfirm: () => applyStatusChange(id, status),
            });
            return;
        }
        applyStatusChange(id, status);
    };

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

                {!isLoading && requests.length === 0 ? (
                    <div className="mx-6 my-6">
                        <EmptyState
                            icon={FileClock}
                            title="No requests logged yet"
                            description="Access, deletion, and correction requests from data subjects will appear here."
                            action={{ label: "Log Request", onClick: () => setOpenCreate(true), icon: <Plus size={16} /> }}
                        />
                    </div>
                ) : (
                <div className="mx-6 my-6 overflow-x-auto rounded-lg border border-gray-200">
                    <Table sx={{ minWidth: 760 }}>
                        <TableHead>
                            <TableRow className="bg-[#EEF2FD]!">
                                <TableCell sx={{ color: "#6B7280", fontWeight: 600, py: 2 }}>Subject</TableCell>
                                <TableCell sx={{ color: "#6B7280", fontWeight: 600, py: 2 }}>Type</TableCell>
                                <TableCell sx={{ color: "#6B7280", fontWeight: 600, py: 2 }}>Received</TableCell>
                                <TableCell sx={{ color: "#6B7280", fontWeight: 600, py: 2, width: 200 }}>
                                    Status
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.map((request) => (
                                    <TableRow key={request.id} hover>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-medium text-gray-900">
                                                    {request.subject_name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {request.subject_email_or_phone}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                                {TYPE_LABELS[request.request_type] || request.request_type}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                            {format(new Date(request.created_at), "dd MMM yyyy, HH:mm")}
                                        </TableCell>
                                        <TableCell>
                                            <AppSelect
                                                value={request.status}
                                                onChange={(e) =>
                                                    handleStatusChange(
                                                        request.id,
                                                        e.target.value as DsrRequestStatus,
                                                        request.request_type
                                                    )
                                                }
                                                options={STATUS_OPTIONS}
                                                height="34px"
                                                isBgWhite
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                )}
            </div>

            <CreateDsrRequestModal open={openCreate} onClose={() => setOpenCreate(false)} />
        </div>
    );
}
