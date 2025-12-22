export type CompanyType = {
  id: number;
  name: string;
  email: string;
  industry: "SaaS" | "Manufacturing" | "Logistics" | "Finance" | "Healthcare";
  location: string;
  employees: string;
  insightScore: number;
  status: "Connected" | "Enriching" | "Disconnected";
};

export type Industry = "all" | "saas" | "manufacturing" | "logistics" | "finance" | "healthcare";

export type IndustryOption = { label: string; value: Industry };

export type CompanyStatus = "all" | "connected" | "enriching" | "disconnected";

export type StatusOption = { label: string; value: CompanyStatus };

export type RecentSignalsType = {
  id: number;
  title: string;
  description: string;
  timePosted: string;
  dotColor: "green" | "blue" | "orange";
};

export type DetailCompanyType = {
  name: string;
  description: string;
  tags: string[];
  founded: string;
  headquarters: string;
  employees: string;
  status: "Private" | "Public";
};

export type AISummaryType = {
  description: string;
  tags: string[];
};

export type Status = "online" | "idle" | "offline";

export type KeyPersonType = {
  id: string;
  name: string;
  title: string;
  location: string;
  avatarUrl?: string;
  initials?: string;
  status: Status;

  email?: string;
  phone?: string;
  profileLinkLabel?: string;
  description: string;

  badgeLabel: string;
  badgeTone?: "blue" | "red" | "green" | "purple" | "orange" | "cyan";
};

export interface KeyPersonListItem {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
}

export type ActivitySource = "linkedin" | "x" | "website";

export type RecentActivityDetailItem = {
  id: string;
  source: ActivitySource;
  title: string;
  meta: string;
  content: string;
  badge?: {
    label: string;
    tone: "green" | "indigo";
  };
};

export type RecentActivityItem = {
  id: string;
  source: "linkedin" | "x" | "website";
  companyName: string;
  meta: string;
  content: string;
  badge?: {
    label: string;
    tone: "green" | "indigo";
  };
};
