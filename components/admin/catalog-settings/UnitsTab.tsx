"use client";

import { useCallback, useMemo, useState } from "react";
import { Chip } from "@mui/material";
import { Archive, Pencil, Plus, RotateCcw, Ruler, Save, X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { SuperTable, type MRT_ColumnDef, type SuperTableState } from "@/components/ui/super-table";
import { notify } from "@/lib/notifications";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import { useArchiveUnit, useCreateUnit, useUnits, useUpdateUnit } from "@/lib/hooks/useUnits";
import type { Unit, UnitListParams, UnitPrecision, UnitSortBy, UnitUpdate } from "@/lib/types/Unit";

const PRECISION_OPTIONS: { value: string; label: string }[] = [
    { value: "0", label: "Bilangan bulat (pcs, unit)" },
    { value: "1", label: "1 desimal" },
    { value: "2", label: "2 desimal (kg, m3)" },
];

const PRECISION_LABELS: Record<number, string> = {
    0: "Bilangan bulat",
    1: "1 desimal",
    2: "2 desimal",
};

const UNIT_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,15}$/;

interface Draft {
    code: string;
    name: string;
    precision: string;
}

const EMPTY_DRAFT: Draft = { code: "", name: "", precision: "0" };

const INITIAL_PARAMS: UnitListParams = {
    page: 1,
    limit: 25,
    search: "",
    include_inactive: false,
    sort_order: "asc",
    include_total: true,
};

function sameParams(a: UnitListParams, b: UnitListParams): boolean {
    return (
        a.page === b.page &&
        a.limit === b.limit &&
        a.search === b.search &&
        a.include_inactive === b.include_inactive &&
        a.sort_by === b.sort_by &&
        a.sort_order === b.sort_order
    );
}

