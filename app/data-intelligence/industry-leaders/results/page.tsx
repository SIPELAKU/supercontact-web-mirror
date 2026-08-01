"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Search, Save } from "lucide-react";
import { Checkbox } from "@mui/material";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import CompanyResultCard from "@/components/data-intelligence/CompanyResultCard";
import {
    FilterCriteria,
    DEFAULT_FILTER_CRITERIA,
    IndustryLeaderCompany,
    FinancialStatus,
} from "@/lib/types/IndustryLeader";
import { searchCompanyIntelligence, saveCompanyToCrm, bulkSaveCompaniesToCrm } from "@/lib/api/company-intelligence";
import { notify } from "@/lib/notifications";
import { useAuth } from "@/lib/context/AuthContext";
import { CompanyIntelligenceItem } from "@/lib/types/company-intelligence";

const CACHE_KEY = "industryLeadersResults";
const CACHE_TIMESTAMP_KEY = "industryLeadersResultsTimestamp";

export default function IndustryLeadersResultsPage() {
    const router = useRouter();
    const { getToken } = useAuth();
    const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>(
        DEFAULT_FILTER_CRITERIA
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [allCompanies, setAllCompanies] = useState<IndustryLeaderCompany[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const [usedCache, setUsedCache] = useState(false);
    const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
    const [isBulkSaving, setIsBulkSaving] = useState(false);

    // Load filter criteria and cached results from sessionStorage
    useEffect(() => {
        const savedFilter = sessionStorage.getItem("industryLeadersFilter");
        if (savedFilter) {
            setFilterCriteria(JSON.parse(savedFilter));
        }

        // Try to load cached results
        const cachedResults = sessionStorage.getItem(CACHE_KEY);
        const cachedTimestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);
        
        if (cachedResults && cachedTimestamp) {
            try {
                const parsed = JSON.parse(cachedResults);
                setAllCompanies(parsed.companies);
                setTotalCount(parsed.totalCount);
                setUsedCache(true);
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to parse cached results:", err);
            }
        }
        
        setIsInitialized(true);
    }, []);

    // Filter companies based on search query (client-side filtering)
    const companies = useMemo(() => {
        if (!searchQuery.trim()) {
            return allCompanies;
        }
        
        const query = searchQuery.toLowerCase();
        return allCompanies.filter(company => 
            company.name.toLowerCase().includes(query) ||
            company.location.toLowerCase().includes(query) ||
            company.industries.some(industry => industry.toLowerCase().includes(query)) ||
            company.description?.toLowerCase().includes(query)
        );
    }, [allCompanies, searchQuery]);

    const fetchCompanies = useCallback(async () => {
        if (!isInitialized) return;

        // Skip fetch if we already have cached data
        if (usedCache) {
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const payload = {
                industries: filterCriteria.industries,
                locations: filterCriteria.locations,
                employee_min: filterCriteria.employeeRange.min,
                employee_max: filterCriteria.employeeRange.max,
                financial_status: filterCriteria.financialStatuses,
                limit: 100,
                q: "", // No search query for initial fetch
            };

            const response = await searchCompanyIntelligence(token, payload);

            // Map API response to UI model
            const mappedCompanies: IndustryLeaderCompany[] = response.results.map((item: CompanyIntelligenceItem) => ({
                id: item.id || "unknown-id",
                name: item.name || "Unknown Company",
                location: item.location,
                employees: item.employee_count,
                revenue: item.revenue != null ? String(item.revenue) : "N/A",
                financialStatus: item.financial_status as FinancialStatus,
                industries: [item.industry],
                source: item.source,
                confidenceTier: item.confidence_tier,
                matchPercentage: item.match_score,
                description: item.description,
                website: item.domain || undefined,
            }));

            setAllCompanies(mappedCompanies);
            setTotalCount(response.total);

            // Cache the results
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                companies: mappedCompanies,
                totalCount: response.total
            }));
            sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
            
            setUsedCache(false);
        } catch (err: any) {
            console.error("Failed to fetch industry leaders:", err);
            setError("Failed to load companies. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [filterCriteria, getToken, isInitialized, usedCache]);

    // Fetch on filter change or search
    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const handleViewProfile = (id: string) => {
        // Navigate to industry leaders profile page
        router.push(`/data-intelligence/industry-leaders/profile/${id}`);
    };

    const handleSaveToCRM = async (id: string) => {
        try {
            const token = await getToken();
            await saveCompanyToCrm(token, id);
            notify.success("Company saved to CRM successfully!");
        } catch (err: any) {
            console.error("Failed to save to CRM:", err);
            notify.error(err.message || "Failed to save company to CRM");
        }
    };

    const handleSelectionChange = (id: string, selected: boolean) => {
        setSelectedCompanyIds(prev => 
            selected ? [...prev, id] : prev.filter(companyId => companyId !== id)
        );
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedCompanyIds(companies.map(c => c.id));
        } else {
            setSelectedCompanyIds([]);
        }
    };

    const handleBulkSaveToCRM = async () => {
        if (selectedCompanyIds.length === 0) {
            notify.error("Please select at least one company");
            return;
        }

        setIsBulkSaving(true);
        try {
            const token = await getToken();
            await bulkSaveCompaniesToCrm(token, selectedCompanyIds);
            notify.success(`${selectedCompanyIds.length} companies saved to CRM successfully!`);
            setSelectedCompanyIds([]);
        } catch (err: any) {
            console.error("Failed to bulk save to CRM:", err);
            notify.error(err.message || "Failed to save companies to CRM");
        } finally {
            setIsBulkSaving(false);
        }
    };

    const isAllSelected = companies.length > 0 && selectedCompanyIds.length === companies.length;
    const isSomeSelected = selectedCompanyIds.length > 0 && selectedCompanyIds.length < companies.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
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
                <AppButton
                    variantStyle="outline"
                    onClick={() => router.back()}
                    startIcon={<ArrowLeft size={18} />}
                >
                    Back
                </AppButton>
            </div>

            {/* Results Container */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-lg">
                {/* Header Section */}
                <div className="border-b border-gray-200 p-6">
                    <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            {companies.length > 0 && (
                                <Checkbox
                                    checked={isAllSelected}
                                    indeterminate={isSomeSelected}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    sx={{
                                        color: "#5479EE",
                                        "&.Mui-checked": {
                                            color: "#5479EE",
                                        },
                                        "&.MuiCheckbox-indeterminate": {
                                            color: "#5479EE",
                                        },
                                    }}
                                />
                            )}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Search Results
                                </h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Found{" "}
                                    <span className="font-semibold text-gray-900">
                                        {companies.length} Companies
                                    </span>{" "}
                                    {searchQuery && `of ${totalCount} total`}
                                    {selectedCompanyIds.length > 0 && (
                                        <span className="ml-2 text-[#5479EE]">
                                            ({selectedCompanyIds.length} selected)
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {selectedCompanyIds.length > 0 && (
                                <AppButton
                                    variantStyle="primary"
                                    onClick={handleBulkSaveToCRM}
                                    disabled={isBulkSaving}
                                    startIcon={<Save size={18} />}
                                >
                                    {isBulkSaving ? "Saving..." : `Save Selected (${selectedCompanyIds.length})`}
                                </AppButton>
                            )}
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
                    {isLoading ? (
                        <div className="py-12 text-center text-gray-500">Loading companies...</div>
                    ) : error ? (
                        <div className="py-12 text-center text-red-500">{error}</div>
                    ) : companies.length === 0 ? (
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
                            {companies.map((company) => (
                                <CompanyResultCard
                                    key={company.id}
                                    company={company}
                                    onViewProfile={handleViewProfile}
                                    onSaveToCRM={handleSaveToCRM}
                                    isSelected={selectedCompanyIds.includes(company.id)}
                                    onSelectionChange={handleSelectionChange}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
