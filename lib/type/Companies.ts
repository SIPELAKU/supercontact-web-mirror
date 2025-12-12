export type CompaniesType = {
  id: number;
  name: string;
  email: string;
  industry: "SaaS" | "Manufacturing" | "Logistics" | "Finance" | "Healthcare";
  location: string;
  employees: string;
  insightScore: number;
  status: "Connected" | "Enriching" | "Disconnected";
};