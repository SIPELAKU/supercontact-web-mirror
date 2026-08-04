"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface AccountSelectOption {
  id: string;
  display_name: string;
  channel_identifier: string;
  branch?: string | null;
}

interface AccountSelectProps {
  accounts: AccountSelectOption[];
  value: string;
  onChange: (accountId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Account picker styled after components/pipeline/SelectDealStage.tsx's
// colored-pill dropdown, and the rounded-full badge language established in
// AccountStatusBadges.tsx - one consistent color (accounts aren't a fixed
// category set the way deal stages are, so no per-account color assignment).
export default function AccountSelect({
  accounts,
  value,
  onChange,
  placeholder = "Select an account",
  disabled = false,
  className,
}: AccountSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selected = accounts.find((a) => a.id === value) || null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "w-full min-h-[44px] px-3 py-2 flex items-center justify-between border rounded-lg text-left",
          disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white border-gray-300 hover:border-gray-400"
        )}
      >
        {!selected ? (
          <span className="text-sm text-gray-500">{placeholder}</span>
        ) : (
          <div className="flex flex-col items-start gap-0.5">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
              {selected.display_name}
            </span>
            <span className="text-xs text-gray-500">
              {selected.channel_identifier}
              {selected.branch ? ` · ${selected.branch}` : ""}
            </span>
          </div>
        )}
        <ChevronDown className={cn("w-4 h-4 shrink-0 text-gray-400 transition", open && "rotate-180")} />
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-2 w-full bg-white border rounded-xl shadow-lg p-2 max-h-72 overflow-auto">
          {accounts.length === 0 && (
            <div className="px-2 py-2 text-sm text-gray-500">No accounts available</div>
          )}
          {accounts.map((account) => (
            <div
              key={account.id}
              onClick={() => {
                onChange(account.id);
                setOpen(false);
              }}
              className={cn(
                "px-2 py-2 rounded-md cursor-pointer flex items-center justify-between gap-2",
                account.id === value ? "bg-gray-100" : "hover:bg-gray-50"
              )}
            >
              <div className="flex flex-col items-start gap-0.5">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                  {account.display_name}
                </span>
                <span className="text-xs text-gray-500">
                  {account.channel_identifier}
                  {account.branch ? ` · ${account.branch}` : ""}
                </span>
              </div>
              {account.id === value && <span className="text-indigo-600">✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
