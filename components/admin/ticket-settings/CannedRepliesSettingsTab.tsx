"use client";

import { useMemo, useState } from "react";
import { Switch } from "@mui/material";
import { MessageSquareText, Pencil, Plus, Trash2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppTextarea } from "@/components/ui/app-textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { SuperTable, MRT_ColumnDef } from "@/components/ui/super-table";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { CannedReply } from "@/lib/types/omnichannel";
import {
  useCannedReplies,
  useCreateCannedReply,
  useUpdateCannedReply,
  useDeleteCannedReply,
} from "@/lib/hooks/useOmnichannel";

export default function CannedRepliesSettingsTab() {
  // Full listing (active + inactive) for management.
  const { data: replies = [], isLoading, isError, refetch } = useCannedReplies(true);
  const createMutation = useCreateCannedReply();
  const updateMutation = useUpdateCannedReply();
  const deleteMutation = useDeleteCannedReply();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CannedReply | null>(null);
  const [title, setTitle] = useState("");
  const [shortcut, setShortcut] = useState("");
  const [body, setBody] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<CannedReply | null>(null);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setShortcut("");
    setBody("");
    setIsActive(true);
    setModalOpen(true);
  };

  const openEdit = (reply: CannedReply) => {
    setEditing(reply);
    setTitle(reply.title);
    setShortcut(reply.shortcut ?? "");
    setBody(reply.body);
    setIsActive(reply.is_active);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalOpen(false);
  };

  const handleSave = async () => {
    if (!title.trim() || !body.trim()) {
      notify.warning("Validation Error", { description: "Please fill in a title and a reply body." });
      return;
    }
    const shortcutValue = shortcut.trim() || null;
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          data: { title: title.trim(), shortcut: shortcutValue, body: body.trim(), is_active: isActive },
        });
        notify.success("Canned reply updated");
      } else {
        await createMutation.mutateAsync({
          title: title.trim(),
          shortcut: shortcutValue,
          body: body.trim(),
          is_active: isActive,
        });
        notify.success("Canned reply added");
      }
      setModalOpen(false);
    } catch (error) {
      notify.error("Error", { description: handleError(error, editing ? "Update Canned Reply" : "Create Canned Reply") });
    }
  };

  const handleToggleActive = (reply: CannedReply) => {
    updateMutation.mutate(
      { id: reply.id, data: { is_active: !reply.is_active } },
      {
        onSuccess: () => notify.success(reply.is_active ? "Canned reply deactivated" : "Canned reply activated"),
        onError: (error) => notify.error("Error", { description: handleError(error, "Update Canned Reply") }),
      }
    );
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      notify.success("Canned reply removed");
      setDeleteTarget(null);
    } catch (error) {
      notify.error("Error", { description: handleError(error, "Delete Canned Reply") });
    }
  };

  const columns = useMemo<MRT_ColumnDef<CannedReply>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        Cell: ({ row }) => (
          <span className={row.original.is_active ? "font-semibold text-gray-800" : "font-semibold text-gray-400"}>
            {row.original.title}
          </span>
        ),
      },
      {
        accessorKey: "shortcut",
        header: "Shortcut",
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>();
          return value ? (
            <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] text-gray-600">
              /{value.replace(/^\//, "")}
            </span>
          ) : (
            <span className="text-gray-300">—</span>
          );
        },
      },
      {
        accessorKey: "body",
        header: "Body",
        Cell: ({ cell }) => (
          <div className="max-w-md truncate text-gray-600" title={cell.getValue<string>()}>
            {cell.getValue<string>()}
          </div>
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
            disabled={updateMutation.isPending}
            inputProps={{ "aria-label": `Toggle ${row.original.title} active` }}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateMutation.isPending]
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm text-gray-500 max-w-2xl">
          Saved replies agents can insert in the workspace by clicking the canned-replies button or typing{" "}
          <code className="bg-gray-100 px-1 rounded">/</code> followed by a shortcut. Use{" "}
          <code className="bg-gray-100 px-1 rounded">{"{{customer_name}}"}</code> and{" "}
          <code className="bg-gray-100 px-1 rounded">{"{{agent_name}}"}</code> as placeholders - they are filled
          in when the reply is inserted.
        </p>
        <AppButton onClick={openCreate} startIcon={<Plus size={16} />} className="shrink-0">
          Add canned reply
        </AppButton>
      </div>

      <SuperTable<CannedReply>
        tableId="canned-replies-table"
        urlKey="canned"
        columns={columns}
        data={replies}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load canned replies. Please try again."
        onRetry={() => refetch()}
        renderRowActions={({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => openEdit(row.original)}
              className="text-gray-300 hover:text-gray-700"
              aria-label="Edit canned reply"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => setDeleteTarget(row.original)}
              className="text-gray-300 hover:text-red-500"
              aria-label="Delete canned reply"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
        renderEmptyState={() => (
          <EmptyState
            icon={MessageSquareText}
            title="No canned replies yet"
            description="Add saved replies your agents can insert into any conversation in one click."
          />
        )}
        features={{          urlSync: true,
 columnFilters: false }}
      />

      <Dialog open={modalOpen} onOpenChange={(next) => (next ? undefined : closeModal())} maxWidth="sm">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit canned reply" : "Add canned reply"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <AppInput
              isBgWhite
              fullWidth
              label="Title"
              required
              placeholder="e.g. Greeting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <AppInput
              isBgWhite
              fullWidth
              label="Shortcut"
              placeholder="e.g. greeting (optional)"
              value={shortcut}
              onChange={(e) => setShortcut(e.target.value)}
            />
            <AppTextarea
              isBgWhite
              label="Reply body"
              required
              rows={5}
              placeholder="Hi {{customer_name}}, thanks for reaching out. This is {{agent_name}}…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <Switch
                size="small"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                inputProps={{ "aria-label": "Active" }}
              />
              Active (available to agents in the workspace)
            </label>
          </div>

          <DialogFooter>
            <AppButton variantStyle="outline" color="gray" onClick={closeModal} disabled={isSaving}>
              Cancel
            </AppButton>
            <AppButton onClick={handleSave} disabled={isSaving} isLoading={isSaving}>
              {editing ? "Save changes" : "Add canned reply"}
            </AppButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationPopup
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete canned reply"
        description={`Are you sure you want to delete "${deleteTarget?.title ?? ""}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
