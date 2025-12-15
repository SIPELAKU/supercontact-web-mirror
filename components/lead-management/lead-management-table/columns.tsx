"use client";

import * as React from "react";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { Globe, MessageCircle, Edit3 } from "lucide-react";
import WAIcon from "@/public/wa.svg";
import ManualEntry from "@/public/manual-entry.svg";
import { cn } from "@/lib/utils";
import {Lead, LeadStatus, LeadSource} from "@/lib/models/types";


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

export const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: "lead_name",
    header: () => <span className="text-[#6B7280]">Lead Name</span>,
    cell: ({ row }) => (
      <span className="text-black">{row.original.contact.name}</span>
    ),
  },
  {
    accessorKey: "lead_status",
    header: () => <span className="text-[#6B7280]">Status</span>,
    cell: ({ row }) => {
      const status = row.getValue<LeadStatus>("lead_status"); 
      return (
        <span
          className={cn(
            "px-3 py-1 rounded-md text-white text-sm font-medium",
            statusColors[status]
          )}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "lead_source",
    header: () => <span className="text-[#6B7280]">Source</span>,
    cell: ({ row }) => {
      const source = row.getValue<LeadSource>("lead_source");
      // console.log('row', row);
      // console.log('source', source);
      return (
        <div className="flex items-center gap-2 text-black">
          {sourceIcon[source]}
          <span>{source}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "user",
    header: () => <span className="text-[#6B7280]">Assigned To</span>,
    cell: ({ row }) => (
      <span className="text-[#6B7280]">
        {row.original.user.fullname}
      </span>
    ),
  },
  {
    accessorKey: "last_contacted",
    header: () => <span className="text-[#6B7280]">Last Contacted</span>,
    cell: ({ row }) => (
      <span className="text-[#6B7280]">
        {row.getValue<string>("last_contacted")}
      </span>
    ),
  },
];
