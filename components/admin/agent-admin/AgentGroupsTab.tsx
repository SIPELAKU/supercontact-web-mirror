"use client";

import { useMemo, useState } from "react";
import { Switch } from "@mui/material";
import { Pencil, Plus, Trash2, UsersRound } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { EmptyState } from "@/components/ui/empty-state";
import { SuperTable, MRT_ColumnDef } from "@/components/ui/super-table";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import type { AgentGroup } from "@/lib/types/agents";
import { useAgentGroups, useDeleteAgentGroup } from "@/lib/hooks/useAgents";
import AgentGroupFormModal from "./AgentGroupFormModal";
import AgentGroupDetailModal from "./AgentGroupDetailModal";

interface AgentGroupsTabProps {
  /** Gates every write control; false = read-only viewer. */
  canManage: boolean;
}

// Agent groups (teams) management: list + create/edit/soft-delete, and a row
// click opens the member-management detail modal.
export default function AgentGroupsTab({ canManage }: AgentGroupsTabProps) {
  const [includeInactive, setIncludeInactive] = useState(false);
  const { data: groups = [], isLoading, isError, refetch } = useAgentGroups(includeInactive);
  const deleteMutation = useDeleteAgentGroup();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AgentGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AgentGroup | null>(null);
  const [detailGroupId, setDetailGroupId] = useState<string | null>(null);

  const openCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEdit = (group: AgentGroup) => {
    setEditTarget(group);
    setFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      notify.success("Group deleted");
      setDeleteTarget(null);
    } catch (error) {
      notify.error("Error", { description: handleError(error, "Delete Agent Group") });
    }
  };

  const columns = useMemo<MRT_ColumnDef<AgentGroup>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        Cell: ({ row }) => (
          <span
            className={
              row.original.is_active ? "font-semibold text-gray-800" : "font-semibold text-gray-400"
            }
          >
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        enableSorting: false,
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>();
          return value ? (
            <div className="max-w-md truncate text-gray-600" title={value}>
              {value}
            </div>
          ) : (
            <span className="text-gray-300">—</span>
          );
        },
      },
      {
        accessorKey: "member_count",
        header: "Members",
        Cell: ({ cell }) => (
          <span className="inline-flex items-center gap-1.5 text-gray-700">
            <UsersRound size={14} className="text-gray-400" />
            {cell.getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Active",
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm text-gray-500 max-w-2xl">
          Organize agents into groups (teams) so you can route and report on support work. Click a
          group to manage its members.
        </p>
        <div className="flex items-center gap-4 shrink-0">
          <label className="flex items-center gap-1.5 text-sm text-gray-600 whitespace-nowrap">
            <Switch
              size="small"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              inputProps={{ "aria-label": "Show inactive groups" }}
            />
            Show inactive
          </label>
          {canManage && (
            <AppButton onClick={openCreate} startIcon={<Plus size={16} />} className="shrink-0">
              Add group
            </AppButton>
          )}
        </div>
      </div>

      <SuperTable<AgentGroup>
        entityLabel="grup"
        searchPlaceholder="Cari nama grup"
        tableId="agent-groups-table"
        urlKey="groups"
        columns={columns}
        data={groups}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load agent groups. Please try again."
        onRetry={() => refetch()}
        onRowClick={(row) => setDetailGroupId(row.id)}
        getRowClassName={() => "cursor-pointer"}
        rowActions={[
          {
            id: "edit",
            label: "Edit",
            icon: <Pencil size={16} />,
            hidden: () => !canManage,
            onClick: (row) => openEdit(row),
          },
          {
            id: "delete",
            label: "Delete",
            icon: <Trash2 size={16} />,
            hidden: () => !canManage,
            destructive: true,
            onClick: (row) => setDeleteTarget(row),
          },
        ]}
        renderEmptyState={() => (
          <EmptyState
            icon={UsersRound}
            title="No groups yet"
            description={
              canManage
                ? "Create your first agent group to start organizing your support team."
                : "No agent groups have been created yet."
            }
            action={
              canManage
                ? { label: "Add group", onClick: openCreate, icon: <Plus size={16} /> }
                : undefined
            }
          />
        )}
        features={{          urlSync: true,
 columnFilters: false }}
      />

      {/* Create / edit modal - only mounted for managers */}
      {canManage && (
        <AgentGroupFormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          group={editTarget}
        />
      )}

      {/* Member-management detail modal (read-only viewers see it without controls) */}
      <AgentGroupDetailModal
        groupId={detailGroupId}
        open={!!detailGroupId}
        onClose={() => setDetailGroupId(null)}
        canManage={canManage}
      />

      <ConfirmationPopup
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete group"
        description={`Are you sure you want to delete "${deleteTarget?.name ?? ""}"? Members will be detached from this group. This can be reversed by re-activating the group.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
