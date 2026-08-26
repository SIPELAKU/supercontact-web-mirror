"use client";

import { useMemo, useState } from "react";
import { Switch } from "@mui/material";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { EmptyState } from "@/components/ui/empty-state";
import { SuperTable, MRT_ColumnDef } from "@/components/ui/super-table";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import type { AgentSkill } from "@/lib/types/agents";
import {
  useAgentSkills,
  useUpdateAgentSkill,
  useDeleteAgentSkill,
} from "@/lib/hooks/useAgents";
import AgentSkillFormModal from "./AgentSkillFormModal";

interface AgentSkillsTabProps {
  /** Gates every write control; false = read-only viewer. */
  canManage: boolean;
}

// Company skill vocabulary: list + create/edit/soft-delete. Skills are assigned
// to agents (Roster tab) and can gate conversation queues (Routing settings).
export default function AgentSkillsTab({ canManage }: AgentSkillsTabProps) {
  const [includeInactive, setIncludeInactive] = useState(false);
  const { data: skills = [], isLoading, isError, refetch } = useAgentSkills(includeInactive);
  const updateMutation = useUpdateAgentSkill();
  const deleteMutation = useDeleteAgentSkill();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AgentSkill | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AgentSkill | null>(null);

  const openCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEdit = (skill: AgentSkill) => {
    setEditTarget(skill);
    setFormOpen(true);
  };

  const handleToggleActive = (skill: AgentSkill) => {
    updateMutation.mutate(
      { id: skill.id, data: { is_active: !skill.is_active } },
      {
        onSuccess: () => notify.success(skill.is_active ? "Skill deactivated" : "Skill activated"),
        onError: (error) => notify.error("Error", { description: handleError(error, "Update Skill") }),
      }
    );
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      notify.success("Skill deleted");
      setDeleteTarget(null);
    } catch (error) {
      notify.error("Error", { description: handleError(error, "Delete Agent Skill") });
    }
  };

  const columns = useMemo<MRT_ColumnDef<AgentSkill>[]>(
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
        accessorKey: "is_active",
        header: "Active",
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <Switch
            size="small"
            checked={row.original.is_active}
            onChange={() => handleToggleActive(row.original)}
            disabled={!canManage || updateMutation.isPending}
            inputProps={{ "aria-label": `Toggle ${row.original.name} active` }}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManage, updateMutation.isPending]
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm text-gray-500 max-w-2xl">
          A shared skill vocabulary for your workspace. Assign skills to agents from the{" "}
          <span className="font-medium text-gray-700">Roster</span> tab, and require a skill on a
          queue from <span className="font-medium text-gray-700">Routing settings</span> so only
          qualified agents receive that work.
        </p>
        <div className="flex items-center gap-4 shrink-0">
          <label className="flex items-center gap-1.5 text-sm text-gray-600 whitespace-nowrap">
            <Switch
              size="small"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              inputProps={{ "aria-label": "Show inactive skills" }}
            />
            Show inactive
          </label>
          {canManage && (
            <AppButton onClick={openCreate} startIcon={<Plus size={16} />} className="shrink-0">
              Add skill
            </AppButton>
          )}
        </div>
      </div>

      <SuperTable<AgentSkill>
        tableId="agent-skills-table"
        urlKey="skills"
        columns={columns}
        data={skills}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load skills. Please try again."
        onRetry={() => refetch()}
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
            icon={Tags}
            title="No skills yet"
            description={
              canManage
                ? "Create your first skill to start tagging agents and queues."
                : "No skills have been created yet."
            }
            action={
              canManage
                ? { label: "Add skill", onClick: openCreate, icon: <Plus size={16} /> }
                : undefined
            }
          />
        )}
        features={{          urlSync: true,
 columnFilters: false }}
      />

      {/* Create / edit modal - only mounted for managers */}
      {canManage && (
        <AgentSkillFormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          skill={editTarget}
        />
      )}

      <ConfirmationPopup
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete skill"
        description={`Are you sure you want to delete "${deleteTarget?.name ?? ""}"? It will be removed from agents and any queues requiring it. This can be reversed by re-activating the skill.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
