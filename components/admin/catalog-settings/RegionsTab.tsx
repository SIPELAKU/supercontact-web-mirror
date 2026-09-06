"use client";

// components/admin/catalog-settings/RegionsTab.tsx
//
// Regions (Phase 3, spec I2): the `ProductCategoriesTab.tsx` manager - a paged
// flat list plus a separate full-tree query feeding the parent picker and the
// parent filter - with the two importers on the toolbar.
//
// Two rules the screen must state rather than merely obey:
//   * the CRM importer NEVER invents a region. It matches text on the saved
//     companies against regions THIS TENANT has, so the dry-run report's
//     unmatched list (with its row counts) is the instruction for what to add
//     next (spec A19, E6.3).
//   * only the province tier ships as reference data - 1 country + 38
//     provinces with ISO 3166-2:ID codes. Kabupaten and kecamatan matching
//     works, against regions the tenant creates (spec K4, owner review L(c)).

import { useCallback, useMemo, useState } from "react";
import { Chip } from "@mui/material";
import { Archive, Download, Map, Pencil, Plus, RotateCcw, Save, Wand2, X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppDialog } from "@/components/ui/app-dialog";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { SuperTable, type MRT_ColumnDef, type SuperTableState } from "@/components/ui/super-table";
import { notify } from "@/lib/notifications";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import {
    useArchiveRegion,
    useCreateRegion,
    useImportReferenceRegions,
    useImportRegionsFromCrm,
    useRegionTree,
    useRegions,
    useUpdateRegion,
} from "@/lib/hooks/useCommercialContext";
import { descendantIds, findNode, flattenTree, subtreeHeight } from "@/lib/utils/categoryTree";
import {
    COMMERCIAL_CODE_PATTERN,
    CRM_IMPORT_LEVELS,
    MAX_REGION_DEPTH_INDEX,
    REGION_CODE_MAX_LENGTH,
    REGION_LEVEL_LABELS,
    REGION_LEVEL_OPTIONS,
    REGION_NAME_MAX_LENGTH,
} from "@/lib/constants/commercial-context";
import type {
    Region,
    RegionCrmImportResponse,
    RegionLevel,
    RegionListParams,
    RegionSortBy,
    RegionUpdate,
} from "@/lib/types/CommercialContext";

interface Draft {
    code: string;
    name: string;
    level: RegionLevel;
    parentId: string;
}

const EMPTY_DRAFT: Draft = { code: "", name: "", level: "province", parentId: "" };

// `limit` MUST equal the table's batch size (25) - the SuperTable README rule.
const INITIAL_PARAMS: RegionListParams = {
    page: 1,
    limit: 25,
    search: "",
    include_inactive: false,
    sort_by: "name",
    sort_order: "asc",
    include_total: true,
};

function sameParams(a: RegionListParams, b: RegionListParams): boolean {
    return (
        a.page === b.page &&
        a.limit === b.limit &&
        a.search === b.search &&
        a.include_inactive === b.include_inactive &&
        a.level === b.level &&
        a.parent_id === b.parent_id &&
        a.sort_by === b.sort_by &&
        a.sort_order === b.sort_order
    );
}

