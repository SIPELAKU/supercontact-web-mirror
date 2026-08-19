"use client"

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddContactModal from "@/components/contact/modal/AddContactModal";
import EditContactModal from "@/components/contact/modal/EditContactModal";
import DeleteContactModal from "@/components/contact/modal/DeleteContactModal";
import { Contact } from "@/lib/models/types";
import DeleteMultipleContactModal from "@/components/contact/modal/DeleteMultipleContactModal";
import ImportContactModal from "@/components/contact/modal/ImportContactModal";
import { useReactToPrint } from "react-to-print";
import { PrintableTable } from "@/components/ui/printable-table";
import PageHeader from "@/components/ui/page-header";
import { ContactTable } from "./ContactTable";
import { useDeleteMultipleContacts, useDeleteContact, useDeleteAllContacts, useDuplicateContacts } from '@/lib/hooks/useContacts';
import { useAuth } from "@/lib/context/AuthContext";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Stack, Typography, CircularProgress } from '@mui/material';
import { AppButton } from "@/components/ui/app-button";
import { notify } from "@/lib/notifications";
import type { SuperTableState } from "@/components/ui/super-table";

// Printable columns for PDF print
const printableColumns = [
    { header: "Name", accessorKey: "name" },
    { header: "Phone", accessorKey: "phone_number" },
    { header: "Email", accessorKey: "email" },
    { header: "Position", accessorKey: "position" },
    { header: "Company", accessorKey: "company" },
    { header: "Address", accessorKey: "address" },
];

