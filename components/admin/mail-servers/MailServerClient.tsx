"use client";

import { handleError } from '@/lib/utils/errorHandler';
import { DeleteButton, EditButton } from '@/components/ui/app-action-buttons-table';
import { AppButton } from '@/components/ui/app-button';
import SettingsPageHeader from '@/components/settings/SettingsPageHeader';
import { Switch } from '@/components/ui/switch';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmationPopup } from '@/components/ui/confirmation-popup';
import { SuperTable, MRT_ColumnDef, SuperTableState } from '@/components/ui/super-table';
import { useMailServers, useTestMailServerConnection, useUpdateMailServerStatus, useDeleteMailServer } from '@/lib/hooks/useMailServers';
import { fetchMailServers } from '@/lib/api/mail-servers';
import { useAuth } from '@/lib/context/AuthContext';
import { MailServer } from '@/lib/models/types';
import { notify } from '@/lib/notifications';
import { CircularProgress, Tooltip } from '@mui/material';
import { AlertCircle, CheckCircle2, HelpCircle, Play, Plus, Server } from 'lucide-react';
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import PlatformSenderCard from './PlatformSenderCard';
import AddMailServerModal from './AddMailServerModal';
import EditMailServerModal from './EditMailServerModal';
import ConnectionStatusModal from './ConnectionStatusModal';

const STATUS_FILTER_OPTIONS = ["Active", "Inactive", "Error"];

// Client-side column filters (SuperTable's per-column filters replace the old
// operator FilterPopover). The API only supports a global `search` param, so
// while column filters are active we fetch the whole set - same interim
// strategy the old popover used - and filter/paginate client-side.
function applyColumnFilters(
    items: MailServer[],
    columnFilters: { id: string; value: unknown }[]
): MailServer[] {
    if (columnFilters.length === 0) return items;
    return items.filter((item) =>
        columnFilters.every((filter) => {
            const raw = item[filter.id as keyof MailServer];
            const itemValue = String(raw ?? "").toLowerCase();
            const filterValue = String(filter.value ?? "").toLowerCase();
            if (!filterValue) return true;
            if (filter.id === "status") return itemValue === filterValue;
            return itemValue.includes(filterValue);
        })
    );
}