export default function RegionsTab() {
    const [params, setParams] = useState<RegionListParams>(INITIAL_PARAMS);
    const { data, isLoading, isFetching, isError, refetch } = useRegions(params);
    const { data: tree } = useRegionTree();
    const rows: Region[] = data?.items ?? [];
    const flat = useMemo(() => flattenTree(tree ?? []), [tree]);

    const createMutation = useCreateRegion();
    const updateMutation = useUpdateRegion();
    const archiveMutation = useArchiveRegion();
    const referenceImport = useImportReferenceRegions();
    const crmImport = useImportRegionsFromCrm();
    const { confirm, confirmationPopup } = useConfirmationPopup();

    const [editing, setEditing] = useState<Region | null>(null);
    const [adding, setAdding] = useState(false);
    const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    // Bumped after every mutation so the lazy list restarts from batch 1.
    const [mutationSeq, setMutationSeq] = useState(0);
    const bump = () => setMutationSeq((s) => s + 1);

    // The dry-run report a user confirms against; null while the dialog is shut.
    const [crmReport, setCrmReport] = useState<RegionCrmImportResponse | null>(null);

    const resetForm = () => {
        setEditing(null);
        setAdding(false);
        setDraft(EMPTY_DRAFT);
        setFieldErrors({});
    };

    const beginEdit = (row: Region) => {
        setAdding(false);
        setEditing(row);
        setDraft({
            code: row.code,
            name: row.name,
            level: row.level,
            parentId: row.parent_id ?? "",
        });
        setFieldErrors({});
    };

    // Parent picker: the active tree minus the node itself and its subtree (a
    // cycle), with every node that cannot take THIS node's subtree without
    // breaking the five-level cap disabled and labelled with the reason.
    const parentOptions = useMemo(() => {
        const excluded = new Set(editing ? [editing.id, ...descendantIds(tree ?? [], editing.id)] : []);
        const height = editing ? subtreeHeight(tree ?? [], editing.id) : 0;
        const options: { value: string; label: string; disabled?: boolean }[] = [
            { value: "", label: "Tanpa induk (tingkat teratas)" },
        ];
        for (const node of flat) {
            if (excluded.has(node.id)) continue;
            const tooDeep = node.depth + 1 + height > MAX_REGION_DEPTH_INDEX;
            options.push({
                value: node.id,
                label: tooDeep ? `${node.label} — Maksimal 5 tingkat` : node.label,
                disabled: tooDeep,
            });
        }
        // An archived parent still assigned on edit stays visible-as-is.
        if (editing?.parent_id && !flat.some((node) => node.id === editing.parent_id)) {
            options.push({ value: editing.parent_id, label: "Induk tidak aktif", disabled: true });
        }
        return options;
    }, [flat, tree, editing]);

    const parentFilterOptions = useMemo(
        () => flat.map((node) => ({ value: node.id, label: node.label })),
        [flat]
    );

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
            else if (!COMMERCIAL_CODE_PATTERN.test(code))
                problems.code = `Huruf, angka, _ . - ; maksimal ${REGION_CODE_MAX_LENGTH} karakter`;
        }
        if (!name) problems.name = "Nama wajib diisi";
        else if (name.length > REGION_NAME_MAX_LENGTH)
            problems.name = `Maksimal ${REGION_NAME_MAX_LENGTH} karakter`;
        if (Object.keys(problems).length > 0) {
            setFieldErrors(problems);
            return;
        }
        const parentId = draft.parentId || null;
        try {
            if (editing) {
                const patch: RegionUpdate = {};
                if (name !== editing.name) patch.name = name;
                if (draft.level !== editing.level) patch.level = draft.level;
                // `parent_id: null` moves the node to the root.
                if (parentId !== (editing.parent_id ?? null)) patch.parent_id = parentId;
                if (Object.keys(patch).length === 0) {
                    notify.info("Tidak ada perubahan");
                    resetForm();
                    return;
                }
                await updateMutation.mutateAsync({ id: editing.id, data: patch });
                notify.success("Wilayah diubah");
            } else {
                await createMutation.mutateAsync({
                    code,
                    name,
                    level: draft.level,
                    parent_id: parentId,
                });
                notify.success("Wilayah ditambahkan");
            }
            resetForm();
            bump();
        } catch (error: any) {
            handleServerError(error, "Gagal menyimpan");
        }
    };

    const handleArchive = (row: Region) => {
        confirm({
            variant: "warning",
            title: "Arsipkan wilayah",
            description: `Arsipkan "${row.name}"? Kontak dan perusahaan yang memakainya tetap menyimpannya; wilayah hanya disembunyikan dari pilihan baru dan tidak lagi ikut menentukan harga.`,
            confirmText: "Arsipkan",
            cancelText: "Batal",
            onConfirm: async () => {
                try {
                    await archiveMutation.mutateAsync(row.id);
                    notify.success("Wilayah diarsipkan");
                    bump();
                } catch (error: any) {
                    notify.error("Gagal mengarsipkan", { description: error?.message });
                }
            },
        });
    };

    const handleRestore = async (row: Region) => {
        try {
            await updateMutation.mutateAsync({ id: row.id, data: { status: "active" } });
            notify.success("Wilayah diaktifkan kembali");
            bump();
        } catch (error: any) {
            notify.error("Gagal mengaktifkan", { description: error?.message });
        }
    };

    /** Idempotent BY CODE: a second run creates nothing (`created: 0`). */
    const handleReferenceImport = async () => {
        try {
            const result = await referenceImport.mutateAsync();
            notify.success(
                result.created > 0
                    ? `${result.created} wilayah referensi ditambahkan`
                    : "Semua wilayah referensi sudah ada",
                {
                    description:
                        result.skipped > 0
                            ? `${result.skipped} sudah ada dan dilewati - impor ini aman diulang.`
                            : "1 negara dan 38 provinsi dengan kode ISO 3166-2:ID.",
                }
            );
            bump();
        } catch (error: any) {
            notify.error("Gagal mengimpor wilayah referensi", { description: error?.message });
        }
    };

    /** ALWAYS a dry run first: the report is what the user confirms against. */
    const handleCrmPreview = async () => {
        try {
            const report = await crmImport.mutateAsync({
                levels: [...CRM_IMPORT_LEVELS],
                dry_run: true,
            });
            setCrmReport(report);
        } catch (error: any) {
            notify.error("Gagal membaca data perusahaan", { description: error?.message });
        }
    };

    const handleCrmConfirm = async () => {
        try {
            const result = await crmImport.mutateAsync({
                levels: [...CRM_IMPORT_LEVELS],
                dry_run: false,
            });
            setCrmReport(null);
            notify.success(`${result.updated} perusahaan dicocokkan ke wilayah`, {
                description:
                    result.unmatched.length > 0
                        ? `${result.unmatched.length} nilai belum punya wilayah yang cocok - tambahkan wilayahnya lalu jalankan lagi.`
                        : "Semua nilai geografi yang terisi berhasil dicocokkan.",
            });
            bump();
        } catch (error: any) {
            notify.error("Gagal mencocokkan wilayah", { description: error?.message });
        }
    };

    const handleStateChange = useCallback((state: SuperTableState) => {
        const page = state.pagination.pageIndex + 1;
        const sort = state.sorting?.[0];
        const parent = state.filters?.parent_id;
        const level = state.filters?.level;
        setParams((prev) => {
            const next: RegionListParams = {
                page,
                limit: state.pagination.pageSize,
                search: state.globalFilter || "",
                include_inactive: Boolean(state.filters?.include_inactive),
                level: typeof level === "string" && level ? (level as RegionLevel) : undefined,
                parent_id: typeof parent === "string" && parent ? parent : undefined,
                sort_by: (sort?.id as RegionSortBy) ?? "name",
                sort_order: sort ? (sort.desc ? "desc" : "asc") : "asc",
                include_total: page === 1,
            };
            return sameParams(prev, next) ? prev : next;
        });
    }, []);

    const columns = useMemo<MRT_ColumnDef<Region>[]>(
        () => [
            { accessorKey: "name", header: "Nama", size: 220 },
            {
                // The flat list does not indent (branches interleave under
                // OFFSET/LIMIT); the path says where a row sits.
                accessorKey: "path",
                header: "Jalur",
                size: 300,
                enableSorting: false,
                Cell: ({ cell }) => <span className="text-gray-600">{cell.getValue<string>()}</span>,
            },
            {
                accessorKey: "code",
                header: "Kode",
                size: 130,
                Cell: ({ cell }) => <span className="font-mono text-xs">{cell.getValue<string>()}</span>,
            },
            {
                id: "level",
                accessorFn: (row) => REGION_LEVEL_LABELS[row.level] ?? row.level,
                header: "Tingkat",
                size: 150,
            },
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
                        placeholder="mis. ID-JB"
                        inputProps={{ maxLength: REGION_CODE_MAX_LENGTH }}
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
                        placeholder="mis. Jawa Barat"
                        inputProps={{ maxLength: REGION_NAME_MAX_LENGTH }}
                        error={!!fieldErrors.name}
                        helperText={
                            fieldErrors.name ??
                            "Ditulis sama persis dengan teks di data perusahaan agar bisa dicocokkan"
                        }
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium">Tingkat</label>
                    <AppSelect
                        isBgWhite
                        fullWidth
                        value={draft.level}
                        options={REGION_LEVEL_OPTIONS}
                        onChange={(e) => setDraft({ ...draft, level: e.target.value as RegionLevel })}
                        error={!!fieldErrors.level}
                        helperText={fieldErrors.level}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium">Induk</label>
                    <AppSelect
                        isBgWhite
                        fullWidth
                        value={draft.parentId}
                        options={parentOptions}
                        onChange={(e) => setDraft({ ...draft, parentId: e.target.value as string })}
                        error={!!fieldErrors.parent_id}
                        helperText={fieldErrors.parent_id}
                    />
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
                    Wilayah disusun sebagai pohon sampai lima tingkat, dan merupakan salah satu tingkat
                    penentuan harga.
                </p>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-muted-foreground">
                    <li>
                        Harga yang ditetapkan ke satu wilayah juga berlaku untuk wilayah di bawahnya: wilayah
                        kontak dipakai lebih dulu, lalu wilayah induknya.
                    </li>
                    <li>
                        <strong>Impor wilayah Indonesia</strong> memasang 1 negara dan 38 provinsi berkode ISO
                        3166-2:ID. Kabupaten dan kecamatan tidak ikut - buat sendiri sesuai kebutuhan.
                    </li>
                    <li>
                        <strong>Cocokkan dari data perusahaan</strong> membaca teks lokasi, kabupaten dan
                        kecamatan pada perusahaan CRM lalu mengisi wilayahnya.{" "}
                        <strong>Pencocokan tidak pernah membuat wilayah baru</strong>; nilai yang tidak cocok
                        dilaporkan beserta jumlah barisnya.
                    </li>
                    <li>Kode tidak bisa diubah setelah dibuat.</li>
                </ul>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
                <AppButton
                    variantStyle="outline"
                    onClick={handleReferenceImport}
                    disabled={referenceImport.isPending}
                    isLoading={referenceImport.isPending}
                >
                    <Download className="mr-1.5 h-4 w-4" />
                    Impor wilayah Indonesia
                </AppButton>
                <AppButton
                    variantStyle="outline"
                    onClick={handleCrmPreview}
                    disabled={crmImport.isPending}
                    isLoading={crmImport.isPending && crmReport === null}
                >
                    <Wand2 className="mr-1.5 h-4 w-4" />
                    Cocokkan dari data perusahaan
                </AppButton>
                {!adding && !editing && (
                    <AppButton
                        onClick={() => {
                            setAdding(true);
                            setDraft(EMPTY_DRAFT);
                            setFieldErrors({});
                        }}
                    >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Tambah wilayah
                    </AppButton>
                )}
            </div>

            {(adding || editing) && editorRow}

            <SuperTable<Region>
                tableId="regions-table"
                urlKey=""
                entityLabel="wilayah"
                searchPlaceholder="Cari nama atau kode wilayah"
                columns={columns}
                data={rows}
                getRowId={(row) => row.id}
                isLoading={isLoading}
                isFetching={isFetching}
                isError={isError}
                errorMessage="Failed to load regions. Please try again."
                onRetry={() => refetch()}
                rowCount={typeof data?.total === "number" ? data.total : undefined}
                manualPagination
                manualFiltering
                manualSorting
                onStateChange={handleStateChange}
                resetPageKey={mutationSeq}
                filters={[
                    { id: "include_inactive", label: "Tampilkan yang diarsipkan", type: "boolean" },
                    {
                        id: "level",
                        label: "Tingkat",
                        type: "select",
                        options: REGION_LEVEL_OPTIONS,
                        anyLabel: "Semua tingkat",
                    },
                    {
                        id: "parent_id",
                        label: "Induk",
                        type: "select",
                        options: parentFilterOptions,
                        anyLabel: "Semua induk",
                    },
                ]}
                rowActions={[
                    {
                        id: "edit",
                        label: "Ubah",
                        icon: <Pencil size={16} />,
                        onClick: (row) => beginEdit(row),
                    },
                    {
                        id: "restore",
                        label: "Aktifkan kembali",
                        icon: <RotateCcw size={16} />,
                        hidden: (row) => row.status === "active",
                        // The tree holds every ACTIVE node, so a parent missing
                        // from it is archived.
                        disabled: (row) =>
                            row.parent_id && !findNode(tree ?? [], row.parent_id)
                                ? "Induk wilayah ini masih diarsipkan"
                                : false,
                        onClick: (row) => handleRestore(row),
                    },
                    {
                        id: "archive",
                        label: "Arsipkan",
                        icon: <Archive size={16} />,
                        destructive: true,
                        hidden: (row) => row.status !== "active",
                        onClick: (row) => handleArchive(row),
                    },
                ]}
                renderEmptyState={({ hasActiveFilters, hasSearch }) => (
                    <EmptyState
                        icon={Map}
                        title={hasActiveFilters || hasSearch ? "No regions match" : "No regions yet"}
                        description="Import the Indonesian provinces to get started, then match your saved companies against them."
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

            {/* The dry-run report. The server computed these numbers with the
                SAME code the real run uses, so what is confirmed here is what
                happens - the bulk-price dialog's contract. */}
            <AppDialog
                open={crmReport !== null}
                onClose={() => setCrmReport(null)}
                title="Cocokkan wilayah dari data perusahaan"
                description="Pratinjau: belum ada yang disimpan."
                maxWidth="sm"
                actions={
                    <>
                        <AppButton variantStyle="outline" onClick={() => setCrmReport(null)}>
                            Batal
                        </AppButton>
                        <AppButton
                            onClick={handleCrmConfirm}
                            disabled={crmImport.isPending || (crmReport?.updated ?? 0) === 0}
                            isLoading={crmImport.isPending}
                        >
                            Terapkan
                        </AppButton>
                    </>
                }
            >
                {crmImport.isPending && crmReport === null ? (
                    <div className="flex items-center justify-center py-8">
                        <Spinner />
                    </div>
                ) : (
                    crmReport && (
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="rounded-lg border bg-muted/40 p-3">
                                    <p className="text-lg font-semibold">{crmReport.matched}</p>
                                    <p className="text-xs text-muted-foreground">Nilai cocok</p>
                                </div>
                                <div className="rounded-lg border bg-muted/40 p-3">
                                    <p className="text-lg font-semibold">{crmReport.updated}</p>
                                    <p className="text-xs text-muted-foreground">Perusahaan akan diisi</p>
                                </div>
                                <div className="rounded-lg border bg-muted/40 p-3">
                                    <p className="text-lg font-semibold">{crmReport.skipped}</p>
                                    <p className="text-xs text-muted-foreground">Dilewati</p>
                                </div>
                            </div>

                            {crmReport.updated === 0 && (
                                <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                                    Tidak ada perusahaan yang bisa diisi. Jalankan &quot;Impor wilayah
                                    Indonesia&quot; dulu, atau tambahkan wilayah yang namanya sama dengan
                                    nilai di bawah.
                                </p>
                            )}

                            <div>
                                <p className="mb-1.5 text-xs font-medium">
                                    Nilai yang belum punya wilayah ({crmReport.unmatched.length})
                                </p>
                                {crmReport.unmatched.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">
                                        Semua nilai geografi yang terisi punya wilayah yang cocok.
                                    </p>
                                ) : (
                                    <>
                                        <p className="mb-2 text-xs text-muted-foreground">
                                            Pencocokan tidak pernah membuat wilayah baru. Tambahkan wilayah
                                            dengan nama ini lalu jalankan lagi.
                                        </p>
                                        <div className="max-h-56 overflow-y-auto rounded-lg border">
                                            <table className="w-full text-xs">
                                                <thead className="bg-muted/40 text-left">
                                                    <tr>
                                                        <th className="px-3 py-2 font-medium">Nilai</th>
                                                        <th className="px-3 py-2 font-medium">Tingkat</th>
                                                        <th className="px-3 py-2 text-right font-medium">
                                                            Baris
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {crmReport.unmatched.map((entry) => (
                                                        <tr
                                                            key={`${entry.level}:${entry.value}`}
                                                            className="border-t"
                                                        >
                                                            <td className="px-3 py-1.5">{entry.value}</td>
                                                            <td className="px-3 py-1.5 text-muted-foreground">
                                                                {REGION_LEVEL_LABELS[
                                                                    entry.level as RegionLevel
                                                                ] ?? entry.level}
                                                            </td>
                                                            <td className="px-3 py-1.5 text-right">
                                                                {entry.count}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )
                )}
            </AppDialog>
        </div>
    );
}
