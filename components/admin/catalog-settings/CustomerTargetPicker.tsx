"use client";

// components/admin/catalog-settings/CustomerTargetPicker.tsx
//
// Picks the customer a price list is assigned to: a contact or a CRM company.
//
// It calls EXACTLY ONE endpoint - `GET /price-lists/targets/search`, which is
// gated on the same `sales:config:manage` the rest of this screen needs.
// Deliberately NOT `GET /contacts` (permission `contacts`) or
// `GET /company-intelligence/my-target-companies` (`companies`/`companies:read`):
// a role holding only the sales-config grant would get two pickers that 403
// with no explanation (spec S3-9b).

import { useEffect, useMemo, useState } from "react";
import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import { AppSelect } from "@/components/ui/app-select";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useAssignmentTargetSearch } from "@/lib/hooks/usePriceLists";
import { TARGET_TYPE_OPTIONS } from "@/lib/constants/price-list";
import type { AssignmentTargetSearchItem, AssignmentTargetType } from "@/lib/types/PriceList";

export default function CustomerTargetPicker({
    targetType,
    onTargetTypeChange,
    value,
    onChange,
    disabled = false,
    error,
    helperText,
}: {
    targetType: AssignmentTargetType;
    onTargetTypeChange: (next: AssignmentTargetType) => void;
    value: AssignmentTargetSearchItem | null;
    onChange: (next: AssignmentTargetSearchItem | null) => void;
    disabled?: boolean;
    error?: boolean;
    helperText?: React.ReactNode;
}) {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 350);

    // Switching Kontak <-> Perusahaan invalidates the current pick: it is a
    // row from the other table.
    useEffect(() => {
        setSearch("");
    }, [targetType]);

    const { data, isFetching } = useAssignmentTargetSearch(
        { target_type: targetType, search: debouncedSearch || undefined, page: 1, limit: 20 },
        { enabled: !disabled }
    );

    const options = useMemo(() => {
        const items = data?.items ?? [];
        if (value && !items.some((item) => item.id === value.id)) return [value, ...items];
        return items;
    }, [data, value]);

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
                <label className="mb-1 block text-xs font-medium">Jenis pelanggan</label>
                <AppSelect
                    isBgWhite
                    fullWidth
                    value={targetType}
                    options={TARGET_TYPE_OPTIONS}
                    disabled={disabled}
                    onChange={(e) => {
                        onChange(null);
                        onTargetTypeChange(e.target.value as AssignmentTargetType);
                    }}
                />
            </div>
            <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium">
                    {targetType === "contact" ? "Kontak" : "Perusahaan"}
                </label>
                <AppAutocomplete<AssignmentTargetSearchItem, false, false, false>
                    isBgWhite
                    placeholder={
                        targetType === "contact" ? "Cari nama, email atau telepon" : "Cari nama perusahaan"
                    }
                    disabled={disabled}
                    error={error}
                    helperText={helperText}
                    loading={isFetching}
                    value={value}
                    options={options}
                    filterOptions={(x) => x}
                    isOptionEqualToValue={(option, selected) => option.id === selected.id}
                    getOptionLabel={(option) => (typeof option === "string" ? option : option.label)}
                    renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                            <span className="flex flex-col">
                                <span>{option.label}</span>
                                {option.secondary && (
                                    <span className="text-[11px] text-gray-500">{option.secondary}</span>
                                )}
                            </span>
                        </li>
                    )}
                    onInputChange={(_event, next, reason) => {
                        if (reason === "input") setSearch(next);
                        if (reason === "clear") setSearch("");
                    }}
                    onChange={(_event, next) => onChange(next ?? null)}
                    noOptionsText={debouncedSearch ? "Tidak ditemukan" : "Ketik untuk mencari"}
                />
            </div>
        </div>
    );
}
