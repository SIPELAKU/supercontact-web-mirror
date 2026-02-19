"use client";

import { ArrowRight } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { FilterCriteria } from "@/lib/types/IndustryLeader";

interface FilterSummaryCardProps {
    filterCriteria: FilterCriteria;
    estimatedCount: number;
    onViewResults: () => void;
}

export default function FilterSummaryCard({
    filterCriteria,
    estimatedCount,
    onViewResults,
}: FilterSummaryCardProps) {
    return (
        <div className="sticky top-6 rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            {/* ESTIMASI HASIL section removed */}

            <div className="space-y-4">
                {/* Industry Summary */}
                {filterCriteria.industries.length > 0 && (
                    <div>
                        <h4 className="mb-2 text-sm font-semibold text-gray-700">
                            Industri
                        </h4>
                        <p className="text-sm text-gray-600">
                            {filterCriteria.industries.join(", ")}
                        </p>
                    </div>
                )}

                {/* Location Summary */}
                {filterCriteria.locations.length > 0 && (
                    <div>
                        <h4 className="mb-2 text-sm font-semibold text-gray-700">Lokasi</h4>
                        <p className="text-sm text-gray-600">
                            {filterCriteria.locations.join(", ")}
                        </p>
                    </div>
                )}

                {/* Employee Range Summary */}
                <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">
                        Karyawan
                    </h4>
                    <p className="text-sm text-gray-600">
                        {filterCriteria.employeeRange.min} -{" "}
                        {filterCriteria.employeeRange.max}
                    </p>
                </div>

                {/* Financial Status Summary */}
                {filterCriteria.financialStatuses.length > 0 && (
                    <div>
                        <h4 className="mb-2 text-sm font-semibold text-gray-700">
                            Finansial
                        </h4>
                        <p className="text-sm text-gray-600">
                            {filterCriteria.financialStatuses.join(", ")}
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-6">
                <AppButton
                    variantStyle="primary"
                    fullWidth
                    endIcon={<ArrowRight size={20} />}
                    onClick={onViewResults}
                >
                    Temukan Perusahaan
                </AppButton>
            </div>
        </div>
    );
}
