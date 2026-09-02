"use client";

import { AppAutocomplete } from "@/components/ui/app-autocomplete";

interface KabupatenFilterSectionProps {
    selectedKabupaten: string[];
    onChange: (kabupaten: string[]) => void;
}

// Free text, unlike LocationFilterSection's fixed province list - there is
// no bounded set of kabupaten/kota to offer as options. Typing a name here
// also narrows the live Google Maps search to that place (not just the
// province), so this doubles as "search Maps for this specific kabupaten"
// alongside filtering companies already saved with it.
export default function KabupatenFilterSection({
    selectedKabupaten,
    onChange,
}: KabupatenFilterSectionProps) {
    return (
        <div className="space-y-3">
            <AppAutocomplete
                multiple
                freeSolo
                options={[]}
                label="Kabupaten/Kota"
                value={selectedKabupaten}
                onChange={(event, newValue) => {
                    onChange(newValue as string[]);
                }}
                placeholder="e.g. Kabupaten Bandung"
                helperText="Ketik nama lalu Enter - menajamkan pencarian Google Maps ke area ini."
                isBgWhite
            />
        </div>
    );
}
