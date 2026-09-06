"use client";

import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import CustomFieldsPanel from "@/components/custom-fields/CustomFieldsPanel";
import CustomFieldsReadOnly from "@/components/custom-fields/CustomFieldsReadOnly";
import { updateCrmCompanyCustomFields } from "@/lib/api/company-intelligence";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import { useAuth } from "@/lib/context/AuthContext";
import { useCustomFieldDefinitionsFor } from "@/lib/hooks/useCustomFieldDefinitions";
import { usePermission } from "@/lib/hooks/usePermission";
import { notify } from "@/lib/notifications";
import {
    customFieldErrorsByKey,
    isBlankCustomValue,
    validateCustomFieldValues,
} from "@/lib/utils/customFieldValues";

interface CrmCompanyCustomFieldsCardProps {
    crmCompanyId: string;
    values: Record<string, unknown>;
    onSaved: (values: Record<string, unknown>) => void;
}

/**
 * Tenant-defined attributes of a SAVED CRM company (entity_type
 * `crm_company`), on the Company 360 overview. Edits go through
 * PATCH .../custom-fields (merge, strict) - the module's `companies` write
 * grant; a `companies:read`-only user sees the values read-only. Nothing is
 * rendered when the tenant has defined no company fields.
 */
export default function CrmCompanyCustomFieldsCard({ crmCompanyId, values, onSaved }: CrmCompanyCustomFieldsCardProps) {
    const { getToken } = useAuth();
    const { can } = usePermission();
    const canEdit = can("companies");
    const { definitions, isLoading } = useCustomFieldDefinitionsFor("crm_company");

    const [draft, setDraft] = useState<Record<string, unknown>>(values);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    // A reload of the profile (or a save) is the new baseline.
    useEffect(() => {
        setDraft(values);
        setErrors({});
    }, [values]);

    const dirty = useMemo(() => {
        const keys = new Set([...Object.keys(draft), ...Object.keys(values)]);
        for (const key of keys) {
            if (JSON.stringify(draft[key] ?? null) !== JSON.stringify(values[key] ?? null)) return true;
        }
        return false;
    }, [draft, values]);

    if (isLoading || definitions.length === 0) return null;

    const handleSave = async () => {
        const result = validateCustomFieldValues(definitions, draft, {
            entityType: "crm_company",
            mode: "strict",
            enforceRequired: true,
            // A key left by a DEACTIVATED definition is part of the seeded
            // draft with no control to clear it; it is not "unknown".
            storedValues: values,
        });
        const clientErrors = customFieldErrorsByKey(result.errors);
        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }
        // Only defined keys travel; a cleared value is sent as null so the
        // server-side merge actually clears it.
        const payload: Record<string, unknown> = {};
        for (const def of definitions) {
            const value = result.values[def.field_key];
            payload[def.field_key] = isBlankCustomValue(value) ? null : value;
        }
        setSaving(true);
        try {
            const token = await getToken();
            const saved = await updateCrmCompanyCustomFields(token, crmCompanyId, payload);
            setErrors({});
            onSaved(saved?.custom_fields ?? payload);
            notify.success("Atribut perusahaan disimpan");
        } catch (error: any) {
            const fe = extractFieldErrors(error);
            const known = Object.keys(fe).filter((k) => k !== "_");
            if (known.length > 0) setErrors(fe);
            if (known.length === 0 || fe._) {
                notify.error("Gagal menyimpan atribut", { description: fe._ ?? error?.message });
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h4 className="text-xs font-bold uppercase text-gray-400">Atribut perusahaan</h4>
                {canEdit && (
                    <AppButton
                        size="small"
                        onClick={handleSave}
                        disabled={!dirty || saving}
                        isLoading={saving}
                        startIcon={<Save size={14} />}
                    >
                        Simpan
                    </AppButton>
                )}
            </div>
            {canEdit ? (
                <CustomFieldsPanel
                    entityType="crm_company"
                    definitions={definitions}
                    values={draft}
                    onChange={(key, value) => {
                        setDraft((prev) => ({ ...prev, [key]: value }));
                        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
                    }}
                    showRequiredMarkers
                    errors={errors}
                />
            ) : (
                <CustomFieldsReadOnly
                    entityType="crm_company"
                    definitions={definitions}
                    values={values}
                    className="space-y-1 text-sm text-gray-700"
                />
            )}
        </div>
    );
}
