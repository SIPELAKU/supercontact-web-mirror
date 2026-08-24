"use client";

import { useEffect, useState } from "react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppTextarea } from "@/components/ui/app-textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import type { AgentGroup } from "@/lib/types/agents";
import { useCreateAgentGroup, useUpdateAgentGroup } from "@/lib/hooks/useAgents";

interface AgentGroupFormModalProps {
  open: boolean;
  onClose: () => void;
  /** When set, the modal edits this group; otherwise it creates a new one. */
  group: AgentGroup | null;
}

// Create / edit form for an agent group (name + description). Reused for both
// flows: `group === null` -> create, otherwise -> edit.
export default function AgentGroupFormModal({ open, onClose, group }: AgentGroupFormModalProps) {
  const createMutation = useCreateAgentGroup();
  const updateMutation = useUpdateAgentGroup();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isEditing = !!group;

  // Sync form fields whenever the modal (re)opens for a given group.
  useEffect(() => {
    if (open) {
      setName(group?.name ?? "");
      setDescription(group?.description ?? "");
    }
  }, [open, group]);

  const closeModal = () => {
    if (isSaving) return;
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      notify.warning("Validation Error", { description: "Please enter a group name." });
      return;
    }
    const descriptionValue = description.trim() || null;
    try {
      if (group) {
        await updateMutation.mutateAsync({
          id: group.id,
          data: { name: name.trim(), description: descriptionValue },
        });
        notify.success("Group updated");
      } else {
        await createMutation.mutateAsync({ name: name.trim(), description: descriptionValue ?? undefined });
        notify.success("Group created");
      }
      onClose();
    } catch (error) {
      notify.error("Error", {
        description: handleError(error, isEditing ? "Update Agent Group" : "Create Agent Group"),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : closeModal())} maxWidth="sm">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit group" : "Add group"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <AppInput
            isBgWhite
            fullWidth
            label="Name"
            required
            placeholder="e.g. Tier 1 Support"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <AppTextarea
            isBgWhite
            label="Description"
            rows={4}
            placeholder="What is this team responsible for? (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <DialogFooter>
          <AppButton variantStyle="outline" color="gray" onClick={closeModal} disabled={isSaving}>
            Cancel
          </AppButton>
          <AppButton onClick={handleSave} disabled={isSaving} isLoading={isSaving}>
            {isEditing ? "Save changes" : "Add group"}
          </AppButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
