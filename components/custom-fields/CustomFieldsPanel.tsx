"use client";

import { useMemo } from "react";
import type {
  CustomFieldDefinitionLike,
  CustomFieldEntityType,
} from "@/lib/types/CustomFieldDefinition";
import { useCustomFieldDefinitionsFor } from "@/lib/hooks/useCustomFieldDefinitions";
import { buildEntityVisibilityValues, isFieldVisible } from "@/lib/utils/customFieldVisibility";
import CustomFieldControl from "./CustomFieldControl";

export interface CustomFieldsPanelProps {
  entityType: CustomFieldEntityType;
  values: Record<string, unknown> | null | undefined;
  onChange: (fieldKey: string, value: unknown) => void;
  /** The entity's built-in values (product_type/status, quotation_status) for visibility. */
  builtInValues?: Record<string, unknown> | null;
  readOnly?: boolean;
  /** Inject to skip the fetch (a parent that already holds them, or a test). */
  definitions?: CustomFieldDefinitionLike[];
  showRequiredMarkers?: boolean;
  /** `{ field_key: message }`; `custom_fields` is shown at the top of the panel. */
  errors?: Record<string, string>;
  title?: string;
  className?: string;
}

/**
 * The generic custom-field form section: one control per ACTIVE definition
 * of `entityType` whose visibility condition passes against the current
 * values. Renders nothing while loading and nothing when no field is
 * visible, so a tenant without definitions never sees an empty heading -
 * EXCEPT the panel-level `custom_fields` error, which is shown even with no
 * visible control so a server refusal is never silent.
 */
export default function CustomFieldsPanel({
  entityType,
  values,
  onChange,
  builtInValues,
  readOnly,
  definitions,
  showRequiredMarkers,
  errors,
  title,
  className,
}: CustomFieldsPanelProps) {
  const fetched = useCustomFieldDefinitionsFor(entityType, { enabled: !definitions });
  const defs = definitions ?? fetched.definitions;

  const visible = useMemo(() => {
    const visibilityValues = buildEntityVisibilityValues(entityType, builtInValues, values ?? {});
    return defs
      .filter((d) => d.is_active !== false)
      .filter((d) => isFieldVisible(d.visibility_condition ?? null, visibilityValues));
  }, [defs, entityType, builtInValues, values]);

  if (!definitions && fetched.isLoading) return null;
  const panelError = errors?.custom_fields;
  if (visible.length === 0 && !panelError) return null;

  return (
    <div className={className ?? "space-y-4"}>
      {title && <h3 className="text-sm font-semibold text-gray-700">{title}</h3>}
      {panelError && (
        <p className="text-xs text-red-600" role="alert">
          {panelError}
        </p>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {visible.map((def) => (
          <CustomFieldControl
            key={def.field_key}
            definition={def}
            value={values?.[def.field_key]}
            onChange={(next) => onChange(def.field_key, next)}
            error={errors?.[def.field_key]}
            disabled={readOnly}
            showRequiredMarker={showRequiredMarkers}
          />
        ))}
      </div>
    </div>
  );
}
