"use client";

import { MapPin, X } from "lucide-react";
import { useState } from "react";
import { AppInput } from "@/components/ui/app-input";

interface LocationFilterSectionProps {
    selectedLocations: string[];
    onChange: (locations: string[]) => void;
}

export default function LocationFilterSection({
    selectedLocations,
    onChange,
}: LocationFilterSectionProps) {
    const [inputValue, setInputValue] = useState("");

    const handleAddLocation = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault();
            if (!selectedLocations.includes(inputValue.trim())) {
                onChange([...selectedLocations, inputValue.trim()]);
            }
            setInputValue("");
        }
    };

    const handleRemoveLocation = (location: string) => {
        onChange(selectedLocations.filter((item) => item !== location));
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <MapPin className="text-[#5479EE]" size={24} />
                <h3 className="text-base font-semibold text-gray-800">Lokasi</h3>
            </div>

            <div className="flex flex-wrap gap-2">
                {selectedLocations.map((location) => (
                    <div
                        key={location}
                        className="flex items-center gap-1.5 rounded-full bg-[#DDE4FC] px-3 py-1.5 text-sm font-medium text-[#5479EE]"
                    >
                        <span>{location}</span>
                        <button
                            onClick={() => handleRemoveLocation(location)}
                            className="hover:bg-[#5479EE]/10 rounded-full p-0.5 transition-colors"
                            aria-label={`Remove ${location}`}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
                <AppInput
                    placeholder="e.g., Jabodetabek"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleAddLocation}
                    isBgWhite
                    height="36px"
                    width="200px"
                    className="min-w-[200px]"
                />
            </div>
        </div>
    );
}
