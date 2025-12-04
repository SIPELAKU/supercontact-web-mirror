// app/lead-management/page.tsx
"use client"; // needed because LeadManagement uses hooks

import LeadManagement from "@/components/lead-management/lead-management";
import { Lead } from "@/components/lead-management/lead-management-table/columns";

export default function LeadManagementPage() {
  const data: Lead[] = [
  {
    id: "1",
    name: "Calvin",
    status: "New",
    source: "Web Form",
    assignedTo: "Tjahaja",
    lastContacted: "20 Sept 2025",
  },
  {
    id: "2",
    name: "Pram",
    status: "Contacted",
    source: "WhatsApp",
    assignedTo: "Aman",
    lastContacted: "10 Okt 2025",
  },
  {
    id: "3",
    name: "Cahaya",
    status: "Qualified",
    source: "Manual Entry",
    assignedTo: "Budi",
    lastContacted: "17 Okt 2025",
  },
  {
    id: "4",
    name: "Alex",
    status: "Proposal",
    source: "Web Form",
    assignedTo: "Johannes",
    lastContacted: "15 Nov 2025",
  },
  {
    id: "5",
    name: "Joko",
    status: "Closed-Won",
    source: "WhatsApp",
    assignedTo: "Chris",
    lastContacted: "20 Nov 2025",
  },
  {
    id: "6",
    name: "John",
    status: "Closed-Lost",
    source: "Manual Entry",
    assignedTo: "Calvin",
    lastContacted: "29 Nov 2025",
  },
];

  return <LeadManagement data={data} />;
}
