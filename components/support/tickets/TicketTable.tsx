import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Ticket as TicketGlyph, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Ticket, TicketStatus } from "@/lib/types/Ticket";
import { TicketPriorityBadge, TicketStatusBadge, TicketTypeBadge } from "./TicketBadges";
import { TicketSlaBadge } from "./TicketSlaBadge";
import { DeleteButton, EditButton } from "@/components/ui/app-action-buttons-table";
import { SuperTable, SuperTableState, MRT_ColumnDef } from "@/components/ui/super-table";
import { EmptyState } from "@/components/ui/empty-state";
import { AppButton } from "@/components/ui/app-button";
import { AppSelect } from "@/components/ui/app-select";
import { useAssignableAgents } from "@/lib/hooks/useTickets";
import { usePermission } from "@/lib/hooks/usePermission";

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
    { value: "Open", label: "Open" },
    { value: "Pending", label: "Pending" },
    { value: "On-hold", label: "On-hold" },
    { value: "In Progress", label: "In Progress" },
    { value: "Solved", label: "Solved" },
    { value: "Closed", label: "Closed" },
];

interface TicketTableProps {
    tickets: Ticket[];
    isLoading: boolean;
    isError?: boolean;
    errorMessage?: string;
    onRetry?: () => void;
    onAdd?: () => void;
    rowCount?: number;
    onStateChange?: (state: SuperTableState) => void;
    onExportRequest?: (params: { format: "csv" | "excel", currentState: SuperTableState }) => Promise<Ticket[]>;
    onEdit: (ticket: Ticket) => void;
    onDelete: (ticket: Ticket) => void;
    renderTopLeftToolbar?: () => React.ReactNode;
    onBulkDelete?: (tickets: Ticket[], clearSelection: () => void) => Promise<void> | void;
    isBulkDeleting?: boolean;
    onBulkAssign?: (tickets: Ticket[], agentId: string, clearSelection: () => void) => Promise<void> | void;
    isBulkAssigning?: boolean;
    onBulkStatusChange?: (tickets: Ticket[], status: TicketStatus, clearSelection: () => void) => Promise<void> | void;
    isBulkChangingStatus?: boolean;
}

