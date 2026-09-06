"use client";

// components/admin/catalog-settings/SalesChannelsTab.tsx
//
// Sales channels (Phase 3, spec I2): the `UnitsTab.tsx` manager, on the lazy
// SuperTable. Four channels are seeded per company by the migration
// (WHATSAPP / WEB_WIDGET / EMAIL / DIRECT), so this list is never empty and the
// quotation form's channel picker works on day one for every tenant (spec A20).
//
// The omnichannel link is the one non-obvious rule: only a `whatsapp` /
// `web_widget` / `email` channel can carry one, and only an account of the
// MATCHING type - the two vocabularies overlap in exactly three values
// (spec A25). The control is disabled WITH ITS REASON rather than letting a
// user pick something the server will 400.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Chip } from "@mui/material";
import { Archive, Pencil, Plus, Radio, RotateCcw, Save, X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { SuperTable, type MRT_ColumnDef, type SuperTableState } from "@/components/ui/super-table";
import { notify } from "@/lib/notifications";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import {
    useArchiveSalesChannel,
    useCreateSalesChannel,
    useSalesChannels,
    useUpdateSalesChannel,
} from "@/lib/hooks/useCommercialContext";
import { useAccounts } from "@/lib/hooks/useOmnichannel";
import {
    COMMERCIAL_CODE_PATTERN,
    COMMERCIAL_NAME_MAX_LENGTH,
    SALES_CHANNEL_CODE_MAX_LENGTH,
    SALES_CHANNEL_TYPE_LABELS,
    SALES_CHANNEL_TYPE_OPTIONS,
    canLinkOmnichannelAccount,
    omnichannelLinkDisabledReason,
} from "@/lib/constants/commercial-context";
import type {
    SalesChannel,
    SalesChannelListParams,
    SalesChannelSortBy,
    SalesChannelType,
    SalesChannelUpdate,
} from "@/lib/types/CommercialContext";

interface Draft {
    code: string;
    name: string;
    channelType: SalesChannelType;
    omnichannelAccountId: string;
}

const EMPTY_DRAFT: Draft = {
    code: "",
    name: "",
    channelType: "direct",
    omnichannelAccountId: "",
};

// `limit` MUST equal the table's batch size (25) - the SuperTable README rule.
const INITIAL_PARAMS: SalesChannelListParams = {
    page: 1,
    limit: 25,
    search: "",
    include_inactive: false,
    sort_by: "name",
    sort_order: "asc",
    include_total: true,
};

function sameParams(a: SalesChannelListParams, b: SalesChannelListParams): boolean {
    return (
        a.page === b.page &&
        a.limit === b.limit &&
        a.search === b.search &&
        a.include_inactive === b.include_inactive &&
        a.channel_type === b.channel_type &&
        a.sort_by === b.sort_by &&
        a.sort_order === b.sort_order
    );
}

export default function SalesChannelsTab() {
    const [params, setParams] = useState<SalesChannelListParams>(INITIAL_PARAMS);
    const { data, isLoading, isFetching, isError, refetch } = useSalesChannels(params);
    const rows: SalesChannel[] = data?.items ?? [];

    const createMutation = useCreateSalesChannel();
    const updateMutation = useUpdateSalesChannel();
    const archiveMutation = useArchiveSalesChannel();
    const { confirm, confirmationPopup } = useConfirmationPopup();

    const [editing, setEditing] = useState<SalesChannel | null>(null);
    const [adding, setAdding] = useState(false);
    const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    // Bumped after every mutation so the lazy list restarts from batch 1.
    const [mutationSeq, setMutationSeq] = useState(0);
    const bump = () => setMutationSeq((s) => s + 1);

    const linkable = canLinkOmnichannelAccount(draft.channelType);
    const linkDisabledReason = omnichannelLinkDisabledReason(draft.channelType);
    // Only accounts of the MATCHING type are fetched, so a mismatched pick is
    // not merely refused - it is never offered.
    const { data: accounts } = useAccounts(linkable ? draft.channelType : undefined, false);

    // Switching to a type no account can serve drops a link that would 400.
    useEffect(() => {
        if (!linkable && draft.omnichannelAccountId) {
            setDraft((prev) => ({ ...prev, omnichannelAccountId: "" }));
        }
    }, [linkable, draft.omnichannelAccountId]);

    const accountOptions = useMemo(() => {
        const options = (accounts ?? []).map((account) => ({
            value: account.id,
            label: account.display_name || account.channel_identifier || account.id,
        }));
        // An account already linked but now inactive (or of another type after
        // an edit) stays visible-as-is, so the editor never silently clears it.
        if (
            draft.omnichannelAccountId &&
            !options.some((option) => option.value === draft.omnichannelAccountId)
        ) {
            options.unshift({
                value: draft.omnichannelAccountId,
                label: editing?.omnichannel_account?.display_name ?? "Akun tertaut (tidak aktif)",
            });
        }
        return [{ value: "", label: "Tanpa akun omnichannel" }, ...options];
    }, [accounts, draft.omnichannelAccountId, editing]);

    const resetForm = () => {
        setEditing(null);
        setAdding(false);
        setDraft(EMPTY_DRAFT);
        setFieldErrors({});
    };

    const beginEdit = (row: SalesChannel) => {
        setAdding(false);
        setEditing(row);
        setDraft({
            code: row.code,
            name: row.name,
            channelType: row.channel_type,
            omnichannelAccountId: row.omnichannel_account_id ?? "",
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
            else if (!COMMERCIAL_CODE_PATTERN.test(code))
                problems.code = `Huruf, angka, _ . - ; maksimal ${SALES_CHANNEL_CODE_MAX_LENGTH} karakter`;
        }
        if (!name) problems.name = "Nama wajib diisi";
        else if (name.length > COMMERCIAL_NAME_MAX_LENGTH)
            problems.name = `Maksimal ${COMMERCIAL_NAME_MAX_LENGTH} karakter`;
        if (Object.keys(problems).length > 0) {
            setFieldErrors(problems);
            return;
        }
        const accountId = linkable ? draft.omnichannelAccountId || null : null;
        try {
            if (editing) {
                const patch: SalesChannelUpdate = {};
                if (name !== editing.name) patch.name = name;
                if (draft.channelType !== editing.channel_type) patch.channel_type = draft.channelType;
                if (accountId !== (editing.omnichannel_account_id ?? null))
                    patch.omnichannel_account_id = accountId;
                if (Object.keys(patch).length === 0) {
                    notify.info("Tidak ada perubahan");
                    resetForm();
                    return;
                }
                await updateMutation.mutateAsync({ id: editing.id, data: patch });
                notify.success("Kanal penjualan diubah");
            } else {
                await createMutation.mutateAsync({
                    code,
                    name,
                    channel_type: draft.channelType,
                    omnichannel_account_id: accountId,
                });
                notify.success("Kanal penjualan ditambahkan");
            }
            resetForm();
            bump();
        } catch (error: any) {
            handleServerError(error, "Gagal menyimpan");
        }
    };

    const handleArchive = (row: SalesChannel) => {
        confirm({
            variant: "warning",
            title: "Arsipkan kanal penjualan",
            description: `"${row.name}" hilang dari pilihan baru dan tidak lagi ikut menentukan harga. Lead dan quotation yang sudah memakainya tetap menyimpannya.`,
            confirmText: "Arsipkan",
            cancelText: "Batal",
            onConfirm: async () => {
                try {
                    await archiveMutation.mutateAsync(row.id);
                    notify.success("Kanal penjualan diarsipkan");
                    bump();
                } catch (error: any) {
                    notify.error("Gagal mengarsipkan", { description: error?.message });
                }
            },
        });
    };

    const handleRestore = async (row: SalesChannel) => {
        try {
            await updateMutation.mutateAsync({ id: row.id, data: { status: "active" } });
            notify.success("Kanal penjualan diaktifkan kembali");
            bump();
        } catch (error: any) {
            notify.error("Gagal mengaktifkan", { description: error?.message });
        }
    };

    const handleStateChange = useCallback((state: SuperTableState) => {
        const page = state.pagination.pageIndex + 1;
        const sort = state.sorting?.[0];
        const channelType = state.filters?.channel_type;
        setParams((prev) => {
            const next: SalesChannelListParams = {
                page,
                limit: state.pagination.pageSize,
                search: state.globalFilter || "",
                include_inactive: Boolean(state.filters?.include_inactive),
                channel_type:
                    typeof channelType === "string" && channelType
                        ? (channelType as SalesChannelType)
                        : undefined,
                sort_by: (sort?.id as SalesChannelSortBy) ?? "name",
                sort_order: sort ? (sort.desc ? "desc" : "asc") : "asc",
                include_total: page === 1,
            };
            return sameParams(prev, next) ? prev : next;
        });
    }, []);

    const columns = useMemo<MRT_ColumnDef<SalesChannel>[]>(
        () => [
            { accessorKey: "name", header: "Nama", size: 220 },
            {
                accessorKey: "code",
                header: "Kode",
                size: 150,
                Cell: ({ cell }) => <span className="font-mono text-xs">{cell.getValue<string>()}</span>,
            },
            {
                id: "channel_type",
                accessorFn: (row) => SALES_CHANNEL_TYPE_LABELS[row.channel_type] ?? row.channel_type,
                header: "Jenis",
                size: 150,
            },
            {
                id: "omnichannel_account",
                accessorFn: (row) => row.omnichannel_account?.display_name ?? "",
                header: "Akun omnichannel",
                size: 240,
                enableSorting: false,
                Cell: ({ row }) => {
                    const account = row.original.omnichannel_account;
                    if (!account) return <span className="text-gray-400">-</span>;
                    return (
                        <span className="flex flex-col">
                            <span>{account.display_name ?? account.channel_identifier ?? account.id}</span>
                            {!account.is_active && (
                                <span className="text-[11px] text-amber-600">Akun tidak aktif</span>
                            )}
                        </span>
                    );
                },
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
                        placeholder="mis. MARKETPLACE"
                        inputProps={{ maxLength: SALES_CHANNEL_CODE_MAX_LENGTH }}
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
                        placeholder="mis. Tokopedia"
                        inputProps={{ maxLength: COMMERCIAL_NAME_MAX_LENGTH }}
                        error={!!fieldErrors.name}
                        helperText={fieldErrors.name}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium">Jenis kanal</label>
                    <AppSelect
                        isBgWhite
                        fullWidth
                        value={draft.channelType}
                        options={SALES_CHANNEL_TYPE_OPTIONS}
                        onChange={(e) =>
                            setDraft({ ...draft, channelType: e.target.value as SalesChannelType })
                        }
                        error={!!fieldErrors.channel_type}
                        helperText={fieldErrors.channel_type}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium">Akun omnichannel</label>
                    <AppSelect
                        isBgWhite
                        fullWidth
                        value={draft.omnichannelAccountId}
                        options={accountOptions}
                        disabled={!linkable}
                        onChange={(e) =>
                            setDraft({ ...draft, omnichannelAccountId: e.target.value as string })
                        }
                        error={!!fieldErrors.omnichannel_account_id}
                        helperText={
                            fieldErrors.omnichannel_account_id ??
                            linkDisabledReason ??
                            "Opsional: menautkan percakapan kanal ini ke akun yang melayaninya"
                        }
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
                    Kanal penjualan adalah salah satu tingkat penentuan harga, dan dicatat pada lead maupun
                    quotation.
                </p>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-muted-foreground">
                    <li>
                        Empat kanal (WhatsApp, Web Widget, Email, Langsung) sudah tersedia untuk setiap
                        workspace; lead baru otomatis mendapat kanal dari sumber lead-nya.
                    </li>
                    <li>
                        Hanya kanal WhatsApp, Web Widget dan Email yang bisa ditautkan ke akun omnichannel -
                        jenis lain tidak punya padanan akun.
                    </li>
                    <li>Mengarsipkan menyembunyikan kanal dari pilihan baru; data yang ada tetap utuh.</li>
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
                        Tambah kanal
                    </AppButton>
                )}
            </div>

            {(adding || editing) && editorRow}

            <SuperTable<SalesChannel>
                tableId="sales-channels-table"
                urlKey=""
                entityLabel="kanal penjualan"
                searchPlaceholder="Cari nama atau kode kanal"
                columns={columns}
                data={rows}
                getRowId={(row) => row.id}
                isLoading={isLoading}
                isFetching={isFetching}
                isError={isError}
                errorMessage="Failed to load sales channels. Please try again."
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
                        id: "channel_type",
                        label: "Jenis kanal",
                        type: "select",
                        options: SALES_CHANNEL_TYPE_OPTIONS,
                        anyLabel: "Semua jenis",
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
                        icon={Radio}
                        title={hasActiveFilters || hasSearch ? "No channels match" : "No sales channels yet"}
                        description="A sales channel records where a lead or a quotation came from, and can carry its own price list."
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
