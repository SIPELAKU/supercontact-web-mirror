"use client";

import IndustryFilterSection from "@/components/data-intelligence/IndustryFilterSection";
import LocationFilterSection from "@/components/data-intelligence/LocationFilterSection";
import EmployeeRangeFilter from "@/components/data-intelligence/EmployeeRangeFilter";
import FinancialStatusFilter from "@/components/data-intelligence/FinancialStatusFilter";
import ReachabilityFilter from "@/components/data-intelligence/ReachabilityFilter";
import ConfidenceFilter from "@/components/data-intelligence/ConfidenceFilter";
import { FilterCriteria } from "@/lib/types/IndustryLeader";

interface CompanyFilterRailProps {
    // "discover" shows every facet (this is where you're finding new
    // companies external providers know about); "saved" only shows what
    // GET /my-target-companies can actually filter on server-side
    // (Industry/Location) - Employee Range/Financial Status/Reachability
    // have no equivalent on that endpoint, so showing them there would be
    // a filter that silently does nothing.
    mode: "discover" | "saved";
    filterCriteria: FilterCriteria;
    onChange: (criteria: FilterCriteria) => void;
}

export default function CompanyFilterRail({ mode, filterCriteria, onChange }: CompanyFilterRailProps) {
    return (
        <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-400">Filters</h3>

            <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-500">Industry</span>
                <IndustryFilterSection
                    selectedIndustries={filterCriteria.industries}
                    onChange={(industries) => onChange({ ...filterCriteria, industries })}
                />
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-4">
                <span className="text-xs font-semibold text-gray-500">Location</span>
                <LocationFilterSection
                    selectedLocations={filterCriteria.locations}
                    onChange={(locations) => onChange({ ...filterCriteria, locations })}
                />
            </div>

            {mode === "discover" && (
                <>
                    <div className="border-t border-gray-100 pt-4">
                        <EmployeeRangeFilter
                            min={filterCriteria.employeeRange.min}
                            max={filterCriteria.employeeRange.max}
                            onChange={(employeeRange) => onChange({ ...filterCriteria, employeeRange })}
                        />
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <FinancialStatusFilter
                            selectedStatuses={filterCriteria.financialStatuses}
                            onChange={(financialStatuses) => onChange({ ...filterCriteria, financialStatuses })}
                        />
                    </div>

                    <div className="space-y-4 border-t border-gray-100 pt-4">
                        <ReachabilityFilter
                            hasPhone={filterCriteria.hasPhone}
                            hasDomain={filterCriteria.hasDomain}
                            excludeSaved={filterCriteria.excludeSaved}
                            onChange={({ hasPhone, hasDomain, excludeSaved }) =>
                                onChange({ ...filterCriteria, hasPhone, hasDomain, excludeSaved })
                            }
                        />
                        <ConfidenceFilter
                            minConfidence={filterCriteria.minConfidence}
                            onChange={(minConfidence) => onChange({ ...filterCriteria, minConfidence })}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
