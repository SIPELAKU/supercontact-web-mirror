"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Plus, Search } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import CompanyResultCard from "@/components/data-intelligence/CompanyResultCard";
import {
    FilterCriteria,
    DEFAULT_FILTER_CRITERIA,
} from "@/lib/types/IndustryLeader";
import { industryLeadersCompanies } from "@/lib/data/industry-leaders-companies";

export default function IndustryLeadersResultsPage() {
    const router = useRouter();
    const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>(
        DEFAULT_FILTER_CRITERIA
    );
    const [searchQuery, setSearchQuery] = useState("");

    // Load filter criteria from sessionStorage
    useEffect(() => {
        const savedFilter = sessionStorage.getItem("industryLeadersFilter");
        if (savedFilter) {
            setFilterCriteria(JSON.parse(savedFilter));
        }
    }, []);

    // Filter companies based on criteria and search
    const filteredCompanies = useMemo(() => {
        return industryLeadersCompanies.filter((company) => {
            // Search filter
            const matchesSearch =
                searchQuery === "" ||
                company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                company.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                company.industries.some((industry) =>
                    industry.toLowerCase().includes(searchQuery.toLowerCase())
                );

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
                matchesSearch &&
                matchesIndustry &&
                matchesLocation &&
                matchesEmployees &&
                matchesFinancialStatus
            );
        });
    }, [filterCriteria, searchQuery]);

    const handleViewProfile = (id: string) => {
        // Navigate to industry leaders profile page
        router.push(`/data-intelligence/industry-leaders/profile/${id}`);
    };

    const handleSaveToCRM = (id: string) => {
        // TODO: Implement save to CRM functionality
        console.log("Save to CRM:", id);
        alert(`Company ${id} saved to CRM (mock action)`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            {/* Header with gradient background */}
            {/* Header */}
            <PageHeader
                title="Search Results"
                breadcrumbs={[
                    { label: "Data Intelligence" },
                    { label: "Target Customer" },
                    { label: "Results" },
                ]}
            />

            {/* Back Button */}
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>
            </div>

            {/* Results Container */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-lg">
                {/* Header Section */}
                <div className="border-b border-gray-200 p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Hasil Pencarian
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Ditemukan{" "}
                                <span className="font-semibold text-gray-900">
                                    {filteredCompanies.length} Perusahaan
                                </span>{" "}
                                yang cocok
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <AppButton
                                variantStyle="outline"
                                color="gray"
                                startIcon={<Upload size={18} />}
                            >
                                Export
                            </AppButton>
                            <AppButton variantStyle="primary" startIcon={<Plus size={18} />}>
                                Add Company
                            </AppButton>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-md">
                        <AppInput
                            placeholder="Search companies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            isBgWhite
                            startIcon={<Search size={20} />}
                        />
                    </div>
                </div>

                {/* Results List */}
                <div className="p-6">
                    {filteredCompanies.length === 0 ? (
                        <div className="py-12 text-center">
                            <p className="text-lg text-gray-500">
                                No companies found matching your criteria
                            </p>
                            <p className="mt-2 text-sm text-gray-400">
                                Try adjusting your filters or search query
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredCompanies.map((company) => (
                                <CompanyResultCard
                                    key={company.id}
                                    company={company}
                                    onViewProfile={handleViewProfile}
                                    onSaveToCRM={handleSaveToCRM}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
