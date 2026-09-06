"use client";

// components/admin/catalog-settings/SegmentCriteriaBuilder.tsx
//
// The segment criteria builder (Phase 3, spec I2). It clones
// `components/custom-fields/VisibilityConditionBuilder.tsx` - extracted and
// parametrised in Phase 1 precisely so a second consumer could take it - and
// extends it in the two ways that component cannot express:
//
//   1. numeric operators (`gte` / `lte`) for the two accepted-quotation
//      aggregates and for numeric custom fields, with a per-field value
//      control instead of one free-text box: a customer-type select, a region
//      tree select, a sales-channel select, a lead-status select, a REAL
//      contact-tag picker, and a number input;
//   2. `custom_fields.<key>` clauses, whose options come from
//      `useCustomFieldDefinitionsFor("contact")` - the same source
//      `CustomFieldsPanel` reads. Without it the builder could not offer or
//      validate a custom-field clause at all (spec 0.18).
//
// THE BUILDER IS CONFINED TO THE WHITELIST. `operatorsForField` is the only
// source of the operator list, so a pair the API refuses (spec A8: an operator
// a field does not allow is a 400 at write time, never a silently-false
// clause) can never be offered. A criteria loaded from an older build that
// carries an illegal pair is repaired to the field's first legal operator by
// `clausesFromCriteria`, so the row is visible and fixable rather than
// unrenderable.
//
// The ticket module keeps its own untouched copy of the original builder.

import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { useCustomFieldDefinitionsFor } from "@/lib/hooks/useCustomFieldDefinitions";
import { useActiveContactTags } from "@/lib/hooks/useContactTags";
import {
    useActiveCustomerTypes,
    useActiveSalesChannels,
    useRegionTree,
} from "@/lib/hooks/useCommercialContext";
import { flattenTree } from "@/lib/utils/categoryTree";
import {
    MAX_SEGMENT_CLAUSES,
    SEGMENT_CLAUSE_OPERATOR_LABELS,
    SEGMENT_CUSTOM_FIELD_PREFIX,
    SEGMENT_FIELD_OPTIONS,
} from "@/lib/constants/commercial-context";
import {
    customFieldKeyOf,
    isCustomFieldClause,
    isNumericClause,
    operatorsForField,
    type SegmentClauseDraft,
} from "@/lib/utils/segmentCriteria";
import type { SegmentClauseField, SegmentClauseOperator } from "@/lib/types/CommercialContext";

interface SegmentCriteriaBuilderProps {
    clauses: SegmentClauseDraft[];
    onChange: (clauses: SegmentClauseDraft[]) => void;
    disabled?: boolean;
}

/** One selectable value for a clause: what is sent, and what is shown. */
interface ValueOption {
    value: string;
    label: string;
}

const LEAD_STATUS_VALUES = ["New", "Contacted", "Qualified", "Unqualified"];

