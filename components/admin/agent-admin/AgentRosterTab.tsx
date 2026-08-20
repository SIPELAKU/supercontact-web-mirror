"use client";

import { useMemo } from "react";
import { Chip, Tooltip } from "@mui/material";
import { Star, Users } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SuperTable, MRT_ColumnDef } from "@/components/ui/super-table";
import type { AgentRosterItem } from "@/lib/types/agents";
import { useAgentRoster } from "@/lib/hooks/useAgents";

// Read-only roster of every support agent, one row per agent. Search / column
// filters are handled client-side by SuperTable's built-in global filter.
export default function AgentRosterTab() {
  const { data: agents = [], isLoading, isError, refetch } = useAgentRoster();

  const columns = useMemo<MRT_ColumnDef<AgentRosterItem>[]>(
    () => [
      {
        accessorKey: "fullname",
        header: "Name",
        Cell: ({ row }) => (
          <span
            className={
              row.original.is_active ? "font-semibold text-gray-800" : "font-semibold text-gray-400"
            }
          >
            {row.original.fullname}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        Cell: ({ cell }) => <span className="text-gray-600">{cell.getValue<string>()}</span>,
      },
      {
        accessorKey: "role_name",
        header: "Role",
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>();
          return value ? (
            <span className="text-gray-700">{value}</span>
          ) : (
            <span className="text-gray-300">—</span>
          );
        },
      },
      {
        id: "groups",
        header: "Groups",
        // Flatten to group names so the global search can match on them.
        accessorFn: (row) => row.groups.map((g) => g.name).join(", "),
        enableSorting: false,
        Cell: ({ row }) => {
          const groups = row.original.groups;
          if (!groups.length) return <span className="text-gray-300">—</span>;
          return (
            <div className="flex flex-wrap gap-1.5">
              {groups.map((g) => {
                const isLead = g.role === "lead";
                return (
                  <Tooltip
                    key={g.group_id}
                    title={isLead ? `Lead of ${g.name}` : `Member of ${g.name}`}
                    arrow
                  >
                    <Chip
                      size="small"
                      icon={isLead ? <Star size={12} /> : undefined}
                      label={g.name}
                      sx={
                        isLead
                          ? {
                              backgroundColor: "#FEF3C7",
                              color: "#B45309",
                              fontWeight: 600,
                              "& .MuiChip-icon": { color: "#D97706", marginLeft: "4px" },
                            }
                          : {
                              backgroundColor: "#5479EE1A",
                              color: "#5479EE",
                              fontWeight: 500,
                            }
                      }
                    />
                  </Tooltip>
                );
              })}
            </div>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: "Status",
        Cell: ({ row }) => {
          const active = row.original.is_active;
          return (
            <span
              className={
                active
                  ? "inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700"
                  : "inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500"
              }
            >
              {active ? "Active" : "Inactive"}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
      <p className="text-sm text-gray-500 max-w-2xl">
        Everyone in your workspace who can be assigned support work. Group membership is managed from
        the <span className="font-medium text-gray-700">Groups</span> tab.
      </p>

      <SuperTable<AgentRosterItem>
        tableId="agent-roster-table"
        columns={columns}
        data={agents}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load agents. Please try again."
        onRetry={() => refetch()}
        renderEmptyState={() => (
          <EmptyState
            icon={Users}
            title="No agents yet"
            description="Agents added to your workspace will appear here."
          />
        )}
        features={{ columnFilters: false }}
      />
    </div>
  );
}
