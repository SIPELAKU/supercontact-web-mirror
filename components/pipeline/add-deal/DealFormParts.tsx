"use client";

// Pieces shared by Add Deal (many products) and Update Pipeline (one deal):
// the read-only field, the Client/Account (lead) picker and the Assign To
// picker. Each picker owns its own search + debounce.

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppInput } from "@/components/ui/app-input";
import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useUsers } from "@/lib/hooks/useUsers";
import * as pipelineAPI from "@/lib/api/pipelines";
import { toLeadOption, type LeadOption } from "../dealLeadOptions";

export type PickerOption = { value: string; label: string };

export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-sm font-medium text-gray-700 mb-2 block">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

// The one look for every read-only field (the Product Name style), whatever the
// editable control would have been - a dropdown, select or date picker each
// greys out differently, so a locked field never renders as one of those.
export function LockedField({
  value,
  placeholder,
  error,
  helperText,
}: {
  value: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
}) {
  return (
    <AppInput
      disabled={true}
      value={value}
      placeholder={placeholder}
      isBgWhite
      height="48px"
      rounded="8px"
      readOnly
      error={error}
      helperText={helperText}
    />
  );
}

const sameOption = (option: unknown, value: unknown) => {
  if (!value) return false;
  if (typeof option === "string" || typeof value === "string") return option === value;
  return (option as PickerOption).value === (value as PickerOption).value;
};

/**
 * Client/Account: the client always comes from a LEAD (BO) - a lead has one
 * contact (the deal's client) and one assignee, which "Assign To" starts from.
 * Only Contacted/Qualified leads; `owner` limits a sales user to their own.
 */
export function DealLeadPicker({
  value,
  onChange,
  owner,
  enabled,
  error,
}: {
  value: LeadOption | null;
  onChange: (lead: LeadOption | null) => void;
  owner?: string;
  enabled: boolean;
  error?: string;
}) {
  const [search, setSearch] = useState("");
  // Searches only once the user has stopped typing for a second.
  const debounced = useDebounce(search, 1000);
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["deal-leads", debounced, owner],
    queryFn: () => pipelineAPI.fetchDealLeads(debounced, owner),
    enabled,
  });

  const options = useMemo(() => {
    const list = leads.map(toLeadOption);
    // Keep the picked lead selectable when a new search no longer returns it.
    if (value && !list.find((o) => o.value === value.value)) return [value, ...list];
    return list;
  }, [leads, value]);

  return (
    <AppAutocomplete
      isBgWhite
      height="48px"
      rounded="8px"
      loading={isLoading}
      value={value}
      options={options}
      getOptionLabel={(option) => (typeof option === "string" ? option : option.label)}
      // The list is already the API's search result.
      filterOptions={(opts) => opts}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props as typeof props & { key: string };
        return (
          <li key={option.value} {...optionProps}>
            <div className="flex flex-col">
              <span>{option.label}</span>
              {option.detail && <span className="text-xs text-gray-500">{option.detail}</span>}
            </div>
          </li>
        );
      }}
      onChange={(_, newValue) => {
        if (newValue && typeof newValue !== "string" && !Array.isArray(newValue)) onChange(newValue as LeadOption);
        else if (!newValue) onChange(null);
      }}
      onInputChange={(_, inputValue, reason) => {
        // Only what the user types searches; picking a lead also fills the
        // input and must not become the search.
        if (reason === "input") setSearch(inputValue.trim());
        else if (reason === "clear") setSearch("");
      }}
      isOptionEqualToValue={sameOption}
      noOptionsText="No Contacted or Qualified leads found"
      placeholder="Select Client"
      error={Boolean(error)}
      helperText={error}
    />
  );
}

/**
 * Assign To for Admin/Manager: first 20 users, searched on the API. `current`
 * keeps the chosen user selectable when the results do not include them.
 */
export function DealAssigneePicker({
  value,
  current,
  onChange,
  error,
}: {
  value: string;
  current: PickerOption | null;
  onChange: (option: PickerOption | null) => void;
  error?: string;
}) {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search);
  const { data: usersResponse, isLoading } = useUsers(1, 20, debounced || undefined);

  const options = useMemo(() => {
    const list: PickerOption[] = (usersResponse?.data?.users ?? []).map((u) => ({ value: u.id, label: u.fullname }));
    if (current && current.value === value && !list.find((o) => o.value === current.value)) return [current, ...list];
    return list;
  }, [usersResponse, current, value]);

  return (
    <AppAutocomplete
      isBgWhite
      height="48px"
      rounded="8px"
      loading={isLoading}
      value={options.find((u) => u.value === value) || null}
      options={options}
      getOptionLabel={(option) => (typeof option === "string" ? option : option.label)}
      // The list is already the API's search result.
      filterOptions={(opts) => opts}
      onChange={(_, newValue) => {
        if (newValue && typeof newValue !== "string" && !Array.isArray(newValue)) onChange(newValue as PickerOption);
        else if (!newValue) onChange(null);
      }}
      onInputChange={(_, inputValue, reason) => {
        // Only what the user types searches; selecting an option also fills
        // the input and must not become the search.
        if (reason === "input") setSearch(inputValue.trim());
        else if (reason === "clear") setSearch("");
      }}
      isOptionEqualToValue={sameOption}
      placeholder="Select User"
      error={Boolean(error)}
      helperText={error}
    />
  );
}
