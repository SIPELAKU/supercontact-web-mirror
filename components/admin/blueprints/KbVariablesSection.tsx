"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { AppInput } from "@/components/ui/app-input";
import type { BlueprintVariable } from "@/lib/types/IndustryBlueprint";
import { filledCount } from "./kbVariables";

/** The KB packs' own fields, asked next to the company data. Optional and
 *  folded by default: there can be ~80 of them, and anything left blank is
 *  still offered in the Checklist Aktivasi panel after the install. */
export default function KbVariablesSection({
    fields,
    values,
    onChange,
}: {
    fields: BlueprintVariable[];
    values: Record<string, string>;
    onChange: (key: string, value: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const filled = filledCount(fields, values);
    const Chevron = open ? ChevronDown : ChevronRight;

    return (
        <section className="rounded-lg border">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                className="flex w-full items-center gap-2 px-4 py-3 text-left"
            >
                <Chevron className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 font-medium">Data untuk artikel Knowledge Base (opsional)</span>
                <span className="text-xs text-muted-foreground">
                    {filled} dari {fields.length} terisi
                </span>
            </button>
            {open && (
                <div className="border-t px-4 py-3">
                    <p className="mb-3 text-sm text-muted-foreground">
                        Artikel Knowledge Base dari blueprint ini memakai data berikut, misalnya
                        alamat dan link Google Maps. Yang dikosongkan tetap terlihat sebagai{" "}
                        <code className="rounded bg-muted px-1">{"{{TANDA}}"}</code> dan bisa
                        dilengkapi nanti di tab Checklist Aktivasi. Teks abu-abu hanya contoh.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {fields.map((v) => (
                            <div key={v.key}>
                                <label className="mb-1 block text-xs font-medium">{v.label || v.key}</label>
                                <AppInput
                                    value={values[v.key] || ""}
                                    placeholder={v.example || v.key}
                                    onChange={(e) => onChange(v.key, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
