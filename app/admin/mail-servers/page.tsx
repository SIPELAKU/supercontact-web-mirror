"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Pencil,
    Trash2,
    Search,
    Plus,
    Play,
    AlertCircle,
    CheckCircle2,
    HelpCircle
} from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Checkbox,
    CircularProgress,
    Box,
    TablePagination,
} from "@mui/material";
import FilterPopover from "@/components/contact/filter-popover";
import AddMailServerModal from "@/components/admin/mail-servers/AddMailServerModal";
import EditMailServerModal from "@/components/admin/mail-servers/EditMailServerModal";
import ConnectionStatusModal from "@/components/admin/mail-servers/ConnectionStatusModal";
import DeleteMailServerModal from "@/components/admin/mail-servers/DeleteMailServerModal";
import { MailServer } from "@/lib/models/types";
import { notify } from "@/lib/notifications";
import { useMailServers, useTestMailServerConnection, useUpdateMailServer, useUpdateMailServerStatus } from "@/lib/hooks/useMailServers";
import { useDebounce } from "@/lib/hooks/useDebounce";

export default function MailServersPage() {
    const router = useRouter();

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Search
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Data fetching
    const { data: response, isLoading, refetch } = useMailServers(page + 1, rowsPerPage, debouncedSearch);
    const mailServers = response?.data?.mail_servers || [];
    const totalCount = response?.data?.total || 0;

    const [selected, setSelected] = useState<string[]>([]);

    // Modals state
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedServer, setSelectedServer] = useState<MailServer | null>(null);
    const [openStatus, setOpenStatus] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [serverToDelete, setServerToDelete] = useState<MailServer | null>(null);

    // Filters
    const [filters, setFilters] = useState<any[]>([]);

    const allColumns = [
        { id: "selection", label: "Selection" },
        { id: "name", label: "Nama" },
        { id: "smtp_host", label: "Server SMTP" },
        { id: "smtp_username", label: "Username" },
        { id: "status", label: "Status" },
        { id: "", label: "Prioritas" },
        { id: "action", label: "Aksi" },
    ];

    // Filter Logic (Client-side for now, as API only supports basic search)
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

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelected(mailServers.map((item) => item.id));
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
            notify.error("Connection Failed", { description: error.message, duration: 10000 });
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
            <PageHeader
                title="Mail Servers"
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Admin" },
                    { label: "Mail Servers" }
                ]}
            />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 space-y-8 min-h-[500px]">
                <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 pt-5">
                    <div className="flex flex-wrap gap-2">
                        <FilterPopover
                            columns={allColumns.filter(
                                (c) => c.id !== "selection" && c.id !== "action"
                            )}
                            onApply={setFilters}
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
                                        checked={mailServers.length > 0 && selected.length === mailServers.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Name</TableCell>
                                <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Server SMTP</TableCell>
                                <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Username</TableCell>
                                <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2, textAlign: 'center' }}>Status</TableCell>
                                <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2, textAlign: 'center' }}>Active</TableCell>
                                <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2, pr: 3, textAlign: 'center' }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                                        <p className="text-gray-500">No mail servers found.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((item) => (
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
                                                {item.last_error ? (
                                                    <button
                                                        onClick={() => handleViewLog(item)}
                                                        className="flex items-center gap-1 text-xs text-red-500 hover:underline"
                                                        title={item.last_error}
                                                    >
                                                        <AlertCircle size={12} className="text-red-500" />
                                                        Check log connection
                                                    </button>
                                                ) : !item.is_system_mail_server && !item.last_tested_at ? (
                                                    <button
                                                        onClick={() => handleViewLog(item)}
                                                        className="flex items-center gap-1 text-xs text-gray-400 hover:underline"
                                                        title="Belum pernah diuji"
                                                    >
                                                        <HelpCircle size={12} className="text-gray-400" />
                                                        Check log connection
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleViewLog(item)}
                                                        className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
                                                    >
                                                        <CheckCircle2 size={12} className="text-green-500" />
                                                        Check log connection
                                                    </button>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-600">{item.smtp_host}</TableCell>
                                        <TableCell className="text-gray-600">{item.smtp_username}</TableCell>
                                        <TableCell align="center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'Active'
                                                ? 'bg-emerald-100 text-emerald-600'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {item.status === 'Active' ? 'Aktif' : 'Non-aktif'}
                                            </span>
                                        </TableCell>
                                        <TableCell align="center" className="text-gray-600">
                                            {updateMailServerStatusMutation.isPending && updateMailServerStatusMutation.variables?.id === item.id ? (
                                                <CircularProgress size={20} />
                                            ) : (
                                                <Switch
                                                    checked={item.status === 'Active'}
                                                    onCheckedChange={async (checked) => {
                                                        try {
                                                            await updateMailServerStatusMutation.mutateAsync({
                                                                id: item.id,
                                                                data: { status: checked ? 'Active' : 'Inactive' }
                                                            });
                                                            notify.success("Status Updated");
                                                        } catch (error: any) {
                                                            notify.error("Update Failed", { description: error.message });
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
                                                        <Play size={18} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="cursor-pointer p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-purple-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="cursor-pointer p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
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
                        count={totalCount}
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
    );
}
