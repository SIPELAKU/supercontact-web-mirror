"use client";

import { Plus, Trash2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import type { VisibilityClause, VisibilityOp } from "@/lib/types/CustomFieldDefinition";

export interface ConditionFieldOption {
  value: string;
  label: string;
  /** Known value set; empty = free text. */
  options: string[];
}

interface VisibilityConditionBuilderProps {
  clauses: VisibilityClause[];
  onChange: (clauses: VisibilityClause[]) => void;
  /** Built-ins of the entity plus every OTHER definition of the same entity. */
  fieldOptions: ConditionFieldOption[];
  disabled?: boolean;
  /** What the clauses gate ("produk", "quotation", ...) for the helper copy. */
  entityNoun?: string;
}

const CONDITION_OP_OPTIONS: { value: VisibilityOp; label: string }[] = [
  { value: "eq", label: "adalah" },
  { value: "neq", label: "bukan" },
  { value: "in", label: "salah satu dari" },
];

/**
 * The clause builder extracted from the ticket settings tab (which keeps its
 * own copy - that module is untouched), parametrised by the fields a clause
 * may reference. Serialisation lives in lib/utils/customFieldVisibility.ts.
 */
export default function VisibilityConditionBuilder({
  clauses,
  onChange,
  fieldOptions,
  disabled,
  entityNoun = "data",
}: VisibilityConditionBuilderProps) {
  const knownOptionsFor = (fieldName: string): string[] =>
    fieldOptions.find((o) => o.value === fieldName)?.options ?? [];

  const updateClause = (index: number, patch: Partial<VisibilityClause>) =>
    onChange(clauses.map((c, i) => (i === index ? { ...c, ...patch } : c)));

  const addClause = () =>
    onChange([...clauses, { field: fieldOptions[0]?.value ?? "", op: "eq", value: "" }]);

  const removeClause = (index: number) => onChange(clauses.filter((_, i) => i !== index));

  // Changing the field resets the value (its valid options differ).
  const handleFieldChange = (index: number, newField: string) =>
    updateClause(index, { field: newField, value: clauses[index].op === "in" ? [] : "" });

  // Switching to/from "salah satu dari" coerces between string and string[].
  const handleOpChange = (index: number, newOp: VisibilityOp) => {
    const current = clauses[index];
    let value: string | string[];
    if (newOp === "in") {
      value = Array.isArray(current.value) ? current.value : current.value ? [current.value] : [];
    } else {
      value = Array.isArray(current.value) ? current.value[0] ?? "" : current.value;
    }
    updateClause(index, { op: newOp, value });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-700">Tampilkan field ini hanya jika…</p>
          <p className="text-xs text-gray-500">
            {clauses.length === 0
              ? `Selalu tampil. Tambah kondisi untuk menampilkannya hanya pada ${entityNoun} tertentu.`
              : `Semua kondisi di bawah harus terpenuhi agar field ini muncul di form ${entityNoun}.`}
          </p>
        </div>
        <AppButton
          variantStyle="outline"
          onClick={addClause}
          startIcon={<Plus size={14} />}
          disabled={disabled || fieldOptions.length === 0}
        >
          Tambah kondisi
        </AppButton>
      </div>

      {clauses.map((clause, index) => {
        const options = knownOptionsFor(clause.field);
        const singleValue = Array.isArray(clause.value) ? clause.value[0] ?? "" : clause.value;
        return (
          <div key={index} className="flex flex-wrap items-center gap-2">
            <div className="w-44">
              <AppSelect
                isBgWhite
                fullWidth
                value={clause.field}
                options={fieldOptions.map((o) => ({ value: o.value, label: o.label }))}
                onChange={(e) => handleFieldChange(index, e.target.value as string)}
                disabled={disabled}
              />
            </div>
            <div className="w-36">
              <AppSelect
                isBgWhite
                fullWidth
                value={clause.op}
                options={CONDITION_OP_OPTIONS}
                onChange={(e) => handleOpChange(index, e.target.value as VisibilityOp)}
                disabled={disabled}
              />
            </div>
            <div className="flex-1 min-w-[10rem]">
              {clause.op === "in" ? (
                options.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {options.map((opt) => {
                      const selected = Array.isArray(clause.value) ? clause.value : [];
                      const checked = selected.includes(opt);
                      return (
                        <label
                          key={opt}
                          className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm text-gray-600"
                        >
                          <input
                            type="checkbox"
                            className="h-3.5 w-3.5"
                            checked={checked}
                            disabled={disabled}
                            onChange={(e) =>
                              updateClause(index, {
                                value: e.target.checked ? [...selected, opt] : selected.filter((v) => v !== opt),
                              })
                            }
                          />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <AppInput
                    isBgWhite
                    fullWidth
                    placeholder="nilai1, nilai2"
                    value={Array.isArray(clause.value) ? clause.value.join(", ") : clause.value}
                    onChange={(e) => updateClause(index, { value: e.target.value.split(",").map((s) => s.trim()) })}
                    disabled={disabled}
                  />
                )
              ) : options.length > 0 ? (
                <AppSelect
                  isBgWhite
                  fullWidth
                  placeholder="Pilih nilai"
                  value={singleValue}
                  options={options.map((o) => ({ value: o, label: o }))}
                  onChange={(e) => updateClause(index, { value: e.target.value as string })}
                  disabled={disabled}
                />
              ) : (
                <AppInput
                  isBgWhite
                  fullWidth
                  placeholder="Isi nilai"
                  value={singleValue}
                  onChange={(e) => updateClause(index, { value: e.target.value })}
                  disabled={disabled}
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => removeClause(index)}
              className="text-gray-300 hover:text-red-500 disabled:opacity-40"
              aria-label="Hapus kondisi"
              disabled={disabled}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
