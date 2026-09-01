// lib/api/organization.ts
//
// B2: fetch-and-normalize layer for the unified Company 360 profile. A
// company can be viewed from two different underlying resources depending
// on where the user came from - a still-only-cached search result
// (CompanyIntelligenceProfileResponse) or an already-saved CRM account
// (TargetCompanyDetailResponse) - and CompanyProfile360Client should not
// have to know the difference. This replaces the old profile page's
// `?type=target` URL-sniffing: the caller now passes an explicit
// `source` rather than the page guessing from a raw query param.
import { getCompanyIntelligenceProfile, getMyTargetCompany } from "./company-intelligence";
import {
    CompanyIntelligenceProfileResponse,
    CompanyProfile360,
    TargetCompanyDetailResponse,
} from "@/lib/types/company-intelligence";

export type ProfileSource = "saved" | "search";

function normalizeKeyPeople(raw: any[] | undefined | null): CompanyProfile360["keyPeople"] {
    if (!Array.isArray(raw)) return [];
    return raw
        .filter((person) => person && typeof person === "object" && person.name)
        .map((person, index) => ({
            id: person.id ? String(person.id) : undefined,
            name: String(person.name),
            role: person.role || person.title || person.position || undefined,
        }));
}

function fromSearch(data: CompanyIntelligenceProfileResponse): CompanyProfile360 {
    const rawData = (data.raw_data && typeof data.raw_data === "object" ? data.raw_data : {}) as Record<string, any>;
    return {
        id: data.id,
        source: "search",
        cacheId: data.id,
        organizationId: data.organization_id ?? null,
        name: data.name,
        email: data.email ?? null,
        domain: data.domain,
        phone: data.phone,
        industry: data.industry,
        location: data.location,
        employeeCount: data.employee_count ?? null,
        revenue: data.revenue,
        financialStatus: data.financial_status ?? null,
        description: data.description ?? null,
        providerSource: data.source ?? null,
        confidenceTier: data.confidence_tier ?? null,
        fieldProvenance: (data as any).field_provenance ?? null,
        keyPeople: normalizeKeyPeople(rawData.key_people),
        subsidiaries: Array.isArray(rawData.subsidiaries) ? rawData.subsidiaries : [],
        social: rawData.social && typeof rawData.social === "object" ? rawData.social : null,
        emailVerificationStatus: data.email_verification_status ?? null,
        emailVerifiedAt: data.email_verified_at ?? null,
        phoneVerificationStatus: data.phone_verification_status ?? null,
        phoneLineType: data.phone_line_type ?? null,
        phoneVerifiedAt: data.phone_verified_at ?? null,
        createdAt: data.created_at,
    };
}

function fromSaved(data: TargetCompanyDetailResponse): CompanyProfile360 {
    // Saved companies don't carry a row-level confidence_tier (that's a
    // CompanyIntelligenceCache-only concept) - fall back to whatever
    // field_provenance happens to record for `name`, which is set on every
    // save (see CompanyCrmService._apply_cache_to_crm's source propagation).
    const nameProvenance = data.field_provenance?.name;
    return {
        id: data.id,
        source: "saved",
        crmCompanyId: data.id,
        cacheId: data.company_intelligence_id ?? undefined,
        organizationId: data.organization_id ?? null,
        name: data.name,
        email: data.email,
        domain: data.domain,
        phone: null,
        industry: data.industry,
        location: data.location,
        employeeCount: data.employee_count,
        revenue: data.revenue,
        financialStatus: data.financial_status,
        description: data.description,
        providerSource: data.source ?? nameProvenance?.source ?? null,
        confidenceTier: nameProvenance?.confidence ?? null,
        fieldProvenance: data.field_provenance,
        keyPeople: normalizeKeyPeople(data.key_people),
        subsidiaries: Array.isArray(data.subsidiaries) ? data.subsidiaries : [],
        social: data.social ?? null,
        emailVerificationStatus: data.email_verification_status ?? null,
        emailVerifiedAt: data.email_verified_at ?? null,
        // CrmCompany has no phone column, so no phone verification state exists
        // on the saved path (phone above is null for the same reason).
        phoneVerificationStatus: null,
        phoneLineType: null,
        phoneVerifiedAt: null,
        createdAt: data.created_at,
    };
}

export async function fetchCompanyProfile360(
    token: string,
    id: string,
    source: ProfileSource
): Promise<CompanyProfile360> {
    if (source === "saved") {
        const data = (await getMyTargetCompany(token, id)) as TargetCompanyDetailResponse;
        return fromSaved(data);
    }
    const data = await getCompanyIntelligenceProfile(token, id);
    return fromSearch(data);
}
