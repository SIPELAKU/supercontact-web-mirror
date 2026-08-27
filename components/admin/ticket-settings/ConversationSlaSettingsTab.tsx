"use client";

import { useMemo, useState } from "react";
import { Switch } from "@mui/material";
import { Pencil, Plus, Timer, Trash2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { SuperTable, MRT_ColumnDef } from "@/components/ui/super-table";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { usePermission } from "@/lib/hooks/usePermission";
import { useBusinessHours } from "@/lib/hooks/useBusinessHours";
import {
  useConversationSlaPolicies,
  useCreateConversationSlaPolicy,
  useUpdateConversationSlaPolicy,
  useDeleteConversationSlaPolicy,
} from "@/lib/hooks/useConversationSla";
import {
  ConversationSlaChannelType,
  ConversationSlaPolicy,
  ConversationPriority,
} from "@/lib/types/omnichannel";

// "Any" is the empty-string option that maps back to a null column on save.
const CHANNEL_OPTIONS: { value: ConversationSlaChannelType | ""; label: string }[] = [
  { value: "", label: "Any" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "sms", label: "SMS" },
  { value: "email", label: "Email" },
  { value: "web_widget", label: "Web widget" },
  { value: "messenger", label: "Messenger" },
  { value: "instagram", label: "Instagram" },
];

const PRIORITY_OPTIONS: { value: ConversationPriority | ""; label: string }[] = [
  { value: "", label: "Any" },
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const CHANNEL_LABEL: Record<ConversationSlaChannelType, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
  web_widget: "Web widget",
  messenger: "Messenger",
  instagram: "Instagram",
};

const PRIORITY_LABEL: Record<ConversationPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

function formatMinutes(minutes: number): string {
  if (minutes % 60 === 0) return `${minutes / 60}h`;
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export default function ConversationSlaSettingsTab() {
  const { can } = usePermission();
  const canManage = can("omnichannel:setup");

  const [showInactive, setShowInactive] = useState(false);
  const { data: policies = [], isLoading, isError, refetch } = useConversationSlaPolicies(showInactive);
  const { data: calendarsData } = useBusinessHours();
  const calendars = calendarsData?.data?.data || [];

  const createMutation = useCreateConversationSlaPolicy();
  const updateMutation = useUpdateConversationSlaPolicy();
  const deleteMutation = useDeleteConversationSlaPolicy();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ConversationSlaPolicy | null>(null);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<ConversationSlaChannelType | "">("");
  const [priority, setPriority] = useState<ConversationPriority | "">("");
  const [firstResponseMinutes, setFirstResponseMinutes] = useState("60");
  const [resolutionMinutes, setResolutionMinutes] = useState("480");
  const [calendarId, setCalendarId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ConversationSlaPolicy | null>(null);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const openCreate = () => {
    setEditing(null);
    setName("");
    setChannel("");
    setPriority("");
    setFirstResponseMinutes("60");
    setResolutionMinutes("480");
    setCalendarId("");
    setModalOpen(true);
  };

  const openEdit = (policy: ConversationSlaPolicy) => {
    setEditing(policy);
    setName(policy.name);
    setChannel(policy.channel_type ?? "");
    setPriority(policy.priority ?? "");
    setFirstResponseMinutes(String(policy.first_response_target_minutes));
    setResolutionMinutes(String(policy.resolution_target_minutes));
    setCalendarId(policy.business_hours_calendar_id ?? "");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalOpen(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      notify.warning("Validation Error", { description: "Please enter a policy name." });
      return;
    }
    const firstResponse = Number(firstResponseMinutes);
    const resolution = Number(resolutionMinutes);
    if (!firstResponse || firstResponse <= 0 || !resolution || resolution <= 0) {
      notify.warning("Validation Error", {
        description: "Targets must be positive numbers of minutes.",
      });
      return;
    }
    const payload = {
      name: name.trim(),
      channel_type: channel || null,
      priority: priority || null,
      first_response_target_minutes: firstResponse,
      resolution_target_minutes: resolution,
      business_hours_calendar_id: calendarId || null,
    };
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: payload });
        notify.success("SLA policy updated");
      } else {
        await createMutation.mutateAsync(payload);
        notify.success("SLA policy added");
      }
      setModalOpen(false);
    } catch (error) {
      notify.error("Error", {
        description: handleError(error, editing ? "Update SLA Policy" : "Create SLA Policy"),
      });
    }
  };

  const handleToggleActive = (policy: ConversationSlaPolicy) => {
    updateMutation.mutate(
      { id: policy.id, data: { is_active: !policy.is_active } },
      {
        onSuccess: () =>
          notify.success(policy.is_active ? "SLA policy deactivated" : "SLA policy activated"),
        onError: (error) => notify.error("Error", { description: handleError(error, "Update SLA Policy") }),
      }
    );
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      notify.success("SLA policy removed");
      setDeleteTarget(null);
    } catch (error) {
      notify.error("Error", { description: handleError(error, "Delete SLA Policy") });
    }
  };

  const columns = useMemo<MRT_ColumnDef<ConversationSlaPolicy>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        Cell: ({ row }) => (
          <span className={row.original.is_active ? "font-semibold text-gray-800" : "font-semibold text-gray-400"}>
            {row.original.name}
          </span>
        ),
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
        id: "first_response",
        accessorFn: (row) => row.first_response_target_minutes,
        header: "First response",
        Cell: ({ row }) => <>{formatMinutes(row.original.first_response_target_minutes)}</>,
      },
      {
        id: "resolution",
        accessorFn: (row) => row.resolution_target_minutes,
        header: "Resolution",
        Cell: ({ row }) => <>{formatMinutes(row.original.resolution_target_minutes)}</>,
      },
      {
        id: "business_hours",
        accessorFn: (row) =>
          calendars.find((c) => c.id === row.business_hours_calendar_id)?.name || "24/7",
        header: "Business hours",
      },
      {
        accessorKey: "is_active",
        header: "Active",
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <span data-st-no-row-click>
            <Switch
              size="small"
              checked={row.original.is_active}
              onChange={() => handleToggleActive(row.original)}
              disabled={!canManage || updateMutation.isPending}
              inputProps={{ "aria-label": `Toggle ${row.original.name} active` }}
            />
          </span>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calendars, canManage, updateMutation.isPending]
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm text-gray-500 max-w-2xl">
          First-response and resolution targets for omnichannel conversations. The most specific
          matching policy (channel + priority, then priority-only, then channel-only, then a
          catch-all) applies to each conversation. Leave channel or priority as{" "}
          <span className="font-medium">Any</span> to match everything.
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <Switch
              size="small"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              inputProps={{ "aria-label": "Show inactive policies" }}
            />
            Show inactive
          </label>
          {canManage && (
            <AppButton onClick={openCreate} startIcon={<Plus size={16} />}>
              Add policy
            </AppButton>
          )}
        </div>
      </div>

      <SuperTable<ConversationSlaPolicy>
        tableId="conversation-sla-policies-table"
        urlKey="convsla"
        columns={columns}
        data={policies}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load conversation SLA policies. Please try again."
        onRetry={() => refetch()}
        onRowClick={canManage ? (row) => openEdit(row) : undefined}
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
            icon={Timer}
            title="No conversation SLA policies yet"
            description="Add first-response and resolution targets to track SLA compliance across your conversations."
          />
        )}
        features={{          urlSync: true,
 columnFilters: false }}
      />

      <Dialog open={modalOpen} onOpenChange={(next) => (next ? undefined : closeModal())} maxWidth="sm">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit SLA policy" : "Add SLA policy"}</DialogTitle>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AppSelect
                isBgWhite
                fullWidth
                label="Channel"
                value={channel}
                options={CHANNEL_OPTIONS}
                onChange={(e) => setChannel(e.target.value as ConversationSlaChannelType | "")}
              />
              <AppSelect
                isBgWhite
                fullWidth
                label="Priority"
                value={priority}
                options={PRIORITY_OPTIONS}
                onChange={(e) => setPriority(e.target.value as ConversationPriority | "")}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AppInput
                isBgWhite
                fullWidth
                label="First response (minutes)"
                required
                type="number"
                inputProps={{ min: 1 }}
                value={firstResponseMinutes}
                onChange={(e) => setFirstResponseMinutes(e.target.value)}
              />
              <AppInput
                isBgWhite
                fullWidth
                label="Resolution (minutes)"
                required
                type="number"
                inputProps={{ min: 1 }}
                value={resolutionMinutes}
                onChange={(e) => setResolutionMinutes(e.target.value)}
              />
            </div>
            <AppSelect
              isBgWhite
              fullWidth
              label="Business hours calendar"
              value={calendarId}
              options={[
                { value: "", label: "None (24/7)" },
                ...calendars.map((c) => ({ value: c.id, label: c.name })),
              ]}
              onChange={(e) => setCalendarId(e.target.value as string)}
            />
          </div>

          <DialogFooter>
            <AppButton variantStyle="outline" color="gray" onClick={closeModal} disabled={isSaving}>
              Cancel
            </AppButton>
            <AppButton onClick={handleSave} disabled={isSaving} isLoading={isSaving}>
              {editing ? "Save changes" : "Add policy"}
            </AppButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationPopup
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete SLA policy"
        description={`Are you sure you want to delete "${deleteTarget?.name ?? ""}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
