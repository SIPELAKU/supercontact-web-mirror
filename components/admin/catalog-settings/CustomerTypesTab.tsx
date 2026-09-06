"use client";

// components/admin/catalog-settings/CustomerTypesTab.tsx
//
// Customer types (Phase 3, spec I2): the `UnitsTab.tsx` manager, on the lazy
// SuperTable. A customer type is a RESOLUTION LEVEL - a price list assigned to
// "Reseller" prices every contact carrying that type, with no per-contact
// assignment - so archiving one is never a delete (spec A26) and exactly one
// type per tenant may be the default (partial unique index).

import { useCallback, useMemo, useState } from "react";
import { Chip } from "@mui/material";
import { Archive, Pencil, Plus, RotateCcw, Save, Star, Tags, X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { EmptyState } from "@/components/ui/empty-state";
import { Switch } from "@/components/ui/switch";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { SuperTable, type MRT_ColumnDef, type SuperTableState } from "@/components/ui/super-table";
import { notify } from "@/lib/notifications";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import {
    useArchiveCustomerType,
    useCreateCustomerType,
    useCustomerTypes,
    useUpdateCustomerType,
} from "@/lib/hooks/useCommercialContext";
import {
    COMMERCIAL_CODE_PATTERN,
    COMMERCIAL_NAME_MAX_LENGTH,
    CUSTOMER_TYPE_CODE_MAX_LENGTH,
} from "@/lib/constants/commercial-context";
import type {
    CustomerType,
    CustomerTypeListParams,
    CustomerTypeSortBy,
    CustomerTypeUpdate,
} from "@/lib/types/CommercialContext";

interface Draft {
    code: string;
    name: string;
    sortOrder: string;
    isDefault: boolean;
}

const EMPTY_DRAFT: Draft = { code: "", name: "", sortOrder: "0", isDefault: false };

// `limit` MUST equal the table's batch size (25) or the lazy footer asks for
// page 2 of 25 while showing 10 and rows 11-25 vanish without a trace
// (the SuperTable README's non-negotiable rule).
const INITIAL_PARAMS: CustomerTypeListParams = {
    page: 1,
    limit: 25,
    search: "",
    include_inactive: false,
    sort_by: "sort_order",
    sort_order: "asc",
    include_total: true,
};

function sameParams(a: CustomerTypeListParams, b: CustomerTypeListParams): boolean {
    return (
        a.page === b.page &&
        a.limit === b.limit &&
        a.search === b.search &&
        a.include_inactive === b.include_inactive &&
        a.sort_by === b.sort_by &&
        a.sort_order === b.sort_order
    );
}

export default function CustomerTypesTab() {
    const [params, setParams] = useState<CustomerTypeListParams>(INITIAL_PARAMS);
    const { data, isLoading, isFetching, isError, refetch } = useCustomerTypes(params);
    const rows: CustomerType[] = data?.items ?? [];

    const createMutation = useCreateCustomerType();
    const updateMutation = useUpdateCustomerType();
    const archiveMutation = useArchiveCustomerType();
    const { confirm, confirmationPopup } = useConfirmationPopup();

    const [editing, setEditing] = useState<CustomerType | null>(null);
    const [adding, setAdding] = useState(false);
    const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    // Bumped after every mutation so the lazy list restarts from batch 1.
    const [mutationSeq, setMutationSeq] = useState(0);
    const bump = () => setMutationSeq((s) => s + 1);

    const resetForm = () => {
        setEditing(null);
        setAdding(false);
        setDraft(EMPTY_DRAFT);
        setFieldErrors({});
    };

    const beginEdit = (row: CustomerType) => {
        setAdding(false);
        setEditing(row);
        setDraft({
            code: row.code,
            name: row.name,
            sortOrder: String(row.sort_order ?? 0),
            isDefault: row.is_default,
        });
        setFieldErrors({});
    };

    const handleServerError = (error: any, title: string) => {
        const fe = extractFieldErrors(error);
        const known = Object.keys(fe).filter((k) => k !== "_");
        if (known.length > 0) setFieldErrors(fe);
        if (known.length === 0 || fe._) notify.error(title, { description: fe._ ?? error?.message });
    };

    const handleSave = async () => {
        const code = draft.code.trim();
        const name = draft.name.trim();
        const sortOrder = draft.sortOrder.trim() === "" ? 0 : Number(draft.sortOrder);
        const problems: Record<string, string> = {};
        if (!editing) {
            if (!code) problems.code = "Kode wajib diisi";
            else if (!COMMERCIAL_CODE_PATTERN.test(code))
                problems.code = `Huruf, angka, _ . - ; maksimal ${CUSTOMER_TYPE_CODE_MAX_LENGTH} karakter`;
        }
        if (!name) problems.name = "Nama wajib diisi";
        else if (name.length > COMMERCIAL_NAME_MAX_LENGTH)
            problems.name = `Maksimal ${COMMERCIAL_NAME_MAX_LENGTH} karakter`;
        if (!Number.isInteger(sortOrder)) problems.sort_order = "Harus bilangan bulat";
        if (Object.keys(problems).length > 0) {
            setFieldErrors(problems);
            return;
        }
        try {
            if (editing) {
                const patch: CustomerTypeUpdate = {};
                if (name !== editing.name) patch.name = name;
                if (sortOrder !== editing.sort_order) patch.sort_order = sortOrder;
                if (draft.isDefault !== editing.is_default) patch.is_default = draft.isDefault;
                if (Object.keys(patch).length === 0) {
                    notify.info("Tidak ada perubahan");
                    resetForm();
                    return;
                }
                await updateMutation.mutateAsync({ id: editing.id, data: patch });
                notify.success("Tipe pelanggan diubah");
            } else {
                await createMutation.mutateAsync({
                    code,
                    name,
                    sort_order: sortOrder,
                    is_default: draft.isDefault,
                });
                notify.success("Tipe pelanggan ditambahkan", {
                    description:
                        "Belum ada kontak yang memakainya - setel di form kontak atau di kartu perusahaan.",
                });
            }
            resetForm();
            bump();
        } catch (error: any) {
            handleServerError(error, "Gagal menyimpan");
        }
    };

    const handleMakeDefault = async (row: CustomerType) => {
        try {
            // Exactly one default per tenant: the server demotes the incumbent
            // in the same transaction.
            await updateMutation.mutateAsync({ id: row.id, data: { is_default: true } });
            notify.success("Tipe pelanggan bawaan diubah", {
                description: `"${row.name}" kini dipakai untuk kontak yang belum diberi tipe.`,
            });
            bump();
        } catch (error: any) {
            notify.error("Gagal menjadikan bawaan", { description: error?.message });
        }
    };

    const handleArchive = (row: CustomerType) => {
        confirm({
            variant: "warning",
            title: "Arsipkan tipe pelanggan",
            description: `"${row.name}" tidak akan dipakai lagi saat harga quotation dihitung, dan hilang dari pilihan baru. Kontak dan perusahaan yang sudah memakainya tetap menyimpannya, dan quotation yang sudah ada tidak berubah.`,
            confirmText: "Arsipkan",
            cancelText: "Batal",
            onConfirm: async () => {
                try {
                    await archiveMutation.mutateAsync(row.id);
                    notify.success("Tipe pelanggan diarsipkan");
                    bump();
                } catch (error: any) {
                    notify.error("Gagal mengarsipkan", { description: error?.message });
                }
            },
        });
    };

    const handleRestore = async (row: CustomerType) => {
        try {
            await updateMutation.mutateAsync({ id: row.id, data: { status: "active" } });
            notify.success("Tipe pelanggan diaktifkan kembali");
            bump();
        } catch (error: any) {
            notify.error("Gagal mengaktifkan", { description: error?.message });
        }
    };

    const handleStateChange = useCallback((state: SuperTableState) => {
        const page = state.pagination.pageIndex + 1;
        const sort = state.sorting?.[0];
        setParams((prev) => {
            const next: CustomerTypeListParams = {
                page,
                limit: state.pagination.pageSize,
                search: state.globalFilter || "",
                include_inactive: Boolean(state.filters?.include_inactive),
                sort_by: (sort?.id as CustomerTypeSortBy) ?? "sort_order",
                sort_order: sort ? (sort.desc ? "desc" : "asc") : "asc",
                include_total: page === 1,
            };
            return sameParams(prev, next) ? prev : next;
        });
    }, []);

    const columns = useMemo<MRT_ColumnDef<CustomerType>[]>(
        () => [
            { accessorKey: "name", header: "Nama", size: 240 },
            {
                accessorKey: "code",
                header: "Kode",
                size: 160,
                Cell: ({ cell }) => <span className="font-mono text-xs">{cell.getValue<string>()}</span>,
            },
            {
                id: "is_default",
                accessorFn: (row) => (row.is_default ? "Bawaan" : ""),
                header: "Bawaan",
                size: 110,
                enableSorting: false,
                Cell: ({ row }) =>
                    row.original.is_default ? <Chip label="Bawaan" color="primary" size="small" /> : null,
            },
            { accessorKey: "sort_order", header: "Urutan", size: 100 },
            {
                id: "status",
                accessorFn: (row) => (row.status === "active" ? "Aktif" : "Diarsipkan"),
                header: "Status",
                size: 120,
                enableSorting: false,
                Cell: ({ row }) => (
                    <Chip
                        label={row.original.status === "active" ? "Aktif" : "Diarsipkan"}
                        color={row.original.status === "active" ? "success" : "default"}
                        size="small"
                    />
                ),
            },
        ],
        []
    );

    const saving = createMutation.isPending || updateMutation.isPending;
    // An ARCHIVED type cannot be the tenant default: the server refuses it, the
    // same rule the default price list carries.
    const defaultLocked = !!editing && editing.status !== "active";

    const editorRow = (
        <div className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <label className="mb-1 block text-xs font-medium">Kode</label>
                    <AppInput
                        isBgWhite
                        value={draft.code}
                        disabled={!!editing}
                        onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                        placeholder="mis. RESELLER"
                        inputProps={{ maxLength: CUSTOMER_TYPE_CODE_MAX_LENGTH }}
                        error={!!fieldErrors.code}
                        helperText={fieldErrors.code ?? (editing ? "Kode tidak bisa diubah" : undefined)}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium">Nama</label>
                    <AppInput
                        isBgWhite
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        placeholder="mis. Reseller"
                        inputProps={{ maxLength: COMMERCIAL_NAME_MAX_LENGTH }}
                        error={!!fieldErrors.name}
                        helperText={fieldErrors.name ?? "Nama ini yang dibaca sales di form kontak"}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium">Urutan</label>
                    <AppInput
                        isBgWhite
                        type="number"
                        value={draft.sortOrder}
                        onChange={(e) => setDraft({ ...draft, sortOrder: e.target.value })}
                        inputProps={{ step: 1 }}
                        error={!!fieldErrors.sort_order}
                        helperText={fieldErrors.sort_order ?? "Urutan tampil di pilihan"}
                    />
                </div>
                <div className="flex flex-col justify-center gap-2">
                    <label className="flex items-center gap-2 text-xs font-medium">
                        <Switch
                            checked={draft.isDefault}
                            disabled={defaultLocked}
                            onCheckedChange={(checked) => setDraft({ ...draft, isDefault: checked })}
                        />
                        Jadikan tipe bawaan
                    </label>
                    {defaultLocked && (
                        <p className="text-[11px] text-gray-500">
                            Tipe yang diarsipkan tidak bisa dijadikan bawaan. Aktifkan kembali dulu.
                        </p>
                    )}
                    {!!fieldErrors.is_default && (
                        <p className="text-[11px] text-red-600">{fieldErrors.is_default}</p>
                    )}
                </div>
            </div>
            <div className="flex gap-2">
                <AppButton onClick={handleSave} disabled={saving}>
                    <Save className="mr-1.5 h-4 w-4" />
                    Simpan
                </AppButton>
                <AppButton variantStyle="outline" onClick={resetForm} aria-label="Batal">
                    <X className="h-4 w-4" />
                </AppButton>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-4">
            {confirmationPopup}
            <div className="rounded-lg border-l-4 border-l-sky-500 bg-sky-50 p-4 text-sm dark:bg-sky-950/30">
                <p className="font-medium">
                    Tipe pelanggan adalah salah satu tingkat penentuan harga: satu daftar harga yang
                    ditetapkan ke tipe berlaku untuk SEMUA kontak bertipe itu.
                </p>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-muted-foreground">
                    <li>Setel tipe di form kontak, atau di kartu Konteks Komersial pada perusahaan CRM.</li>
                    <li>
                        Urutan pemakaian: tipe milik kontak dulu, baru tipe milik perusahaannya - keduanya
                        dipakai, yang lebih spesifik lebih dulu.
                    </li>
                    <li>
                        Tipe bawaan hanya satu per workspace, dan dipakai untuk kontak yang belum diberi tipe.
                    </li>
                    <li>
                        Mengarsipkan tidak menghapus apa pun: kontak yang memakainya tetap menyimpannya, dan
                        quotation yang sudah ada tidak berubah.
                    </li>
                </ul>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
                {!adding && !editing && (
                    <AppButton
                        onClick={() => {
                            setAdding(true);
                            setDraft(EMPTY_DRAFT);
                            setFieldErrors({});
                        }}
                    >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Tambah tipe pelanggan
                    </AppButton>
                )}
            </div>

            {(adding || editing) && editorRow}

            <SuperTable<CustomerType>
                tableId="customer-types-table"
                urlKey=""
                entityLabel="tipe pelanggan"
                searchPlaceholder="Cari nama atau kode tipe pelanggan"
                columns={columns}
                data={rows}
                getRowId={(row) => row.id}
                isLoading={isLoading}
                isFetching={isFetching}
                isError={isError}
                errorMessage="Failed to load customer types. Please try again."
                onRetry={() => refetch()}
                rowCount={typeof data?.total === "number" ? data.total : undefined}
                manualPagination
                manualFiltering
                manualSorting
                onStateChange={handleStateChange}
                resetPageKey={mutationSeq}
                filters={[{ id: "include_inactive", label: "Tampilkan yang diarsipkan", type: "boolean" }]}
                rowActions={[
                    {
                        id: "edit",
                        label: "Ubah",
                        icon: <Pencil size={16} />,
                        onClick: (row) => beginEdit(row),
                    },
                    {
                        id: "make-default",
                        label: "Jadikan bawaan",
                        icon: <Star size={16} />,
                        hidden: (row) => row.is_default || row.status !== "active",
                        onClick: (row) => handleMakeDefault(row),
                    },
                    {
                        id: "restore",
                        label: "Aktifkan kembali",
                        icon: <RotateCcw size={16} />,
                        hidden: (row) => row.status === "active",
                        onClick: (row) => handleRestore(row),
                    },
                    {
                        id: "archive",
                        label: "Arsipkan",
                        icon: <Archive size={16} />,
                        destructive: true,
                        hidden: (row) => row.status !== "active",
                        // Disabled WITH the reason: archiving the default would
                        // leave untyped contacts with no type at all.
                        disabled: (row) =>
                            row.is_default ? "Tipe pelanggan bawaan tidak bisa diarsipkan" : false,
                        onClick: (row) => handleArchive(row),
                    },
                ]}
                renderEmptyState={({ hasActiveFilters, hasSearch }) => (
                    <EmptyState
                        icon={Tags}
                        title={
                            hasActiveFilters || hasSearch ? "No customer types match" : "No customer types yet"
                        }
                        description="A customer type groups contacts and companies so one price list can serve all of them - resellers, corporates, walk-ins."
                    />
                )}
                features={{
                    pagination: true,
                    globalFilter: true,
                    sorting: true,
                    columnFilters: false,
                    urlSync: true,
                    rowSelection: "none",
                }}
            />
        </div>
    );
}
