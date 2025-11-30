"use client";

import * as React from "react";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { Globe, MessageCircle, Edit3 } from "lucide-react";
import WAIcon from "@/public/wa.svg";
import ManualEntry from "@/public/manual-entry.svg";
import { cn } from "@/lib/utils";

// Lead type (matches your screenshot table)
export interface Lead {
  id: string;
  name: string;
  status: LeadStatus;
  source: LeadSource;
  assignedTo: string;
  lastContacted: string;
}

// Strongly typed status options
export type LeadStatus =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Proposal"
  | "Closed-Won"
  | "Closed-Lost";

// Strongly typed source options
export type LeadSource = "Web Form" | "WhatsApp" | "Manual Entry";

// Status badge colors
const statusColors: Record<LeadStatus, string> = {
  "New": "bg-gray-500",
  "Contacted": "bg-blue-500",
  "Qualified": "bg-purple-700",
  "Proposal": "bg-[#E28F1E]",
  "Closed-Won": "bg-[#5BC557]",
  "Closed-Lost": "bg-red-500",
};

// Source icon mapping
export const sourceIcon: Record<LeadSource, React.ReactNode> = {
  "Web Form": <Globe className="h-4 w-4 text-black" />,
  "WhatsApp": <Image src={WAIcon} className="h-4 w-4 text-black" alt={"wa-icon"} />,
  "Manual Entry": <Image src={ManualEntry} alt={"manual-entry"} className="h-4 w-4" />,
};

export const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: "name",
    header: () => <span className="text-[#6B7280]">Lead Name</span>,
    cell: ({ row }) => (
      <span className="text-black">{row.getValue<string>("name")}</span>
    ),
  },
  {
    accessorKey: "status",
    header: () => <span className="text-[#6B7280]">Status</span>,
    cell: ({ row }) => {
      const status = row.getValue<LeadStatus>("status");

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
    accessorKey: "source",
    header: () => <span className="text-[#6B7280]">Source</span>,
    cell: ({ row }) => {
      const source = row.getValue<LeadSource>("source");
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
    accessorKey: "assignedTo",
    header: () => <span className="text-[#6B7280]">Assigned To</span>,
    cell: ({ row }) => (
      <span className="text-[#6B7280]">
        {row.getValue<string>("assignedTo")}
      </span>
    ),
  },
  {
    accessorKey: "lastContacted",
    header: () => <span className="text-[#6B7280]">Last Contacted</span>,
    cell: ({ row }) => (
      <span className="text-[#6B7280]">
        {row.getValue<string>("lastContacted")}
      </span>
    ),
  },
];
