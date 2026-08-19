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
  "Unqualified": "bg-[#FCE8E8] text-[#C0392B]",
};

// Source icon mapping
export const sourceIcon: Record<LeadSource, React.ReactNode> = {
  "Web Form": <Globe className="h-4 w-4 text-black" />,
  "WhatsApp": <Image src={WAIcon} className="h-4 w-4 text-black" alt={"wa-icon"} />,
  "Manual Entry": <Image src={ManualEntry} alt={"manual-entry"} className="h-4 w-4" />,
};

import { MRT_ColumnDef } from "@/components/ui/super-table";

// Column definitions for MUI Table using SuperTable formatting
export const leadColumns: MRT_ColumnDef<Lead>[] = [
  {
    accessorFn: (row) => row.contact.name,
    id: "lead_name",
    header: "Lead Name",
    enableColumnFilter: false,
    Cell: ({ row }) => <span className="text-black font-medium">{row.original.contact.name}</span>,
  },
  {
    accessorKey: "lead_status",
    header: "Status",
    filterVariant: 'select',
    filterSelectOptions: ['New', 'Contacted', 'Qualified', 'Unqualified'],
    enableColumnFilter: true,
    Cell: ({ cell }) => (
      <span
        className={cn(
          "px-3 py-1 rounded-md text-white text-sm font-medium whitespace-nowrap",
          statusColors[cell.getValue<LeadStatus>()]
        )}
      >
        {cell.getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "lead_source",
    header: "Source",
    filterVariant: 'select',
    filterSelectOptions: ['Web Form', 'WhatsApp', 'Manual Entry'],
    enableColumnFilter: true,
    Cell: ({ cell }) => (
      <div className="flex items-center gap-2 text-black whitespace-nowrap">
        {sourceIcon[cell.getValue<LeadSource>()]}
        <span>{cell.getValue<string>()}</span>
      </div>
    ),
  },
  {
    accessorFn: (row) => row.user.fullname,
    id: "user",
    header: "Assigned To",
    filterVariant: 'select',
    enableColumnFilter: true,
    Cell: ({ row }) => (
      <span className="text-[#6B7280]">{row.original.user.fullname}</span>
    ),
  },
  {
    accessorFn: (row) => {
      const dateStr = row.contact.last_contacted?.created_at;
      if (!dateStr) return null;
      return new Date(dateStr);
    },
    id: "last_contacted",
    header: "Last Contacted",
    filterVariant: 'date-range',
    filterFn: 'betweenInclusive',
    enableColumnFilter: true,
    Cell: ({ cell }) => {
      const val = cell.getValue<Date | null>();
      if (!val) return <span className="text-[#6B7280]">-</span>;

      try {
        return (
          <span className="text-[#6B7280] whitespace-nowrap">
            {format(val, "dd MMM yyyy 'at' HH:mm")}
          </span>
        );
      } catch (error) {
        return <span className="text-[#6B7280]">-</span>;
      }
    },
  },
];
