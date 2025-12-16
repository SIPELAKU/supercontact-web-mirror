// lib/api.ts

import { leadResponse } from "@/lib/models/types";

export async function fetchLeads(token: string): Promise<leadResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  console.log("API response:", json);
  if (!res.ok || !json.success) throw new Error("Failed to load leads");
  return json;
  // return json.data.leads.map((u: any) => ({
  //   id: u.id,
  //   name: u.lead_name,
  //   status: u.status as LeadStatus, // <-- cast here
  //   source: u.source,
  //   assignedTo: u.user?.fullname ?? "Unknown",
  //   lastContacted: u.last_contacted,
  // }));
}
