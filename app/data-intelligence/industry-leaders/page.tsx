"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/page-header";
import IndustryFilterSection from "@/components/data-intelligence/IndustryFilterSection";
import LocationFilterSection from "@/components/data-intelligence/LocationFilterSection";
import EmployeeRangeFilter from "@/components/data-intelligence/EmployeeRangeFilter";
import FinancialStatusFilter from "@/components/data-intelligence/FinancialStatusFilter";
import FilterSummaryCard from "@/components/data-intelligence/FilterSummaryCard";
import {
    FilterCriteria,
    DEFAULT_FILTER_CRITERIA,
} from "@/lib/types/IndustryLeader";
import { industryLeadersCompanies } from "@/lib/data/industry-leaders-companies";

export default function IndustryLeadersPage() {
    const router = useRouter();
    const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>(
        DEFAULT_FILTER_CRITERIA
    );

    // Calculate estimated count based on filters
    const estimatedCount = useMemo(() => {
        return industryLeadersCompanies.filter((company) => {
            // Industry filter
            const matchesIndustry =
                filterCriteria.industries.length === 0 ||
                filterCriteria.industries.some((industry) =>
                    company.industries.some(
                        (companyIndustry) =>
                            companyIndustry.toLowerCase() === industry.toLowerCase()
                    )
                );

            // Location filter
            const matchesLocation =
                filterCriteria.locations.length === 0 ||
                filterCriteria.locations.some(
                    (location) =>
                        company.location.toLowerCase().includes(location.toLowerCase()) ||
                        location.toLowerCase().includes(company.location.toLowerCase())
                );

            // Employee range filter
            const matchesEmployees =
                company.employees >= filterCriteria.employeeRange.min &&
                company.employees <= filterCriteria.employeeRange.max;

            // Financial status filter
            const matchesFinancialStatus =
                filterCriteria.financialStatuses.length === 0 ||
                filterCriteria.financialStatuses.includes(company.financialStatus);

            return (
                matchesIndustry &&
                matchesLocation &&
                matchesEmployees &&
                matchesFinancialStatus
            );
        }).length;
    }, [filterCriteria]);

    const handleViewResults = () => {
        // Store filter criteria in sessionStorage
        sessionStorage.setItem("industryLeadersFilter", JSON.stringify(filterCriteria));
        router.push("/data-intelligence/industry-leaders/results");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            {/* Header with gradient background */}
            <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#A9C1F5] via-[#B8CEFA] to-[#C7DBFF] p-8">
                <div className="relative z-10">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">
                        Data Intelegence
                    </h1>
                    <p className="text-sm text-gray-700">
                        Data Intelegence • <span className="font-medium">Filters</span>
                    </p>
                </div>
                {/* Decorative graphic */}
                <div className="absolute right-8 top-0 h-32 w-32 opacity-40">
                    <svg viewBox="0 0 100 100" className="h-full w-full">
                        <polygon points="50,10 90,90 10,90" fill="#5479EE" opacity="0.6" />
                        <polygon points="50,30 70,70 30,70" fill="#6EE7B7" opacity="0.8" />
                    </svg>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Main Filter Section */}
                <div className="lg:col-span-2">
                    {/* Core Criteria Section */}
                    <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
                        <h2 className="mb-6 text-xl font-bold text-gray-900">
                            1. Kriteria Utama (Core Criteria)
                        </h2>

                        <div className="space-y-6">
                            {/* Industry Filter */}
                            <IndustryFilterSection
                                selectedIndustries={filterCriteria.industries}
                                onChange={(industries) =>
                                    setFilterCriteria({ ...filterCriteria, industries })
                                }
                            />

                            {/* Location Filter */}
                            <LocationFilterSection
                                selectedLocations={filterCriteria.locations}
                                onChange={(locations) =>
                                    setFilterCriteria({ ...filterCriteria, locations })
                                }
                            />

                            {/* Employee Range Filter */}
                            <EmployeeRangeFilter
                                min={filterCriteria.employeeRange.min}
                                max={filterCriteria.employeeRange.max}
                                onChange={(employeeRange) =>
                                    setFilterCriteria({ ...filterCriteria, employeeRange })
                                }
                            />
                        </div>
                    </div>

                    {/* Financial Status Section */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
                        <h2 className="mb-6 text-xl font-bold text-gray-900">
                            2. Status Finansial & Bisnis
                        </h2>

                        <FinancialStatusFilter
                            selectedStatuses={filterCriteria.financialStatuses}
                            onChange={(financialStatuses) =>
                                setFilterCriteria({ ...filterCriteria, financialStatuses })
                            }
                        />
                    </div>
                </div>

                {/* Summary Card */}
                <div className="lg:col-span-1">
                    <FilterSummaryCard
                        filterCriteria={filterCriteria}
                        estimatedCount={estimatedCount}
                        onViewResults={handleViewResults}
                    />
                </div>
            </div>
        </div>
    );
}
