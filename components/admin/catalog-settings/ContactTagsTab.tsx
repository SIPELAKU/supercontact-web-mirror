"use client";

// components/admin/catalog-settings/ContactTagsTab.tsx
//
// The contact-tag manager under Settings › Sales (Phase 3, spec A0.1), on the
// `UnitsTab.tsx` lazy-SuperTable pattern: `limit` equal to the table's batch
// size of 25, the `sameParams` guard against the re-render loop, a
// `mutationSeq` `resetPageKey` so the lazy list restarts at batch 1 after every
// write, an INLINE editor row rather than a modal, declarative `filters` and
// `rowActions`, and server 400s mapped per-field through `extractFieldErrors`.
//
// The one thing this manager does that no earlier one had to: A RENAME IS
// SHOWN WITH ITS BLAST RADIUS BEFORE IT COMMITS. A tag is a row, so renaming
// "VIP" renames it on every contact that carries it at once - that is the
// whole reason the amendment chose a table over a JSONB array, and it is also
// exactly why a rename must not be a quiet inline save. The row carries
// `contact_count`, so the count is already in hand and the confirm costs no
// extra request - which is why EVERY list request from this screen sets
// `include_counts: true`. The API defaults it to FALSE and leaves
// `contact_count` null, and `describeRenameImpact(..., undefined)` reads a
// null count as "Belum ada kontak yang memakai tag ini", i.e. it would
// confidently promise a no-op rename while 800 contacts change underneath.
//
// Archiving does NOT unlink anything (spec A26 - nothing is physically
// deleted): the tag stops being offered, the contacts that carry it keep it.

