export interface CompanyProfileStatsItem {
  title: string;
  value: string | number;
  subtitle: string;
  growth?: {
    value: number;
    unit?: "%";
  };
}

export interface CompanyProfileData {
  name: string;
  description: string;
  tags: string[];
  founded: string;
  headquarters: string;
  employees: string;
  status: string;
  aiSummary: {
    description: string;
    tags: string[];
  };
  stats: CompanyProfileStatsItem[];
}

export interface CompanyProfileKeyPerson {
  id: string;
  name: string;
  title: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  location?: string;
  description?: string;
}

export interface CompanyProfileOrganizationStructure {
  departmentsCount: number;
}
