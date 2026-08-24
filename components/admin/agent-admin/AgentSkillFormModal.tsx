"use client";

import { useEffect, useState } from "react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import type { AgentSkill } from "@/lib/types/agents";
import { useCreateAgentSkill, useUpdateAgentSkill } from "@/lib/hooks/useAgents";

interface AgentSkillFormModalProps {
  open: boolean;
  onClose: () => void;
  /** When set, the modal edits this skill; otherwise it creates a new one. */
  skill: AgentSkill | null;
}

// Create / edit form for a company skill (just its name). Reused for both
// flows: `skill === null` -> create, otherwise -> rename.
export default function AgentSkillFormModal({ open, onClose, skill }: AgentSkillFormModalProps) {
  const createMutation = useCreateAgentSkill();
  const updateMutation = useUpdateAgentSkill();

  const [name, setName] = useState("");

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isEditing = !!skill;

  // Sync the field whenever the modal (re)opens for a given skill.
  useEffect(() => {
    if (open) {
      setName(skill?.name ?? "");
    }
  }, [open, skill]);

  const closeModal = () => {
    if (isSaving) return;
    onClose();
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      notify.warning("Validation Error", { description: "Please enter a skill name." });
      return;
    }
    try {
      if (skill) {
        await updateMutation.mutateAsync({ id: skill.id, data: { name: trimmed } });
        notify.success("Skill updated");
      } else {
        await createMutation.mutateAsync({ name: trimmed });
        notify.success("Skill created");
      }
      onClose();
    } catch (error) {
      notify.error("Error", {
        description: handleError(error, isEditing ? "Update Agent Skill" : "Create Agent Skill"),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : closeModal())} maxWidth="sm">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit skill" : "Add skill"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <AppInput
            isBgWhite
            fullWidth
            label="Name"
            required
            placeholder="e.g. Billing, Spanish, Tier 2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <DialogFooter>
          <AppButton variantStyle="outline" color="gray" onClick={closeModal} disabled={isSaving}>
            Cancel
          </AppButton>
          <AppButton onClick={handleSave} disabled={isSaving} isLoading={isSaving}>
            {isEditing ? "Save changes" : "Add skill"}
          </AppButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