export function TicketTable({
    tickets,
    isLoading,
    isError,
    errorMessage,
    onRetry,
    onAdd,
    rowCount,
    onStateChange,
    onExportRequest,
    onEdit,
    onDelete,
    renderTopLeftToolbar,
    onBulkDelete,
    isBulkDeleting,
    onBulkAssign,
    isBulkAssigning,
    onBulkStatusChange,
    isBulkChangingStatus,
}: TicketTableProps) {
    const router = useRouter();
    const { data: agentsData } = useAssignableAgents();
    const { can } = usePermission();
    const canWrite = can(["tickets:write:my", "tickets:write:team", "tickets"]);
    const canDelete = can(["tickets:delete", "tickets"]);
    const canAssign = can(["tickets:assign", "tickets"]);
    const [bulkAgentId, setBulkAgentId] = useState("");
    const [bulkStatus, setBulkStatus] = useState<TicketStatus | "">("");

    // safe fallback if agentsData format changes or is undefined
    const agentOptions = useMemo(() => {
        const agents = agentsData?.data || agentsData || [];
        if (!Array.isArray(agents)) return [];
        return agents.map((agent: any) => ({
            value: agent.id,
            label: agent.fullname
        }));
    }, [agentsData]);

    const columns = useMemo<MRT_ColumnDef<Ticket>[]>(
        () => [
            {
                accessorKey: "ticket_code",
                header: "Ticket ID",
                enableColumnFilter: false,
                Cell: ({ row }) => (
                    <Link
                        href={`/support/tickets/${row.original.id}`}
                        className="font-medium text-[#5479EE] hover:underline"
                    >
                        {row.original.ticket_code || row.original.id.substring(0, 8)}
                    </Link>
                )
            },
            {
                accessorKey: "subject",
                header: "Subject",
                enableColumnFilter: false,
                Cell: ({ cell }) => (
                    <div className="max-w-50 truncate" title={cell.getValue<string>()}>
                        {cell.getValue<string>()}
                    </div>
                ),
            },
            {
                accessorKey: "priority",
                header: "Priority",
                filterVariant: "select",
                filterSelectOptions: ["Urgent", "High", "Medium", "Low"],
                Cell: ({ cell }) => (
                    <TicketPriorityBadge priority={cell.getValue<any>()} />
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                filterVariant: "select",
                filterSelectOptions: ["Open", "Pending", "On-hold", "In Progress", "Solved", "Closed"],
                Cell: ({ cell }) => (
                    <TicketStatusBadge status={cell.getValue<any>()} />
                ),
            },
            {
                accessorKey: "type",
                header: "Type",
                filterVariant: "select",
                filterSelectOptions: ["Question", "Incident", "Problem", "Task"],
                // Nullable — the badge renders nothing when the value is unset.
                Cell: ({ cell }) => (
                    <TicketTypeBadge type={cell.getValue<any>()} />
                ),
            },
            {
                id: "assigned_agent", // Filter is using this string
                // Agent name lives on the joined User (selectinload, not a
                // join) - backend can't sort by it, so no sort arrow.
                enableSorting: false,
                accessorFn: (row: Ticket) => row.assigned_agent?.fullname || "Unassigned",
                header: "Assigned Agent",
                filterVariant: "select",
                filterSelectOptions: agentOptions,
                Cell: ({ row }) => {
                    const fullName = row.original.assigned_agent?.fullname;
                    return <span className="text-gray-600">{fullName || "Unassigned"}</span>;
                },
            },
            {
                id: "sla",
                header: "SLA",
                enableColumnFilter: false,
                enableSorting: false,
                Cell: ({ row }) => <TicketSlaBadge sla={row.original.sla} />,
            },
            {
                accessorKey: "updated_at",
                header: "Updated",
                enableColumnFilter: false,
                Cell: ({ cell }) => {
                    const dateVal = cell.getValue<string>();
                    return (
                        <span className="text-gray-500 text-sm">
                            {dateVal ? formatDistanceToNow(new Date(dateVal), { addSuffix: true }) : "-"}
                        </span>
                    );
                },
            },
        ],
        [agentOptions]
    );

    return (
        <SuperTable<Ticket>
            tableId="tickets-table"
            // Class B: this module has the best record page in the app and,
            // until now, no way to reach it from the row. The ticket_code
            // column was already a real Link - primaryColumn makes that the
            // documented pattern rather than a one-off.
            primaryColumn={{
                accessorKey: "ticket_code",
                href: (row) => `/support/tickets/${row.id}`,
            }}
            onRowClick={(row) => router.push(`/support/tickets/${row.id}`)}
            rowActions={[
                {
                    id: "edit",
                    label: "Edit",
                    icon: <Pencil size={16} />,
                    hidden: () => !canWrite,
                    onClick: (row) => onEdit(row),
                },
                {
                    id: "delete",
                    label: "Delete",
                    icon: <Trash2 size={16} />,
                    hidden: () => !canDelete,
                    destructive: true,
                    onClick: (row) => onDelete(row),
                },
            ]}
            columns={columns}
            data={tickets || []}
            isLoading={isLoading}
            isError={isError}
            errorMessage={errorMessage}
            onRetry={onRetry}
            rowCount={rowCount}
            renderEmptyState={() => (
                <EmptyState
                    icon={TicketGlyph}
                    title="No tickets found"
                    description="Support tickets will appear here once created or received."
                    action={
                        canWrite && onAdd
                            ? { label: "Add Ticket", onClick: onAdd, icon: <Plus size={16} /> }
                            : undefined
                    }
                />
            )}
            onStateChange={onStateChange}
            onExportRequest={onExportRequest as any}
            renderTopLeftToolbar={renderTopLeftToolbar}
            renderBulkActions={({ selectedRows, clearSelection }: { selectedRows: any[], clearSelection: () => void }) => (
                <div className="flex flex-wrap items-center gap-2">
                    {canAssign && (
                        <div className="flex items-center gap-1">
                            <AppSelect
                                isBgWhite
                                placeholder="Assign to..."
                                value={bulkAgentId}
                                options={agentOptions}
                                onChange={(e) => setBulkAgentId(e.target.value as string)}
                            />
                            <AppButton
                                variantStyle="outline"
                                disabled={isBulkAssigning || !bulkAgentId}
                                onClick={() => {
                                    if (onBulkAssign && bulkAgentId) {
                                        onBulkAssign(selectedRows as Ticket[], bulkAgentId, clearSelection);
                                        setBulkAgentId("");
                                    }
                                }}
                            >
                                {isBulkAssigning ? "Assigning..." : "Assign"}
                            </AppButton>
                        </div>
                    )}
                    {canWrite && (
                        <div className="flex items-center gap-1">
                            <AppSelect
                                isBgWhite
                                placeholder="Set status..."
                                value={bulkStatus}
                                options={STATUS_OPTIONS}
                                onChange={(e) => setBulkStatus(e.target.value as TicketStatus)}
                            />
                            <AppButton
                                variantStyle="outline"
                                disabled={isBulkChangingStatus || !bulkStatus}
                                onClick={() => {
                                    if (onBulkStatusChange && bulkStatus) {
                                        onBulkStatusChange(selectedRows as Ticket[], bulkStatus, clearSelection);
                                        setBulkStatus("");
                                    }
                                }}
                            >
                                {isBulkChangingStatus ? "Updating..." : "Update"}
                            </AppButton>
                        </div>
                    )}
                    {canDelete && (
                        <AppButton
                            variantStyle="danger"
                            disabled={isBulkDeleting}
                            onClick={() => {
                                if (onBulkDelete) {
                                    onBulkDelete(
                                        selectedRows as Ticket[],
                                        clearSelection
                                    );
                                }
                            }}
                        >
                            {isBulkDeleting ? "Deleting..." : `Delete (${selectedRows.length})`}
                        </AppButton>
                    )}
                </div>
            )}
            manualPagination={true}
            manualFiltering={true}
            manualSorting={true}
            initialState={{ sorting: [{ id: "updated_at", desc: true }] }}
            features={{
                sorting: true,
                globalFilter: true,
                columnFilters: true,
                pagination: true,
                rowSelection: 'multi',
                export: { excel: true, csv: true },
                densityToggle: true,
                fullScreenToggle: true,
                urlSync: true,
            }}
        />
    );
}
