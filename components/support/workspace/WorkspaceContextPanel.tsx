"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Chip } from "@mui/material";
import { format } from "date-fns";
import { Mail, Phone, Globe, User, ExternalLink, Hash, Clock, Building2, MapPin, Briefcase, ClipboardCheck, Facebook } from "lucide-react";
import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import { AppSelect } from "@/components/ui/app-select";
import { AppButton } from "@/components/ui/app-button";
import { useUsers } from "@/lib/hooks/useUsers";
import { usePermission } from "@/lib/hooks/usePermission";
import { QaReviewFormDialog } from "@/components/support/qa/QaReviewFormDialog";
import {
  useAssignConversation,
  useSetConversationStatus,
  useSetConversationPriority,
  useSetConversationTags,
  useConversationTags,
  useOrganization,
  useOrganizationConversations,
} from "@/lib/hooks/useOmnichannel";
import {
  ConversationWithMessages,
  ConversationListItem,
  ConversationStatus,
  ConversationPriority,
  SettableConversationStatus,
  ConversationTag,
  ConversationNote,
  ConversationSlaSummary,
} from "@/lib/types/omnichannel";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { cn } from "@/lib/utils";
import {
  ChannelType,
  CHANNEL_META,
  STATUS_META,
  SLA_TONE_META,
  avatarColor,
  getInitials,
  getSlaTargetState,
  formatRelativeTime,
} from "./workspaceHelpers";

// Icon + human label for the customer's channel identifier row.
const IDENTIFIER_META: Record<ChannelType, { icon: React.ElementType; label: string }> = {
  sms: { icon: Phone, label: "Phone" },
  email: { icon: Mail, label: "Email" },
  whatsapp: { icon: Phone, label: "Phone" },
  web_widget: { icon: Globe, label: "Visitor" },
  // A PSID is an opaque page-scoped id, not a phone/email.
  messenger: { icon: Facebook, label: "Messenger ID" },
};

interface WorkspaceContextPanelProps {
  selectedItem: ConversationListItem | null;
  conversation?: ConversationWithMessages;
  // Selecting one of the organization's other conversations reuses the same
  // selection mechanism the queue list uses (WorkspaceClient.handleSelect).
  onSelectConversation?: (item: ConversationListItem) => void;
}

