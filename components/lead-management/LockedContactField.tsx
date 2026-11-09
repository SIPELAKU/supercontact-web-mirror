"use client";

import { Label } from "@/components/ui/label";
import { AppInput } from "@/components/ui/app-input";

export const LOCKED_FIELD_LABELS = {
  name: "Name",
  email: "Email",
  phone_number: "Phone Number",
  company: "Company",
} as const;

// A contact field shown read-only on the lead forms (BO request 2026-11-04).
// The API stores none of them on the lead: POST/PUT /leads take only
// `contact_id`, so an edit here was silently dropped. Same look as the deal
// form's LockedField.
export const LockedContactField = ({
  label,
  value,
  placeholder,
  helperText = "From the contact. Edit it in Contacts.",
}: {
  label: string;
  value: string;
  placeholder?: string;
  helperText?: string;
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-gray-700">{label}</Label>
    <AppInput
      disabled
      readOnly
      value={value}
      placeholder={placeholder}
      helperText={helperText}
      isBgWhite
      height="48px"
      rounded="8px"
    />
  </div>
);
