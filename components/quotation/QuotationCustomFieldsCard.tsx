"use client";

import CustomFieldsPanel from "@/components/custom-fields/CustomFieldsPanel";
import type { CustomFieldDefinitionLike } from "@/lib/types/CustomFieldDefinition";

interface QuotationCustomFieldsCardProps {
  values: Record<string, unknown>;
  onChange: (fieldKey: string, value: unknown) => void;
  /** The tenant's active `quotation` definitions; the card is hidden when there are none. */
  definitions: CustomFieldDefinitionLike[];
  /** Current quotation status - the one built-in a quotation clause may reference. */
  status: string;
  /** `{ field_key: message }` plus `custom_fields` / `_` from the API's header errors. */
  errors?: Record<string, string>;
  readOnly?: boolean;
}

/**
 * Header-level custom fields (spec A8/I9): strict against the tenant's
 * `quotation` definitions, sent as the multipart `custom_fields` JSON string.
 * Rendered after the terms card; nothing at all when the tenant has defined
 * no quotation fields, divider included.
 */
export default function QuotationCustomFieldsCard({
  values,
  onChange,
  definitions,
  status,
  errors,
  readOnly = false,
}: QuotationCustomFieldsCardProps) {
  if (definitions.length === 0) return null;
  const generalError = errors?.custom_fields ?? errors?._;

  return (
    <>
      <div className="w-full border-t border-dashed border-gray-300 my-8 dash-large" />
      <div className="bg-white p-6 space-y-4">
        <h2 className="text-base font-semibold">Field tambahan</h2>
        {generalError && (
          <p className="text-xs text-red-600" role="alert">
            {generalError}
          </p>
        )}
        <CustomFieldsPanel
          entityType="quotation"
          definitions={definitions}
          values={values}
          onChange={onChange}
          builtInValues={{ quotation_status: status }}
          showRequiredMarkers
          readOnly={readOnly}
          errors={errors}
        />
      </div>
    </>
  );
}
