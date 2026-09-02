"use client";

import { ReactNode } from "react";
import { CompanyProfile360 } from "@/lib/types/company-intelligence";

interface LegalRegistryCardProps {
    profile: CompanyProfile360;
}

interface RegistryEntry {
    label: string;
    content: ReactNode;
}

// "Legal & Registry" card for the Company 360 Overview tab: the Fase 1
// registry identifiers (NIB/NPWP/KBLI/legal form/founded year) plus the
// detailed address columns. Only fields that actually hold a value are
// rendered, and the whole card disappears when none of them do — most
// Maps/SerpAPI-discovered rows carry none of this, only registry-loader
// (PSE/Kemenperin) and import/manual rows tend to.
export default function LegalRegistryCard({ profile }: LegalRegistryCardProps) {
    const kbliCodes = (profile.kbliCodes ?? [])
        .map((code) => String(code).trim())
        .filter(Boolean);

    const entries: RegistryEntry[] = [];
    if (profile.nib) entries.push({ label: "NIB", content: profile.nib });
    if (profile.npwp) entries.push({ label: "NPWP", content: profile.npwp });
    if (kbliCodes.length > 0) {
        entries.push({
            label: "KBLI Codes",
            content: (
                <span className="flex flex-wrap gap-1.5">
                    {kbliCodes.map((code, index) => (
                        <span
                            key={`${code}-${index}`}
                            className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
                        >
                            {code}
                        </span>
                    ))}
                </span>
            ),
        });
    }
    if (profile.legalForm) entries.push({ label: "Legal Form", content: profile.legalForm });
    if (profile.foundedYear != null)
        entries.push({ label: "Founded Year", content: String(profile.foundedYear) });
    if (profile.addressLine) entries.push({ label: "Address", content: profile.addressLine });
    if (profile.kecamatan) entries.push({ label: "Kecamatan", content: profile.kecamatan });
    if (profile.kabupaten) entries.push({ label: "Kabupaten", content: profile.kabupaten });
    if (profile.postalCode) entries.push({ label: "Postal Code", content: profile.postalCode });

    if (entries.length === 0) return null;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            <h4 className="mb-4 text-xs font-bold uppercase text-gray-400">Legal &amp; Registry</h4>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                {entries.map((entry) => (
                    <div key={entry.label} className="min-w-0">
                        <dt className="mb-0.5 text-xs font-medium text-gray-400">{entry.label}</dt>
                        <dd className="break-words font-medium text-gray-700">{entry.content}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
