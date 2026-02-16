import { fetchWithTimeout } from "./api-client";
import {
  CompanyProfileData,
  CompanyProfileKeyPerson,
  CompanyProfileOrganizationStructure,
  CompanyProfileStatsItem,
  CompanyDocument,
} from "@/lib/types/company-profile";

function asObject(value: unknown): Record<string, any> {
  return value && typeof value === "object" ? (value as Record<string, any>) : {};
}

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function firstNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return undefined;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string")
    .map((item) => (item as string).trim())
    .filter(Boolean);
}

function mapStats(rawStats: unknown): CompanyProfileStatsItem[] {
  if (!Array.isArray(rawStats)) return [];
  return rawStats
    .map((item) => asObject(item))
    .map((item) => {
      const growthValue = firstNumber(item.growth?.value, item.growth_value, item.growth);
      const metricKey = firstString(item.key);
      const metricTitleMap: Record<string, string> = {
        total_employees: "Total Employees",
        active_employees: "Active Employees",
        departments_count: "Departments Count",
      };
      return {
        title: firstString(item.title, item.label, metricTitleMap[metricKey]),
        value: item.value ?? "-",
        subtitle: firstString(item.subtitle, item.description, item.note),
        growth: growthValue !== undefined ? { value: growthValue } : undefined,
      };
    })
    .filter((item) => item.title);
}

function mapCompanyProfilePayload(payload: unknown): CompanyProfileData {
  const raw = asObject(payload);
  const overview = asObject(raw.overview);
  const company = asObject(raw.company);
  const aiSummary = asObject(raw.ai_summary ?? raw.aiSummary);
  const metrics = asObject(raw.metrics ?? raw.summary);

  const fallbackStats: CompanyProfileStatsItem[] = [
    {
      title: "Total Employees",
      value:
        firstString(
          company.employee_range,
          company.total_employees_range,
          company.total_employees
        ) || "-",
      subtitle: "Current estimate",
    },
    {
      title: "Headquarters",
      value: firstString(company.headquarters, company.location) || "-",
      subtitle: "Main office",
    },
  ];

  const mappedStats = mapStats(
    Array.isArray(raw.stats) ? raw.stats : Array.isArray(raw.metrics) ? raw.metrics : []
  );

  const totalEmployeesFromMetrics = Array.isArray(raw.metrics)
    ? raw.metrics.find((m: any) => asObject(m).key === "total_employees")?.value
    : undefined;

  return {
    name: firstString(overview.name, company.name, raw.name, raw.company_name) || "Company Profile",
    description:
      firstString(overview.about, company.description, raw.description) ||
      "Company profile information is not available.",
    tags: stringArray(company.tags).length ? stringArray(company.tags) : stringArray(raw.tags),
    founded:
      firstString(
        overview.founded_year,
        company.founded,
        company.founded_year,
        raw.founded,
        raw.founded_year
      ) || "-",
    headquarters:
      firstString(overview.headquarters, company.headquarters, company.location, raw.headquarters) ||
      "-",
    employees:
      firstString(
        company.employee_range,
        company.total_employees_range,
        company.total_employees,
        totalEmployeesFromMetrics,
        raw.employees
      ) || "-",
    status: firstString(overview.status, company.status, raw.status) || "-",
    aiSummary: {
      description:
        firstString(aiSummary.description, raw.ai_summary_text, metrics.ai_summary) ||
        "AI summary is not available.",
      tags: stringArray(aiSummary.tags),
    },
    stats: mappedStats.length ? mappedStats : fallbackStats,
  };
}

function mapKeyPeoplePayload(payload: unknown): CompanyProfileKeyPerson[] {
  const raw = asObject(payload);
  const list =
    (Array.isArray(raw.key_people) && raw.key_people) ||
    (Array.isArray(raw.items) && raw.items) ||
    (Array.isArray(raw.data) && raw.data) ||
    [];

  return list
    .map((item: unknown) => asObject(item))
    .map((person: Record<string, any>, index: number) => ({
      id: String(person.manage_user_id ?? person.id ?? person.user_id ?? index + 1),
      name: firstString(person.full_name, person.fullname, person.name) || "Unknown",
      title: firstString(
        person.manage_user_position,
        person.position,
        person.manage_user_level,
        person.title,
        person.role
      ),
      avatarUrl: firstString(person.avatar_url, person.avatar),
      email: firstString(person.email),
      phone: firstString(person.phone),
      location: firstString(person.department_branch, person.location, person.city),
      description: firstString(person.about, person.description),
    }));
}

function mapOrganizationPayload(payload: unknown): CompanyProfileOrganizationStructure {
  const raw = asObject(payload);
  const departments =
    (Array.isArray(raw.departments) && raw.departments) ||
    (Array.isArray(raw.organization_structure) && raw.organization_structure) ||
    (Array.isArray(raw.items) && raw.items) ||
    [];

  const countFromPayload = firstNumber(
    raw.departments_count,
    raw.total_departments,
    raw.total,
    departments.length
  );

  return {
    departmentsCount: countFromPayload ?? 0,
  };
}

async function authorizedGet(url: string, token: string): Promise<any> {
  const res = await fetchWithTimeout(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok || json?.success === false) {
    const message = json?.error?.message || json?.message || "Failed to fetch company profile data";
    throw new Error(message);
  }

  return json?.data ?? json;
}

export async function fetchCompanyProfile(token: string): Promise<CompanyProfileData> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const payload = await authorizedGet(`${baseUrl}/internal/company-profile`, token);
  return mapCompanyProfilePayload(payload);
}

export async function fetchCompanyProfileKeyPeople(
  token: string,
  page: number = 1,
  limit: number = 12
): Promise<CompanyProfileKeyPerson[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const payload = await authorizedGet(
    `${baseUrl}/internal/company-profile/key-people?page=${page}&limit=${limit}`,
    token
  );
  return mapKeyPeoplePayload(payload);
}

export async function fetchCompanyProfileOrganizationStructure(
  token: string
): Promise<CompanyProfileOrganizationStructure> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const payload = await authorizedGet(
    `${baseUrl}/internal/company-profile/organization-structure`,
    token
  );
  return mapOrganizationPayload(payload);
}

export async function uploadCompanyDocument(token: string, file: File): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Create FormData and append the file
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetchWithTimeout(`${baseUrl}/internal/company-profile/documents/import`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type - browser will set it with boundary for FormData
    },
    body: formData,
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok || json?.success === false) {
    const message = json?.error?.message || json?.message || 'Failed to upload document';
    throw new Error(message);
  }
}

export async function fetchCompanyDocuments(token: string): Promise<CompanyDocument[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const payload = await authorizedGet(`${baseUrl}/internal/company-profile/documents`, token);

  // Handle the actual response structure: { items: [...] }
  const documents = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload)
      ? payload
      : [];

  return documents.map((doc: any) => ({
    id: String(doc.id || ''),
    title: String(doc.title || doc.name || doc.file_name || 'Untitled Document'),
    filename: String(doc.file_name || doc.filename || ''),
    uploadedAt: doc.created_at || doc.uploaded_at || new Date().toISOString(),
    fileUrl: doc.file_url,
  }));
}

export async function deleteCompanyDocument(token: string, documentId: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetchWithTimeout(`${baseUrl}/internal/company-profile/documents/${documentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok || json?.success === false) {
    const message = json?.error?.message || json?.message || 'Failed to delete document';
    throw new Error(message);
  }
}
