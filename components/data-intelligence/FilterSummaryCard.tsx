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
            <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-[#DDE4FC] p-3">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-[#5479EE]"
                    >
                        <path
                            d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"
                            fill="currentColor"
                            opacity="0.3"
                        />
                    </svg>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-600">ESTIMASI HASIL</h3>
                    <p className="text-2xl font-bold text-gray-900">
                        {estimatedCount}{" "}
                        <span className="text-base font-normal text-gray-600">
                            Perusahaan
                        </span>
                    </p>
                </div>
            </div>

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
