"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Plus, Search } from "lucide-react";
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
        // Navigate to company detail page (reuse existing company intelligence page)
        router.push(`/data-intelligence/company-intelligence/${id}`);
    };

    const handleSaveToCRM = (id: string) => {
        // TODO: Implement save to CRM functionality
        console.log("Save to CRM:", id);
        alert(`Company ${id} saved to CRM (mock action)`);
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
                        Data Intelegence • Results • <span className="font-medium">Profile</span>
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
