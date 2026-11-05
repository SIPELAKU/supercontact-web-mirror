"use client";

import { format } from "date-fns";
import { contactSourceLabel } from "@/lib/constants/contact-source";
import type { DuplicateContactDetails } from "@/lib/utils/contactDuplicate";

interface ExistingContactSummaryProps {
  contact: DuplicateContactDetails["existing_contact"];
}

// The contact already in the database: name, email · phone, source and date.
export const ExistingContactSummary = ({ contact }: ExistingContactSummaryProps) => {
  const reach = [contact.email, contact.phone_number].filter(Boolean).join(" · ");

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Existing contact</p>
      <p className="mt-1 font-semibold text-gray-900">{contact.name || "-"}</p>
      {reach && <p className="text-gray-700">{reach}</p>}
      <p className="mt-1 text-xs text-gray-500">
        {contactSourceLabel(contact.source)}
        {contact.created_at ? ` · created ${format(new Date(contact.created_at), "dd MMM yyyy")}` : ""}
      </p>
    </div>
  );
};
