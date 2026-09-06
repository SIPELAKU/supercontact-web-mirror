"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chip, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { EyeOff, ListChecks, Pencil, Plus, RotateCcw, Save, X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { SuperTable, type MRT_ColumnDef, type SuperTableState } from "@/components/ui/super-table";
import VisibilityConditionBuilder, {
    type ConditionFieldOption,
} from "@/components/custom-fields/VisibilityConditionBuilder";
import { notify } from "@/lib/notifications";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import {
    useCreateCustomFieldDefinition,
    useCustomFieldDefinitions,
    useCustomFieldDefinitionsFor,
    useDeleteCustomFieldDefinition,
    useUpdateCustomFieldDefinition,
} from "@/lib/hooks/useCustomFieldDefinitions";
import {
    BUILTIN_CONDITION_FIELDS_BY_ENTITY,
    CUSTOM_FIELD_ENTITY_LABELS,
    CUSTOM_FIELD_ENTITY_OPTIONS,
    FIELD_KEY_PATTERN,
    FIELD_TYPE_LABELS,
    FIELD_TYPE_OPTIONS,
    builtinNamesFor,
    usesOptions,
} from "@/lib/constants/custom-field-entities";
import { clausesFromCondition, serializeVisibilityClauses } from "@/lib/utils/customFieldVisibility";
import type {
    CustomFieldDefinition,
    CustomFieldDefinitionListParams,
    CustomFieldDefinitionSortBy,
    CustomFieldDefinitionUpdate,
    CustomFieldEntityType,
    CustomFieldType,
    VisibilityClause,
} from "@/lib/types/CustomFieldDefinition";

const ENTITY_VALUES = CUSTOM_FIELD_ENTITY_OPTIONS.map((o) => o.value);

function readEntity(value: string | null): CustomFieldEntityType {
    return value && (ENTITY_VALUES as string[]).includes(value) ? (value as CustomFieldEntityType) : "product";
}

/** What a definition does, per entity - the strict/permissive split in one sentence. */
const ENTITY_HELP: Record<CustomFieldEntityType, string> = {
    product: "Field ini muncul di form produk dan divalidasi saat disimpan.",
    quotation: "Field ini muncul di form quotation dan divalidasi saat disimpan.",
    crm_company: "Field ini muncul di halaman perusahaan (CRM) dan divalidasi saat disimpan.",
    contact:
        "Field ini muncul di form kontak dan divalidasi saat disimpan. Untuk kontak, field lama yang tidak terdefinisi tetap tersimpan dan nilai lama yang tidak diubah tidak divalidasi.",
};

interface Draft {
    fieldKey: string;
    label: string;
    fieldType: CustomFieldType;
    options: string;
    isRequired: boolean;
    displayOrder: string;
    clauses: VisibilityClause[];
}

const EMPTY_DRAFT: Draft = {
    fieldKey: "",
    label: "",
    fieldType: "text",
    options: "",
    isRequired: false,
    displayOrder: "0",
    clauses: [],
};

function initialParams(entity: CustomFieldEntityType): CustomFieldDefinitionListParams {
    return {
        entity_type: entity,
        active_only: false,
        page: 1,
        limit: 25,
        search: "",
        sort_order: "asc",
        include_total: true,
    };
}

function sameParams(a: CustomFieldDefinitionListParams, b: CustomFieldDefinitionListParams): boolean {
    return (
        a.entity_type === b.entity_type &&
        a.page === b.page &&
        a.limit === b.limit &&
        a.search === b.search &&
        a.sort_by === b.sort_by &&
        a.sort_order === b.sort_order
    );
}

