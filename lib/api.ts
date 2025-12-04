// api.ts
export interface Lead {
  id: string;
  name: string;
  status: string;
  source: string;
  assignedTo: string;
  lastContacted: string;
}

// Login and get JWT token
export async function loginAndGetToken(): Promise<string> {
  const res = await fetch("http://localhost:8000/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin", password: "admin" }),
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok || !json.success) throw new Error("Login failed");

  return json.data.access_token;
}

// Fetch leads
export async function fetchLeads(token: string, page: number, limit: number): Promise<{
  data: Lead[];
  total: number;
  totalPages: number;
}> {
  const res = await fetch(`http://localhost:8000/api/v1/leads?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok || !json.success) throw new Error("Failed to load leads");

  interface ApiLead {
    id: string;
    lead_name: string;
    status: string;
    source: string;
    user?: { fullname: string };
    last_contacted: string;
  }

  const mapped: Lead[] = json.data.leads.map((u: ApiLead) => ({
    id: u.id,
    name: u.lead_name,
    status: u.status,
    source: u.source,
    assignedTo: u.user?.fullname ?? "Unknown",
    lastContacted: u.last_contacted,
  }));

  return {
    data: mapped,
    total: json.data.total,
    totalPages: json.data.total_pages,
  };
}

// Create a lead
export async function createLead(token: string, leadData: Partial<Lead>) {
  const res = await fetch(`http://localhost:8000/api/v1/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(leadData),
  });

  const json = await res.json();
  if (!res.ok || !json.success) throw new Error("Failed to create lead");
  return json.data;
}
