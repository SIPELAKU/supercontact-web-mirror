"use client";

import { useEffect, useMemo, useState } from "react";
import { Chip, Switch } from "@mui/material";
import { Info, Plus, Tags, X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import type { AgentRosterItem, AgentSeatType } from "@/lib/types/agents";
import {
  useAgentSkills,
  useAssignAgentSkill,
  useRemoveAgentSkill,
  useAdminUpdateAgentProfile,
} from "@/lib/hooks/useAgents";

interface AgentManageModalProps {
  /** The agent to manage; null when the modal is closed. Kept in sync with the
   *  live roster by the parent so skill chips refresh after assign/remove. */
  agent: AgentRosterItem | null;
  open: boolean;
  onClose: () => void;
}

const SEAT_OPTIONS: { value: AgentSeatType; label: string }[] = [
  { value: "full", label: "Full" },
  { value: "light", label: "Light" },
];

// Manager-only editor for a single agent: licensed seat (full / light), routing
// capacity + transfer opt-in, and skill assignment. Skill changes apply
// immediately (per-chip); the seat/capacity block is saved with its own button.
export default function AgentManageModal({ agent, open, onClose }: AgentManageModalProps) {
  const { data: skills = [] } = useAgentSkills();
  const assignMutation = useAssignAgentSkill();
  const removeMutation = useRemoveAgentSkill();
  const profileMutation = useAdminUpdateAgentProfile();

  // ---- Seat / capacity / transfers form ----
  const [seatType, setSeatType] = useState<AgentSeatType>("full");
  const [maxConcurrent, setMaxConcurrent] = useState("");
  const [acceptsTransfers, setAcceptsTransfers] = useState(true);

  // ---- Add-skill control ----
  const [skillToAdd, setSkillToAdd] = useState("");

  // Seed the form when the modal opens for an agent (keyed on id so a roster
  // refetch of the same agent doesn't clobber in-progress edits).
  useEffect(() => {
    if (open && agent) {
      setSeatType(agent.seat_type ?? "full");
      setMaxConcurrent(agent.max_concurrent_open != null ? String(agent.max_concurrent_open) : "");
      setAcceptsTransfers(agent.accepts_transfers ?? true);
      setSkillToAdd("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, agent?.id]);

  const assignedSkills = agent?.skills ?? [];
  const assignedIds = useMemo(() => new Set(assignedSkills.map((s) => s.id)), [assignedSkills]);

  // Active skills not yet assigned to this agent.
  const availableSkillOptions = useMemo(
    () => [
      { value: "", label: "Select a skill to add…" },
      ...skills
        .filter((s) => s.is_active && !assignedIds.has(s.id))
        .map((s) => ({ value: s.id, label: s.name })),
    ],
    [skills, assignedIds]
  );

  const closeModal = () => {
    if (profileMutation.isPending) return;
    onClose();
  };

  const handleSaveProfile = async () => {
    if (!agent) return;
    const trimmed = maxConcurrent.trim();
    let maxValue: number | null = null;
    if (trimmed !== "") {
      const parsed = Number(trimmed);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        notify.warning("Validation Error", {
          description: "Max concurrent open must be a positive whole number, or blank for unlimited.",
        });
        return;
      }
      maxValue = parsed;
    }
    try {
      await profileMutation.mutateAsync({
        userId: agent.id,
        data: {
          seat_type: seatType,
          max_concurrent_open: maxValue,
          accepts_transfers: acceptsTransfers,
        },
      });
      notify.success("Agent updated");
    } catch (error) {
      notify.error("Error", { description: handleError(error, "Update Agent Profile") });
    }
  };

  const handleAddSkill = async () => {
    if (!agent || !skillToAdd) return;
    try {
      await assignMutation.mutateAsync({ userId: agent.id, skillId: skillToAdd });
      notify.success("Skill assigned");
      setSkillToAdd("");
    } catch (error) {
      notify.error("Error", { description: handleError(error, "Assign Skill") });
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    if (!agent) return;
    try {
      await removeMutation.mutateAsync({ userId: agent.id, skillId });
      notify.success("Skill removed");
    } catch (error) {
      notify.error("Error", { description: handleError(error, "Remove Skill") });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : closeModal())} maxWidth="md">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{agent ? `Manage ${agent.fullname}` : "Manage agent"}</DialogTitle>
          {agent && <p className="text-sm text-gray-500">{agent.email}</p>}
        </DialogHeader>

        <div className="space-y-6">
          {/* Seat + capacity + transfers */}
          <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
            <p className="text-sm font-semibold text-gray-700">Seat &amp; capacity</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AppSelect
                isBgWhite
                fullWidth
                label="Seat type"
                value={seatType}
                options={SEAT_OPTIONS}
                onChange={(e) => setSeatType(e.target.value as AgentSeatType)}
              />
              <AppInput
                isBgWhite
                fullWidth
                label="Max concurrent open"
                type="number"
                inputProps={{ min: 1 }}
                placeholder="Unlimited"
                value={maxConcurrent}
                onChange={(e) => setMaxConcurrent(e.target.value)}
                helperText="Leave blank for unlimited."
              />
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
              <Info size={15} className="mt-0.5 shrink-0" />
              <span>
                <span className="font-semibold">Light</span> agents are read + internal-note only:
                they can view conversations and post internal notes, but can&apos;t be assigned work,
                claim from queues, or send public replies.
              </span>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <Switch
                size="small"
                checked={acceptsTransfers}
                onChange={(e) => setAcceptsTransfers(e.target.checked)}
                inputProps={{ "aria-label": "Accept transfers" }}
              />
              Accept transfers from other agents
            </label>

            <div className="flex justify-end">
              <AppButton
                onClick={handleSaveProfile}
                disabled={profileMutation.isPending}
                isLoading={profileMutation.isPending}
              >
                Save changes
              </AppButton>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Skills</p>

            {assignedSkills.length === 0 ? (
              <EmptyState
                icon={Tags}
                title="No skills assigned"
                description="Assign skills below so this agent can be routed skill-scoped work."
              />
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {assignedSkills.map((s) => (
                  <Chip
                    key={s.id}
                    size="small"
                    label={s.name}
                    onDelete={() => handleRemoveSkill(s.id)}
                    deleteIcon={<X size={14} aria-label={`Remove ${s.name}`} />}
                    disabled={removeMutation.isPending}
                    sx={{
                      backgroundColor: "#5479EE1A",
                      color: "#5479EE",
                      fontWeight: 500,
                      "& .MuiChip-deleteIcon": { color: "#5479EE", "&:hover": { color: "#3B5BDB" } },
                    }}
                  />
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <AppSelect
                  isBgWhite
                  fullWidth
                  label="Add a skill"
                  value={skillToAdd}
                  options={availableSkillOptions}
                  onChange={(e) => setSkillToAdd(e.target.value as string)}
                />
              </div>
              <AppButton
                onClick={handleAddSkill}
                disabled={!skillToAdd || assignMutation.isPending}
                isLoading={assignMutation.isPending}
                startIcon={<Plus size={16} />}
                className="shrink-0"
              >
                Add
              </AppButton>
            </div>
            {skills.filter((s) => s.is_active).length === 0 && (
              <p className="text-xs text-gray-400">
                No active skills yet. Create skills from the Skills tab first.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