export function WorkspaceContextPanel({ selectedItem, conversation, onSelectConversation }: WorkspaceContextPanelProps) {
  // Hooks stay above the empty-state early return (React rules of hooks).
  const { can } = usePermission();
  const canQaReview = can("support:qa:review");
  const [isQaOpen, setIsQaOpen] = useState(false);

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
  // Fallback keeps the panel rendering even if the backend ships a channel
  // value this build doesn't know yet.
  const idMeta = IDENTIFIER_META[channelType] ?? IDENTIFIER_META.web_widget;
  const IdIcon = idMeta.icon;
  const color = avatarColor(identifier || conversationId);

  // CRM organization the contact belongs to (Support Desk Phase 1/2). Prefer
  // the freshly-fetched conversation, fall back to the selected list-item.
  const crmCompanyId = conversation?.crm_company_id ?? selectedItem.crm_company_id ?? null;
  const organizationName = conversation?.organization_name ?? selectedItem.organization_name ?? null;

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

        {/* Organization - only when the contact is linked to a CRM company.
            Renders nothing otherwise (no empty section). */}
        {crmCompanyId && (
          <OrganizationSection
            crmCompanyId={crmCompanyId}
            fallbackName={organizationName}
            currentConversationId={conversationId}
            onSelectConversation={onSelectConversation}
          />
        )}

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
          {/* QA launch point (Phase 8D) - opens the new-review dialog with the
              subject pre-filled to this conversation. */}
          {canQaReview && (
            <AppButton
              variantStyle="outline"
              color="gray"
              size="small"
              className="w-full text-xs"
              onClick={() => setIsQaOpen(true)}
              startIcon={<ClipboardCheck size={14} />}
            >
              QA review
            </AppButton>
          )}
        </Section>

        {/* SLA - only when a policy matches this conversation (sla != null). */}
        {conversation?.sla && <SlaSection sla={conversation.sla} />}

        {/* Internal notes (read-only here; added from the composer's Note tab) */}
        <NotesSection notes={conversation?.notes || []} />

        {/* OMITTED by design (no data source yet), matching the workspace spec:
            - Suggested knowledge  -> TODO(Support Desk Phase 3): KB suggestions API
            Rendered as nothing rather than empty/fake panels. */}
      </div>

      {canQaReview && (
        <QaReviewFormDialog
          isOpen={isQaOpen}
          onClose={() => setIsQaOpen(false)}
          defaultSubjectType="conversation"
          defaultSubjectId={conversationId}
          lockSubject
          defaultAgent={
            selectedItem.assigned_user_id
              ? {
                  id: selectedItem.assigned_user_id,
                  name: conversation?.assigned_user_fullname || "Assigned agent",
                }
              : null
          }
        />
      )}
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

// --------------------------- Organization ---------------------------------
// CRM company summary + the company's OTHER conversations (Support Desk
// Phase 1/2). Rendered only when the contact has a crm_company_id (caller
// guards). The queries idle until then, so it's safe to mount conditionally.
function OrganizationSection({
  crmCompanyId,
  fallbackName,
  currentConversationId,
  onSelectConversation,
}: {
  crmCompanyId: string;
  fallbackName?: string | null;
  currentConversationId: string;
  onSelectConversation?: (item: ConversationListItem) => void;
}) {
  const { data: org, isLoading, isError } = useOrganization(crmCompanyId);
  const { data: conversations = [], isLoading: isLoadingConvos } =
    useOrganizationConversations(crmCompanyId);

  // The org's other conversations (exclude the one currently open).
  const otherConversations = useMemo(
    () => conversations.filter((c) => c.id !== currentConversationId).slice(0, 6),
    [conversations, currentConversationId]
  );

  // With nothing loaded and nothing loading (e.g. the summary 404'd), avoid an
  // empty shell - render nothing unless we at least have a name to show.
  if (isError && !fallbackName) return null;
  if (!org && !isLoading && !fallbackName) return null;

  const name = org?.name || fallbackName || "Organization";

  return (
    <Section title="Organization">
      {isLoading && !org ? (
        <OrgSkeleton />
      ) : (
        <>
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#EEF2FD] text-[#3E63D8]">
              <Building2 className="h-[18px] w-[18px]" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13.5px] font-bold text-gray-900" title={name}>
                {name}
              </div>
              {org?.domain && (
                <div className="truncate text-[11.5px] text-gray-400" title={org.domain}>
                  {org.domain}
                </div>
              )}
            </div>
          </div>

          {(org?.industry || org?.location) && (
            <div className="space-y-3">
              {org?.industry && (
                <KV icon={<Briefcase className="h-[15px] w-[15px]" />} k="Industry" v={org.industry} />
              )}
              {org?.location && (
                <KV icon={<MapPin className="h-[15px] w-[15px]" />} k="Location" v={org.location} />
              )}
            </div>
          )}

          {org && (
            <div className="grid grid-cols-3 gap-2">
              <OrgStat label="Contacts" value={org.contact_count} />
              <OrgStat label="Convos" value={org.conversation_count} />
              <OrgStat label="Open" value={org.open_conversation_count} />
            </div>
          )}

          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Other conversations
            </div>
            {isLoadingConvos && otherConversations.length === 0 ? (
              <p className="text-[12px] text-gray-400">Loading…</p>
            ) : otherConversations.length === 0 ? (
              <p className="text-[12px] text-gray-400">No other conversations from this organization.</p>
            ) : (
              <div className="space-y-1">
                {otherConversations.map((c) => (
                  <OrgConversationRow key={c.id} item={c} onSelect={() => onSelectConversation?.(c)} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Section>
  );
}

function OrgStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5 text-center">
      <div className="text-[15px] font-extrabold tabular-nums text-gray-900">{value}</div>
      <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</div>
    </div>
  );
}

function OrgConversationRow({
  item,
  onSelect,
}: {
  item: ConversationListItem;
  onSelect: () => void;
}) {
  const name = item.external_contact_name || item.external_contact_identifier || "Unknown contact";
  const status = STATUS_META[item.status] ?? STATUS_META.open;
  const channel = CHANNEL_META[item.channel_type];

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-2 rounded-lg border border-gray-100 px-2.5 py-2 text-left transition-colors hover:border-gray-200 hover:bg-gray-50"
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", status.dot)} title={status.label} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12.5px] font-semibold text-gray-800">
          {item.subject || item.last_message_preview || name}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-400">
          <span className={cn("h-2.5 w-2.5 shrink-0 rounded-[3px]", channel.badge)} title={channel.label} />
          <span className="truncate">{name}</span>
        </div>
      </div>
      <span className="shrink-0 text-[10.5px] text-gray-400">{formatRelativeTime(item.last_message_at)}</span>
    </button>
  );
}

function OrgSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-lg bg-gray-200" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-2/3 rounded bg-gray-200" />
          <div className="h-2.5 w-1/2 rounded bg-gray-100" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

// ------------------------------- SLA --------------------------------------
// First-response + resolution rows with a live-ticking status pill, coloured by
// tone (green met/on-track, amber approaching, red breached). Rendered only when
// the conversation has a matching SLA policy (caller guards on `sla != null`).
function SlaSection({ sla }: { sla: ConversationSlaSummary }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const firstResponse = getSlaTargetState(
    sla.first_response_met,
    sla.first_response_breached,
    sla.first_response_due_at,
    now
  );
  const resolution = getSlaTargetState(
    sla.resolution_met,
    sla.resolution_breached,
    sla.resolution_due_at,
    now
  );

  return (
    <Section title="SLA">
      <SlaRow label="First response" state={firstResponse} />
      <SlaRow label="Resolution" state={resolution} />
    </Section>
  );
}

function SlaRow({
  label,
  state,
}: {
  label: string;
  state: ReturnType<typeof getSlaTargetState>;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <div className="text-[12.5px] font-semibold text-gray-800">{label}</div>
        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400">
          <Clock className="h-3 w-3" />
          {state.dueAt ? format(new Date(state.dueAt), "dd MMM, HH:mm") : "No due time"}
        </div>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold tabular-nums",
          SLA_TONE_META[state.tone].chip
        )}
      >
        {state.statusLabel}
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
