import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { Label } from "@/components/ui/label";
import { useTicketCustomFields } from "@/lib/hooks/useTicketCustomFields";

interface TicketCustomFieldsPanelProps {
    values: Record<string, any>;
    onChange: (fieldKey: string, value: any) => void;
}

// One control per active TicketCustomFieldDefinition, keyed by field_type -
// used in both the create/edit form and the (read) detail page overview.
export default function TicketCustomFieldsPanel({ values, onChange }: TicketCustomFieldsPanelProps) {
    const { data, isLoading } = useTicketCustomFields();
    const definitions = data?.data?.data || [];

    if (isLoading || definitions.length === 0) return null;

    return (
        <div className="space-y-4">
            {definitions.map((def) => {
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
