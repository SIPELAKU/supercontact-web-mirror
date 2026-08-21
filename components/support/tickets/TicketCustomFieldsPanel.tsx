import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { Label } from "@/components/ui/label";
import { useTicketCustomFields } from "@/lib/hooks/useTicketCustomFields";
import {
    buildVisibilityValues,
    isFieldVisible,
} from "@/lib/utils/ticketFieldVisibility";

interface TicketCustomFieldsPanelProps {
    values: Record<string, any>;
    onChange: (fieldKey: string, value: any) => void;
    // Inc 4: current built-in ticket field values (type/priority/status) so a
    // custom field's visibility condition can be evaluated reactively as the user
    // edits the ticket. Omitted on read-only surfaces => built-ins treated as empty.
    builtInValues?: { type?: any; priority?: any; status?: any };
}

// One control per active TicketCustomFieldDefinition, keyed by field_type -
// used in both the create/edit form and the (read) detail page overview.
export default function TicketCustomFieldsPanel({ values, onChange, builtInValues }: TicketCustomFieldsPanelProps) {
    const { data, isLoading } = useTicketCustomFields();
    const definitions = data?.data?.data || [];

    // Flat map the visibility evaluator compares against: built-in ticket fields
    // plus the current custom-field values, both keyed by their reference name.
    const visibilityValues = buildVisibilityValues(builtInValues || {}, values);
    const visibleDefinitions = definitions.filter((def) =>
        isFieldVisible(def.visibility_condition ?? null, visibilityValues)
    );

    if (isLoading || visibleDefinitions.length === 0) return null;

    return (
        <div className="space-y-4">
            {visibleDefinitions.map((def) => {
                const value = values?.[def.field_key];
                return (
                    <div key={def.id} className="space-y-2">
                        <Label className="font-bold text-gray-800 text-base">
                            {def.label}
                            {def.is_required && <span className="text-red-500"> *</span>}
                        </Label>
                        {def.field_type === "text" && (
                            <AppInput
                                isBgWhite
                                value={value ?? ""}
                                onChange={(e) => onChange(def.field_key, e.target.value)}
                            />
                        )}
                        {def.field_type === "number" && (
                            <AppInput
                                isBgWhite
                                type="number"
                                value={value ?? ""}
                                onChange={(e) =>
                                    onChange(def.field_key, e.target.value === "" ? null : Number(e.target.value))
                                }
                            />
                        )}
                        {def.field_type === "date" && (
                            <input
                                type="date"
                                value={value ?? ""}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    onChange(def.field_key, e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#5479EE] focus:outline-none"
                            />
                        )}
                        {def.field_type === "boolean" && (
                            <input
                                type="checkbox"
                                checked={!!value}
                                onChange={(e) => onChange(def.field_key, e.target.checked)}
                                className="h-4 w-4"
                            />
                        )}
                        {def.field_type === "select" && (
                            <AppSelect
                                isBgWhite
                                fullWidth
                                value={value ?? ""}
                                options={(def.select_options || []).map((opt) => ({ value: opt, label: opt }))}
                                onChange={(e) => onChange(def.field_key, e.target.value)}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
