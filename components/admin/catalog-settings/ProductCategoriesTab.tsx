"use client";

import { useCallback, useMemo, useState } from "react";
import { Chip } from "@mui/material";
import { Archive, FolderTree, Pencil, Plus, RotateCcw, Save, X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { SuperTable, type MRT_ColumnDef, type SuperTableState } from "@/components/ui/super-table";
import { notify } from "@/lib/notifications";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import {
    useArchiveProductCategory,
    useCreateProductCategory,
    useProductCategories,
    useProductCategoryTree,
    useUpdateProductCategory,
} from "@/lib/hooks/useProductCategories";
import { descendantIds, findNode, flattenTree, subtreeHeight } from "@/lib/utils/categoryTree";
import type {
    ProductCategory,
    ProductCategoryListParams,
    ProductCategorySortBy,
    ProductCategoryUpdate,
} from "@/lib/types/ProductCategory";

/** Same rule as the API: letter or digit first, then letters/digits/_ . -, at most 32. */
const CATEGORY_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,31}$/;
/** root = depth 0; a node at depth 2 cannot have children. */
const MAX_DEPTH_INDEX = 2;

interface Draft {
    code: string;
    name: string;
    parentId: string;
    description: string;
    sortOrder: string;
}

const EMPTY_DRAFT: Draft = { code: "", name: "", parentId: "", description: "", sortOrder: "0" };

const INITIAL_PARAMS: ProductCategoryListParams = {
    page: 1,
    limit: 25,
    search: "",
    include_inactive: false,
    parent_id: undefined,
    sort_order: "asc",
    include_total: true,
};

function sameParams(a: ProductCategoryListParams, b: ProductCategoryListParams): boolean {
    return (
        a.page === b.page &&
        a.limit === b.limit &&
        a.search === b.search &&
        a.include_inactive === b.include_inactive &&
        a.parent_id === b.parent_id &&
        a.sort_by === b.sort_by &&
        a.sort_order === b.sort_order
    );
}

