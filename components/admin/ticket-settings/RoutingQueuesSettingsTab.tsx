"use client";

import { useEffect, useMemo, useState } from "react";
import { Switch } from "@mui/material";
import { ListOrdered, Pencil, Plus, Trash2, Zap } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SuperTable, MRT_ColumnDef } from "@/components/ui/super-table";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { usePermission } from "@/lib/hooks/usePermission";
import {
  useAgentGroups,
  useMyPresence,
  useUpdateMyRoutingProfile,
  useConversationQueues,
  useCreateConversationQueue,
  useUpdateConversationQueue,
  useDeleteConversationQueue,
  useRouteQueueNow,
} from "@/lib/hooks/useAgents";
import type {
  ConversationQueue,
  ConversationQueueChannelType,
  ConversationQueuePriority,
  RoutingStrategy,
} from "@/lib/types/agents";

// "Any" is the empty-string option that maps back to a null column on save.
const CHANNEL_OPTIONS: { value: ConversationQueueChannelType | ""; label: string }[] = [
  { value: "", label: "Any" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "web_widget", label: "Web widget" },
];

const PRIORITY_OPTIONS: { value: ConversationQueuePriority | ""; label: string }[] = [
  { value: "", label: "Any" },
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const CHANNEL_LABEL: Record<ConversationQueueChannelType, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  web_widget: "Web widget",
};

const PRIORITY_LABEL: Record<ConversationQueuePriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

// Phase 4b auto-assignment strategy (only shown when auto-assign is on).
const STRATEGY_OPTIONS: { value: RoutingStrategy; label: string }[] = [
  { value: "round_robin", label: "Round robin" },
  { value: "load_based", label: "Load-based" },
];

const STRATEGY_LABEL: Record<RoutingStrategy, string> = {
  round_robin: "Round-robin",
  load_based: "Load-based",
};

