"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { AppInput } from "@/components/ui/app-input";

interface IndustryFilterSectionProps {
    selectedIndustries: string[];
    onChange: (industries: string[]) => void;
}

export default function IndustryFilterSection({
    selectedIndustries,
    onChange,
}: IndustryFilterSectionProps) {
    const [inputValue, setInputValue] = useState("");

    const handleAddIndustry = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault();
            if (!selectedIndustries.includes(inputValue.trim())) {
                onChange([...selectedIndustries, inputValue.trim()]);
            }
            setInputValue("");
        }
    };

    const handleRemoveIndustry = (industry: string) => {
        onChange(selectedIndustries.filter((item) => item !== industry));
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-[#5479EE]"
                >
                    <path
                        d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"
                        fill="currentColor"
                        opacity="0.3"
                    />
                </svg>
                <h3 className="text-base font-semibold text-gray-800">Industri</h3>
            </div>

            <div className="flex flex-wrap gap-2">
                {selectedIndustries.map((industry) => (
                    <div
                        key={industry}
                        className="flex items-center gap-1.5 rounded-full bg-[#DDE4FC] px-3 py-1.5 text-sm font-medium text-[#5479EE]"
                    >
                        <span>{industry}</span>
                        <button
                            onClick={() => handleRemoveIndustry(industry)}
                            className="hover:bg-[#5479EE]/10 rounded-full p-0.5 transition-colors"
                            aria-label={`Remove ${industry}`}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
                <AppInput
                    placeholder="e.g., Logistik..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleAddIndustry}
                    isBgWhite
                    height="36px"
                    width="200px"
                    className="min-w-[200px]"
                />
            </div>
        </div>
    );
}
