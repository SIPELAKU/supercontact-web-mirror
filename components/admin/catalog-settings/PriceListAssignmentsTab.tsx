"use client";

import { useCallback, useMemo, useState } from "react";
import { Chip } from "@mui/material";
import { Pencil, Plus, Save, Trash2, Users, X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { EmptyState } from "@/components/ui/empty-state";
import { Switch } from "@/components/ui/switch";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { SuperTable, type MRT_ColumnDef, type SuperTableState } from "@/components/ui/super-table";
import CustomerTargetPicker from "@/components/admin/catalog-settings/CustomerTargetPicker";
import { TARGET_TYPE_LABELS, TARGET_TYPE_OPTIONS } from "@/lib/constants/price-list";
import { notify } from "@/lib/notifications";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import {
    useCreateAssignment,
    useDeleteAssignment,
    usePriceListAssignments,
    useUpdateAssignment,
} from "@/lib/hooks/usePriceLists";
import { formatValidityRange } from "@/lib/utils/priceGrid";
import {
    CONTRACT_REF_MAX_LENGTH,
    type AssignmentTargetSearchItem,
    type AssignmentTargetType,
    type PriceList,
    type PriceListAssignment,
    type PriceListAssignmentListParams,
    type PriceListAssignmentUpdate,
} from "@/lib/types/PriceList";

interface Draft {
    targetType: AssignmentTargetType;
    target: AssignmentTargetSearchItem | null;
    priority: string;
    isContract: boolean;
    contractRef: string;
    validFrom: string;
    validUntil: string;
}

const EMPTY_DRAFT: Draft = {
    targetType: "contact",
    target: null,
    priority: "0",
    isContract: false,
    contractRef: "",
    validFrom: "",
    validUntil: "",
};

const INITIAL_PARAMS: PriceListAssignmentListParams = {
    page: 1,
    limit: 25,
    search: "",
    include_total: true,
};

function sameParams(a: PriceListAssignmentListParams, b: PriceListAssignmentListParams): boolean {
    return (
        a.page === b.page &&
        a.limit === b.limit &&
        a.search === b.search &&
        a.target_type === b.target_type &&
        a.only_open === b.only_open
    );
}

export default function PriceListAssignmentsTab({ priceList }: { priceList: PriceList }) {
    const [params, setParams] = useState<PriceListAssignmentListParams>(INITIAL_PARAMS);
    const { data, isLoading, isFetching, isError, refetch } = usePriceListAssignments(
        priceList.id,
        params
    );
    const rows: PriceListAssignment[] = data?.assignments ?? [];

    const createMutation = useCreateAssignment();
    const updateMutation = useUpdateAssignment();
    const deleteMutation = useDeleteAssignment();
    const { confirm, confirmationPopup } = useConfirmationPopup();

    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState<PriceListAssignment | null>(null);
    const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [mutationSeq, setMutationSeq] = useState(0);

    const resetForm = () => {
        setAdding(false);
        setEditing(null);
        setDraft(EMPTY_DRAFT);
        setFieldErrors({});
    };

    const beginEdit = (row: PriceListAssignment) => {
        setAdding(false);
        setEditing(row);
        setDraft({
            targetType: row.target_type,
            target: row.target
                ? { id: row.target.id, target_type: row.target_type, label: row.target.label, secondary: null }
                : null,
            priority: String(row.priority ?? 0),
            isContract: row.is_contract,
            contractRef: row.contract_ref ?? "",
            validFrom: row.valid_from ?? "",
            validUntil: row.valid_until ?? "",
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
        const problems: Record<string, string> = {};
        if (!editing && !draft.target) problems.target_id = "Pilih pelanggan";
        if (draft.contractRef.length > CONTRACT_REF_MAX_LENGTH)
            problems.contract_ref = `Maksimal ${CONTRACT_REF_MAX_LENGTH} karakter`;
        if (draft.validFrom && draft.validUntil && draft.validUntil < draft.validFrom)
            problems.valid_until = "Tanggal berakhir harus setelah tanggal mulai";
        if (Object.keys(problems).length > 0) {
            setFieldErrors(problems);
            return;
        }

        const priority = Number(draft.priority) || 0;
        try {
            if (editing) {
                // The target itself is immutable: remove and re-assign to point
                // the list at somebody else.
                const patch: PriceListAssignmentUpdate = {};
                if (priority !== editing.priority) patch.priority = priority;
                if (draft.isContract !== editing.is_contract) patch.is_contract = draft.isContract;
                if ((draft.contractRef || null) !== (editing.contract_ref ?? null))
                    patch.contract_ref = draft.contractRef || null;
                if ((draft.validFrom || null) !== (editing.valid_from ?? null))
                    patch.valid_from = draft.validFrom || null;
                if ((draft.validUntil || null) !== (editing.valid_until ?? null))
                    patch.valid_until = draft.validUntil || null;
                if (Object.keys(patch).length === 0) {
                    notify.info("Tidak ada perubahan");
                    resetForm();
                    return;
                }
                await updateMutation.mutateAsync({
                    priceListId: priceList.id,
                    assignmentId: editing.id,
                    data: patch,
                });
                notify.success("Penetapan diubah");
            } else {
                await createMutation.mutateAsync({
                    priceListId: priceList.id,
                    data: {
                        target_type: draft.targetType,
                        target_id: draft.target!.id,
                        priority,
                        is_contract: draft.isContract,
                        contract_ref: draft.contractRef || null,
                        valid_from: draft.validFrom || null,
                        valid_until: draft.validUntil || null,
                    },
                });
                notify.success("Daftar harga ditetapkan", {
                    description: `"${priceList.name}" kini dipakai untuk ${draft.target?.label ?? "pelanggan ini"}.`,
                });
            }
            resetForm();
            setMutationSeq((s) => s + 1);
        } catch (error: any) {
            handleServerError(error, "Gagal menyimpan penetapan");
        }
    };

    const handleDelete = (row: PriceListAssignment) => {
        confirm({
            variant: "warning",
            title: "Hapus penetapan",
            description: `${row.target?.label ?? "Pelanggan ini"} tidak lagi memakai "${priceList.name}". Quotation berikutnya akan dihitung ulang dengan daftar harga lain atau harga dasar. Quotation yang sudah tersimpan tidak berubah.`,
            confirmText: "Hapus",
            cancelText: "Batal",
            onConfirm: async () => {
                try {
                    await deleteMutation.mutateAsync({
                        priceListId: priceList.id,
                        assignmentId: row.id,
                    });
                    notify.success("Penetapan dihapus");
                    setMutationSeq((s) => s + 1);
                } catch (error: any) {
                    notify.error("Gagal menghapus", { description: error?.message });
                }
            },
        });
    };

    const handleStateChange = useCallback((state: SuperTableState) => {
        const page = state.pagination.pageIndex + 1;
        setParams((prev) => {
            const next: PriceListAssignmentListParams = {
                page,
                limit: state.pagination.pageSize,
                search: state.globalFilter || "",
                target_type: (state.filters?.target_type as AssignmentTargetType) || undefined,
                only_open: state.filters?.only_open ? true : undefined,
                include_total: page === 1,
            };
            return sameParams(prev, next) ? prev : next;
        });
    }, []);

    const columns = useMemo<MRT_ColumnDef<PriceListAssignment>[]>(
        () => [
            {
                id: "target",
                accessorFn: (row) => row.target?.label ?? row.target_id,
                header: "Pelanggan",
                size: 280,
                Cell: ({ row }) => (
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span>{row.original.target?.label ?? "(tidak dikenal)"}</span>
                        <Chip label={TARGET_TYPE_LABELS[row.original.target_type]} size="small" />
                        {!row.original.target_exists && (
                            <Chip label="Pelanggan sudah dihapus" color="warning" size="small" />
                        )}
                    </div>
                ),
            },
            { accessorKey: "priority", header: "Prioritas", size: 110 },
            {
                id: "validity",
                accessorFn: (row) =>
                    row.valid_from || row.valid_until
                        ? formatValidityRange({ valid_from: row.valid_from ?? "", valid_until: row.valid_until })
                        : "Selalu berlaku",
                header: "Masa berlaku",
                size: 200,
                enableSorting: false,
            },
            {
                id: "is_contract",
                accessorFn: (row) => (row.is_contract ? "Kontrak" : ""),
                header: "Kontrak",
                size: 120,
                enableSorting: false,
                Cell: ({ row }) =>
                    row.original.is_contract ? <Chip label="Kontrak" color="info" size="small" /> : null,
            },
            {
                accessorKey: "contract_ref",
                header: "No. kontrak",
                size: 180,
                enableSorting: false,
                Cell: ({ cell }) => cell.getValue<string | null>() ?? "-",
            },
        ],
        []
    );

    const saving = createMutation.isPending || updateMutation.isPending;

    const editorRow = (
        <div className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-4">
            <CustomerTargetPicker
                targetType={draft.targetType}
                onTargetTypeChange={(next) => setDraft((prev) => ({ ...prev, targetType: next }))}
                value={draft.target}
                onChange={(next) => setDraft((prev) => ({ ...prev, target: next }))}
                disabled={!!editing}
                error={!!fieldErrors.target_id}
                helperText={
                    fieldErrors.target_id ??
                    (editing ? "Pelanggan tidak bisa diganti - hapus lalu tetapkan ulang" : undefined)
                }
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <label className="mb-1 block text-xs font-medium">Prioritas</label>
                    <AppInput
                        isBgWhite
                        type="number"
                        value={draft.priority}
                        onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
                        inputProps={{ step: 1 }}
                        error={!!fieldErrors.priority}
                        helperText={fieldErrors.priority ?? "Angka lebih besar menang"}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium">No. kontrak</label>
                    <AppInput
                        isBgWhite
                        value={draft.contractRef}
                        onChange={(e) => setDraft({ ...draft, contractRef: e.target.value })}
                        inputProps={{ maxLength: CONTRACT_REF_MAX_LENGTH }}
                        error={!!fieldErrors.contract_ref}
                        helperText={fieldErrors.contract_ref}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium">Berlaku dari</label>
                    <input
                        type="date"
                        aria-label="Berlaku dari"
                        value={draft.validFrom}
                        onChange={(e) => setDraft({ ...draft, validFrom: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#5479EE] focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium">Berlaku sampai</label>
                    <input
                        type="date"
                        aria-label="Berlaku sampai"
                        value={draft.validUntil}
                        onChange={(e) => setDraft({ ...draft, validUntil: e.target.value })}
                        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-[#5479EE] focus:outline-none ${
                            fieldErrors.valid_until ? "border-red-500" : "border-gray-200"
                        }`}
                    />
                    {fieldErrors.valid_until && (
                        <p className="mt-1 text-xs text-red-600">{fieldErrors.valid_until}</p>
                    )}
                </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-medium">
                <Switch
                    checked={draft.isContract}
                    onCheckedChange={(checked) => setDraft({ ...draft, isContract: checked })}
                />
                Tandai sebagai kontrak (catatan saja - tidak mengubah urutan)
            </label>
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
                <p>
                    Kontak lebih diutamakan daripada perusahaan; jika keduanya tidak cocok, daftar harga
                    bawaan yang dipakai. Prioritas lebih besar menang.
                </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
                {!adding && !editing && (
                    <AppButton onClick={() => setAdding(true)}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Tetapkan ke pelanggan
                    </AppButton>
                )}
            </div>

            {(adding || editing) && editorRow}

            <SuperTable<PriceListAssignment>
                tableId="price-list-assignments-table"
                urlKey="assignments"
                entityLabel="penetapan"
                // The server matches the TARGET (contact `search_text`, CRM
                // company name/industry/domain) as well as `contract_ref`, so
                // the box says both of the things it actually searches.
                searchPlaceholder="Cari nama pelanggan atau no. kontrak"
                columns={columns}
                data={rows}
                getRowId={(row) => row.id}
                isLoading={isLoading}
                isFetching={isFetching}
                isError={isError}
                errorMessage="Failed to load assignments. Please try again."
                onRetry={() => refetch()}
                rowCount={typeof data?.total === "number" ? data.total : undefined}
                manualPagination
                manualFiltering
                onStateChange={handleStateChange}
                resetPageKey={mutationSeq}
                filters={[
                    {
                        id: "target_type",
                        label: "Jenis pelanggan",
                        type: "select",
                        options: TARGET_TYPE_OPTIONS,
                    },
                    { id: "only_open", label: "Hanya yang masih berlaku", type: "boolean" },
                ]}
                rowActions={[
                    {
                        id: "edit",
                        label: "Ubah",
                        icon: <Pencil size={16} />,
                        onClick: (row) => beginEdit(row),
                    },
                    {
                        id: "delete",
                        label: "Hapus",
                        icon: <Trash2 size={16} />,
                        destructive: true,
                        onClick: (row) => handleDelete(row),
                    },
                ]}
                renderEmptyState={({ hasActiveFilters, hasSearch }) => (
                    <EmptyState
                        icon={Users}
                        title={hasActiveFilters || hasSearch ? "No assignments match" : "Not assigned yet"}
                        description="Until this list is assigned to a customer - or made the company default - it prices nothing."
                    />
                )}
                features={{
                    pagination: true,
                    globalFilter: true,
                    sorting: false,
                    columnFilters: false,
                    urlSync: true,
                    rowSelection: "none",
                }}
            />
        </div>
    );
}
