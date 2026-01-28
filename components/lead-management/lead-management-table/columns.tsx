"use client";

import { Lead, LeadSource, LeadStatus } from "@/lib/models/types";
import { cn } from "@/lib/utils";
import ManualEntry from "@/public/manual-entry.svg";
import WAIcon from "@/public/wa.svg";
import { format } from "date-fns";
import { Globe } from "lucide-react";
import Image from "next/image";
import * as React from "react";

// Status badge colors
const statusColors: Record<LeadStatus, string> = {
  "New": "bg-[#EBEBEB] text-[#617589]",
  "Contacted": "bg-[#E8F4FD] text-[#2980B9]",
  "Qualified": "bg-[#F7EEFF] text-[#6B21A8]",
  "Proposal": "bg-[#FEF5E7] text-[#F39C12]",
  "Closed - Won": "bg-[#EDFDEC] text-[#5BC557]",
  "Closed - Lost": "bg-[#FCE8E8] text-[#C0392B]",
};

// Source icon mapping
export const sourceIcon: Record<LeadSource, React.ReactNode> = {
  "Web Form": <Globe className="h-4 w-4 text-black" />,
  "WhatsApp": <Image src={WAIcon} className="h-4 w-4 text-black" alt={"wa-icon"} />,
  "Manual Entry": <Image src={ManualEntry} alt={"manual-entry"} className="h-4 w-4" />,
};

// Column configuration interface
export interface LeadColumn {
  key: string;
  label: string;
  render: (lead: Lead) => React.ReactNode;
  sortable?: boolean;
}

// Column definitions for MUI Table
export const leadColumns: LeadColumn[] = [
  {
    key: "lead_name",
    label: "Lead Name",
    sortable: true,
    render: (lead) => <span className="text-black">{lead.contact.name}</span>,
  },
  {
    key: "lead_status",
    label: "Status",
    sortable: true,
    render: (lead) => (
      <span
        className={cn(
          "px-3 py-1 rounded-md text-white text-sm font-medium",
          statusColors[lead.lead_status]
        )}
      >
        {lead.lead_status}
      </span>
    ),
  },
  {
    key: "lead_source",
    label: "Source",
    sortable: true,
    render: (lead) => (
      <div className="flex items-center gap-2 text-black">
        {sourceIcon[lead.lead_source]}
        <span>{lead.lead_source}</span>
      </div>
    ),
  },
  {
    key: "user",
    label: "Assigned To",
    sortable: true,
    render: (lead) => (
      <span className="text-[#6B7280]">{lead.user.fullname}</span>
    ),
  },
  {
    key: "last_contacted",
    label: "Last Contacted",
    sortable: true,
    render: (lead) => {
      const dateString = lead.contact.last_contacted?.created_at;
      if (!dateString) return <span className="text-[#6B7280]">-</span>;

      try {
        const date = new Date(dateString);
        return (
          <span className="text-[#6B7280]">
            {format(date, "dd MMM yyyy 'at' HH:mm")}
          </span>
        );
      } catch (error) {
        return <span className="text-[#6B7280]">-</span>;
      }
    },
  },
];