export const ContactClient = () => {
    const router = useRouter();
    const { getToken } = useAuth();
    const deleteMutation = useDeleteContact();
    const bulkDeleteMutation = useDeleteMultipleContacts();
    const deleteAllMutation = useDeleteAllContacts();
    const duplicateMutation = useDuplicateContacts();
    const componentRef = useRef<HTMLDivElement>(null);

    // --- Modal States ---
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openDeleteMultiple, setOpenDeleteMultiple] = useState(false);
    const [openImport, setOpenImport] = useState(false);
    const [confirmAllOpen, setConfirmAllOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Contact | null>(null);
    const [bulkDeleteContacts, setBulkDeleteContacts] = useState<Contact[]>([]);
    const [bulkClearSelection, setBulkClearSelection] = useState<(() => void) | null>(null);

    // --- Data State (server-side pagination + search) ---
    const [dataContact, setDataContact] = useState<Contact[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Current table state from SuperTable ---
    const currentPageRef = useRef(0);
    const currentPageSizeRef = useRef(10);
    const currentSearchRef = useRef("");
    const currentSortByRef = useRef<string | undefined>(undefined);
    const currentSortOrderRef = useRef<"asc" | "desc" | undefined>(undefined);

    const loadData = useCallback(async (
        page: number,
        pageSize: number,
        search?: string,
        sortBy?: string,
        sortOrder?: "asc" | "desc",
    ) => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");

            const params = new URLSearchParams({
                page: String(page + 1),
                limit: String(pageSize),
            });
            if (search) params.set("search", search);
            if (sortBy) {
                params.set("sort_by", sortBy);
                params.set("sort_order", sortOrder ?? "asc");
            }

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/contacts?${params.toString()}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            const json = await res.json();
            const contacts = Array.isArray(json.data)
                ? json.data
                : Array.isArray(json.data?.contacts)
                    ? json.data.contacts
                    : [];
            const total = json.data?.total || json.total || 0;

            setTotalCount(total);
            setDataContact(contacts);
        } catch (err: any) {
            setError(err.message || "Failed to load contacts");
            setDataContact([]);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    // Initial load
    useEffect(() => {
        loadData(0, 10);
    }, [loadData]);

    // --- SuperTable State Change Handler (server-side pagination + search + sorting) ---
    const handleStateChange = useCallback((state: SuperTableState) => {
        const newPageSize = state.pagination?.pageSize ?? 10;
        const newSearch = state.globalFilter ?? "";
        const sort = state.sorting?.[0];
        const newSortBy = sort?.id;
        const newSortOrder: "asc" | "desc" | undefined = sort
            ? (sort.desc ? "desc" : "asc")
            : undefined;

        const searchChanged = newSearch !== currentSearchRef.current;
        // Reset to first page when the search term changes
        const newPage = searchChanged ? 0 : (state.pagination?.pageIndex ?? 0);

        // Only refetch if server-side params actually changed
        if (
            newPage !== currentPageRef.current ||
            newPageSize !== currentPageSizeRef.current ||
            searchChanged ||
            newSortBy !== currentSortByRef.current ||
            newSortOrder !== currentSortOrderRef.current
        ) {
            currentPageRef.current = newPage;
            currentPageSizeRef.current = newPageSize;
            currentSearchRef.current = newSearch;
            currentSortByRef.current = newSortBy;
            currentSortOrderRef.current = newSortOrder;
            loadData(newPage, newPageSize, newSearch, newSortBy, newSortOrder);
        }
    }, [loadData]);

    // --- Export handler: loop all pages ---
    const handleExportRequest = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) throw new Error("No authentication token");

            const allContacts: Contact[] = [];
            let page = 1;
            const limit = 100;
            let hasMore = true;

            while (hasMore) {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/contacts?page=${page}&limit=${limit}&search=`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );
                const json = await res.json();
                const contacts = Array.isArray(json.data?.contacts)
                    ? json.data.contacts
                    : Array.isArray(json.data) ? json.data : [];
                const total = json.data?.total || json.total || 0;

                allContacts.push(...contacts);

                if (allContacts.length >= total || contacts.length < limit) {
                    hasMore = false;
                }
                page++;
            }

            return allContacts;
        } catch (err) {
            console.error("Export failed:", err);
            return [];
        }
    }, [getToken]);

    // --- Reload helper ---
    const reloadCurrentPage = useCallback(() => {
        loadData(
            currentPageRef.current,
            currentPageSizeRef.current,
            currentSearchRef.current,
            currentSortByRef.current,
            currentSortOrderRef.current,
        );
    }, [loadData]);

    // --- Handlers ---
    const handleEdit = (item: Contact) => {
        setSelectedItem(item);
        setOpenEdit(true);
    };

    const handleDelete = (item: Contact) => {
        setSelectedItem(item);
        setOpenDelete(true);
    };

    const handleDetail = (item: Contact) => {
        if (item.id) {
            router.push(`/contact/detail/${item.id}`);
        }
    };

    const handleBulkDelete = (contacts: Contact[], clearSelection: () => void) => {
        setBulkDeleteContacts(contacts);
        setBulkClearSelection(() => clearSelection);
        setOpenDeleteMultiple(true);
    };

    const handleConfirmDeleteAll = async () => {
        try {
            await deleteAllMutation.mutateAsync();
            setConfirmAllOpen(false);
            reloadCurrentPage();
        } catch (error) {
            console.error("Failed to delete all contacts:", error);
        }
    };

    const handleDuplicate = async (contacts: Contact[], clearSelection?: () => void) => {
        try {
            const ids = contacts.map(c => c.id);
            await duplicateMutation.mutateAsync(ids);
            notify.success(`${contacts.length} contact(s) duplicated successfully.`);
            clearSelection?.();
            reloadCurrentPage();
        } catch (err: any) {
            notify.error(err.message || "Failed to duplicate contact(s).");
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: "Contacts",
    });

    return (
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
            <PageHeader
                title="Contacts"
                breadcrumbs={[{ label: "Dashboard" }, { label: "Contacts" }]}
            />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                <ContactTable
                    data={dataContact}
                    isLoading={loading}
                    isError={!!error}
                    errorMessage={error || undefined}
                    onRetry={() =>
                        loadData(
                            currentPageRef.current,
                            currentPageSizeRef.current,
                            currentSearchRef.current,
                            currentSortByRef.current,
                            currentSortOrderRef.current,
                        )
                    }
                    rowCount={totalCount}
                    onStateChange={handleStateChange}
                    onExportRequest={handleExportRequest}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDetail={handleDetail}
                    onDuplicate={handleDuplicate}
                    onBulkDelete={handleBulkDelete}
                    onDeleteAll={() => setConfirmAllOpen(true)}
                    onOpenAdd={() => setOpenAdd(true)}
                    onOpenImport={() => setOpenImport(true)}
                    isDuplicating={duplicateMutation.isPending}
                />
            </div>

            {/* Modals */}
            <AddContactModal
                open={openAdd}
                onClose={() => setOpenAdd(false)}
                onSuccess={reloadCurrentPage}
            />
            <EditContactModal
                open={openEdit}
                initialData={selectedItem}
                onClose={() => setOpenEdit(false)}
                onSuccess={reloadCurrentPage}
            />
            <DeleteContactModal
                open={openDelete}
                initialData={selectedItem}
                onClose={() => setOpenDelete(false)}
                onSuccess={reloadCurrentPage}
            />
            <DeleteMultipleContactModal
                open={openDeleteMultiple}
                selected={bulkDeleteContacts}
                onClose={() => {
                    setOpenDeleteMultiple(false);
                    bulkClearSelection?.();
                }}
                onSuccess={() => {
                    reloadCurrentPage();
                    bulkClearSelection?.();
                }}
            />
            <ImportContactModal
                open={openImport}
                onClose={() => setOpenImport(false)}
                onSuccess={reloadCurrentPage}
            />

            {/* Delete All Confirmation Dialog */}
            <Dialog open={confirmAllOpen} onClose={() => setConfirmAllOpen(false)}>
                <DialogTitle>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <AlertTriangle size={20} className="text-red-500" />
                        <span>Delete All Contacts</span>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>all contacts</strong>? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <AppButton variantStyle="outline" onClick={() => setConfirmAllOpen(false)}>
                        Cancel
                    </AppButton>
                    <AppButton
                        variantStyle="danger"
                        onClick={handleConfirmDeleteAll}
                        disabled={deleteAllMutation.isPending}
                    >
                        {deleteAllMutation.isPending ? (
                            <CircularProgress size={16} color="inherit" />
                        ) : (
                            "Delete All"
                        )}
                    </AppButton>
                </DialogActions>
            </Dialog>

            {/* Hidden Printable Table */}
            <div style={{ display: "none" }}>
                <PrintableTable
                    ref={componentRef}
                    title="Contacts"
                    data={dataContact}
                    columns={printableColumns}
                />
            </div>
        </div>
    );
}
