"use client";

// components/admin/catalog-settings/CustomerSegmentsTab.tsx
//
// Customer segments (Phase 3, spec I2): the `PriceListsTab.tsx` manager on the
// lazy SuperTable, with the name as a real anchor (`primaryColumn`) into the
// detail page that carries the criteria builder.
//
// A segment is never picked by a user - it is EVALUATED at quote time and its
// membership is never persisted (spec A12) - which is why reads as well as
// writes are gated on `sales:config:manage` (spec A27) and why this list shows
// what a segment READS rather than who is in it. There is no member count to
// show, and inventing one would mean the persisted membership table the plan
// forbids.
//
// Priority is HIGHER-WINS, the price-list convention, and it decides which
// segment a quotation stores when several match (spec A10/A11).
//
// CREATE CARRIES THE CRITERIA BUILDER. `CustomerSegmentCreateRequest.criteria`
// is REQUIRED and `validate_segment_criteria` refuses `{"all": []}` outright
// (A14: an empty criteria matches nobody, so accepting one would let a user
// save a segment that can never fire and never says so) - so posting an empty
// criteria on create is a 422 every time, and the segment could never be
// created at all. The first condition is therefore collected here; every LATER
// edit of the criteria happens on the detail page.

import { useCallback, useMemo, useState } from "react";
import { Chip } from "@mui/material";
import { Archive, Layers, Pencil, Plus, RotateCcw, Save, X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { EmptyState } from "@/components/ui/empty-state";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { SuperTable, type MRT_ColumnDef, type SuperTableState } from "@/components/ui/super-table";
import { notify } from "@/lib/notifications";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import {
    useArchiveCustomerSegment,
    useCreateCustomerSegment,
    useCustomerSegments,
    useUpdateCustomerSegment,
} from "@/lib/hooks/useCommercialContext";
import {
    COMMERCIAL_CODE_PATTERN,
    COMMERCIAL_NAME_MAX_LENGTH,
    MAX_SEGMENT_CLAUSES,
    SEGMENT_CODE_MAX_LENGTH,
    SEGMENT_FIELD_LABELS,
} from "@/lib/constants/commercial-context";
import SegmentCriteriaBuilder from "@/components/admin/catalog-settings/SegmentCriteriaBuilder";
import {
    describeCriteria,
    serializeSegmentClauses,
    type SegmentClauseDraft,
} from "@/lib/utils/segmentCriteria";
import type {
    CustomerSegment,
    CustomerSegmentListParams,
    CustomerSegmentSortBy,
    CustomerSegmentUpdate,
} from "@/lib/types/CommercialContext";

interface Draft {
    code: string;
    name: string;
    priority: string;
}

const EMPTY_DRAFT: Draft = { code: "", name: "", priority: "0" };

// `limit` MUST equal the table's batch size (25) - the SuperTable README rule.
const INITIAL_PARAMS: CustomerSegmentListParams = {
    page: 1,
    limit: 25,
    search: "",
    include_inactive: false,
    sort_by: "priority",
    sort_order: "desc",
    include_total: true,
};

function sameParams(a: CustomerSegmentListParams, b: CustomerSegmentListParams): boolean {
    return (
        a.page === b.page &&
        a.limit === b.limit &&
        a.search === b.search &&
        a.include_inactive === b.include_inactive &&
        a.sort_by === b.sort_by &&
        a.sort_order === b.sort_order
    );
}

const labelForField = (field: string) =>
    SEGMENT_FIELD_LABELS[field as keyof typeof SEGMENT_FIELD_LABELS] ??
    (field.startsWith("custom_fields.") ? field.slice("custom_fields.".length) : field);

export default function CustomerSegmentsTab() {
    const [params, setParams] = useState<CustomerSegmentListParams>(INITIAL_PARAMS);
    const { data, isLoading, isFetching, isError, refetch } = useCustomerSegments(params);
    const rows: CustomerSegment[] = useMemo(() => data?.items ?? [], [data]);

    const createMutation = useCreateCustomerSegment();
    const updateMutation = useUpdateCustomerSegment();
    const archiveMutation = useArchiveCustomerSegment();
    const { confirm, confirmationPopup } = useConfirmationPopup();

    const [editing, setEditing] = useState<CustomerSegment | null>(null);
    const [adding, setAdding] = useState(false);
    const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
    // Create-only: the segment's first condition. Editing an existing
    // segment's criteria stays on the detail page.
    const [clauses, setClauses] = useState<SegmentClauseDraft[]>([]);
    const [criteriaError, setCriteriaError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    // Bumped after every mutation so the lazy list restarts from batch 1.
    const [mutationSeq, setMutationSeq] = useState(0);
    const bump = () => setMutationSeq((s) => s + 1);

    const resetForm = () => {
        setEditing(null);
        setAdding(false);
        setDraft(EMPTY_DRAFT);
        setClauses([]);
        setCriteriaError(null);
        setFieldErrors({});
    };

    const beginEdit = (row: CustomerSegment) => {
        setAdding(false);
        setEditing(row);
        setDraft({ code: row.code, name: row.name, priority: String(row.priority ?? 0) });
        setClauses([]);
        setCriteriaError(null);
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
            else if (!COMMERCIAL_CODE_PATTERN.test(code))
                problems.code = `Huruf, angka, _ . - ; maksimal ${SEGMENT_CODE_MAX_LENGTH} karakter`;
        }
        if (!name) problems.name = "Nama wajib diisi";
        else if (name.length > COMMERCIAL_NAME_MAX_LENGTH)
            problems.name = `Maksimal ${COMMERCIAL_NAME_MAX_LENGTH} karakter`;
        if (Object.keys(problems).length > 0) {
            setFieldErrors(problems);
            return;
        }
        const priority = Number(draft.priority) || 0;

        // Create only: the API REQUIRES at least one clause, so an incomplete
        // builder is refused here with the same wording the detail page uses
        // rather than posting `{"all": []}` and reading back a bare 422.
        let criteria = null as ReturnType<typeof serializeSegmentClauses>;
        if (!editing) {
            criteria = serializeSegmentClauses(clauses);
            if (criteria === null) {
                setCriteriaError(
                    clauses.length === 0
                        ? "Tambahkan minimal satu syarat. Segmen tanpa syarat tidak cocok dengan siapa pun."
                        : "Tidak ada syarat yang lengkap. Lengkapi nilainya, atau hapus baris yang kosong."
                );
                return;
            }
            if (criteria.all.length > MAX_SEGMENT_CLAUSES) {
                setCriteriaError(`Maksimal ${MAX_SEGMENT_CLAUSES} syarat`);
                return;
            }
            setCriteriaError(null);
        }

        try {
            if (editing) {
                const patch: CustomerSegmentUpdate = {};
                if (name !== editing.name) patch.name = name;
                if (priority !== editing.priority) patch.priority = priority;
                if (Object.keys(patch).length === 0) {
                    notify.info("Tidak ada perubahan");
                    resetForm();
                    return;
                }
                await updateMutation.mutateAsync({ id: editing.id, data: patch });
                notify.success("Segmen diubah");
            } else {
                // `criteria` is non-null here: the guard above returned on
                // every incomplete builder, and the API refuses `{"all": []}`.
                await createMutation.mutateAsync({ code, name, priority, criteria: criteria! });
                notify.success("Segmen dibuat", {
                    description: "Syarat bisa ditambah atau diubah di halaman detail segmen.",
                });
            }
            resetForm();
            bump();
        } catch (error: any) {
            const fe = extractFieldErrors(error);
            if (fe.criteria) setCriteriaError(fe.criteria);
            handleServerError(error, "Gagal menyimpan");
        }
    };

    const handleArchive = (row: CustomerSegment) => {
        confirm({
            variant: "warning",
            title: "Arsipkan segmen",
            description: `"${row.name}" berhenti dievaluasi saat harga quotation dihitung. Quotation yang sudah menyimpan segmen ini tidak berubah.`,
            confirmText: "Arsipkan",
            cancelText: "Batal",
            onConfirm: async () => {
                try {
                    await archiveMutation.mutateAsync(row.id);
                    notify.success("Segmen diarsipkan");
                    bump();
                } catch (error: any) {
                    notify.error("Gagal mengarsipkan", { description: error?.message });
                }
            },
        });
    };

    const handleRestore = async (row: CustomerSegment) => {
        try {
            await updateMutation.mutateAsync({ id: row.id, data: { status: "active" } });
            notify.success("Segmen diaktifkan kembali");
            bump();
        } catch (error: any) {
            notify.error("Gagal mengaktifkan", { description: error?.message });
        }
    };

    const handleStateChange = useCallback((state: SuperTableState) => {
        const page = state.pagination.pageIndex + 1;
        const sort = state.sorting?.[0];
        setParams((prev) => {
            const next: CustomerSegmentListParams = {
                page,
                limit: state.pagination.pageSize,
                search: state.globalFilter || "",
                include_inactive: Boolean(state.filters?.include_inactive),
                sort_by: (sort?.id as CustomerSegmentSortBy) ?? "priority",
                sort_order: sort ? (sort.desc ? "desc" : "asc") : "desc",
                include_total: page === 1,
            };
            return sameParams(prev, next) ? prev : next;
        });
    }, []);

    const columns = useMemo<MRT_ColumnDef<CustomerSegment>[]>(
        () => [
            { accessorKey: "name", header: "Nama", size: 220 },
            {
                accessorKey: "code",
                header: "Kode",
                size: 140,
                Cell: ({ cell }) => <span className="font-mono text-xs">{cell.getValue<string>()}</span>,
            },
            { accessorKey: "priority", header: "Prioritas", size: 110 },
            {
                id: "criteria",
                accessorFn: (row) => describeCriteria(row.criteria, labelForField),
                header: "Syarat",
                size: 320,
                enableSorting: false,
                Cell: ({ row }) => {
                    const clauses = row.original.criteria?.all ?? [];
                    return (
                        <span className={clauses.length === 0 ? "text-amber-700" : "text-gray-900"}>
                            {describeCriteria(row.original.criteria, labelForField)}
                        </span>
                    );
                },
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
        ],
        []
    );

    const saving = createMutation.isPending || updateMutation.isPending;

    const editorRow = (
        <div className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="sm:w-48">
                    <label className="mb-1 block text-xs font-medium">Kode</label>
                    <AppInput
                        isBgWhite
                        value={draft.code}
                        disabled={!!editing}
                        onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                        placeholder="mis. KORPORAT_JABAR"
                        inputProps={{ maxLength: SEGMENT_CODE_MAX_LENGTH }}
                        error={!!fieldErrors.code}
                        helperText={fieldErrors.code ?? (editing ? "Kode tidak bisa diubah" : undefined)}
                    />
                </div>
                <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium">Nama</label>
                    <AppInput
                        isBgWhite
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        placeholder="mis. Korporat Jawa Barat"
                        inputProps={{ maxLength: COMMERCIAL_NAME_MAX_LENGTH }}
                        error={!!fieldErrors.name}
                        helperText={fieldErrors.name}
                    />
                </div>
                <div className="sm:w-40">
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
                <div className="flex gap-2 sm:pt-5">
                    <AppButton onClick={handleSave} disabled={saving}>
                        <Save className="mr-1.5 h-4 w-4" />
                        Simpan
                    </AppButton>
                    <AppButton variantStyle="outline" onClick={resetForm} aria-label="Batal">
                        <X className="h-4 w-4" />
                    </AppButton>
                </div>
            </div>

            {/* A new segment MUST carry at least one condition - the API
                refuses `{"all": []}` - so the builder is part of the create
                form. An existing segment's criteria is edited on its detail
                page, so the row stays compact when renaming. */}
            {!editing && (
                <div className="flex flex-col gap-2 border-t pt-3">
                    <label className="block text-xs font-medium">
                        Syarat <span className="text-muted-foreground">(minimal satu, semua harus terpenuhi)</span>
                    </label>
                    <SegmentCriteriaBuilder
                        clauses={clauses}
                        onChange={(next) => {
                            setClauses(next);
                            setCriteriaError(null);
                        }}
                        disabled={saving}
                    />
                    {criteriaError && <p className="text-sm text-red-600">{criteriaError}</p>}
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col gap-4">
            {confirmationPopup}
            <div className="rounded-lg border-l-4 border-l-sky-500 bg-sky-50 p-4 text-sm dark:bg-sky-950/30">
                <p className="font-medium">
                    Segmen dihitung ulang setiap kali quotation dibuat - keanggotaannya tidak pernah disimpan.
                </p>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-muted-foreground">
                    <li>Semua syarat harus terpenuhi (AND). Segmen tanpa syarat tidak cocok dengan siapa pun.</li>
                    <li>Prioritas lebih besar menang. Quotation menyimpan segmen cocok dengan prioritas TERTINGGI - belum tentu segmen yang daftar harganya dipakai.</li>
                    <li>Mengubah syarat tidak mengubah quotation yang sudah tersimpan.</li>
                    <li>Segmen baru wajib punya minimal satu syarat; sesudahnya syarat diedit di halaman detail segmen.</li>
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
                        Tambah segmen
                    </AppButton>
                )}
            </div>

            {(adding || editing) && editorRow}

            <SuperTable<CustomerSegment>
                tableId="customer-segments-table"
                urlKey=""
                entityLabel="segmen"
                searchPlaceholder="Cari nama atau kode segmen"
                columns={columns}
                data={rows}
                getRowId={(row) => row.id}
                isLoading={isLoading}
                isFetching={isFetching}
                isError={isError}
                errorMessage="Failed to load customer segments. Please try again."
                onRetry={() => refetch()}
                rowCount={typeof data?.total === "number" ? data.total : undefined}
                manualPagination
                manualFiltering
                manualSorting
                onStateChange={handleStateChange}
                resetPageKey={mutationSeq}
                // A real anchor on the name: middle-click and open-in-new-tab
                // work, and the criteria builder lives behind it.
                primaryColumn={{
                    accessorKey: "name",
                    href: (row) => `/settings/sales/customer-segments/${row.id}`,
                }}
                filters={[
                    { id: "include_inactive", label: "Tampilkan yang diarsipkan", type: "boolean" },
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
                        icon={Layers}
                        title={hasActiveFilters || hasSearch ? "No segments match" : "No customer segments yet"}
                        description="A segment is a rule over the customer's own facts - type, region, channel, tags, lead status and accepted-quotation totals - evaluated fresh on every quote."
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
