import { useMemo } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { formatDistanceToNow } from "date-fns";

import { Ticket } from "@/lib/types/Ticket";
import { TicketPriorityBadge, TicketStatusBadge } from "./TicketBadges";
import { DeleteButton, EditButton } from "@/components/ui/app-action-buttons-table";
import { SuperTable, SuperTableState } from "@/components/ui/super-table";
import { AppButton } from "@/components/ui/app-button";
import { useAssignableAgents } from "@/lib/hooks/useTickets";

interface TicketTableProps {
    tickets: Ticket[];
    isLoading: boolean;
    isError?: boolean;
    rowCount?: number;
    onStateChange?: (state: SuperTableState) => void;
    onExportRequest?: (params: { format: "csv" | "excel", currentState: SuperTableState }) => Promise<Ticket[]>;
    onEdit: (ticket: Ticket) => void;
    onDelete: (ticket: Ticket) => void;
    renderTopLeftToolbar?: () => React.ReactNode;
    onBulkDelete?: (tickets: Ticket[], clearSelection: () => void) => Promise<void> | void;
    isBulkDeleting?: boolean;
}

export function TicketTable({
    tickets,
    isLoading,
    isError,
    rowCount,
    onStateChange,
    onExportRequest,
    onEdit,
    onDelete,
    renderTopLeftToolbar,
    onBulkDelete,
    isBulkDeleting
}: TicketTableProps) {
    const { data: agentsData } = useAssignableAgents();
    
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
                    <span className="font-medium">
                        {row.original.ticket_code || row.original.id.substring(0, 8)}
                    </span>
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
                filterSelectOptions: ["High", "Medium", "Low"],
                Cell: ({ cell }) => (
                    <TicketPriorityBadge priority={cell.getValue<any>()} />
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                filterVariant: "select",
                filterSelectOptions: ["Open", "In Progress", "Closed"],
                Cell: ({ cell }) => (
                    <TicketStatusBadge status={cell.getValue<any>()} />
                ),
            },
            {
                id: "assigned_agent", // Filter is using this string
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
                accessorKey: "updated_at",
                header: "Last Updated",
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
            {
                id: "actions",
                header: "Action",
                enableColumnFilter: false,
                enableSorting: false,
                enableHiding: false,
                size: 100, // Make it compact
                Cell: ({ row }) => (
                    <div className="flex justify-start gap-1">
                        <EditButton onClick={() => onEdit(row.original)} />
                        <DeleteButton onClick={() => onDelete(row.original)} />
                    </div>
                ),
            },
        ],
        [onEdit, onDelete, agentOptions]
    );

    return (
        <SuperTable<Ticket>
            columns={columns}
            data={tickets || []}
            isLoading={isLoading}
            isError={isError}
            rowCount={rowCount}
            onStateChange={onStateChange}
            onExportRequest={onExportRequest as any}
            renderTopLeftToolbar={renderTopLeftToolbar}
            renderBulkActions={({ selectedRows, clearSelection }: { selectedRows: any[], clearSelection: () => void }) => (
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
                    {isBulkDeleting ? "Menghapus..." : `Hapus ${selectedRows.length} Tiket`}
                </AppButton>
            )}
            manualPagination={true}
            manualFiltering={true}
            features={{
                sorting: true,
                globalFilter: true,
                columnFilters: true,
                smartFilterVariants: true,
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
