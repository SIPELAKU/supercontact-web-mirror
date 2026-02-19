"use client";

import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import { INDUSTRY_OPTIONS } from "@/lib/data/company-intelligence-options";

interface IndustryFilterSectionProps {
    selectedIndustries: string[];
    onChange: (industries: string[]) => void;
}

export default function IndustryFilterSection({
    selectedIndustries,
    onChange,
}: IndustryFilterSectionProps) {
    return (
        <div className="space-y-3">
            <AppAutocomplete
                multiple
                label="Industri"
                options={INDUSTRY_OPTIONS}
                value={selectedIndustries}
                onChange={(event, newValue) => {
                    onChange(newValue);
                }}
                placeholder="e.g. Technology"
                isBgWhite
            />
        </div>
    );
}
