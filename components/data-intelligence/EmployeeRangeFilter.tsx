"use client";

import { Users } from "lucide-react";
import Slider from "@mui/material/Slider";

interface EmployeeRangeFilterProps {
    min: number;
    max: number;
    onChange: (range: { min: number; max: number }) => void;
}

export default function EmployeeRangeFilter({
    min,
    max,
    onChange,
}: EmployeeRangeFilterProps) {
    const handleChange = (event: Event, newValue: number | number[]) => {
        if (Array.isArray(newValue)) {
            onChange({ min: newValue[0], max: newValue[1] });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Users className="text-[#5479EE]" size={24} />
                <h3 className="text-base font-semibold text-gray-800">
                    Jumlah Karyawan ({min} - {max})
                </h3>
            </div>

            <div className="px-2">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600">
                        <span className="font-medium">Min</span>
                        <div className="mt-1 flex items-center justify-center rounded-md bg-gray-800 px-3 py-1.5 text-white font-semibold">
                            {min}
                        </div>
                    </div>
                    <div className="text-sm text-gray-600">
                        <span className="font-medium">Max</span>
                        <div className="mt-1 flex items-center justify-center rounded-md bg-gray-800 px-3 py-1.5 text-white font-semibold">
                            {max}
                        </div>
                    </div>
                </div>

                <Slider
                    value={[min, max]}
                    onChange={handleChange}
                    min={0}
                    max={1500}
                    step={50}
                    valueLabelDisplay="auto"
                    sx={{
                        color: "#5479EE",
                        "& .MuiSlider-thumb": {
                            width: 20,
                            height: 20,
                            backgroundColor: "#fff",
                            border: "2px solid #5479EE",
                            "&:hover, &.Mui-focusVisible": {
                                boxShadow: "0 0 0 8px rgba(84, 121, 238, 0.16)",
                            },
                        },
                        "& .MuiSlider-track": {
                            height: 4,
                            backgroundColor: "#5479EE",
                        },
                        "& .MuiSlider-rail": {
                            height: 4,
                            backgroundColor: "#E5E7EB",
                        },
                    }}
                />
            </div>
        </div>
    );
}
