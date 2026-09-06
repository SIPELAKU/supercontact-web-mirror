"use client";

import { Contact } from "@/lib/models/types";
import { MRT_ColumnDef } from "@/components/ui/super-table";
import { tagChipStyle } from "@/lib/utils/contactTags";

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
  // Phase 3 (spec I6). The two reference columns and the contact's own tags.
  //
  // NOTE (spec A29): the type's, the region's and the tag's NAMES are NOT
  // reachable through the search box - that box matches the generated
  // `contacts.search_text` column, whose expression is left byte-identically
  // alone this phase. "Every Korporat contact in Jawa Barat with the VIP tag"
  // is the three FILTERS in the toolbar, not a search phrase.
  {
    id: "customer_type",
    accessorFn: (row) => row.customer_type?.name ?? "",
    header: "Tipe Pelanggan",
    size: 170,
    enableColumnFilter: false,
    enableSorting: false,
    Cell: ({ row }) => (
      <span className="text-gray-900">{row.original.customer_type?.name || "-"}</span>
    ),
  },
  {
    id: "region",
    accessorFn: (row) => row.region?.name ?? "",
    header: "Wilayah",
    size: 170,
    enableColumnFilter: false,
    enableSorting: false,
    Cell: ({ row }) => <span className="text-gray-900">{row.original.region?.name || "-"}</span>,
  },
  {
    id: "tags",
    accessorFn: (row) => (row.tags ?? []).map((tag) => tag.name).join(", "),
    header: "Tags",
    size: 220,
    enableColumnFilter: false,
    enableSorting: false,
    Cell: ({ row }) => {
      const tags = row.original.tags ?? [];
      if (tags.length === 0) return <span className="text-gray-400">-</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-[6px] px-2 py-0.5 text-[11px] font-medium"
              style={tagChipStyle(tag.color)}
            >
              {tag.name}
            </span>
          ))}
        </div>
      );
    },
  },
];
