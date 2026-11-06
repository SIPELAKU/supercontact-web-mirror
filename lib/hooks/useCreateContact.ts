// lib/hooks/useCreateContact.ts
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { createContact } from "@/lib/api/contacts";
import { notify } from "@/lib/notifications";
import type {
  CreateContactResult,
  DuplicateContactDetails,
  DuplicateResolution,
} from "@/lib/utils/contactDuplicate";

type SavedResult = Extract<CreateContactResult, { kind: "created" | "merged" }>;

/**
 * POST /contacts with the duplicate dialog flow (BE-1.3), shared by Add
 * Contact and the Omnichannel new-contact form.
 *
 * `submit(body)` answers what the form shows next: a saved contact goes to
 * `onSaved`; a 409 keeps the body and fills `duplicate` (render
 * DuplicateContactDialog from it); any other refusal is returned for the form
 * to report its own way. `resolve` re-sends that same body with the user's
 * answer.
 */
export function useCreateContact(onSaved: (result: SavedResult) => void) {
  const { getToken } = useAuth();
  const [pending, setPending] = useState<{
    body: Record<string, unknown>;
    duplicate: DuplicateContactDetails;
  } | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const send = async (body: Record<string, unknown>): Promise<CreateContactResult> => {
    const token = await getToken();
    if (!token) return { kind: "error", status: 401, message: "UNAUTHORIZED" };
    return createContact(token, body);
  };

  const submit = async (body: Record<string, unknown>): Promise<CreateContactResult> => {
    const result = await send(body);
    if (result.kind === "duplicate") setPending({ body, duplicate: result.duplicate });
    else if (result.kind !== "error") onSaved(result);
    return result;
  };

  const resolve = async (resolution: DuplicateResolution) => {
    if (!pending) return;
    setIsResolving(true);
    try {
      const result = await send({ ...pending.body, duplicate_resolution: resolution });
      if (result.kind === "duplicate") {
        // The existing contact changed (or was merged away) since the dialog
        // opened: ask again with its current data.
        setPending({ body: pending.body, duplicate: result.duplicate });
        notify.warning("The existing contact has changed", {
          description: "Review the fields again with its latest data.",
        });
      } else if (result.kind === "error") {
        notify.error("Failed to save contact", { description: result.message });
      } else {
        setPending(null);
        onSaved(result);
      }
    } catch (error: any) {
      notify.error("Failed to save contact", { description: error?.message });
    } finally {
      setIsResolving(false);
    }
  };

  return {
    submit,
    resolve,
    duplicate: pending?.duplicate ?? null,
    cancelDuplicate: () => setPending(null),
    isResolving,
  };
}

/** The toast for a saved contact: a merge is not a new contact. */
export function contactSavedToast(kind: SavedResult["kind"]) {
  return kind === "merged"
    ? { title: "Contact already exists", description: "Empty fields of the existing contact were filled in." }
    : { title: "Contact added!", description: "Contact has been added successfully" };
}
