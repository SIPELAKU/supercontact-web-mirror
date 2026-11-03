"use client";

import { useState } from "react";
import { AppInput } from "@/components/ui/app-input";
import type { BlueprintVariable } from "@/lib/types/IndustryBlueprint";

/** One Setup Cepat data field, the same in the company data and the KB
 *  section: the unit sits next to the input (the value is the number only -
 *  the template writes "{{BATAS_HARI_RETUR}} hari"), and a required field
 *  says so once the admin has left it blank. */
export default function BlueprintVariableField({
    variable,
    value,
    onChange,
}: {
    variable: BlueprintVariable;
    value: string;
    onChange: (value: string) => void;
}) {
    const [touched, setTouched] = useState(false);
    const missing = !!variable.required && touched && !value.trim();

    return (
        <div>
            <label className="mb-1 block text-xs font-medium">
                {variable.label || variable.key}
                {variable.required && <span className="ml-0.5 text-red-600">*</span>}
            </label>
            <AppInput
                value={value}
                placeholder={variable.example || variable.key}
                onChange={(e) => onChange(e.target.value)}
                onBlur={() => setTouched(true)}
                inputProps={variable.type === "number" ? { inputMode: "numeric" } : undefined}
                endIcon={
                    variable.unit ? (
                        <span className="whitespace-nowrap text-sm text-muted-foreground">{variable.unit}</span>
                    ) : undefined
                }
                error={missing}
                helperText={missing ? "Wajib diisi" : undefined}
            />
        </div>
    );
}
