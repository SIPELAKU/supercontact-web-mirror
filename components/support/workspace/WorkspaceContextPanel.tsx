"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Chip } from "@mui/material";
import { format } from "date-fns";
import { Mail, Phone, Globe, User, ExternalLink, Hash } from "lucide-react";
import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import { AppSelect } from "@/components/ui/app-select";
import { AppButton } from "@/components/ui/app-button";
import { useUsers } from "@/lib/hooks/useUsers";
import {
  useAssignConversation,
  useSetConversationStatus,
  useSetConversationPriority,
  useSetConversationTags,
  useConversationTags,
} from "@/lib/hooks/useOmnichannel";
import {
  ConversationWithMessages,
  ConversationListItem,
  ConversationStatus,
  ConversationPriority,
  SettableConversationStatus,
  ConversationTag,
  ConversationNote,
} from "@/lib/types/omnichannel";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { cn } from "@/lib/utils";
import { ChannelType, CHANNEL_META, STATUS_META, avatarColor, getInitials } from "./workspaceHelpers";

// Icon + human label for the customer's channel identifier row.
const IDENTIFIER_META: Record<ChannelType, { icon: React.ElementType; label: string }> = {
  email: { icon: Mail, label: "Email" },
  whatsapp: { icon: Phone, label: "Phone" },
  web_widget: { icon: Globe, label: "Visitor" },
};

interface WorkspaceContextPanelProps {
  selectedItem: ConversationListItem | null;
  conversation?: ConversationWithMessages;
}

export function WorkspaceContextPanel({ selectedItem, conversation }: WorkspaceContextPanelProps) {
  if (!selectedItem) {
    return (
      <aside className="flex h-full w-full flex-col items-center justify-center border-l border-gray-200 bg-white px-6 text-center">
        <User className="mb-2 h-6 w-6 text-gray-300" />
        <p className="text-sm text-gray-400">Customer &amp; conversation details appear here.</p>
      </aside>
    );
  }

  const conversationId = selectedItem.id;
  const channelType = conversation?.channel_type || selectedItem.channel_type;
  const name =
    conversation?.external_contact_name ||
    selectedItem.external_contact_name ||
    conversation?.external_contact_identifier ||
    selectedItem.external_contact_identifier ||
    "Unknown contact";
  const identifier =
    conversation?.external_contact_identifier || selectedItem.external_contact_identifier || "—";
  const idMeta = IDENTIFIER_META[channelType];
  const IdIcon = idMeta.icon;
  const color = avatarColor(identifier || conversationId);

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden border-l border-gray-200 bg-white">
      <div className="flex-1 overflow-y-auto">
        {/* Customer hero */}
        <div className="border-b border-gray-100 px-4 py-4 text-center">
          <div
            className="mx-auto mb-2.5 grid h-16 w-16 place-items-center rounded-full text-[22px] font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {getInitials(name)}
          </div>
          <h3 className="truncate text-base font-extrabold text-gray-900">{name}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{CHANNEL_META[channelType].label}</p>
        </div>

        {/* Customer essentials */}
        <Section title="Customer">
          <KV icon={<User className="h-[15px] w-[15px]" />} k="Name" v={name} />
          <KV icon={<Hash className="h-[15px] w-[15px]" />} k="Channel" v={CHANNEL_META[channelType].label} />
          <KV icon={<IdIcon className="h-[15px] w-[15px]" />} k={idMeta.label} v={identifier} />
          {selectedItem.contact_id && (
            <Link
              href={`/contact/detail/${selectedItem.contact_id}?tab=conversations`}
              className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-[#3E63D8] hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View full profile
            </Link>
          )}
        </Section>

        {/* Conversation properties - all fully functional */}
        <Section title="Conversation">
          <StatusControl conversationId={conversationId} status={conversation?.status} />
          <PriorityControl conversationId={conversationId} priority={conversation?.priority} />
          <AssigneeControl
            conversationId={conversationId}
            currentUserId={selectedItem.assigned_user_id ?? undefined}
            currentUserFullname={conversation?.assigned_user_fullname}
          />
          <TagsControl conversationId={conversationId} tags={conversation?.tags || []} />
        </Section>

        {/* Internal notes (read-only here; added from the composer's Note tab) */}
        <NotesSection notes={conversation?.notes || []} />

        {/* OMITTED by design (no data source yet), matching the workspace spec:
            - SLA countdown chips  -> TODO(Support Desk Phase 2): SLA policies API
            - Suggested knowledge  -> TODO(Support Desk Phase 3): KB suggestions API
            Rendered as nothing rather than empty/fake panels. */}
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-100 px-4 py-3.5">
      <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function KV({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="flex items-center gap-2.5 text-[12.5px]">
      <span className="shrink-0 text-gray-400">{icon}</span>
      <span className="w-16 shrink-0 text-gray-500">{k}</span>
      <span className="truncate font-semibold text-gray-800" title={v}>
        {v}
      </span>
    </div>
  );
}

// ------------------- Conversation property controls -------------------
// Recipes ported from components/omnichannel/ConversationDetailSidebar.tsx so
// the workspace behaves identically to the existing inbox's property editors.

const STATUS_ACTIONS: { label: string; value: SettableConversationStatus }[] = [
  { label: "Solve", value: "solved" },
  { label: "Close", value: "closed" },
  { label: "Archive", value: "archived" },
  { label: "Reopen", value: "open" },
];

function StatusControl({ conversationId, status }: { conversationId: string; status?: ConversationStatus }) {
  const statusMutation = useSetConversationStatus();
  const current: ConversationStatus = status ?? "open";
  const meta = STATUS_META[current];

  const setStatus = (next: SettableConversationStatus) =>
    statusMutation.mutate(
      { conversationId, data: { status: next } },
      { onError: (error) => notify.error("Error", { description: handleError(error, "Update Status") }) }
    );

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-[11.5px] font-semibold text-gray-500">Status</label>
        <span className={cn("rounded-full px-2 py-0.5 text-[10.5px] font-bold", meta.pill)}>{meta.label}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {STATUS_ACTIONS.map((action) => (
          <AppButton
            key={action.value}
            variantStyle="outline"
            color="gray"
            size="small"
            className="text-xs"
            disabled={statusMutation.isPending || current === action.value}
            onClick={() => setStatus(action.value)}
          >
            {action.label}
          </AppButton>
        ))}
      </div>
    </div>
  );
}

const PRIORITY_OPTIONS: { value: ConversationPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

function PriorityControl({ conversationId, priority }: { conversationId: string; priority?: ConversationPriority }) {
  const priorityMutation = useSetConversationPriority();
  const current: ConversationPriority = priority ?? "normal";

  const handleChange = (next: string) => {
    if (next === current) return;
    priorityMutation.mutate(
      { conversationId, data: { priority: next as ConversationPriority } },
      { onError: (error) => notify.error("Error", { description: handleError(error, "Update Priority") }) }
    );
  };

  return (
    <div>
      <label className="mb-1.5 block text-[11.5px] font-semibold text-gray-500">Priority</label>
      <AppSelect
        isBgWhite
        options={PRIORITY_OPTIONS}
        value={current}
        onChange={(e) => handleChange(e.target.value as string)}
        disabled={priorityMutation.isPending}
      />
    </div>
  );
}

interface UserOption {
  value: string;
  label: string;
}

function AssigneeControl({
  conversationId,
  currentUserId,
  currentUserFullname,
}: {
  conversationId: string;
  currentUserId?: string;
  currentUserFullname?: string;
}) {
  const [search, setSearch] = useState("");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback((_event: any, value: string) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => setSearch(value), 300);
  }, []);

  const { data: usersData, isLoading: isLoadingUsers } = useUsers(1, 20, search);
  const userOptions: UserOption[] = (usersData?.data?.users || []).map((u) => ({
    value: u.id,
    label: u.fullname,
  }));

  const assignMutation = useAssignConversation();

  const currentValue: UserOption | null = currentUserId
    ? userOptions.find((opt) => opt.value === currentUserId) || {
        value: currentUserId,
        label: currentUserFullname || "Assigned user",
      }
    : null;

  const handleAssignChange = (newValue: UserOption | null) => {
    assignMutation.mutate(
      { conversationId, data: { assigned_user_id: newValue?.value ?? null } },
      { onError: (error) => notify.error("Error", { description: handleError(error, "Assign Conversation") }) }
    );
  };

  return (
    <div>
      <label className="mb-1.5 block text-[11.5px] font-semibold text-gray-500">Assignee</label>
      <AppAutocomplete
        isBgWhite
        options={userOptions}
        placeholder="Assign to a user"
        value={currentValue}
        onChange={(_e, newValue) => handleAssignChange(newValue as UserOption | null)}
        onInputChange={handleSearchChange}
        loading={isLoadingUsers}
        disabled={assignMutation.isPending}
      />
    </div>
  );
}