export const MailServerClient = () => {
    const { token } = useAuth();

    // Table state driven by SuperTable (search debounced 500ms internally)
    const [tableState, setTableState] = useState({
        pageIndex: 0,
        pageSize: 10,
        globalFilter: "",
        columnFilters: [] as { id: string; value: unknown }[],
    });

    const hasActiveFilters = tableState.columnFilters.length > 0;

    // Data fetching (server pagination + server search; full fetch while
    // column filters are active so they apply to ALL rows, not one page)
    const { data: response, isLoading, isError, error, refetch } = useMailServers(
        hasActiveFilters ? 1 : tableState.pageIndex + 1,
        hasActiveFilters ? 1000 : tableState.pageSize,
        tableState.globalFilter
    );
    const mailServers = useMemo(
        () => (response?.data?.mail_servers || []).filter(item => !item.is_system_mail_server),
        [response]
    );
    const totalCount = response?.data?.total || 0;

    // Handle fetch error
    useEffect(() => {
        if (isError && error) {
            const message = handleError(error, "Fetch Mail Servers");
            notify.error("Failed to load mail servers", { description: message });
        }
    }, [isError, error]);

    // Modals state
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedServer, setSelectedServer] = useState<MailServer | null>(null);
    const [openStatus, setOpenStatus] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [serverToDelete, setServerToDelete] = useState<MailServer | null>(null);

    // Bulk delete (checkbox selection previously had NO bulk action - the API
    // has no bulk endpoint, so confirm once then delete sequentially)
    const [bulkDeleteTarget, setBulkDeleteTarget] = useState<{
        servers: MailServer[];
        clearSelection: () => void;
    } | null>(null);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    // While filters are active, paginate the filtered set client-side
    const filteredData = useMemo(
        () => applyColumnFilters(mailServers, tableState.columnFilters),
        [mailServers, tableState.columnFilters]
    );
    const displayCount = hasActiveFilters ? filteredData.length : totalCount;
    const visibleData = hasActiveFilters
        ? filteredData.slice(
            tableState.pageIndex * tableState.pageSize,
            tableState.pageIndex * tableState.pageSize + tableState.pageSize
        )
        : filteredData;

    const handleEdit = useCallback((item: MailServer) => {
        setSelectedServer(item);
        setOpenEdit(true);
    }, []);

    const handleDelete = useCallback((item: MailServer) => {
        setServerToDelete(item);
        setOpenDelete(true);
    }, []);

    const testConnectionMutation = useTestMailServerConnection();
    const updateMailServerStatusMutation = useUpdateMailServerStatus();
    const deleteMailServerMutation = useDeleteMailServer();

    const handleTestConnection = useCallback(async (item: MailServer) => {
        notify.info("Testing Connection...", { description: `Testing connection to ${item.smtp_host}` });
        try {
            const res = await testConnectionMutation.mutateAsync(item.id);
            if (res.success) {
                notify.success("Connection Successful", { description: res.data.message });
            }
        } catch (error: any) {
            const message = handleError(error, "Test Connection");
            notify.error("Connection Failed", { description: message, duration: 10000 });
        }
    }, [testConnectionMutation]);

    const handleViewLog = useCallback((item: MailServer) => {
        setSelectedServer(item);
        setOpenStatus(true);
    }, []);

    // Ported as-is from the deleted DeleteMailServerModal
    const handleConfirmDelete = async () => {
        if (!serverToDelete) return;
        try {
            await deleteMailServerMutation.mutateAsync(serverToDelete.id);
            notify.success("Mail Server Deleted", { description: "The mail server has been successfully deleted." });
            refetch();
            setOpenDelete(false);
        } catch (err: any) {
            const message = handleError(err, "Delete Mail Server");
            notify.error("Error", { description: message });
        }
    };

    const handleConfirmBulkDelete = async () => {
        if (!bulkDeleteTarget) return;
        setIsBulkDeleting(true);
        let succeeded = 0;
        let failed = 0;
        for (const server of bulkDeleteTarget.servers) {
            try {
                await deleteMailServerMutation.mutateAsync(server.id);
                succeeded++;
            } catch {
                failed++;
            }
        }
        setIsBulkDeleting(false);
        bulkDeleteTarget.clearSelection();
        setBulkDeleteTarget(null);
        if (succeeded > 0) {
            notify.success("Mail Servers Deleted", { description: `${succeeded} mail server(s) deleted successfully.` });
        }
        if (failed > 0) {
            notify.error("Error", { description: `${failed} mail server(s) failed to delete.` });
        }
        refetch();
    };

    // Export the full (searched + filtered) set, not just the visible page
    const handleExportRequest = async (params: { format: "csv" | "excel"; currentState: SuperTableState }) => {
        if (!token) return [];
        try {
            const res = await fetchMailServers(token, 1, 1000, params.currentState.globalFilter);
            const all = (res?.data?.mail_servers || []).filter((item: MailServer) => !item.is_system_mail_server);
            return applyColumnFilters(all, params.currentState.columnFilters);
        } catch (err) {
            console.error("Export error:", err);
            return [];
        }
    };

    const columns = useMemo<MRT_ColumnDef<MailServer>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Name",
                Cell: ({ row }) => {
                    const item = row.original;
                    return (
                        <div className="flex flex-col gap-1">
                            <span className="font-medium text-gray-900">{item.name}</span>
                            {item.status === "Error" ? (
                                <button
                                    onClick={() => handleViewLog(item)}
                                    className="flex items-center gap-1 text-xs text-red-500 hover:underline cursor-pointer"
                                    title={item.last_error}
                                >
                                    <AlertCircle size={12} className="text-red-500" />
                                    Check log connection
                                </button>
                            ) : item.status === "Active" ? (
                                <button
                                    onClick={() => handleViewLog(item)}
                                    className="flex items-center gap-1 text-xs text-emerald-500 hover:underline cursor-pointer"
                                >
                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                    Check log connection
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleViewLog(item)}
                                    className="flex items-center gap-1 text-xs text-gray-400 hover:underline cursor-pointer"
                                    title="Inactive"
                                >
                                    <HelpCircle size={12} className="text-gray-400" />
                                    Check log connection
                                </button>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: "smtp_host",
                header: "Server SMTP",
                Cell: ({ cell }) => <span className="text-gray-600">{cell.getValue<string>()}</span>,
            },
            {
                accessorKey: "smtp_username",
                header: "Username",
                Cell: ({ cell }) => <span className="text-gray-600">{cell.getValue<string>()}</span>,
            },
            {
                accessorKey: "smtp_region",
                header: "Region",
                Cell: ({ cell }) => <span className="text-gray-600">{cell.getValue<string>() || "-"}</span>,
            },
            {
                accessorKey: "status",
                header: "Status",
                filterVariant: "select",
                filterSelectOptions: STATUS_FILTER_OPTIONS,
                Cell: ({ row }) => (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${row.original.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-gray-100 text-gray-600'
                        }`}>
                        {row.original.status === 'Active' ? 'Active' : 'Inactive'}
                    </span>
                ),
            },
            {
                id: "active",
                header: "Active",
                enableColumnFilter: false,
                size: 90,
                Cell: ({ row }) => {
                    const item = row.original;
                    return updateMailServerStatusMutation.isPending && updateMailServerStatusMutation.variables?.id === item.id ? (
                        <CircularProgress size={20} />
                    ) : (
                        <Switch
                            disabled={item.is_system_mail_server}
                            checked={item.status === 'Active'}
                            onCheckedChange={async (checked) => {
                                try {
                                    await updateMailServerStatusMutation.mutateAsync({
                                        id: item.id,
                                        data: { status: checked ? 'Active' : 'Inactive' }
                                    });
                                    notify.success("Status Updated");
                                } catch (error: any) {
                                    const message = handleError(error, "Update Status");
                                    notify.error("Update Failed", { description: message });
                                }
                            }}
                        />
                    );
                },
            },
        ],
        [handleViewLog, updateMailServerStatusMutation]
    );

    return (
        <div className="w-full flex flex-col gap-4 p-4 md:p-8">
            <SettingsPageHeader
                title="Mail Servers"
                breadcrumbs={[
                    { label: "Settings", href: "/settings" },
                    { label: "Email" },
                    { label: "Servers" }
                ]}
            />

            <PlatformSenderCard option={response?.data?.platform_sender} />

            <SuperTable<MailServer>
                tableId="mail-servers-table"
                columns={columns}
                data={visibleData}
                isLoading={isLoading}
                isError={isError}
                errorMessage="Failed to load mail servers. Please try again."
                onRetry={() => refetch()}
                manualPagination={true}
                manualFiltering={true}
                rowCount={displayCount}
                onStateChange={(state) => {
                    setTableState({
                        pageIndex: state.pagination.pageIndex,
                        pageSize: state.pagination.pageSize,
                        globalFilter: state.globalFilter,
                        columnFilters: state.columnFilters,
                    });
                }}
                onExportRequest={handleExportRequest as any}
                renderTopLeftToolbar={() => (
                    <AppButton
                        onClick={() => setOpenAdd(true)}
                        variantStyle="primary"
                        startIcon={<Plus size={16} />}
                    >
                        Add Server
                    </AppButton>
                )}
                renderRowActions={({ row }) => {
                    const item = row.original;
                    return (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handleTestConnection(item)}
                                className="cursor-pointer p-1 hover:bg-gray-100 rounded-lg text-emerald-500 transition-colors disabled:opacity-50"
                                title="Test Connection"
                                disabled={testConnectionMutation.isPending}
                            >
                                {testConnectionMutation.isPending && testConnectionMutation.variables === item.id ? (
                                    <CircularProgress size={18} color="inherit" />
                                ) : (
                                    <Tooltip title="Test Connection">
                                        <Play size={18} />
                                    </Tooltip>
                                )}
                            </button>
                            <EditButton onClick={() => handleEdit(item)} disabled={item.is_system_mail_server} customTitle={item.is_system_mail_server ? 'System Mail Server' : 'Edit'} />
                            <DeleteButton onClick={() => handleDelete(item)} disabled={item.is_system_mail_server} customTitle={item.is_system_mail_server ? 'System Mail Server' : 'Delete'} />
                        </div>
                    );
                }}
                renderBulkActions={({ selectedRows, clearSelection }) => (
                    <AppButton
                        variantStyle="danger"
                        disabled={isBulkDeleting}
                        onClick={() => setBulkDeleteTarget({ servers: selectedRows as MailServer[], clearSelection })}
                    >
                        {isBulkDeleting ? "Deleting..." : `Delete (${selectedRows.length})`}
                    </AppButton>
                )}
                renderEmptyState={() => (
                    <EmptyState
                        icon={Server}
                        title="No mail servers found"
                        description="Add an SMTP server to send email through your own infrastructure."
                        action={{ label: "Add Server", onClick: () => setOpenAdd(true), icon: <Plus size={16} /> }}
                    />
                )}
                initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
                features={{
                    // API has no sort params - avoid a misleading page-only sort
                    sorting: false,
                    globalFilter: true,
                    columnFilters: true,
                    rowSelection: 'multi',
                    pagination: true,
                    pageSizeOptions: [5, 10, 25, 50],
                    export: { excel: true, csv: true },
                }}
            />

            {/* Modals */}
            <AddMailServerModal
                open={openAdd}
                onClose={() => setOpenAdd(false)}
                onSuccess={() => {
                    refetch();
                }}
            />

            <EditMailServerModal
                open={openEdit}
                onClose={() => setOpenEdit(false)}
                onSuccess={() => {
                    refetch();
                }}
                mailServer={selectedServer}
            />

            {openStatus && (
                <ConnectionStatusModal
                    open={openStatus}
                    onClose={() => setOpenStatus(false)}
                    serverName={selectedServer?.name || ""}
                    mailServerId={selectedServer?.id || null}
                />
            )}

            <ConfirmationPopup
                isOpen={openDelete}
                onClose={() => setOpenDelete(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Mail Server"
                description={<>Are you sure you want to delete mail server <span className="font-semibold text-gray-900">{serverToDelete?.name}</span>? This action cannot be undone.</>}
                confirmText="Delete Server"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteMailServerMutation.isPending}
            />

            <ConfirmationPopup
                isOpen={!!bulkDeleteTarget}
                onClose={() => setBulkDeleteTarget(null)}
                onConfirm={handleConfirmBulkDelete}
                title="Delete Mail Servers"
                description={`Are you sure you want to delete ${bulkDeleteTarget?.servers.length ?? 0} selected mail server(s)? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={isBulkDeleting}
            />
        </div>
    )
}
