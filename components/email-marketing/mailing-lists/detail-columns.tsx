import { MRT_ColumnDef } from "@/components/ui/super-table";
import { Subscriber, Campaign } from "@/lib/types/email-marketing";
import { format } from "date-fns";

// Column filters are off on both detail tabs (the endpoints take page/limit/
// search only), so these carry no filterVariant — an input that reaches
// nothing is worse than no input.

export const subscriberColumns: MRT_ColumnDef<Subscriber>[] = [
  {
    accessorKey: "email",
    header: "Email",
    Cell: ({ cell }) => (
      <span className="font-medium text-gray-900">{cell.getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    Cell: ({ cell }) => cell.getValue<string>() || "-",
  },
  {
    accessorKey: "company",
    header: "Company",
    Cell: ({ cell }) => cell.getValue<string>() || "-",
  },
];

const percent = (part: number, whole: number) =>
  whole > 0 ? `${((part / whole) * 100).toFixed(1)}%` : "—";

export const campaignColumns: MRT_ColumnDef<Campaign>[] = [
  {
    accessorKey: "subject",
    header: "Subject",
    Cell: ({ cell }) => (
      <span className="font-medium text-gray-900">{cell.getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "sent_at",
    header: "Sent",
    Cell: ({ cell }) =>
      cell.getValue<string>()
        ? format(new Date(cell.getValue<string>()), "dd MMM yyyy, HH:mm")
        : "-",
  },
  {
    id: "delivered",
    header: "Delivered",
    Cell: ({ row }) => (row.original.stats?.delivered ?? 0).toLocaleString(),
  },
  {
    id: "opened",
    header: "Opened",
    Cell: ({ row }) => (row.original.stats?.opened ?? 0).toLocaleString(),
  },
  {
    id: "open_rate",
    header: "Open Rate",
    // "—" rather than "0%" when nothing was delivered: no data and nobody
    // opening it are different facts.
    Cell: ({ row }) =>
      percent(row.original.stats?.opened ?? 0, row.original.stats?.delivered ?? 0),
  },
];