export default function CustomFieldDefinitionsTab() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const entity = readEntity(searchParams.get("entity"));

    const [params, setParams] = useState<CustomFieldDefinitionListParams>(() => initialParams(entity));
    // The entity selector is URL state; the list follows it.
    const effectiveParams = useMemo<CustomFieldDefinitionListParams>(
        () => (params.entity_type === entity ? params : { ...params, entity_type: entity, page: 1, include_total: true }),
        [params, entity]
    );
    const { data, isLoading, isFetching, isError, refetch } = useCustomFieldDefinitions(effectiveParams);
    const rows: CustomFieldDefinition[] = data?.definitions ?? [];
    // Every ACTIVE definition of the entity, for the sibling references a
    // visibility clause may use (the table holds only one page).
    const { definitions: siblings } = useCustomFieldDefinitionsFor(entity);

    const createMutation = useCreateCustomFieldDefinition();
    const updateMutation = useUpdateCustomFieldDefinition();
    const deleteMutation = useDeleteCustomFieldDefinition();
    const { confirm, confirmationPopup } = useConfirmationPopup();

    const [editing, setEditing] = useState<CustomFieldDefinition | null>(null);
    const [adding, setAdding] = useState(false);
    const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [mutationSeq, setMutationSeq] = useState(0);
    const bump = () => setMutationSeq((s) => s + 1);

    const setEntity = (next: CustomFieldEntityType) => {
        if (next === entity) return;
        const query = new URLSearchParams(Array.from(searchParams.entries()));
        query.set("entity", next);
        router.replace(`?${query.toString()}`, { scroll: false });
        setEditing(null);
        setAdding(false);
        setDraft(EMPTY_DRAFT);
        setFieldErrors({});
    };

    const resetForm = () => {
        setEditing(null);
        setAdding(false);
        setDraft(EMPTY_DRAFT);
        setFieldErrors({});
    };

    const beginEdit = (definition: CustomFieldDefinition) => {
        setAdding(false);
        setEditing(definition);
        setDraft({
            fieldKey: definition.field_key,
            label: definition.label,
            fieldType: definition.field_type,
            options: (definition.select_options ?? []).join(", "),
            isRequired: definition.is_required,
            displayOrder: String(definition.display_order),
            clauses: clausesFromCondition(definition.visibility_condition),
        });
        setFieldErrors({});
    };

    // Fields a clause can reference: this entity's built-ins plus every OTHER
    // active definition of the same entity (a field cannot gate itself).
    const conditionFieldOptions = useMemo<ConditionFieldOption[]>(() => {
        const builtins = BUILTIN_CONDITION_FIELDS_BY_ENTITY[entity].map((f) => ({
            value: f.value,
            label: f.label,
            options: f.options,
        }));
        const custom = siblings
            .filter((d) => d.id !== editing?.id)
            .map((d) => ({
                value: d.field_key,
                label: `${d.label} (custom)`,
                options: usesOptions(d.field_type) ? d.select_options ?? [] : [],
            }));
        return [...builtins, ...custom];
    }, [entity, siblings, editing]);

    const keyProblem = (key: string): string | undefined => {
        if (!key) return "Key wajib diisi";
        if (!FIELD_KEY_PATTERN.test(key)) return "huruf kecil, angka, garis bawah";
        if (builtinNamesFor(entity).includes(key)) return `"${key}" adalah nama bawaan ${CUSTOM_FIELD_ENTITY_LABELS[entity]}`;
        return undefined;
    };

    const handleServerError = (error: any, title: string) => {
        const fe = extractFieldErrors(error);
        const known = Object.keys(fe).filter((k) => k !== "_");
        if (known.length > 0) setFieldErrors(fe);
        if (known.length === 0 || fe._) notify.error(title, { description: fe._ ?? error?.message });
    };

    const handleSave = async () => {
        const fieldKey = draft.fieldKey.trim();
        const label = draft.label.trim();
        const displayOrder = draft.displayOrder.trim() === "" ? 0 : Number(draft.displayOrder);
        const parsedOptions = usesOptions(draft.fieldType)
            ? Array.from(new Set(draft.options.split(",").map((o) => o.trim()).filter(Boolean)))
            : undefined;
        const problems: Record<string, string> = {};
        if (!editing) {
            const problem = keyProblem(fieldKey);
            if (problem) problems.field_key = problem;
        }
        if (!label) problems.label = "Label wajib diisi";
        else if (label.length > 120) problems.label = "Maksimal 120 karakter";
        if (usesOptions(draft.fieldType) && (!parsedOptions || parsedOptions.length === 0)) {
            problems.select_options = "Isi minimal satu pilihan, pisahkan dengan koma";
        }
        if (!Number.isInteger(displayOrder)) problems.display_order = "Harus bilangan bulat";
        if (Object.keys(problems).length > 0) {
            setFieldErrors(problems);
            return;
        }
        const visibilityCondition = serializeVisibilityClauses(draft.clauses);
        try {
            if (editing) {
                // entity_type, field_key and field_type are immutable (API extra="forbid").
                const patch: CustomFieldDefinitionUpdate = {
                    label,
                    is_required: draft.isRequired,
                    display_order: displayOrder,
                    visibility_condition: visibilityCondition,
                };
                if (usesOptions(editing.field_type)) patch.select_options = parsedOptions ?? [];
                await updateMutation.mutateAsync({ id: editing.id, data: patch });
                notify.success("Custom field diubah");
            } else {
                await createMutation.mutateAsync({
                    entity_type: entity,
                    field_key: fieldKey,
                    label,
                    field_type: draft.fieldType,
                    select_options: parsedOptions,
                    is_required: draft.isRequired,
                    display_order: displayOrder,
                    visibility_condition: visibilityCondition,
                });
                notify.success("Custom field ditambahkan");
            }
            resetForm();
            bump();
        } catch (error: any) {
            handleServerError(error, "Gagal menyimpan");
        }
    };

    const handleDeactivate = (definition: CustomFieldDefinition) => {
        confirm({
            variant: "warning",
            title: "Nonaktifkan custom field",
            description: `Nonaktifkan "${definition.label}"? Field ini tidak lagi muncul di form ${CUSTOM_FIELD_ENTITY_LABELS[entity]} dan nilainya tidak divalidasi lagi; nilai yang sudah tersimpan tidak dihapus.`,
            confirmText: "Nonaktifkan",
            cancelText: "Batal",
            onConfirm: async () => {
                try {
                    await deleteMutation.mutateAsync(definition.id);
                    notify.success("Custom field dinonaktifkan");
                    bump();
                } catch (error: any) {
                    notify.error("Gagal menonaktifkan", { description: error?.message });
                }
            },
        });
    };

    const handleActivate = async (definition: CustomFieldDefinition) => {
        try {
            await updateMutation.mutateAsync({ id: definition.id, data: { is_active: true } });
            notify.success("Custom field diaktifkan");
            bump();
        } catch (error: any) {
            notify.error("Gagal mengaktifkan", { description: error?.message });
        }
    };

    const handleStateChange = useCallback(
        (state: SuperTableState) => {
            const page = state.pagination.pageIndex + 1;
            const sort = state.sorting?.[0];
            setParams((prev) => {
                const next: CustomFieldDefinitionListParams = {
                    entity_type: entity,
                    active_only: false,
                    page,
                    limit: Math.min(state.pagination.pageSize, 100),
                    search: state.globalFilter || "",
                    sort_by: sort?.id as CustomFieldDefinitionSortBy | undefined,
                    sort_order: sort ? (sort.desc ? "desc" : "asc") : "asc",
                    include_total: page === 1,
                };
                return sameParams(prev, next) ? prev : next;
            });
        },
        [entity]
    );

    const columns = useMemo<MRT_ColumnDef<CustomFieldDefinition>[]>(
        () => [
            { accessorKey: "label", header: "Label", size: 220 },
            {
                accessorKey: "field_key",
                header: "Key",
                size: 180,
                Cell: ({ cell }) => <span className="font-mono text-xs">{cell.getValue<string>()}</span>,
            },
            {
                id: "field_type",
                accessorFn: (row) => FIELD_TYPE_LABELS[row.field_type] ?? row.field_type,
                header: "Tipe",
                size: 130,
                enableSorting: false,
            },
            {
                id: "is_required",
                accessorFn: (row) => (row.is_required ? "Ya" : "Tidak"),
                header: "Wajib",
                size: 90,
                enableSorting: false,
            },
            { accessorKey: "display_order", header: "Urutan", size: 90 },
            {
                id: "is_active",
                accessorFn: (row) => (row.is_active ? "Aktif" : "Nonaktif"),
                header: "Status",
                size: 110,
                enableSorting: false,
                Cell: ({ row }) => (
                    <Chip
                        label={row.original.is_active ? "Aktif" : "Nonaktif"}
                        color={row.original.is_active ? "success" : "default"}
                        size="small"
                    />
                ),
            },
        ],
        []
    );

    const showConditionBuilder = conditionFieldOptions.length > 0;

    const editor = (
        <div className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <label className="mb-1 block text-xs font-medium">Key</label>
                    <AppInput
                        isBgWhite
                        value={draft.fieldKey}
                        disabled={!!editing}
                        onChange={(e) => {
                            const next = e.target.value;
                            setDraft({ ...draft, fieldKey: next });
                            setFieldErrors((prev) => ({ ...prev, field_key: next && !editing ? keyProblem(next.trim()) ?? "" : "" }));
                        }}
                        placeholder="mis. brand"
                        inputProps={{ maxLength: 60 }}
                        error={!!fieldErrors.field_key}
                        helperText={fieldErrors.field_key || "huruf kecil, angka, garis bawah"}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium">Label</label>
                    <AppInput
                        isBgWhite
                        value={draft.label}
                        onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                        placeholder="mis. Merek"
                        inputProps={{ maxLength: 120 }}
                        error={!!fieldErrors.label}
                        helperText={fieldErrors.label}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium">Tipe</label>
                    <AppSelect
                        isBgWhite
                        fullWidth
                        value={draft.fieldType}
                        options={FIELD_TYPE_OPTIONS}
                        disabled={!!editing}
                        onChange={(e) => setDraft({ ...draft, fieldType: e.target.value as CustomFieldType })}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium">Urutan tampil</label>
                    <AppInput
                        isBgWhite
                        type="number"
                        value={draft.displayOrder}
                        onChange={(e) => setDraft({ ...draft, displayOrder: e.target.value })}
                        inputProps={{ step: 1 }}
                        error={!!fieldErrors.display_order}
                        helperText={fieldErrors.display_order}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {usesOptions(draft.fieldType) && (
                    <div className="sm:col-span-2 lg:col-span-3">
                        <label className="mb-1 block text-xs font-medium">Pilihan (pisahkan dengan koma)</label>
                        <AppInput
                            isBgWhite
                            value={draft.options}
                            onChange={(e) => setDraft({ ...draft, options: e.target.value })}
                            placeholder="Kecil, Sedang, Besar"
                            error={!!fieldErrors.select_options}
                            helperText={fieldErrors.select_options}
                        />
                    </div>
                )}
                <div className="flex items-center sm:pt-5">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={draft.isRequired}
                            onChange={(e) => setDraft({ ...draft, isRequired: e.target.checked })}
                            className="h-4 w-4"
                        />
                        Wajib diisi
                    </label>
                </div>
            </div>

            {showConditionBuilder && (
                <VisibilityConditionBuilder
                    clauses={draft.clauses}
                    onChange={(clauses) => setDraft({ ...draft, clauses })}
                    fieldOptions={conditionFieldOptions}
                    entityNoun={CUSTOM_FIELD_ENTITY_LABELS[entity].toLowerCase()}
                />
            )}
            {fieldErrors.visibility_condition && (
                <p className="text-xs text-red-600">{fieldErrors.visibility_condition}</p>
            )}

            <div className="flex justify-end gap-2">
                <AppButton variantStyle="outline" onClick={resetForm}>
                    <X className="mr-1.5 h-4 w-4" />
                    Batal
                </AppButton>
                <AppButton onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                    <Save className="mr-1.5 h-4 w-4" />
                    {editing ? "Simpan" : "Tambah"}
                </AppButton>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-4">
            {confirmationPopup}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={entity}
                    onChange={(_, value) => {
                        if (value) setEntity(value as CustomFieldEntityType);
                    }}
                    aria-label="Entitas"
                >
                    {CUSTOM_FIELD_ENTITY_OPTIONS.map((opt) => (
                        <ToggleButton key={opt.value} value={opt.value} sx={{ textTransform: "none", px: 2 }}>
                            {opt.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
                {!adding && !editing && (
                    <AppButton
                        onClick={() => {
                            setAdding(true);
                            setDraft(EMPTY_DRAFT);
                            setFieldErrors({});
                        }}
                    >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Tambah field
                    </AppButton>
                )}
            </div>

            <p className="text-sm text-gray-500">{ENTITY_HELP[entity]}</p>

            {(adding || editing) && editor}

            <SuperTable<CustomFieldDefinition>
                tableId="custom-field-definitions-table"
                urlKey=""
                entityLabel="field"
                searchPlaceholder="Cari label atau key"
                columns={columns}
                data={rows}
                getRowId={(row) => row.id}
                isLoading={isLoading}
                isFetching={isFetching}
                isError={isError}
                errorMessage="Failed to load custom fields. Please try again."
                onRetry={() => refetch()}
                rowCount={typeof data?.total === "number" ? data.total : undefined}
                manualPagination
                manualFiltering
                manualSorting
                onStateChange={handleStateChange}
                // The entity IS a page-owned filter: switching it restarts the list.
                resetPageKey={`${entity}:${mutationSeq}`}
                rowActions={[
                    {
                        id: "edit",
                        label: "Ubah",
                        icon: <Pencil size={16} />,
                        onClick: (row) => beginEdit(row),
                    },
                    {
                        id: "deactivate",
                        label: "Nonaktifkan",
                        icon: <EyeOff size={16} />,
                        destructive: true,
                        hidden: (row) => !row.is_active,
                        onClick: (row) => handleDeactivate(row),
                    },
                    {
                        id: "activate",
                        label: "Aktifkan",
                        icon: <RotateCcw size={16} />,
                        hidden: (row) => row.is_active,
                        onClick: (row) => handleActivate(row),
                    },
                ]}
                renderEmptyState={({ hasSearch }) => (
                    <EmptyState
                        icon={ListChecks}
                        title={hasSearch ? "No fields match" : "No custom fields configured yet"}
                        description={`Fields you define here appear on every ${CUSTOM_FIELD_ENTITY_LABELS[entity].toLowerCase()} form and are validated on save.`}
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
