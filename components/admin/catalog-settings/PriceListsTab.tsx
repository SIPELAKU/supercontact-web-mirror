"use client";

import { useCallback, useMemo, useState } from "react";
import { Chip } from "@mui/material";
import { Archive, ListOrdered, Pencil, Plus, RotateCcw, Save, Star, X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { Switch } from "@/components/ui/switch";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { SuperTable, type MRT_ColumnDef, type SuperTableState } from "@/components/ui/super-table";
import { notify } from "@/lib/notifications";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import {
    useArchivePriceList,
    useCreatePriceList,
    usePriceLists,
    useUpdatePriceList,
} from "@/lib/hooks/usePriceLists";
import { PRICE_LIST_STATUS_OPTIONS, ROUNDING_OPTIONS } from "@/lib/constants/price-list";
import { formatValidityRange } from "@/lib/utils/priceGrid";
import {
    PRICE_LIST_CODE_MAX_LENGTH,
    PRICE_LIST_CODE_PATTERN,
    PRICE_LIST_NAME_MAX_LENGTH,
    type PriceList,
    type PriceListCreate,
    type PriceListListParams,
    type PriceListRounding,
    type PriceListSortBy,
    type PriceListStatus,
    type PriceListUpdate,
} from "@/lib/types/PriceList";

interface Draft {
    code: string;
    name: string;
    priority: string;
    rounding: PriceListRounding;
    markupPercent: string;
    isDefault: boolean;
    allowManualOverride: boolean;
    validFrom: string;
    validUntil: string;
}

const EMPTY_DRAFT: Draft = {
    code: "",
    name: "",
    priority: "0",
    rounding: "none",
    markupPercent: "",
    isDefault: false,
    allowManualOverride: false,
    validFrom: "",
    validUntil: "",
};

const INITIAL_PARAMS: PriceListListParams = {
    page: 1,
    limit: 25,
    search: "",
    sort_by: "priority",
    sort_order: "desc",
    include_total: true,
};

function sameParams(a: PriceListListParams, b: PriceListListParams): boolean {
    return (
        a.page === b.page &&
        a.limit === b.limit &&
        a.search === b.search &&
        a.status === b.status &&
        a.is_default === b.is_default &&
        a.sort_by === b.sort_by &&
        a.sort_order === b.sort_order
    );
}

/** `""` -> undefined, so an untouched optional field is simply not sent. */
function optionalDate(value: string): string | undefined {
    return value.trim() === "" ? undefined : value.trim();
}

export default function PriceListsTab() {
    const [params, setParams] = useState<PriceListListParams>(INITIAL_PARAMS);
    const { data, isLoading, isFetching, isError, refetch } = usePriceLists(params);
    const rows: PriceList[] = data?.price_lists ?? [];

    const createMutation = useCreatePriceList();
    const updateMutation = useUpdatePriceList();
    const archiveMutation = useArchivePriceList();
    const { confirm, confirmationPopup } = useConfirmationPopup();

    const [editing, setEditing] = useState<PriceList | null>(null);
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

    const beginEdit = (row: PriceList) => {
        setAdding(false);
        setEditing(row);
        setDraft({
            code: row.code,
            name: row.name,
            priority: String(row.priority ?? 0),
            rounding: row.rounding,
            markupPercent: row.markup_percent ?? "",
            isDefault: row.is_default,
            allowManualOverride: row.allow_manual_override,
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
        const code = draft.code.trim();
        const name = draft.name.trim();
        const problems: Record<string, string> = {};
        if (!editing) {
            if (!code) problems.code = "Kode wajib diisi";
            else if (!PRICE_LIST_CODE_PATTERN.test(code))
                problems.code = `Huruf, angka, _ . - ; maksimal ${PRICE_LIST_CODE_MAX_LENGTH} karakter`;
        }
        if (!name) problems.name = "Nama wajib diisi";
        else if (name.length > PRICE_LIST_NAME_MAX_LENGTH)
            problems.name = `Maksimal ${PRICE_LIST_NAME_MAX_LENGTH} karakter`;
        if (draft.markupPercent.trim() !== "" && Number(draft.markupPercent) < 0)
            problems.markup_percent = "Markup tidak boleh negatif";
        if (draft.validFrom && draft.validUntil && draft.validUntil < draft.validFrom)
            problems.valid_until = "Tanggal berakhir harus setelah tanggal mulai";
        if (Object.keys(problems).length > 0) {
            setFieldErrors(problems);
            return;
        }

        const priority = Number(draft.priority) || 0;
        const markup = draft.markupPercent.trim() === "" ? null : Number(draft.markupPercent);

        try {
            if (editing) {
                const patch: PriceListUpdate = {};
                if (name !== editing.name) patch.name = name;
                if (priority !== editing.priority) patch.priority = priority;
                if (draft.rounding !== editing.rounding) patch.rounding = draft.rounding;
                if ((markup === null ? null : String(markup)) !== (editing.markup_percent === null ? null : String(Number(editing.markup_percent))))
                    patch.markup_percent = markup;
                if (draft.isDefault !== editing.is_default) patch.is_default = draft.isDefault;
                if (draft.allowManualOverride !== editing.allow_manual_override)
                    patch.allow_manual_override = draft.allowManualOverride;
                if ((draft.validFrom || null) !== (editing.valid_from ?? null))
                    patch.valid_from = draft.validFrom || null;
                if ((draft.validUntil || null) !== (editing.valid_until ?? null))
                    patch.valid_until = draft.validUntil || null;
                if (Object.keys(patch).length === 0) {
                    notify.info("Tidak ada perubahan");
                    resetForm();
                    return;
                }
                await updateMutation.mutateAsync({ id: editing.id, data: patch });
                notify.success("Daftar harga diubah");
            } else {
                const payload: PriceListCreate = {
                    code,
                    name,
                    priority,
                    is_default: draft.isDefault,
                    allow_manual_override: draft.allowManualOverride,
                    markup_percent: markup,
                    rounding: draft.rounding,
                    valid_from: optionalDate(draft.validFrom),
                    valid_until: optionalDate(draft.validUntil),
                };
                await createMutation.mutateAsync(payload);
                notify.success("Daftar harga dibuat", {
                    description: "Belum ada harga produk di dalamnya - tambahkan dari halaman detail.",
                });
            }
            resetForm();
            bump();
        } catch (error: any) {
            handleServerError(error, "Gagal menyimpan");
        }
    };

    const handleMakeDefault = async (row: PriceList) => {
        try {
            await updateMutation.mutateAsync({ id: row.id, data: { is_default: true } });
            notify.success("Daftar harga bawaan diubah", {
                description: `"${row.name}" kini dipakai untuk pelanggan tanpa penetapan khusus.`,
            });
            bump();
        } catch (error: any) {
            notify.error("Gagal menjadikan bawaan", { description: error?.message });
        }
    };

    const handleArchive = (row: PriceList) => {
        confirm({
            variant: "warning",
            title: "Arsipkan daftar harga",
            description: `"${row.name}" tidak akan dipakai lagi saat harga quotation dihitung. Baris harga di dalamnya tetap tersimpan sebagai riwayat, dan quotation yang sudah ada tidak berubah.`,
            confirmText: "Arsipkan",
            cancelText: "Batal",
            onConfirm: async () => {
                try {
                    await archiveMutation.mutateAsync(row.id);
                    notify.success("Daftar harga diarsipkan");
                    bump();
                } catch (error: any) {
                    notify.error("Gagal mengarsipkan", { description: error?.message });
                }
            },
        });
    };

    const handleRestore = async (row: PriceList) => {
        try {
            await updateMutation.mutateAsync({ id: row.id, data: { status: "active" } });
            notify.success("Daftar harga diaktifkan kembali");
            bump();
        } catch (error: any) {
            notify.error("Gagal mengaktifkan", { description: error?.message });
        }
    };

    const handleStateChange = useCallback((state: SuperTableState) => {
        const page = state.pagination.pageIndex + 1;
        const sort = state.sorting?.[0];
        setParams((prev) => {
            const next: PriceListListParams = {
                page,
                limit: state.pagination.pageSize,
                search: state.globalFilter || "",
                status: (state.filters?.status as PriceListStatus) || undefined,
                // A boolean filter is `true` or absent; sending `false` would
                // mean "only the non-default lists", which no chip claims.
                is_default: state.filters?.is_default ? true : undefined,
                sort_by: (sort?.id as PriceListSortBy) ?? "priority",
                sort_order: sort ? (sort.desc ? "desc" : "asc") : "desc",
                include_total: page === 1,
            };
            return sameParams(prev, next) ? prev : next;
        });
    }, []);

    const columns = useMemo<MRT_ColumnDef<PriceList>[]>(
        () => [
            { accessorKey: "name", header: "Nama", size: 240 },
            {
                accessorKey: "code",
                header: "Kode",
                size: 140,
                Cell: ({ cell }) => <span className="font-mono text-xs">{cell.getValue<string>()}</span>,
            },
            {
                id: "status",
                accessorFn: (row) => (row.status === "active" ? "Aktif" : "Diarsipkan"),
                header: "Status",
                size: 120,
                Cell: ({ row }) => (
                    <Chip
                        label={row.original.status === "active" ? "Aktif" : "Diarsipkan"}
                        color={row.original.status === "active" ? "success" : "default"}
                        size="small"
                    />
                ),
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
            { accessorKey: "priority", header: "Prioritas", size: 110 },
            {
                id: "allow_manual_override",
                accessorFn: (row) => (row.allow_manual_override ? "Ya" : "Tidak"),
                header: "Harga manual",
                size: 130,
                enableSorting: false,
            },
            { accessorKey: "currency", header: "Mata uang", size: 110, enableSorting: false },
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
                id: "price_count",
                accessorFn: (row) => row.price_count ?? 0,
                header: "Harga",
                size: 100,
                enableSorting: false,
            },
            {
                id: "assignment_count",
                accessorFn: (row) => row.assignment_count ?? 0,
                header: "Pelanggan",
                size: 110,
                enableSorting: false,
            },
        ],
        []
    );

    const saving = createMutation.isPending || updateMutation.isPending;
    // An ARCHIVED list cannot become the company default: the server refuses
    // it (the mirror of "archive the default first"), because an archived
    // default is dropped from the resolution chain - every unassigned line
    // would fall to the catalogue price and no line could be overridden.
    // The row action "Jadikan bawaan" is already hidden for non-active rows;
    // this editor is the other way in.
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
                        inputProps={{ maxLength: PRICE_LIST_CODE_MAX_LENGTH }}
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
                        inputProps={{ maxLength: PRICE_LIST_NAME_MAX_LENGTH }}
                        error={!!fieldErrors.name}
                        helperText={fieldErrors.name ?? "Nama ini yang dibaca sales di baris quotation"}
                    />
                </div>
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
                    <label className="mb-1 block text-xs font-medium">Pembulatan</label>
                    <AppSelect
                        isBgWhite
                        fullWidth
                        value={draft.rounding}
                        options={ROUNDING_OPTIONS}
                        onChange={(e) => setDraft({ ...draft, rounding: e.target.value as PriceListRounding })}
                        error={!!fieldErrors.rounding}
                        helperText={fieldErrors.rounding}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium">Markup cost-plus (%)</label>
                    <AppInput
                        isBgWhite
                        type="number"
                        value={draft.markupPercent}
                        onChange={(e) => setDraft({ ...draft, markupPercent: e.target.value })}
                        placeholder="kosong = mati"
                        inputProps={{ min: 0, step: 0.01 }}
                        error={!!fieldErrors.markup_percent}
                        helperText={fieldErrors.markup_percent ?? "Dipakai hanya bila produk punya HPP"}
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
                <div className="flex flex-col justify-center gap-2">
                    <label className="flex items-center gap-2 text-xs font-medium">
                        <Switch
                            checked={draft.isDefault}
                            disabled={defaultLocked}
                            onCheckedChange={(checked) => setDraft({ ...draft, isDefault: checked })}
                        />
                        Jadikan daftar harga bawaan
                    </label>
                    {defaultLocked && (
                        <p className="text-[11px] text-gray-500">
                            Daftar harga yang diarsipkan tidak bisa dijadikan bawaan. Aktifkan
                            kembali dulu.
                        </p>
                    )}
                    <label className="flex items-center gap-2 text-xs font-medium">
                        <Switch
                            checked={draft.allowManualOverride}
                            onCheckedChange={(checked) => setDraft({ ...draft, allowManualOverride: checked })}
                        />
                        Izinkan harga manual di quotation
                    </label>
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
                    Urutan pemakaian: daftar harga milik kontak, lalu milik perusahaannya, lalu daftar harga bawaan.
                </p>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-muted-foreground">
                    <li>Prioritas lebih besar menang. Penetapan ke pelanggan mengalahkan prioritas daftar harga.</li>
                    <li>Kalau tidak ada yang cocok, harga katalog produk yang dipakai - dan baris quotation menulis &quot;Harga dasar&quot;.</li>
                    <li>Harga manual di quotation hanya bisa dipakai bila daftar harga yang menang mengizinkannya.</li>
                    <li>Mengarsipkan tidak menghapus apa pun: baris harga tetap tersimpan sebagai riwayat.</li>
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
                        Tambah daftar harga
                    </AppButton>
                )}
            </div>

            {(adding || editing) && editorRow}

            <SuperTable<PriceList>
                tableId="price-lists-table"
                urlKey=""
                entityLabel="daftar harga"
                searchPlaceholder="Cari nama atau kode daftar harga"
                columns={columns}
                data={rows}
                getRowId={(row) => row.id}
                isLoading={isLoading}
                isFetching={isFetching}
                isError={isError}
                errorMessage="Failed to load price lists. Please try again."
                onRetry={() => refetch()}
                rowCount={typeof data?.total === "number" ? data.total : undefined}
                manualPagination
                manualFiltering
                manualSorting
                onStateChange={handleStateChange}
                resetPageKey={mutationSeq}
                // A real anchor on the name: one tab stop per row, middle-click
                // and open-in-new-tab for free (SuperTable's primaryColumn rule).
                primaryColumn={{
                    accessorKey: "name",
                    href: (row) => `/settings/sales/price-lists/${row.id}`,
                }}
                filters={[
                    { id: "status", label: "Status", type: "select", options: PRICE_LIST_STATUS_OPTIONS },
                    { id: "is_default", label: "Bawaan", type: "boolean" },
                ]}
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
                        // Disabled WITH the reason: an archived default would
                        // remove both the fall-through anchor and the manual
                        // override permission in one click.
                        disabled: (row) =>
                            row.is_default ? "Daftar harga bawaan tidak bisa diarsipkan" : false,
                        onClick: (row) => handleArchive(row),
                    },
                ]}
                renderEmptyState={({ hasActiveFilters, hasSearch }) => (
                    <EmptyState
                        icon={ListOrdered}
                        title={hasActiveFilters || hasSearch ? "No price lists match" : "No price lists yet"}
                        description="A price list holds per-product prices, quantity tiers and validity windows, and is assigned to the customers it applies to."
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
