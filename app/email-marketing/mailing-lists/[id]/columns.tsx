import { MRT_ColumnDef } from "material-react-table";
import { Subscriber, Campaign } from "@/lib/types/email-marketing";
import { format } from "date-fns";

export const subscriberColumns: MRT_ColumnDef<Subscriber>[] = [
  {
    accessorKey: "email",
    header: "Email",
    enableColumnFilter: true,
  },
  {
    accessorKey: "name",
    header: "Nama",
    enableColumnFilter: true,
    Cell: ({ cell }) => cell.getValue<string>() || "-",
  },
  {
    accessorKey: "company",
    header: "Nama Perusahaan",
    enableColumnFilter: true,
    Cell: ({ cell }) => cell.getValue<string>() || "-",
  },
];

export const campaignColumns: MRT_ColumnDef<Campaign>[] = [
  {
    accessorKey: "subject",
    header: "Subject",
    enableColumnFilter: true,
  },
  {
    accessorKey: "sent_at",
    header: "Sent Date",
    enableColumnFilter: false,
    Cell: ({ cell }) =>
      cell.getValue<string>()
        ? format(new Date(cell.getValue<string>()), "dd MMM yyyy, HH:mm")
        : "-",
  },
  {
    accessorKey: "stats.delivered",
    header: "Delivered",
    enableColumnFilter: false,
  },
  {
    accessorKey: "stats.opened",
    header: "Opened",
    enableColumnFilter: false,
  },
  {
    id: "open_rate",
    header: "Open Rate",
    enableColumnFilter: false,
    Cell: ({ row }) => {
      const campaign = row.original;
      const openRate =
        campaign.stats.delivered > 0
          ? ((campaign.stats.opened / campaign.stats.delivered) * 100).toFixed(1)
          : "0";
      return `${openRate}%`;
    },
  },
];