// ---------------------------------------------------------------------------
// My routing profile - self-service capacity + transfer opt-in. Available to
// any omnichannel:use holder (the route is already gated to that permission).
// ---------------------------------------------------------------------------
function MyRoutingProfileSection() {
  const { data: profile, isLoading, isError } = useMyPresence();
  const updateMutation = useUpdateMyRoutingProfile();

  const [maxConcurrent, setMaxConcurrent] = useState("");
  const [acceptsTransfers, setAcceptsTransfers] = useState(true);

  // Seed the form from the loaded profile.
  useEffect(() => {
    if (profile) {
      setMaxConcurrent(profile.max_concurrent_open != null ? String(profile.max_concurrent_open) : "");
      setAcceptsTransfers(profile.accepts_transfers);
    }
  }, [profile]);

  const handleSave = async () => {
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
      await updateMutation.mutateAsync({
        max_concurrent_open: maxValue,
        accepts_transfers: acceptsTransfers,
      });
      notify.success("Routing profile saved");
    } catch (error) {
      notify.error("Error", { description: handleError(error, "Update Routing Profile") });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">My routing profile</h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Controls how work is routed to you: your open-conversation capacity and whether you accept
          transfers from other agents.
        </p>
      </div>

      {isError ? (
        <p className="text-sm text-red-500">Couldn&apos;t load your routing profile. Please try again.</p>
      ) : (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="w-full sm:w-56">
              <AppInput
                isBgWhite
                fullWidth
                label="Max concurrent open"
                type="number"
                inputProps={{ min: 1 }}
                placeholder="Unlimited"
                value={maxConcurrent}
                disabled={isLoading}
                onChange={(e) => setMaxConcurrent(e.target.value)}
                helperText="Leave blank for unlimited."
              />
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm text-gray-600">
              <Switch
                size="small"
                checked={acceptsTransfers}
                disabled={isLoading}
                onChange={(e) => setAcceptsTransfers(e.target.checked)}
                inputProps={{ "aria-label": "Accept transfers" }}
              />
              Accept transfers
            </label>
          </div>
          <AppButton
            onClick={handleSave}
            disabled={isLoading || updateMutation.isPending}
            isLoading={updateMutation.isPending}
            className="shrink-0"
          >
            Save profile
          </AppButton>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conversation queues - admin CRUD. Listing needs omnichannel:use (route gate);
// write actions are gated in-UI by omnichannel:setup.
// ---------------------------------------------------------------------------
export default function RoutingQueuesSettingsTab() {
  const { can } = usePermission();
  const canManage = can("omnichannel:setup");

  const [showInactive, setShowInactive] = useState(false);
  const { data: queues = [], isLoading, isError, refetch } = useConversationQueues(showInactive);
  const { data: groups = [] } = useAgentGroups();

  const groupsById = useMemo(() => {
    const map = new Map<string, string>();
    groups.forEach((g) => map.set(g.id, g.name));
    return map;
  }, [groups]);

  const createMutation = useCreateConversationQueue();
  const updateMutation = useUpdateConversationQueue();
  const deleteMutation = useDeleteConversationQueue();
  const routeNowMutation = useRouteQueueNow();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ConversationQueue | null>(null);
  const [name, setName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [channel, setChannel] = useState<ConversationQueueChannelType | "">("");
  const [priority, setPriority] = useState<ConversationQueuePriority | "">("");
  const [position, setPosition] = useState("0");
  const [autoRoute, setAutoRoute] = useState(false);
  const [routingStrategy, setRoutingStrategy] = useState<RoutingStrategy>("round_robin");
  const [deleteTarget, setDeleteTarget] = useState<ConversationQueue | null>(null);
  // Which queue row is currently being routed (drives the per-row spinner state).
  const [routingId, setRoutingId] = useState<string | null>(null);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const openCreate = () => {
    setEditing(null);
    setName("");
    setGroupId("");
    setChannel("");
    setPriority("");
    setPosition(String(queues.length));
    setAutoRoute(false);
    setRoutingStrategy("round_robin");
    setModalOpen(true);
  };

  const openEdit = (queue: ConversationQueue) => {
    setEditing(queue);
    setName(queue.name);
    setGroupId(queue.group_id ?? "");
    setChannel(queue.channel_type ?? "");
    setPriority(queue.priority ?? "");
    setPosition(String(queue.position));
    setAutoRoute(queue.auto_route);
    setRoutingStrategy(queue.routing_strategy);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalOpen(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      notify.warning("Validation Error", { description: "Please enter a queue name." });
      return;
    }
    const positionValue = Number(position);
    if (!Number.isInteger(positionValue) || positionValue < 0) {
      notify.warning("Validation Error", {
        description: "Position must be a whole number of 0 or more.",
      });
      return;
    }
    const payload = {
      name: name.trim(),
      group_id: groupId || null,
      channel_type: channel || null,
      priority: priority || null,
      position: positionValue,
      auto_route: autoRoute,
      routing_strategy: routingStrategy,
    };
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: payload });
        notify.success("Queue updated");
      } else {
        await createMutation.mutateAsync(payload);
        notify.success("Queue added");
      }
      setModalOpen(false);
    } catch (error) {
      notify.error("Error", {
        description: handleError(error, editing ? "Update Queue" : "Create Queue"),
      });
    }
  };

  const handleToggleActive = (queue: ConversationQueue) => {
    updateMutation.mutate(
      { id: queue.id, data: { is_active: !queue.is_active } },
      {
        onSuccess: () => notify.success(queue.is_active ? "Queue deactivated" : "Queue activated"),
        onError: (error) => notify.error("Error", { description: handleError(error, "Update Queue") }),
      }
    );
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      notify.success("Queue removed");
      setDeleteTarget(null);
    } catch (error) {
      notify.error("Error", { description: handleError(error, "Delete Queue") });
    }
  };

  // Phase 4b: run the auto-assignment sweep for a single queue immediately.
  const handleRouteNow = (queue: ConversationQueue) => {
    setRoutingId(queue.id);
    routeNowMutation.mutate(queue.id, {
      onSuccess: ({ assigned }) => {
        if (assigned > 0) {
          notify.success(`Assigned ${assigned} conversation(s)`);
        } else {
          notify.info("Nothing to route", {
            description: "No unassigned conversations matched this queue.",
          });
        }
      },
      onError: (error) => notify.error("Error", { description: handleError(error, "Route Now") }),
      onSettled: () => setRoutingId(null),
    });
  };

  const columns = useMemo<MRT_ColumnDef<ConversationQueue>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        Cell: ({ row }) => (
          <span
            className={row.original.is_active ? "font-semibold text-gray-800" : "font-semibold text-gray-400"}
          >
            {row.original.name}
          </span>
        ),
      },
      {
        id: "group",
        accessorFn: (row) => (row.group_id ? groupsById.get(row.group_id) ?? "Group" : "Any agent"),
        header: "Group",
      },
      {
        id: "channel",
        accessorFn: (row) => (row.channel_type ? CHANNEL_LABEL[row.channel_type] : "Any"),
        header: "Channel",
      },
      {
        id: "priority",
        accessorFn: (row) => (row.priority ? PRIORITY_LABEL[row.priority] : "Any"),
        header: "Priority",
      },
      {
        id: "auto",
        accessorFn: (row) => (row.auto_route ? STRATEGY_LABEL[row.routing_strategy] : "Off"),
        header: "Auto",
        Cell: ({ row }) =>
          row.original.auto_route ? (
            <Badge variant="secondary" className="font-medium">
              {STRATEGY_LABEL[row.original.routing_strategy]}
            </Badge>
          ) : (
            <Badge variant="outline" className="font-medium text-gray-400">
              Off
            </Badge>
          ),
      },
      {
        accessorKey: "position",
        header: "Position",
        Cell: ({ cell }) => <span className="tabular-nums text-gray-700">{cell.getValue<number>()}</span>,
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
    [groupsById, canManage, updateMutation.isPending]
  );

  const groupSelectOptions = useMemo(
    () => [
      { value: "", label: "Any agent" },
      ...groups.map((g) => ({ value: g.id, label: g.name })),
    ],
    [groups]
  );

  return (
    <div className="space-y-4">
      <MyRoutingProfileSection />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-sm text-gray-500 max-w-2xl">
            Ordered queues describe a slice of work agents can pull from with{" "}
            <span className="font-medium">Claim next</span> in the workspace. Scope a queue to a group,
            channel or priority - leave any of those as <span className="font-medium">Any</span> to match
            everything. Lower positions are pulled first.
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <label className="flex items-center gap-1.5 text-sm text-gray-600 whitespace-nowrap">
              <Switch
                size="small"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                inputProps={{ "aria-label": "Show inactive queues" }}
              />
              Show inactive
            </label>
            {canManage && (
              <AppButton onClick={openCreate} startIcon={<Plus size={16} />}>
                Add queue
              </AppButton>
            )}
          </div>
        </div>

        <SuperTable<ConversationQueue>
          tableId="conversation-queues-table"
          columns={columns}
          data={queues}
          isLoading={isLoading}
          isError={isError}
          errorMessage="Failed to load conversation queues. Please try again."
          onRetry={() => refetch()}
          renderRowActions={
            canManage
              ? ({ row }) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRouteNow(row.original)}
                      className="text-gray-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-gray-300"
                      aria-label={`Route ${row.original.name} now`}
                      title={
                        row.original.is_active
                          ? "Route now - assign matching conversations to eligible online agents"
                          : "Activate the queue to route"
                      }
                      disabled={
                        !row.original.is_active ||
                        (routeNowMutation.isPending && routingId === row.original.id)
                      }
                    >
                      <Zap size={16} />
                    </button>
                    <button
                      onClick={() => openEdit(row.original)}
                      className="text-gray-300 hover:text-gray-700"
                      aria-label="Edit queue"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(row.original)}
                      className="text-gray-300 hover:text-red-500"
                      aria-label="Delete queue"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              : undefined
          }
          renderEmptyState={() => (
            <EmptyState
              icon={ListOrdered}
              title="No conversation queues yet"
              description={
                canManage
                  ? "Create your first queue so agents can pull the next-in-line conversation from the workspace."
                  : "No conversation queues have been created yet."
              }
              action={
                canManage
                  ? { label: "Add queue", onClick: openCreate, icon: <Plus size={16} /> }
                  : undefined
              }
            />
          )}
          features={{ columnFilters: false }}
        />
      </div>

      {canManage && (
        <Dialog open={modalOpen} onOpenChange={(next) => (next ? undefined : closeModal())} maxWidth="sm">
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit queue" : "Add queue"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <AppInput
                isBgWhite
                fullWidth
                label="Name"
                required
                placeholder="e.g. Urgent WhatsApp"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <AppSelect
                isBgWhite
                fullWidth
                label="Group"
                value={groupId}
                options={groupSelectOptions}
                onChange={(e) => setGroupId(e.target.value as string)}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AppSelect
                  isBgWhite
                  fullWidth
                  label="Channel"
                  value={channel}
                  options={CHANNEL_OPTIONS}
                  onChange={(e) => setChannel(e.target.value as ConversationQueueChannelType | "")}
                />
                <AppSelect
                  isBgWhite
                  fullWidth
                  label="Priority"
                  value={priority}
                  options={PRIORITY_OPTIONS}
                  onChange={(e) => setPriority(e.target.value as ConversationQueuePriority | "")}
                />
              </div>
              <AppInput
                isBgWhite
                fullWidth
                label="Position"
                type="number"
                inputProps={{ min: 0 }}
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                helperText="Lower positions are pulled first."
              />

              <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Switch
                    size="small"
                    checked={autoRoute}
                    onChange={(e) => setAutoRoute(e.target.checked)}
                    inputProps={{ "aria-label": "Auto-assign conversations" }}
                  />
                  Auto-assign
                </label>
                <p className="text-xs text-gray-500">
                  When on, unassigned conversations matching this queue are automatically assigned to
                  eligible online agents (checked every minute).
                </p>
                {autoRoute && (
                  <AppSelect
                    isBgWhite
                    fullWidth
                    label="Strategy"
                    value={routingStrategy}
                    options={STRATEGY_OPTIONS}
                    onChange={(e) => setRoutingStrategy(e.target.value as RoutingStrategy)}
                  />
                )}
              </div>
            </div>

            <DialogFooter>
              <AppButton variantStyle="outline" color="gray" onClick={closeModal} disabled={isSaving}>
                Cancel
              </AppButton>
              <AppButton onClick={handleSave} disabled={isSaving} isLoading={isSaving}>
                {editing ? "Save changes" : "Add queue"}
              </AppButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <ConfirmationPopup
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete queue"
        description={`Are you sure you want to delete "${deleteTarget?.name ?? ""}"? Agents will no longer be able to pull from it. This can be reversed by re-activating the queue.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
