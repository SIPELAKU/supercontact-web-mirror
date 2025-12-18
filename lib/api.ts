// lib/api.ts

import { leadResponse } from "@/lib/models/types";

export async function fetchLeads(token: string): Promise<leadResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  console.log("API response:", json);
  
  if (res.status === 401) {
    // Token is invalid/expired, throw specific error
    throw new Error("UNAUTHORIZED");
  }
  
  if (!res.ok || !json.success) throw new Error("Failed to load leads");
  return json;
}

export interface CreateLeadData {
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  company_size: string;
  office_location: string;
  lead_status: string;
  lead_source: string;
  assigned_to: string;
  tag: string;
  notes: string;
}

export async function createLead(token: string, leadData: CreateLeadData): Promise<any> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(leadData),
  });

  const json = await res.json();
  console.log("Create lead response:", json);
  
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  
  if (!res.ok) {
    throw new Error(json.message || "Failed to create lead");
  }
  
  return json;
}