export default function SegmentCriteriaBuilder({
    clauses,
    onChange,
    disabled,
}: SegmentCriteriaBuilderProps) {
    // Every source the value controls read. All four are cheap single-page
    // reads that the manager screens already warm, and the segment screen is
    // behind `sales:config:manage`, which is a superset of every read grant
    // these endpoints accept (spec A27).
    const { definitions } = useCustomFieldDefinitionsFor("contact");
    const { data: customerTypes } = useActiveCustomerTypes();
    const { data: channels } = useActiveSalesChannels();
    const { data: regionTree } = useRegionTree();
    const { data: tagPage } = useActiveContactTags();

    const regionOptions = useMemo(
        () => flattenTree(regionTree ?? []).map((node) => ({ value: node.id, label: node.label })),
        [regionTree]
    );

    /**
     * The field select: the seven whitelisted base fields, then one entry per
     * ACTIVE contact custom-field definition. A clause naming anything else is
     * refused server-side with a 400 carrying the clause index, so nothing
     * outside this list is ever offered.
     */
    const fieldOptions: ValueOption[] = useMemo(
        () => [
            ...SEGMENT_FIELD_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
            ...definitions.map((definition) => ({
                value: `${SEGMENT_CUSTOM_FIELD_PREFIX}${definition.field_key}`,
                label: `${definition.label} (custom)`,
            })),
        ],
        [definitions]
    );

    /**
     * The values a field can take, when the set is known. An empty list means
     * "free text" - the same contract `VisibilityConditionBuilder` uses.
     *
     * `customer_type`, `region` and `sales_channel` are compared by ID, so
     * these three send the row id and never the code. `SegmentFacts` carries
     * raw UUIDs for all three (`customer_type_ids`, `region_ids`,
     * `sales_channel_id`, built in customer_context_service.load_batch), and
     * the evaluator's `_norm` turns a UUID into its canonical lower-case UUID
     * string - so a code stored as the clause value can never equal a fact,
     * and the whole segment silently matches nobody. The API's own contract
     * test (`tests/test_segment_criteria.py`) pins UUID strings on every one
     * of these clauses. `tags` is compared by NAME, case-insensitively,
     * existentially over the contact's own tag set (spec A0.2), and
     * `lead_status` by its enum text.
     */
    const valuesFor = (field: string): ValueOption[] => {
        if (field === "customer_type")
            return (customerTypes?.items ?? []).map((type) => ({ value: type.id, label: type.name }));
        if (field === "sales_channel")
            return (channels?.items ?? []).map((channel) => ({
                value: channel.id,
                label: channel.name,
            }));
        if (field === "region") return regionOptions;
        if (field === "lead_status")
            return LEAD_STATUS_VALUES.map((value) => ({ value, label: value }));
        if (field === "tags")
            // REAL tags (spec A0.1). Before the amendment this clause had no
            // source at all - it read `leads.tag`, which no screen could show.
            return (tagPage?.items ?? []).map((tag) => ({ value: tag.name, label: tag.name }));
        const key = customFieldKeyOf(field);
        if (key) {
            const definition = definitions.find((entry) => entry.field_key === key);
            return (definition?.select_options ?? []).map((option) => ({
                value: option,
                label: option,
            }));
        }
        return [];
    };

    const hintFor = (field: string): string | undefined => {
        const base = SEGMENT_FIELD_OPTIONS.find((option) => option.value === field);
        if (base) return base.hint;
        if (isCustomFieldClause(field)) return "Nilai field khusus kontak, dibandingkan sebagai teks.";
        return undefined;
    };

    const updateClause = (index: number, patch: Partial<SegmentClauseDraft>) =>
        onChange(clauses.map((clause, i) => (i === index ? { ...clause, ...patch } : clause)));

    const addClause = () => {
        if (clauses.length >= MAX_SEGMENT_CLAUSES) return;
        const field = (fieldOptions[0]?.value ?? "") as SegmentClauseField | "";
        const operator = operatorsForField(field)[0] ?? "eq";
        onChange([...clauses, { field, operator, value: operator === "in" ? [] : "" }]);
    };

    const removeClause = (index: number) => onChange(clauses.filter((_, i) => i !== index));

    /** Changing the field resets the value AND re-picks a legal operator. */
    const handleFieldChange = (index: number, nextField: string) => {
        const allowed = operatorsForField(nextField);
        const current = clauses[index];
        const operator: SegmentClauseOperator = allowed.includes(current.operator)
            ? current.operator
            : allowed[0] ?? "eq";
        updateClause(index, {
            field: nextField as SegmentClauseField,
            operator,
            value: operator === "in" ? [] : "",
        });
    };

    /** Switching to / from "salah satu dari" coerces between string and string[]. */
    const handleOperatorChange = (index: number, nextOperator: SegmentClauseOperator) => {
        const current = clauses[index];
        let value: string | string[];
        if (nextOperator === "in") {
            value = Array.isArray(current.value)
                ? current.value
                : current.value
                  ? [current.value]
                  : [];
        } else {
            value = Array.isArray(current.value) ? current.value[0] ?? "" : current.value;
        }
        updateClause(index, { operator: nextOperator, value });
    };

    return (
        <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-gray-700">Kontak masuk segmen ini jika…</p>
                    <p className="text-xs text-gray-500">
                        {clauses.length === 0
                            ? "Belum ada syarat. Segmen tanpa syarat tidak cocok dengan siapa pun - bukan dengan semua orang."
                            : `Semua ${clauses.length} syarat harus terpenuhi (maksimal ${MAX_SEGMENT_CLAUSES}).`}
                    </p>
                </div>
                <AppButton
                    variantStyle="outline"
                    onClick={addClause}
                    startIcon={<Plus size={14} />}
                    disabled={disabled || clauses.length >= MAX_SEGMENT_CLAUSES}
                >
                    Tambah syarat
                </AppButton>
            </div>

            {clauses.map((clause, index) => {
                const field = String(clause.field ?? "");
                const allowed = operatorsForField(field);
                const options = valuesFor(field);
                const numeric = isNumericClause(field, clause.operator);
                const single = Array.isArray(clause.value) ? clause.value[0] ?? "" : clause.value;
                const selected = Array.isArray(clause.value) ? clause.value : [];
                const hint = hintFor(field);

                return (
                    <div key={index} className="rounded-lg border border-gray-200 bg-white p-3">
                        <div className="flex flex-wrap items-start gap-2">
                            <div className="w-56">
                                <AppSelect
                                    isBgWhite
                                    fullWidth
                                    value={field}
                                    options={fieldOptions}
                                    onChange={(e) => handleFieldChange(index, e.target.value as string)}
                                    disabled={disabled}
                                />
                            </div>
                            <div className="w-44">
                                <AppSelect
                                    isBgWhite
                                    fullWidth
                                    value={clause.operator}
                                    // ONLY the operators the API allows for
                                    // this field; an unknown field gets an
                                    // empty list rather than the full set.
                                    options={allowed.map((operator) => ({
                                        value: operator,
                                        label: SEGMENT_CLAUSE_OPERATOR_LABELS[operator],
                                    }))}
                                    onChange={(e) =>
                                        handleOperatorChange(index, e.target.value as SegmentClauseOperator)
                                    }
                                    disabled={disabled || allowed.length === 0}
                                />
                            </div>
                            <div className="min-w-[12rem] flex-1">
                                {clause.operator === "in" ? (
                                    options.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {options.map((option) => {
                                                const checked = selected.includes(option.value);
                                                return (
                                                    <label
                                                        key={option.value}
                                                        className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm text-gray-600"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="h-3.5 w-3.5"
                                                            checked={checked}
                                                            disabled={disabled}
                                                            onChange={(e) =>
                                                                updateClause(index, {
                                                                    value: e.target.checked
                                                                        ? [...selected, option.value]
                                                                        : selected.filter(
                                                                              (entry) => entry !== option.value
                                                                          ),
                                                                })
                                                            }
                                                        />
                                                        {option.label}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <AppInput
                                            isBgWhite
                                            fullWidth
                                            placeholder="nilai1, nilai2"
                                            value={selected.join(", ")}
                                            onChange={(e) =>
                                                updateClause(index, {
                                                    value: e.target.value.split(",").map((s) => s.trim()),
                                                })
                                            }
                                            disabled={disabled}
                                        />
                                    )
                                ) : numeric ? (
                                    <AppInput
                                        isBgWhite
                                        fullWidth
                                        type="number"
                                        placeholder="mis. 2"
                                        value={single}
                                        onChange={(e) => updateClause(index, { value: e.target.value })}
                                        disabled={disabled}
                                    />
                                ) : options.length > 0 ? (
                                    <AppSelect
                                        isBgWhite
                                        fullWidth
                                        placeholder="Pilih nilai"
                                        value={single}
                                        options={options}
                                        onChange={(e) => updateClause(index, { value: e.target.value as string })}
                                        disabled={disabled}
                                    />
                                ) : (
                                    <AppInput
                                        isBgWhite
                                        fullWidth
                                        placeholder="Isi nilai"
                                        value={single}
                                        onChange={(e) => updateClause(index, { value: e.target.value })}
                                        disabled={disabled}
                                    />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => removeClause(index)}
                                className="mt-2 text-gray-300 hover:text-red-500 disabled:opacity-40"
                                aria-label="Hapus syarat"
                                disabled={disabled}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        {hint && <p className="mt-2 text-xs text-gray-500">{hint}</p>}
                    </div>
                );
            })}
        </div>
    );
}
