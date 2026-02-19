"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Globe, Mail, MapPin, Phone } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { useAuth } from "@/lib/context/AuthContext";
import {
    getCompanyIntelligenceProfile,
    saveCompanyToCrm,
    getMyTargetCompany
} from "@/lib/api/company-intelligence";
import { CompanyIntelligenceProfileResponse } from "@/lib/types/company-intelligence";
import { notify } from "@/lib/notifications";

export default function CompanyProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { getToken } = useAuth();
    const companyId = params.id as string;

    const searchParams = useSearchParams();
    const type = searchParams.get("type");

    const [company, setCompany] = useState<CompanyIntelligenceProfileResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCompanyProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = await getToken();
            let data;

            if (type === "target") {
                data = await getMyTargetCompany(token, companyId);
            } else {
                data = await getCompanyIntelligenceProfile(token, companyId);
            }

            setCompany(data);
        } catch (err: any) {
            console.error("Failed to fetch company profile:", err);
            setError("Failed to load company profile.");
        } finally {
            setIsLoading(false);
        }
    }, [companyId, getToken, type]);

    useEffect(() => {
        if (companyId) {
            fetchCompanyProfile();
        }
    }, [companyId, fetchCompanyProfile]);

    const handleSaveToCRM = async () => {
        if (!company) return;
        try {
            const token = await getToken();
            await saveCompanyToCrm(token, company.id);
            notify.success("Company saved to CRM successfully!");
        } catch (err: any) {
            console.error("Failed to save to CRM:", err);
            notify.error(err.message || "Failed to save company to CRM");
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-gray-600">Loading company profile...</div>
            </div>
        );
    }

    if (error || !company) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900">
                        {error || "Company Not Found"}
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {error
                            ? "Please try again later."
                            : "The company you're looking for doesn't exist."}
                    </p>
                    <AppButton
                        variantStyle="primary"
                        onClick={() => router.push("/data-intelligence/industry-leaders/results")}
                        className="mt-4"
                    >
                        Back to Results
                    </AppButton>
                </div>
            </div>
        );
    }

    const initials = company.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    // Parse raw_data for additional details if available
    const rawData = company.raw_data || {};
    const keyPeople = rawData.key_people || [];
    const subsidiaries = rawData.subsidiaries || [];

    // Helper for financial status color
    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes("success") || s.includes("profit") || s.includes("growth"))
            return "bg-[#E6F4EA] text-[#1E8E3E]"; // Green
        if (s.includes("loss") || s.includes("fail"))
            return "bg-[#FCE8E6] text-[#C5221F]"; // Red
        return "bg-gray-100 text-gray-700"; // Default Gray
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <PageHeader
                title="Company Intelligence"
                breadcrumbs={[]} // Mockup doesn't show breadcrumbs prominently, but we keep the title
            />

            {/* Back Button */}
            <div className="mb-6">
                <AppButton
                    variantStyle="outline"
                    onClick={() => router.back()}
                    className="gap-2"
                >
                    <ArrowLeft size={16} />
                    Back
                </AppButton>
            </div>

            <h3 className="mb-4 text-lg font-medium text-gray-900">Description</h3>

            {/* Main Content Card */}
            <div className="flex flex-col gap-8 rounded-lg bg-white p-8 shadow-sm lg:flex-row">
                {/* Left Column - Company Info */}
                <div className="w-full space-y-6 border-r border-gray-100 pr-0 lg:w-1/3 lg:pr-8">
                    <div className="space-y-4">
                        {/* Company Logo */}
                        <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-[#EEF2FF] text-4xl font-bold text-[#5479EE]">
                            {initials}
                        </div>

                        {/* Company Name */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {company.name}
                            </h3>
                        </div>

                        {/* Contact Details */}
                        <div className="space-y-3 text-sm">
                            {company.domain && (
                                <div className="flex items-center gap-3">
                                    <Globe size={18} className="text-[#5479EE]" />
                                    <a
                                        href={`https://${company.domain}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#5479EE] hover:underline"
                                    >
                                        {company.domain}
                                    </a>
                                </div>
                            )}
                            {/* Placeholders for Email/Phone as per mockup style if data existed */}
                            {company.raw_data?.email && (
                                <div className="flex items-center gap-3">
                                    <Mail size={18} className="text-[#5479EE]" />
                                    <a href={`mailto:${company.raw_data.email}`} className="text-[#5479EE] hover:underline">
                                        {company.raw_data.email}
                                    </a>
                                </div>
                            )}
                            {company.raw_data?.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone size={18} className="text-[#5479EE]" />
                                    <span className="text-[#5479EE]">{company.raw_data.phone}</span>
                                </div>
                            )}
                            {company.location && (
                                <div className="flex items-center gap-3 text-[#5479EE]">
                                    <MapPin size={18} />
                                    <span>{company.location}</span>
                                </div>
                            )}
                        </div>

                        {/* Source Badge */}
                        <div className="flex items-center gap-2 pt-2">
                            <div className="flex items-center gap-2 rounded-full bg-gray-50 p-1 pr-3 text-sm">
                                <Globe size={16} className="ml-1 text-[#5479EE]" />
                                <span className="text-gray-500">Source :</span>
                                <span className="font-semibold text-gray-900">
                                    {company.source}
                                </span>
                            </div>
                        </div>

                        {/* Strategic Badge */}
                        <div className="pt-1">
                            <span className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-700">
                                Strategic
                            </span>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* Left Column Details Grid */}
                    <div className="space-y-6">
                        {/* Industry Sector */}
                        <div>
                            <h4 className="mb-2 text-xs font-bold uppercase text-gray-400">
                                INDUSTRY SECTOR (KBLI)
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                <span className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-900">
                                    {company.industry}
                                </span>
                            </div>
                        </div>

                        {/* Headquarters */}
                        <div>
                            <h4 className="mb-1 text-xs font-bold uppercase text-gray-400">
                                HEADQUARTERS
                            </h4>
                            <p className="text-base font-bold text-gray-900">
                                {company.location}
                            </p>
                        </div>

                        {/* Employee Count */}
                        <div>
                            <h4 className="mb-1 text-xs font-bold uppercase text-gray-400">
                                EMPLOYEE COUNT
                            </h4>
                            <p className="text-base font-bold text-gray-900">
                                {company.employee_count}
                            </p>
                        </div>

                        {/* Annual Revenue */}
                        <div>
                            <h4 className="mb-1 text-xs font-bold uppercase text-gray-400">
                                EST. ANNUAL REVENUE
                            </h4>
                            <p className="text-base font-bold text-[#1E8E3E]">
                                {company.revenue}
                            </p>
                        </div>

                        {/* Status */}
                        <div>
                            <h4 className="mb-1 text-xs font-bold uppercase text-gray-400">
                                STATUS
                            </h4>
                            <span className={`inline-block rounded-full px-4 py-1 text-sm font-medium ${getStatusColor(company.financial_status)}`}>
                                {company.financial_status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Column - Business Intelligence */}
                <div className="flex w-full flex-col lg:w-2/3">
                    <div className="flex-1 space-y-8">
                        <div>
                            <h3 className="mb-4 text-xl font-bold text-gray-900">
                                Business Intelligence
                            </h3>
                            <p className="leading-relaxed text-gray-500">
                                {company.description ||
                                    "No description available for this company."}
                            </p>
                        </div>

                        <div className="h-px bg-gray-200" />

                        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                            {/* Key People */}
                            <div>
                                <h4 className="mb-4 text-xs font-bold uppercase text-gray-400">
                                    KEY PEOPLE
                                </h4>
                                {keyPeople.length > 0 ? (
                                    <div className="space-y-6">
                                        {keyPeople.map((person: any, index: number) => (
                                            <div
                                                key={person.id || index}
                                                className="flex items-start gap-3"
                                            >
                                                {/* Person Avatar - Mock Image Style */}
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 overflow-hidden">
                                                    {/* Start of mock avatar logic */}
                                                    <img
                                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name || index}`}
                                                        alt={person.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {person.name}
                                                    </p>
                                                    <p className="text-xs font-medium text-gray-500">
                                                        {person.role || person.position}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">No key people data available.</p>
                                )}
                            </div>

                            {/* Subsidiaries */}
                            <div>
                                <h4 className="mb-4 text-xs font-bold uppercase text-gray-400">
                                    SUBSIDIARIES
                                </h4>
                                {subsidiaries.length > 0 ? (
                                    <ul className="space-y-3">
                                        {subsidiaries.map((subsidiary: any, index: number) => (
                                            <li
                                                key={index}
                                                className="flex items-center text-sm font-medium text-gray-600"
                                            >
                                                <span className="mr-3 h-1.5 w-1.5 rounded-full bg-black"></span>
                                                <span>
                                                    {typeof subsidiary === 'string'
                                                        ? subsidiary
                                                        : subsidiary.company || subsidiary.name}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-400">No subsidiaries data available.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Save to CRM Button - Aligned to bottom right of the content */}
                    <div className="mt-8 flex justify-end pt-8">
                        <AppButton
                            variantStyle="primary"
                            onClick={handleSaveToCRM}
                            className="h-12 px-8 text-base font-medium"
                        >
                            Save To CRM
                        </AppButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
