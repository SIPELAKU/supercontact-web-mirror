"use client";

import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import { LOCATION_OPTIONS } from "@/lib/data/company-intelligence-options";

interface LocationFilterSectionProps {
    selectedLocations: string[];
    onChange: (locations: string[]) => void;
}

export default function LocationFilterSection({
    selectedLocations,
    onChange,
}: LocationFilterSectionProps) {
    return (
        <div className="space-y-3">
            <AppAutocomplete
                multiple
                label="Lokasi"
                options={LOCATION_OPTIONS}
                value={selectedLocations}
                onChange={(event, newValue) => {
                    onChange(newValue);
                }}
                placeholder="e.g. Jakarta"
                isBgWhite
            />
        </div>
    );
}
