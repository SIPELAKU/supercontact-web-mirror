"use client";

import { Contact } from "@/lib/models/types";
import { MRT_ColumnDef } from "@/components/ui/super-table";

export const contactColumns: MRT_ColumnDef<Contact>[] = [
  {
    accessorKey: "name",
    header: "Name",
    size: 240,
    enableColumnFilter: true,
    filterVariant: "text",
    Cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#5479EE] shrink-0 flex items-center justify-center text-white text-sm font-semibold">
          {row.original.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <span className="font-semibold text-gray-900">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    size: 240,
    enableColumnFilter: true,
    filterVariant: "text",
    Cell: ({ cell }) => (
      <span className="text-gray-900">{cell.getValue<string>() || "-"}</span>
    ),
  },
  {
    accessorKey: "phone_number",
    header: "Phone",
    size: 160,
    enableColumnFilter: true,
    filterVariant: "text",
    Cell: ({ cell }) => (
      <span className="text-gray-900">{cell.getValue<string>() || "-"}</span>
    ),
  },
  {
    accessorKey: "position",
    header: "Position",
    size: 170,
    filterVariant: "select",
    enableColumnFilter: true,
    Cell: ({ cell }) => (
      <span className="text-gray-900">{cell.getValue<string>() || "-"}</span>
    ),
  },
  {
    accessorKey: "company",
    header: "Company",
    size: 200,
    filterVariant: "select",
    enableColumnFilter: true,
    Cell: ({ cell }) => (
      <span className="text-gray-900">{cell.getValue<string>() || "-"}</span>
    ),
  },
  {
    accessorKey: "address",
    header: "Address",
    enableColumnFilter: false,
    size: 200,
    Cell: ({ cell }) => (
      <span className="truncate block text-gray-900" style={{ maxWidth: 200 }}>
        {cell.getValue<string>() || "-"}
      </span>
    ),
  },
];