export default function UnitsTab() {
    const [params, setParams] = useState<UnitListParams>(INITIAL_PARAMS);
    const { data, isLoading, isFetching, isError, refetch } = useUnits(params);
    const rows: Unit[] = data?.units ?? [];

    const createMutation = useCreateUnit();
    const updateMutation = useUpdateUnit();
    const archiveMutation = useArchiveUnit();
    const { confirm, confirmationPopup } = useConfirmationPopup();

    const [editing, setEditing] = useState<Unit | null>(null);
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

    const beginEdit = (unit: Unit) => {
        setAdding(false);
        setEditing(unit);
        setDraft({ code: unit.code, name: unit.name, precision: String(unit.precision) });
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
        const precision = Number(draft.precision) as UnitPrecision;
        const problems: Record<string, string> = {};
        if (!editing) {
            if (!code) problems.code = "Kode wajib diisi";
            else if (!UNIT_CODE_PATTERN.test(code)) problems.code = "Huruf, angka, _ . - ; maksimal 16 karakter";
        }
        if (!name) problems.name = "Nama wajib diisi";
        else if (name.length > 32) problems.name = "Maksimal 32 karakter";
        if (Object.keys(problems).length > 0) {
            setFieldErrors(problems);
            return;
        }
        try {
            if (editing) {
                const patch: UnitUpdate = {};
                if (name !== editing.name) patch.name = name;
                if (precision !== editing.precision) patch.precision = precision;
                if (Object.keys(patch).length === 0) {
                    notify.info("Tidak ada perubahan");
                    resetForm();
                    return;
                }
                await updateMutation.mutateAsync({ id: editing.id, data: patch });
                notify.success("Satuan diubah", {
                    description:
                        patch.precision !== undefined && patch.precision < editing.precision
                            ? "Presisi yang lebih rendah hanya berlaku untuk baris quotation baru."
                            : undefined,
                });
            } else {
                await createMutation.mutateAsync({ code, name, precision });
                notify.success("Satuan ditambahkan");
            }
            resetForm();
            bump();
        } catch (error: any) {
            handleServerError(error, "Gagal menyimpan");
        }
    };

    const handleArchive = (unit: Unit) => {
        confirm({
            variant: "warning",
            title: "Arsipkan satuan",
            description: `${unit.product_count ?? 0} produk memakai satuan ini; mengarsipkan hanya menyembunyikannya dari pilihan baru. Baris quotation yang ada tidak berubah.`,
            confirmText: "Arsipkan",
            cancelText: "Batal",
            onConfirm: async () => {
                try {
                    await archiveMutation.mutateAsync(unit.id);
                    notify.success("Satuan diarsipkan");
                    bump();
                } catch (error: any) {
                    notify.error("Gagal mengarsipkan", { description: error?.message });
                }
            },
        });
    };

    const handleRestore = async (unit: Unit) => {
        try {
            await updateMutation.mutateAsync({ id: unit.id, data: { is_active: true } });
            notify.success("Satuan dipulihkan");
            bump();
        } catch (error: any) {
            notify.error("Gagal memulihkan", { description: error?.message });
        }
    };

    const handleStateChange = useCallback((state: SuperTableState) => {
        const page = state.pagination.pageIndex + 1;
        const sort = state.sorting?.[0];
        setParams((prev) => {
            const next: UnitListParams = {
                page,
                limit: state.pagination.pageSize,
                search: state.globalFilter || "",
                include_inactive: Boolean(state.filters?.include_inactive),
                sort_by: sort?.id as UnitSortBy | undefined,
                sort_order: sort ? (sort.desc ? "desc" : "asc") : "asc",
                include_total: page === 1,
            };
            return sameParams(prev, next) ? prev : next;
        });
    }, []);

    const columns = useMemo<MRT_ColumnDef<Unit>[]>(
        () => [
            {
                accessorKey: "code",
                header: "Kode",
                size: 140,
                Cell: ({ cell }) => <span className="font-mono text-xs">{cell.getValue<string>()}</span>,
            },
            { accessorKey: "name", header: "Nama", size: 220 },
            {
                accessorKey: "precision",
                header: "Presisi",
                size: 150,
                Cell: ({ cell }) => PRECISION_LABELS[cell.getValue<number>()] ?? String(cell.getValue<number>()),
            },
            {
                id: "product_count",
                accessorFn: (row) => row.product_count ?? 0,
                header: "Produk",
                size: 100,
                enableSorting: false,
            },
            {
                id: "is_active",
                accessorFn: (row) => (row.is_active ? "Aktif" : "Diarsipkan"),
                header: "Status",
                size: 110,
                Cell: ({ row }) => (
                    <Chip
                        label={row.original.is_active ? "Aktif" : "Diarsipkan"}
                        color={row.original.is_active ? "success" : "default"}
                        size="small"
                    />
                ),
            },
        ],
        []
    );

    const editorRow = (
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-4 sm:flex-row sm:items-start">
            <div className="sm:w-40">
                <label className="mb-1 block text-xs font-medium">Kode</label>
                <AppInput
                    isBgWhite
                    value={draft.code}
                    disabled={!!editing}
                    onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                    placeholder="mis. kg"
                    inputProps={{ maxLength: 16 }}
                    error={!!fieldErrors.code}
                    helperText={fieldErrors.code}
                />
            </div>
            <div className="flex-1">
                <label className="mb-1 block text-xs font-medium">Nama</label>
                <AppInput
                    isBgWhite
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="mis. kilogram"
                    inputProps={{ maxLength: 32 }}
                    error={!!fieldErrors.name}
                    helperText={fieldErrors.name ?? "Nama ini tercetak di baris quotation"}
                />
            </div>
            <div className="sm:w-64">
                <label className="mb-1 block text-xs font-medium">Presisi jumlah</label>
                <AppSelect
                    isBgWhite
                    fullWidth
                    value={draft.precision}
                    options={PRECISION_OPTIONS}
                    onChange={(e) => setDraft({ ...draft, precision: String(e.target.value) })}
                    error={!!fieldErrors.precision}
                    helperText={fieldErrors.precision}
                />
            </div>
            <div className="flex gap-2 sm:pt-5">
                <AppButton onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
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
                <p className="font-medium">Presisi menentukan berapa desimal yang boleh dipakai jumlah di quotation.</p>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-muted-foreground">
                    <li>Satuan bilangan bulat (pcs, unit) menolak 1,5; satuan 2 desimal (kg, m3) menerimanya.</li>
                    <li>Menurunkan presisi hanya berlaku untuk baris quotation baru; baris yang tersimpan tidak berubah.</li>
                    <li>Mengarsipkan menyembunyikan satuan dari pilihan baru; produk dan baris quotation yang ada tetap utuh.</li>
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
                        Tambah satuan
                    </AppButton>
                )}
            </div>

            {(adding || editing) && editorRow}

            <SuperTable<Unit>
                tableId="units-table"
                urlKey=""
                entityLabel="satuan"
                searchPlaceholder="Cari nama atau kode satuan"
                columns={columns}
                data={rows}
                getRowId={(row) => row.id}
                isLoading={isLoading}
                isFetching={isFetching}
                isError={isError}
                errorMessage="Failed to load units. Please try again."
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
                        id: "archive",
                        label: "Arsipkan",
                        icon: <Archive size={16} />,
                        destructive: true,
                        hidden: (row) => !row.is_active,
                        onClick: (row) => handleArchive(row),
                    },
                    {
                        id: "restore",
                        label: "Pulihkan",
                        icon: <RotateCcw size={16} />,
                        hidden: (row) => row.is_active,
                        onClick: (row) => handleRestore(row),
                    },
                ]}
                renderEmptyState={({ hasActiveFilters, hasSearch }) => (
                    <EmptyState
                        icon={Ruler}
                        title={hasActiveFilters || hasSearch ? "No units match" : "No units yet"}
                        description="Units set how many decimals a quotation quantity may carry for the products sold in them."
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
