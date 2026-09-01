"use client";

import { Mail, Phone, ShieldCheck } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { VerificationBadge } from "@/components/data-intelligence/VerificationBadge";
import { CompanyProfile360 } from "@/lib/types/company-intelligence";

interface ContactCardProps {
    profile: CompanyProfile360;
    // Verification needs a backend record to write to - false when the
    // profile has neither a cacheId nor a crmCompanyId (nothing to target).
    canVerify: boolean;
    isVerifying: boolean;
    onVerify: () => void;
}

// Small "Contact" card for the Company 360 Overview tab: the profile's
// email/phone with their verification state. Renders nothing when the
// profile carries no contact data at all.
export default function ContactCard({ profile, canVerify, isVerifying, onVerify }: ContactCardProps) {
    if (!profile.email && !profile.phone) return null;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-xs font-bold uppercase text-gray-400">Contact</h4>
                {canVerify && (
                    <AppButton
                        variantStyle="outline"
                        color="gray"
                        size="small"
                        startIcon={<ShieldCheck size={14} />}
                        onClick={onVerify}
                        isLoading={isVerifying}
                    >
                        Verify contacts
                    </AppButton>
                )}
            </div>
            <div className="flex flex-col gap-3 text-sm">
                {profile.email && (
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <a
                            href={`mailto:${profile.email}`}
                            className="flex min-w-0 items-center gap-1.5 text-gray-600 hover:text-[#5479EE] hover:underline"
                        >
                            <Mail size={14} className="shrink-0 text-gray-400" />
                            <span className="truncate">{profile.email}</span>
                        </a>
                        <VerificationBadge
                            status={profile.emailVerificationStatus}
                            checkedAt={profile.emailVerifiedAt}
                            className="shrink-0"
                        />
                    </div>
                )}
                {profile.phone && (
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <a
                            href={`tel:${profile.phone}`}
                            className="flex min-w-0 items-center gap-1.5 text-gray-600 hover:text-[#5479EE] hover:underline"
                        >
                            <Phone size={14} className="shrink-0 text-gray-400" />
                            <span className="truncate">{profile.phone}</span>
                        </a>
                        <VerificationBadge
                            status={profile.phoneVerificationStatus}
                            checkedAt={profile.phoneVerifiedAt}
                            lineType={profile.phoneLineType}
                            className="shrink-0"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
