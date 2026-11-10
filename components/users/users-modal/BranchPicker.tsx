"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import useDepartments from "@/lib/hooks/useDepartments";
import { usePermission } from "@/lib/hooks/usePermission";
import { branchOptions, findBranch, hasBranches } from "@/lib/utils/branchOptions";

interface BranchPickerProps {
  /** One of the fixed department names; empty until chosen. */
  department: string;
  /** The branch name shown in the field. */
  value: string;
  /** The department record of the chosen branch; empty while none is chosen. */
  selectedId: string;
  onChange: (branch: string, departmentId: string) => void;
}

// The Branch field of Add User and Edit User: the department's branches show
// as soon as the field is clicked, typing narrows them, and "+ Add branch"
// creates a new one (a department record with this department and branch).
export function BranchPicker({ department, value, selectedId, onChange }: BranchPickerProps) {
  const { can } = usePermission();
  const canAdd = can("departments:manage");
  const { departments, addDepartment, isAdding } = useDepartments(0, 100, "", { department });

  const [open, setOpen] = useState(false);
  // What was typed since the list opened; null shows the whole list.
  const [query, setQuery] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const close = () => {
    setOpen(false);
    setQuery(null);
    setAdding(false);
    setAddError(null);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // A typed name that is an existing branch counts as chosen, also once a new
  // branch shows up after it was added.
  useEffect(() => {
    if (!value || selectedId) return;
    const match = findBranch(departments, department, value);
    if (match) onChangeRef.current(match.branch, match.id);
  }, [departments, department, value, selectedId]);

  const { items, more } = branchOptions(departments, department, query ?? "");

  const choose = (branch: string, id: string) => {
    onChange(branch, id);
    close();
  };

  const startAdding = () => {
    setNewName(query ?? "");
    setAddError(null);
    setAdding(true);
  };

  const submitNew = async () => {
    const name = newName.trim();
    if (!name || isAdding) return;
    if (findBranch(departments, department, name)) {
      setAddError(`${name} already exists in ${department}.`);
      return;
    }
    try {
      const res = await addDepartment({ department, branch: name });
      const id = (res?.data as { id?: string } | undefined)?.id ?? "";
      choose(name, id);
    } catch (error) {
      setAddError(error instanceof Error ? error.message : "Failed to add the branch");
    }
  };

  const disabled = !department;

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="text-sm font-medium">Branch</label>
      <div className="relative mt-2">
        <AppInput
          startIcon={<Search size={18} />}
          placeholder={disabled ? "Select department first" : "Search for a branch"}
          value={query ?? value}
          disabled={disabled}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            onChange(e.target.value, "");
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
            // Enter must not submit the whole user form.
            if (e.key === "Enter") e.preventDefault();
          }}
          isBgWhite
          autoComplete="off"
        />
        {open && !disabled && (
          <div className="absolute z-1500 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="max-h-60 overflow-y-auto">
              {items.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => choose(row.branch, row.id)}
                  className="block w-full border-b border-gray-100 px-4 py-3 text-left text-gray-900 last:border-b-0 hover:bg-gray-50"
                >
                  {row.branch}
                </button>
              ))}
              {items.length === 0 && (
                <p className="px-4 py-3 text-sm text-gray-500">
                  {hasBranches(departments, department)
                    ? `No branch matches "${(query ?? "").trim()}"`
                    : `No branches in ${department} yet`}
                </p>
              )}
              {more > 0 && (
                <p className="px-4 py-2 text-xs text-gray-400">Type to find {more} more</p>
              )}
            </div>

            <div className="border-t border-gray-200 p-3">
              {!canAdd ? (
                <p className="text-xs text-gray-500">Ask an admin to add a branch in Settings › Organization.</p>
              ) : !adding ? (
                <button
                  type="button"
                  onClick={startAdding}
                  className="flex items-center gap-1.5 text-sm font-medium text-[#5479EE] hover:underline"
                >
                  <Plus size={16} /> Add branch
                </button>
              ) : (
                <div className="space-y-2">
                  <AppInput
                    autoFocus
                    placeholder="Branch name"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      setAddError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void submitNew();
                      }
                      if (e.key === "Escape") {
                        e.stopPropagation();
                        setAdding(false);
                      }
                    }}
                    isBgWhite
                    autoComplete="off"
                  />
                  {addError && <p className="text-xs text-red-500">{addError}</p>}
                  <div className="flex justify-end gap-2">
                    <AppButton variantStyle="outline" size="small" onClick={() => setAdding(false)}>
                      Cancel
                    </AppButton>
                    <AppButton
                      variantStyle="primary"
                      size="small"
                      onClick={() => void submitNew()}
                      disabled={!newName.trim() || isAdding}
                    >
                      {isAdding ? "Adding..." : "Add"}
                    </AppButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