export default function ProductCategoriesTab() {
    const [params, setParams] = useState<ProductCategoryListParams>(INITIAL_PARAMS);
    const { data, isLoading, isFetching, isError, refetch } = useProductCategories(params);
    const { data: tree } = useProductCategoryTree();
    const rows: ProductCategory[] = data?.categories ?? [];
    const flat = useMemo(() => flattenTree(tree ?? []), [tree]);

    const createMutation = useCreateProductCategory();
    const updateMutation = useUpdateProductCategory();
    const archiveMutation = useArchiveProductCategory();
    const { confirm, confirmationPopup } = useConfirmationPopup();

    const [editing, setEditing] = useState<ProductCategory | null>(null);
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

    const beginEdit = (category: ProductCategory) => {
        setAdding(false);
        setEditing(category);
        setDraft({
            code: category.code,
            name: category.name,
            parentId: category.parent_id ?? "",
            description: category.description ?? "",
            sortOrder: String(category.sort_order),
        });
        setFieldErrors({});
    };

    // Parent picker: the active tree minus the node itself and its subtree
    // (a cycle), with every node that cannot take THIS node's subtree without
    // exceeding three levels disabled and labelled with the reason.
    const parentOptions = useMemo(() => {
        const excluded = new Set(editing ? [editing.id, ...descendantIds(tree ?? [], editing.id)] : []);
        const height = editing ? subtreeHeight(tree ?? [], editing.id) : 0;
        const options: { value: string; label: string; disabled?: boolean }[] = [
            { value: "", label: "Tanpa induk (tingkat teratas)" },
        ];
        for (const node of flat) {
            if (excluded.has(node.id)) continue;
            const tooDeep = node.depth + 1 + height > MAX_DEPTH_INDEX;
            options.push({
                value: node.id,
                label: tooDeep ? `${node.label} — Maksimal 3 tingkat` : node.label,
                disabled: tooDeep,
            });
        }
        // An archived parent still assigned on edit stays visible-as-is.
        if (editing?.parent_id && !flat.some((node) => node.id === editing.parent_id)) {
            options.push({ value: editing.parent_id, label: "Induk tidak aktif", disabled: true });
        }
        return options;
    }, [flat, tree, editing]);

    const parentFilterOptions = useMemo(() => flat.map((node) => ({ value: node.id, label: node.label })), [flat]);

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
            else if (!CATEGORY_CODE_PATTERN.test(code)) problems.code = "Huruf, angka, _ . - ; maksimal 32 karakter";
        }
        if (!name) problems.name = "Nama wajib diisi";
        else if (name.length > 100) problems.name = "Maksimal 100 karakter";
        if (!Number.isInteger(sortOrder)) problems.sort_order = "Harus bilangan bulat";
        if (Object.keys(problems).length > 0) {
            setFieldErrors(problems);
            return;
        }
        const description = draft.description.trim() === "" ? null : draft.description.trim();
        const parentId = draft.parentId || null;
        try {
            if (editing) {
                const patch: ProductCategoryUpdate = {};
                if (name !== editing.name) patch.name = name;
                if (description !== (editing.description ?? null)) patch.description = description;
                // `parent_id: null` moves the node to the root.
                if (parentId !== (editing.parent_id ?? null)) patch.parent_id = parentId;
                if (sortOrder !== editing.sort_order) patch.sort_order = sortOrder;
                if (Object.keys(patch).length === 0) {
                    notify.info("Tidak ada perubahan");
                    resetForm();
                    return;
                }
                await updateMutation.mutateAsync({ id: editing.id, data: patch });
                notify.success("Kategori diubah");
            } else {
                await createMutation.mutateAsync({ code, name, description, parent_id: parentId, sort_order: sortOrder });
                notify.success("Kategori ditambahkan");
            }
            resetForm();
            bump();
        } catch (error: any) {
            handleServerError(error, "Gagal menyimpan");
        }
    };

    const handleArchive = (category: ProductCategory) => {
        confirm({
            variant: "warning",
            title: "Arsipkan kategori",
            description: `Arsipkan "${category.name}"? Produk yang memakai kategori ini tetap menyimpannya; kategori hanya disembunyikan dari pilihan baru.`,
            confirmText: "Arsipkan",
            cancelText: "Batal",
            onConfirm: async () => {
                try {
                    await archiveMutation.mutateAsync(category.id);
                    notify.success("Kategori diarsipkan");
                    bump();
                } catch (error: any) {
                    notify.error("Gagal mengarsipkan", { description: error?.message });
                }
            },
        });
    };

    const handleRestore = async (category: ProductCategory) => {
        try {
            await updateMutation.mutateAsync({ id: category.id, data: { is_active: true } });
            notify.success("Kategori dipulihkan");
            bump();
        } catch (error: any) {
            notify.error("Gagal memulihkan", { description: error?.message });
        }
    };

    const handleStateChange = useCallback((state: SuperTableState) => {
        const page = state.pagination.pageIndex + 1;
        const sort = state.sorting?.[0];
        const parent = state.filters?.parent_id;
        setParams((prev) => {
            const next: ProductCategoryListParams = {
                page,
                limit: state.pagination.pageSize,
                search: state.globalFilter || "",
                include_inactive: Boolean(state.filters?.include_inactive),
                parent_id: typeof parent === "string" && parent ? parent : undefined,
                sort_by: sort?.id as ProductCategorySortBy | undefined,
                sort_order: sort ? (sort.desc ? "desc" : "asc") : "asc",
                include_total: page === 1,
            };
            return sameParams(prev, next) ? prev : next;
        });
    }, []);

    const columns = useMemo<MRT_ColumnDef<ProductCategory>[]>(
        () => [
            { accessorKey: "name", header: "Nama", size: 260 },
            {
                // The flat list does not indent (branches interleave under
                // OFFSET/LIMIT); the path says where a row sits.
                accessorKey: "path",
                header: "Jalur",
                size: 260,
                enableSorting: false,
                Cell: ({ cell }) => <span className="text-gray-600">{cell.getValue<string>()}</span>,
            },
            {
                accessorKey: "code",
                header: "Kode",
                size: 140,
                Cell: ({ cell }) => <span className="font-mono text-xs">{cell.getValue<string>()}</span>,
            },
            { accessorKey: "sort_order", header: "Urutan", size: 90 },
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
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <label className="mb-1 block text-xs font-medium">Kode</label>
                    <AppInput
                        isBgWhite
                        value={draft.code}
                        disabled={!!editing}
                        onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                        placeholder="mis. MINUMAN"
                        inputProps={{ maxLength: 32 }}
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
                        placeholder="mis. Minuman panas"
                        inputProps={{ maxLength: 100 }}
                        error={!!fieldErrors.name}
                        helperText={fieldErrors.name}
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
                <div>
                    <label className="mb-1 block text-xs font-medium">Urutan</label>
                    <AppInput
                        isBgWhite
                        type="number"
                        value={draft.sortOrder}
                        onChange={(e) => setDraft({ ...draft, sortOrder: e.target.value })}
                        inputProps={{ step: 1 }}
                        error={!!fieldErrors.sort_order}
                        helperText={fieldErrors.sort_order}
                    />
                </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium">Deskripsi</label>
                    <AppInput
                        isBgWhite
                        value={draft.description}
                        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                        placeholder="opsional"
                        error={!!fieldErrors.description}
                        helperText={fieldErrors.description}
                    />
                </div>
                <div className="flex gap-2">
                    <AppButton onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                        <Save className="mr-1.5 h-4 w-4" />
                        Simpan
                    </AppButton>
                    <AppButton variantStyle="outline" onClick={resetForm} aria-label="Batal">
                        <X className="h-4 w-4" />
                    </AppButton>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-4">
            {confirmationPopup}
            <div className="rounded-lg border-l-4 border-l-sky-500 bg-sky-50 p-4 text-sm dark:bg-sky-950/30">
                <p className="font-medium">Kategori disusun sebagai pohon sampai tiga tingkat.</p>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-muted-foreground">
                    <li>Filter produk pada satu kategori ikut menampilkan produk di sub-kategorinya.</li>
                    <li>Mengarsipkan menyembunyikan kategori (dan sub-kategorinya) dari pilihan baru; produk yang memakainya tetap menyimpannya.</li>
                    <li>Kode tidak bisa diubah setelah dibuat.</li>
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
                        Tambah kategori
                    </AppButton>
                )}
            </div>

            {(adding || editing) && editorRow}

            <SuperTable<ProductCategory>
                tableId="product-categories-table"
                urlKey=""
                entityLabel="kategori"
                searchPlaceholder="Cari nama atau kode kategori"
                columns={columns}
                data={rows}
                getRowId={(row) => row.id}
                isLoading={isLoading}
                isFetching={isFetching}
                isError={isError}
                errorMessage="Failed to load categories. Please try again."
                onRetry={() => refetch()}
                rowCount={typeof data?.total === "number" ? data.total : undefined}
                manualPagination
                manualFiltering
                manualSorting
                onStateChange={handleStateChange}
                resetPageKey={mutationSeq}
                filters={[
                    { id: "include_inactive", label: "Tampilkan yang diarsipkan", type: "boolean" },
                    { id: "parent_id", label: "Induk", type: "select", options: parentFilterOptions, anyLabel: "Semua induk" },
                ]}
                // One statement: edit always; archive on active rows, always
                // enabled (products keep the category - the confirmation says
                // so); restore on archived rows, disabled with a readable reason
                // while the parent is itself archived.
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
                        // The tree holds every ACTIVE node, so a parent missing
                        // from it is archived.
                        disabled: (row) =>
                            row.parent_id && !findNode(tree ?? [], row.parent_id)
                                ? "Induk kategori ini masih diarsipkan"
                                : false,
                        onClick: (row) => handleRestore(row),
                    },
                ]}
                renderEmptyState={({ hasActiveFilters, hasSearch }) => (
                    <EmptyState
                        icon={FolderTree}
                        title={hasActiveFilters || hasSearch ? "No categories match" : "No categories yet"}
                        description="Categories group the catalogue; a product page filter on a parent includes its children."
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
