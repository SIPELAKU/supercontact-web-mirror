"use client";

import FilterPopover from '@/components/contact/filter-popover';
import { handleError } from '@/lib/utils/errorHandler';
import { DeleteButton, EditButton } from '@/components/ui/app-action-buttons-table';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import SettingsPageHeader from '@/components/settings/SettingsPageHeader';
import { Switch } from '@/components/ui/switch';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useMailServers, useTestMailServerConnection, useUpdateMailServerStatus } from '@/lib/hooks/useMailServers';
import { MailServer } from '@/lib/models/types';
import { notify } from '@/lib/notifications';
import { Checkbox, CircularProgress, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Tooltip } from '@mui/material';
import { AlertCircle, CheckCircle2, HelpCircle, Play, Plus, Search } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import AddMailServerModal from './AddMailServerModal';
import EditMailServerModal from './EditMailServerModal';
import ConnectionStatusModal from './ConnectionStatusModal';
import DeleteMailServerModal from './DeleteMailServerModal';

export const MailServerClient = () => {
    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Search
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Reset to first page whenever the (server-side) search term changes
    useEffect(() => {
        setPage(0);
    }, [debouncedSearch]);

    // Filters (operator popover stays client-side; when active we fetch the whole
    // set so the filter applies to ALL rows, not just the current page)
    const [filters, setFilters] = useState<any[]>([]);
    const hasActiveFilters = filters.some((f) => f.columnId && f.operator);

    // Data fetching
    const { data: response, isLoading, isError, error, refetch } = useMailServers(
        hasActiveFilters ? 1 : page + 1,
        hasActiveFilters ? 1000 : rowsPerPage,
        debouncedSearch
    );
    const mailServers = (response?.data?.mail_servers || []).filter(item => !item.is_system_mail_server);
    const totalCount = response?.data?.total || 0;

    // Handle fetch error
    useEffect(() => {
        if (isError && error) {
            const message = handleError(error, "Fetch Mail Servers");
            notify.error("Failed to load mail servers", { description: message });
        }
    }, [isError, error]);

    const [selected, setSelected] = useState<string[]>([]);

    // Modals state
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedServer, setSelectedServer] = useState<MailServer | null>(null);
    const [openStatus, setOpenStatus] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [serverToDelete, setServerToDelete] = useState<MailServer | null>(null);

    const allColumns = [
        { id: "selection", label: "Selection" },
        { id: "name", label: "Name" },
        { id: "smtp_host", label: "Server SMTP" },
        { id: "smtp_username", label: "Username" },
        { id: "smtp_region", label: "Region" },
        { id: "status", label: "Status" },
        { id: "action", label: "Actions" },
    ];

    // Filter Logic (client-side operator popover; applied to the full fetched set
    // because pagination switches to client-side while filters are active)
    const filteredData = mailServers.filter((item) => {
        if (filters.length === 0) return true;

        return filters.every((filter) => {
            if (!filter.columnId || !filter.operator) return true;

            let itemValue: any = item[filter.columnId as keyof MailServer];
            if (itemValue === undefined || itemValue === null) return true;

            itemValue = String(itemValue).toLowerCase();
            const filterValue = (filter.value || "").toString().toLowerCase();

            switch (filter.operator) {
                case "contains": return itemValue.includes(filterValue);
                case "does not contain": return !itemValue.includes(filterValue);
                case "equals": return itemValue === filterValue;
                case "does not equal": return itemValue !== filterValue;
                case "starts with": return itemValue.startsWith(filterValue);
                case "ends with": return itemValue.endsWith(filterValue);
                case "is empty": return itemValue === "";
                case "is not empty": return itemValue !== "";
                default: return true;
            }
        });
    });

    // While filters are active, paginate the filtered set client-side
    const displayCount = hasActiveFilters ? filteredData.length : totalCount;
    const visibleData = hasActiveFilters
        ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        : filteredData;

    const handleApplyFilters = (newFilters: any[]) => {
        setFilters(newFilters);
        setPage(0);
        setSelected([]);
    };

    // Select-all scopes to the filtered rows (not the raw page)
    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelected(filteredData.map((item) => item.id));
        } else {
            setSelected([]);
        }
    };

    const handleSelectRow = (id: string) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((item) => item !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const handleEdit = (item: MailServer) => {
        setSelectedServer(item);
        setOpenEdit(true);
    };

    const handleDelete = (item: MailServer) => {
        setServerToDelete(item);
        setOpenDelete(true);
    };

    const testConnectionMutation = useTestMailServerConnection();
    const updateMailServerStatusMutation = useUpdateMailServerStatus();

    const handleTestConnection = async (item: MailServer) => {
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
    };

    const handleViewLog = (item: MailServer) => {
        setSelectedServer(item);
        setOpenStatus(true);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

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

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 space-y-8 min-h-[500px]">
                <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 pt-5">
                    <div className="flex flex-wrap gap-2">
                        <FilterPopover
                            columns={allColumns.filter(
                                (c) => c.id !== "selection" && c.id !== "action"
                            )}
                            onApply={handleApplyFilters}
                        />
                        <div className="flex items-center relative w-full md:w-64">
                            <AppInput
                                startIcon={<Search size={16} />}
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                isBgWhite
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <AppButton
                            onClick={() => setOpenAdd(true)}
                            variantStyle="primary"
                            startIcon={<Plus size={16} />}
                        >
                            Add Server
                        </AppButton>
                    </div>
                </section>

                <div className="overflow-x-auto rounded-lg border border-gray-200 mx-6 mb-6">
                    <Table sx={{ minWidth: 900 }}>
                        <TableHead>
                            <TableRow className="bg-[#EEF2FD]!">
                                <TableCell padding="checkbox" sx={{ pl: 3 }}>
                                    <Checkbox
                                        color="primary"
                                        checked={filteredData.length > 0 && selected.length === filteredData.length}
                                        indeterminate={selected.length > 0 && selected.length < filteredData.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Name</TableCell>
                                <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Server SMTP</TableCell>
                                <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Username</TableCell>
                                <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Region</TableCell>
                                <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2, textAlign: 'center' }}>Status</TableCell>
                                <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2, textAlign: 'center' }}>Active</TableCell>
                                <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2, pr: 3, textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : visibleData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                                        <p className="text-gray-500">No mail servers found.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                visibleData.map((item) => (
                                    <TableRow key={item.id} hover sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                                        <TableCell padding="checkbox" sx={{ pl: 3 }}>
                                            <Checkbox
                                                color="primary"
                                                checked={selected.includes(item.id)}
                                                onChange={() => handleSelectRow(item.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
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
                                        </TableCell>
                                        <TableCell className="text-gray-600">{item.smtp_host}</TableCell>
                                        <TableCell className="text-gray-600">{item.smtp_username}</TableCell>
                                        <TableCell className="text-gray-600">{item.smtp_region || "-"}</TableCell>
                                        <TableCell align="center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'Active'
                                                ? 'bg-emerald-100 text-emerald-600'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {item.status === 'Active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell align="center" className="text-gray-600">
                                            {updateMailServerStatusMutation.isPending && updateMailServerStatusMutation.variables?.id === item.id ? (
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
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <div className="flex items-center justify-center gap-2">
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
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={displayCount}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </div>
            </div>

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

            {openDelete && (
                <DeleteMailServerModal
                    open={openDelete}
                    onClose={() => setOpenDelete(false)}
                    onSuccess={() => {
                        // Optional: any specific success logic like refreshing list is handled in hook
                        refetch();
                    }}
                    mailServer={serverToDelete}
                />
            )}

        </div>
    )
}
