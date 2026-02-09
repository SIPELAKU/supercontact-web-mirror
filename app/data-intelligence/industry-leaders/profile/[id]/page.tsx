"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Globe, Mail, MapPin, Phone } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { industryLeadersCompanies } from "@/lib/data/industry-leaders-companies";

export default function CompanyProfilePage() {
    const params = useParams();
    const router = useRouter();
    const companyId = params.id as string;

    // Find the company by ID
    const company = industryLeadersCompanies.find((c) => c.id === companyId);

    if (!company) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900">
                        Company Not Found
                    </h1>
                    <p className="mt-2 text-gray-600">
                        The company you're looking for doesn't exist.
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

    // Mock key people data
    const keyPeople = [
        {
            id: "1",
            name: "Budi Santoso",
            position: "CEO",
            avatar: "/api/placeholder/40/40",
        },
        {
            id: "2",
            name: "Sari Wijaya",
            position: "CTO",
            avatar: "/api/placeholder/40/40",
        },
        {
            id: "3",
            name: "Andi Prabowo",
            position: "CFO",
            avatar: "/api/placeholder/40/40",
        },
    ];

    // Mock subsidiaries
    const subsidiaries = ["PT. ABC", "PT. ABC", "PT. ABC"];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            {/* Header */}
            <PageHeader
                title="Profile"
                breadcrumbs={[
                    { label: "Data Intelligence" },
                    { label: "Filters" },
                    { label: "Results" },
                    { label: "Profile" },
                ]}
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

            {/* Main Content */}
            <div className="rounded-lg bg-white p-8 shadow-md">
                <h2 className="mb-6 text-2xl font-bold text-[#5479EE]">
                    Company Intelligence
                </h2>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left Column - Company Info */}
                    <div className="space-y-4">
                        {/* Company Logo */}
                        <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-gradient-to-br from-[#7B92F0] to-[#5479EE] text-3xl font-bold text-white">
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
                            {company.website && (
                                <div className="flex items-center gap-2 text-blue-600">
                                    <Globe size={16} />
                                    <a
                                        href={`https://${company.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:underline"
                                    >
                                        {company.website}
                                    </a>
                                </div>
                            )}
                            {company.email && (
                                <div className="flex items-center gap-2 text-blue-600">
                                    <Mail size={16} />
                                    <a
                                        href={`mailto:${company.email}`}
                                        className="hover:underline"
                                    >
                                        {company.email}
                                    </a>
                                </div>
                            )}
                            {company.phone && (
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Phone size={16} />
                                    <span>{company.phone}</span>
                                </div>
                            )}
                            {company.location && (
                                <div className="flex items-center gap-2 text-gray-700">
                                    <MapPin size={16} />
                                    <span>{company.location}</span>
                                </div>
                            )}
                        </div>

                        {/* Source Badge */}
                        <div className="flex items-center gap-2">
                            <Globe size={16} className="text-gray-600" />
                            <span className="text-sm text-gray-600">Source :</span>
                            <span className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                                {company.source}
                            </span>
                        </div>

                        {/* Strategic Badge */}
                        <div className="inline-block rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                            Strategic
                        </div>

                        {/* Industry Sector */}
                        <div>
                            <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">
                                Industry Sector (KBLI)
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {company.industries.map((industry) => (
                                    <span
                                        key={industry}
                                        className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                                    >
                                        {industry}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Headquarters */}
                        <div>
                            <h4 className="mb-1 text-xs font-semibold uppercase text-gray-500">
                                Headquarters
                            </h4>
                            <p className="text-sm font-semibold text-gray-900">
                                {company.location}
                            </p>
                        </div>

                        {/* Employee Count */}
                        <div>
                            <h4 className="mb-1 text-xs font-semibold uppercase text-gray-500">
                                Employee Count
                            </h4>
                            <p className="text-sm font-semibold text-gray-900">
                                {company.employees}
                            </p>
                        </div>

                        {/* Annual Revenue */}
                        <div>
                            <h4 className="mb-1 text-xs font-semibold uppercase text-gray-500">
                                Est. Annual Revenue
                            </h4>
                            <p className="text-sm font-semibold text-green-600">
                                {company.revenue}
                            </p>
                        </div>

                        {/* Status */}
                        <div>
                            <h4 className="mb-1 text-xs font-semibold uppercase text-gray-500">
                                Status
                            </h4>
                            <span className="inline-block rounded-md bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                {company.financialStatus}
                            </span>
                        </div>
                    </div>

                    {/* Right Column - Business Intelligence */}
                    <div className="lg:col-span-2">
                        <div className="space-y-6">
                            {/* Description */}
                            <div>
                                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                                    Business Intelligence
                                </h3>
                                <p className="text-sm leading-relaxed text-gray-600">
                                    {company.description ||
                                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam id nibh non nulla consectetur congue vitae vitae enim. Aenean lacinia, eros sit amet cursus luctus, nisl dolor feugiat erat, eu interdum felis elit ac dui."}
                                </p>
                            </div>

                            {/* Key People and Subsidiaries */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Key People */}
                                <div>
                                    <h4 className="mb-3 text-xs font-semibold uppercase text-gray-500">
                                        Key People
                                    </h4>
                                    <div className="space-y-3">
                                        {keyPeople.map((person) => (
                                            <div
                                                key={person.id}
                                                className="flex items-center gap-3"
                                            >
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7B92F0] to-[#5479EE] text-sm font-bold text-white">
                                                    {person.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {person.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {person.position}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Subsidiaries */}
                                <div>
                                    <h4 className="mb-3 text-xs font-semibold uppercase text-gray-500">
                                        Subsidiaries
                                    </h4>
                                    <ul className="space-y-2">
                                        {subsidiaries.map((subsidiary, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center text-sm text-gray-700"
                                            >
                                                <span className="mr-2">•</span>
                                                <span>{subsidiary}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save to CRM Button */}
                <div className="mt-8 flex justify-end">
                    <AppButton
                        variantStyle="primary"
                        onClick={() => {
                            // TODO: Implement save to CRM
                            alert(`Saved ${company.name} to CRM (mock action)`);
                        }}
                        className="px-8"
                    >
                        Save To CRM
                    </AppButton>
                </div>
            </div>
        </div>
    );
}