// Every change sends the full tag-name set (PUT /tags is a full replace).
function TagsControl({ conversationId, tags }: { conversationId: string; tags: ConversationTag[] }) {
  const { data: tagSuggestions } = useConversationTags();
  const suggestionNames = (tagSuggestions?.tags || []).map((t) => t.name);
  const currentTagNames = tags.map((t) => t.name);

  const setTagsMutation = useSetConversationTags();

  const handleTagsChange = (newValue: string[]) =>
    setTagsMutation.mutate(
      { conversationId, data: { tags: newValue } },
      { onError: (error) => notify.error("Error", { description: handleError(error, "Update Tags") }) }
    );

  return (
    <div>
      <label className="mb-1.5 block text-[11.5px] font-semibold text-gray-500">Tags</label>
      <AppAutocomplete
        isBgWhite
        multiple
        freeSolo
        options={suggestionNames}
        value={currentTagNames}
        disabled={setTagsMutation.isPending}
        filterOptions={(options: string[], state: { inputValue: string }) => {
          const input = state.inputValue.trim().toLowerCase();
          if (!input) return options;
          return options.filter((opt) => opt.toLowerCase().includes(input));
        }}
        onChange={(_e, newValue) => handleTagsChange((newValue as string[]) || [])}
        renderTags={(tagValue: string[], getTagProps: any) =>
          tagValue.map((option: string, index: number) => (
            <Chip
              {...getTagProps({ index })}
              key={option}
              label={option}
              size="small"
              sx={{ backgroundColor: "#5479EE1A", color: "#5479EE", fontWeight: 500 }}
            />
          ))
        }
        placeholder="Add tags..."
      />
    </div>
  );
}

function NotesSection({ notes }: { notes: ConversationNote[] }) {
  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [notes]
  );

  return (
    <div className="px-4 py-3.5">
      <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">Internal notes</div>
      {sortedNotes.length > 0 ? (
        <div className="space-y-2">
          {sortedNotes.map((n) => (
            <div key={n.id} className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="truncate text-xs font-bold text-amber-800">{n.user_fullname}</span>
                <span className="shrink-0 text-[10px] text-amber-600">
                  {format(new Date(n.created_at), "dd MMM, HH:mm")}
                </span>
              </div>
              <p className="whitespace-pre-wrap break-words text-sm text-amber-900">{n.note}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">
          No notes yet. Use the composer&apos;s Internal note tab to add one.
        </p>
      )}
    </div>
  );
}
