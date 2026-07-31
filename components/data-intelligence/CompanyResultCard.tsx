"use client";

import { MapPin, Users, DollarSign, TrendingUp, Globe } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { IndustryLeaderCompany } from "@/lib/types/IndustryLeader";
import { Checkbox } from "@mui/material";

interface CompanyResultCardProps {
    company: IndustryLeaderCompany;
    onViewProfile: (id: string) => void;
    onSaveToCRM: (id: string) => void;
    isSelected?: boolean;
    onSelectionChange?: (id: string, selected: boolean) => void;
}

export default function CompanyResultCard({
    company,
    onViewProfile,
    onSaveToCRM,
    isSelected = false,
    onSelectionChange,
}: CompanyResultCardProps) {
    const initials = company.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    return (
        <div className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            {/* Selection Checkbox */}
            {onSelectionChange && (
                <div className="flex items-start pt-1">
                    <Checkbox
                        checked={isSelected}
                        onChange={(e) => onSelectionChange(company.id, e.target.checked)}
                        sx={{
                            color: "#5479EE",
                            "&.Mui-checked": {
                                color: "#5479EE",
                            },
                        }}
                    />
                </div>
            )}

            {/* Company Initial Badge */}
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#7B92F0] to-[#5479EE] text-2xl font-bold text-white">
                {initials}
            </div>

            {/* Company Info */}
            <div className="flex-1">
                <div className="mb-3 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {company.name}
                            </h3>
                            {company.matchPercentage && (
                                <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                    {company.matchPercentage}% Match
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Company Details */}
                <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        <span>{company.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span>{company.employees} Employees</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <DollarSign size={16} />
                        <span>{company.revenue}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <TrendingUp size={16} />
                        <span>{company.financialStatus}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Globe size={16} />
                        <span>Source : {company.source}</span>
                    </div>
                </div>

                {/* Industry Tags */}
                <div className="mb-4 flex flex-wrap gap-2">
                    {company.industries.map((industry) => (
                        <span
                            key={industry}
                            className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                        >
                            {industry}
                        </span>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <AppButton
                        variantStyle="primary"
                        onClick={() => onViewProfile(company.id)}
                    >
                        View Profile
                    </AppButton>
                    <AppButton
                        variantStyle="outline"
                        color="gray"
                        onClick={() => onSaveToCRM(company.id)}
                    >
                        Save To CRM
                    </AppButton>
                </div>
            </div>
        </div>
    );
}
