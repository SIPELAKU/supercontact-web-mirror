"use client";

import type { CustomFieldDefinitionLike, CustomFieldEntityType } from "@/lib/types/CustomFieldDefinition";
import { useCustomFieldDefinitionsFor } from "@/lib/hooks/useCustomFieldDefinitions";
import { formatCustomFieldValue, isBlankCustomValue } from "@/lib/utils/customFieldValues";

interface CustomFieldsReadOnlyProps {
  entityType: CustomFieldEntityType;
  values: Record<string, unknown> | null | undefined;
  /** Inject to skip the fetch - the PDF template passes them so capture never waits. */
  definitions?: CustomFieldDefinitionLike[];
  className?: string;
  /** Inline style for the PDF capture region (html2canvas needs explicit colours). */
  style?: React.CSSProperties;
}

/**
 * `label: value` for every defined key that holds a value, in display order.
 * Read-only by design: on a quotation line a product attribute is shown, never
 * edited and never priced (spec A8). Prints nothing when nothing is set.
 */
export default function CustomFieldsReadOnly({
  entityType,
  values,
  definitions,
  className,
  style,
}: CustomFieldsReadOnlyProps) {
  const fetched = useCustomFieldDefinitionsFor(entityType, { enabled: !definitions });
  const defs = definitions ?? fetched.definitions;

  const rows = defs
    .filter((d) => d.is_active !== false)
    .map((d) => ({ key: d.field_key, label: d.label, value: values?.[d.field_key], type: d.field_type }))
    .filter((row) => !isBlankCustomValue(row.value));

  if (rows.length === 0) return null;

  return (
    <dl className={className ?? "mt-1 space-y-0.5 text-xs text-gray-600"} style={style}>
      {rows.map((row) => (
        <div key={row.key} className="flex gap-1">
          <dt className="shrink-0">{row.label}:</dt>
          <dd className="min-w-0 break-words font-medium">{formatCustomFieldValue(row.value, row.type)}</dd>
        </div>
      ))}
    </dl>
  );
}