import { useCallback, useMemo, useState } from "react";
import { Chip } from "@mui/material";
import { Archive, Check, Pencil, Plus, RotateCcw, Save, Tags, X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { EmptyState } from "@/components/ui/empty-state";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { SuperTable, type MRT_ColumnDef, type SuperTableState } from "@/components/ui/super-table";
import { notify } from "@/lib/notifications";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import {
    useArchiveContactTag,
    useContactTags,
    useCreateContactTag,
    useUpdateContactTag,
} from "@/lib/hooks/useContactTags";
import {
    CONTACT_TAG_COLORS,
    CONTACT_TAG_NAME_MAX_LENGTH,
    cleanTagName,
    describeArchiveImpact,
    describeRenameImpact,
    normalizeTagColor,
    tagChipStyle,
    validateTagDraft,
} from "@/lib/utils/contactTags";
import type {
    ContactTag,
    ContactTagListParams,
    ContactTagSortBy,
    ContactTagUpdate,
} from "@/lib/types/ContactTag";

interface Draft {
    name: string;
    /** `""` means "no colour" - the neutral chip, stored as NULL. */
    color: string;
}

const EMPTY_DRAFT: Draft = { name: "", color: CONTACT_TAG_COLORS[0] };

// `limit` MUST equal the table's batch size (25) or the lazy footer asks for
// page 2 of 25 while showing 10 and rows 11-25 vanish (SuperTable README).
const INITIAL_PARAMS: ContactTagListParams = {
    page: 1,
    limit: 25,
    search: "",
    include_inactive: false,
    // Not optional on this screen: the rename/archive blast-radius copy is
    // read straight off `contact_count`.
    include_counts: true,
    sort_by: "name",
    sort_order: "asc",
    include_total: true,
};

function sameParams(a: ContactTagListParams, b: ContactTagListParams): boolean {
    return (
        a.page === b.page &&
        a.limit === b.limit &&
        a.search === b.search &&
        a.include_inactive === b.include_inactive &&
        a.sort_by === b.sort_by &&
        a.sort_order === b.sort_order
    );
}

export default function ContactTagsTab() {
    const [params, setParams] = useState<ContactTagListParams>(INITIAL_PARAMS);
    const { data, isLoading, isFetching, isError, refetch } = useContactTags(params);
    const rows: ContactTag[] = useMemo(() => data?.items ?? [], [data]);

    const createMutation = useCreateContactTag();
    const updateMutation = useUpdateContactTag();
    const archiveMutation = useArchiveContactTag();
    const { confirm, confirmationPopup } = useConfirmationPopup();

    const [editing, setEditing] = useState<ContactTag | null>(null);
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

    const beginEdit = (row: ContactTag) => {
        setAdding(false);
        setEditing(row);
        setDraft({ name: row.name, color: row.color ?? "" });
        setFieldErrors({});
    };

    const handleServerError = (error: any, title: string) => {
        const fe = extractFieldErrors(error);
        const known = Object.keys(fe).filter((k) => k !== "_");
        if (known.length > 0) setFieldErrors(fe);
        if (known.length === 0 || fe._) notify.error(title, { description: fe._ ?? error?.message });
    };

    /** The PATCH itself, once the rename (if any) has been confirmed. */
    const commitUpdate = async (target: ContactTag, patch: ContactTagUpdate) => {
        try {
            await updateMutation.mutateAsync({ id: target.id, data: patch });
            notify.success("Tag diubah", {
                description:
                    patch.name !== undefined
                        ? `Nama baru berlaku untuk ${target.contact_count ?? 0} kontak.`
                        : undefined,
            });
            resetForm();
            bump();
        } catch (error: any) {
            handleServerError(error, "Gagal menyimpan");
        }
    };

    const handleSave = async () => {
        const name = cleanTagName(draft.name);
        const color = normalizeTagColor(draft.color);
        // The catalogue we can see is one page; the server still owns the
        // unique index, so a duplicate outside this page comes back as a 409
        // and lands on `name` through extractFieldErrors.
        const problems = validateTagDraft(
            { name: draft.name, color: draft.color === "" ? null : draft.color },
            rows,
            editing?.id
        );
        if (Object.keys(problems).length > 0) {
            setFieldErrors(problems);
            return;
        }

        if (editing) {
            const patch: ContactTagUpdate = {};
            if (name !== editing.name) patch.name = name;
            if (color !== (editing.color ?? null)) patch.color = color;
            if (Object.keys(patch).length === 0) {
                notify.info("Tidak ada perubahan");
                resetForm();
                return;
            }
            if (patch.name !== undefined) {
                // The blast radius, stated before it commits.
                confirm({
                    variant: "warning",
                    title: "Ubah nama tag",
                    description: describeRenameImpact(editing.name, name, editing.contact_count),
                    confirmText: "Ubah nama",
                    cancelText: "Batal",
                    onConfirm: () => commitUpdate(editing, patch),
                });
                return;
            }
            await commitUpdate(editing, patch);
            return;
        }

        try {
            await createMutation.mutateAsync({ name, color });
            notify.success("Tag dibuat", {
                description: "Tag baru langsung bisa dipasang dari halaman kontak.",
            });
            resetForm();
            bump();
        } catch (error: any) {
            handleServerError(error, "Gagal menyimpan");
        }
    };

    const handleArchive = (row: ContactTag) => {
        confirm({
            variant: "warning",
            title: "Arsipkan tag",
            description: describeArchiveImpact(row.name, row.contact_count),
            confirmText: "Arsipkan",
            cancelText: "Batal",
            onConfirm: async () => {
                try {
                    await archiveMutation.mutateAsync(row.id);
                    notify.success("Tag diarsipkan");
                    bump();
                } catch (error: any) {
                    notify.error("Gagal mengarsipkan", { description: error?.message });
                }
            },
        });
    };

    const handleRestore = async (row: ContactTag) => {
        try {
            await updateMutation.mutateAsync({ id: row.id, data: { is_active: true } });
            notify.success("Tag diaktifkan kembali");
            bump();
        } catch (error: any) {
            notify.error("Gagal mengaktifkan", { description: error?.message });
        }
    };

    const handleStateChange = useCallback((state: SuperTableState) => {
        const page = state.pagination.pageIndex + 1;
        const sort = state.sorting?.[0];
        setParams((prev) => {
            const next: ContactTagListParams = {
                page,
                limit: state.pagination.pageSize,
                search: state.globalFilter || "",
                include_inactive: Boolean(state.filters?.include_inactive),
                include_counts: true,
                sort_by: (sort?.id as ContactTagSortBy) ?? "name",
                sort_order: sort ? (sort.desc ? "desc" : "asc") : "asc",
                include_total: page === 1,
            };
            return sameParams(prev, next) ? prev : next;
        });
    }, []);

    const columns = useMemo<MRT_ColumnDef<ContactTag>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Tag",
                size: 260,
                Cell: ({ row }) => (
                    <span
                        className="inline-flex rounded-[8px] px-3 py-1 text-xs font-medium"
                        style={tagChipStyle(row.original.color)}
                    >
                        {row.original.name}
                    </span>
                ),
            },
            {
                id: "color",
                accessorFn: (row) => row.color ?? "",
                header: "Warna",
                size: 130,
                enableSorting: false,
                Cell: ({ row }) => (
                    <span className="font-mono text-xs text-gray-500">
                        {row.original.color ?? "tanpa warna"}
                    </span>
                ),
            },
            {
                id: "contact_count",
                accessorFn: (row) => row.contact_count ?? 0,
                header: "Kontak",
                size: 110,
                // The API sorts on `name` / `created_at` only and silently
                // falls back to `name` for anything else, so offering this
                // header as sortable would lie about what the click did.
                enableSorting: false,
            },
            {
                id: "is_active",
                accessorFn: (row) => (row.is_active ? "Aktif" : "Diarsipkan"),
                header: "Status",
                size: 120,
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

    const saving = createMutation.isPending || updateMutation.isPending;

    const editorRow = (
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium">Nama tag</label>
                    <AppInput
                        isBgWhite
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        placeholder="mis. VIP"
                        inputProps={{ maxLength: CONTACT_TAG_NAME_MAX_LENGTH }}
                        error={!!fieldErrors.name}
                        helperText={
                            fieldErrors.name ??
                            (editing
                                ? `Mengubah nama berlaku untuk ${editing.contact_count ?? 0} kontak sekaligus`
                                : "Huruf besar/kecil dianggap sama: \"VIP\" dan \"vip\" satu tag")
                        }
                    />
                </div>
                <div className="sm:w-80">
                    <label className="mb-1 block text-xs font-medium">Warna</label>
                    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-gray-200 bg-white p-2">
                        <button
                            type="button"
                            aria-label="Tanpa warna"
                            onClick={() => setDraft({ ...draft, color: "" })}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-black/10"
                            style={{ backgroundColor: "#e7ebf3" }}
                        >
                            {draft.color === "" && <Check size={12} color="#0d121b" />}
                        </button>
                        {CONTACT_TAG_COLORS.map((option) => (
                            <button
                                key={option}
                                type="button"
                                aria-label={`Warna ${option}`}
                                onClick={() => setDraft({ ...draft, color: option })}
                                className="flex h-6 w-6 items-center justify-center rounded-full border border-black/10"
                                style={{ backgroundColor: option }}
                            >
                                {draft.color === option && <Check size={12} color="#ffffff" />}
                            </button>
                        ))}
                    </div>
                    {fieldErrors.color && <p className="mt-1 text-xs text-red-600">{fieldErrors.color}</p>}
                </div>
                <div className="flex items-center gap-2 sm:pt-6">
                    <span className="text-xs text-gray-500">Pratinjau</span>
                    <span
                        className="rounded-[8px] px-3 py-1 text-xs font-medium"
                        style={tagChipStyle(draft.color || null)}
                    >
                        {cleanTagName(draft.name) || "Tag"}
                    </span>
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
                    Tag adalah kosakata milik workspace: satu tag dipakai bersama oleh semua kontak.
                </p>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-muted-foreground">
                    <li>Mengubah nama tag berlaku untuk semua kontak yang memakainya - jumlahnya ditampilkan sebelum disimpan.</li>
                    <li>Huruf besar dan kecil dianggap sama, jadi &quot;VIP&quot; dan &quot;vip&quot; adalah satu tag.</li>
                    <li>Mengarsipkan tidak melepas tag dari kontak mana pun; tag hanya berhenti ditawarkan.</li>
                    <li>Tag bisa dipakai sebagai syarat segmen pelanggan, dan sebagai filter di daftar kontak.</li>
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
                        Tambah tag
                    </AppButton>
                )}
            </div>

            {(adding || editing) && editorRow}

            <SuperTable<ContactTag>
                tableId="contact-tags-table"
                urlKey=""
                entityLabel="tag kontak"
                searchPlaceholder="Cari nama tag"
                columns={columns}
                data={rows}
                getRowId={(row) => row.id}
                isLoading={isLoading}
                isFetching={isFetching}
                isError={isError}
                errorMessage="Failed to load contact tags. Please try again."
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
                        label: "Aktifkan kembali",
                        icon: <RotateCcw size={16} />,
                        hidden: (row) => row.is_active,
                        onClick: (row) => handleRestore(row),
                    },
                ]}
                renderEmptyState={({ hasActiveFilters, hasSearch }) => (
                    <EmptyState
                        icon={Tags}
                        title={hasActiveFilters || hasSearch ? "No tags match" : "No contact tags yet"}
                        description="Tags are the workspace's own vocabulary for contacts - a blueprint never invents them. Create one here, or straight from a contact."
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
