"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { X, UserPlus, Mail, Phone, Briefcase, Building, UserRound } from "lucide-react";
import { Chip } from "@mui/material";
import { format } from "date-fns";
import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import { AppTextarea } from "@/components/ui/app-textarea";
import { AppButton } from "@/components/ui/app-button";
import { AppSelect } from "@/components/ui/app-select";
import { useUsers } from "@/lib/hooks/useUsers";
import {
    useConversation,
    useAssignConversation,
    useContactInboxDetail,
    useConversationTags,
    useSetConversationTags,
    useCreateConversationNote,
    useSetConversationStatus,
    useSetConversationPriority,
} from "@/lib/hooks/useOmnichannel";
import {
    OmnichannelContact,
    ConversationTag,
    ConversationNote,
    ConversationStatus,
    SettableConversationStatus,
    ConversationPriority,
} from "@/lib/types/omnichannel";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { cn } from "@/lib/utils";

interface ConversationDetailSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    selectedContact: OmnichannelContact | null;
    onViewProfile: () => void;
    // The conversation actually shown in column 2 (OmnichannelClient's
    // activeConversationId) - NOT always selectedContact.latest_conversation_id,
    // which isn't channel-specific for multi-channel contacts. Assignment/tags/
    // notes are per-conversation, so this is what they need to target.
    conversationId: string | null;
}

// Column 3: contact detail fields plus the two (currently placeholder) stat
// tiles. Renders its own mobile/laptop backdrop below `xl:` alongside the
// slide-in panel, exactly as the two were paired in the original inline
// JSX - both share the same `selectedContact && isOpen` condition.
export default function ConversationDetailSidebar({
    isOpen,
    onClose,
    selectedContact,
    onViewProfile,
    conversationId,
}: ConversationDetailSidebarProps) {
    const { data: inboxDetail } = useContactInboxDetail(
        selectedContact?.inbox_key ?? null
    );

    if (!selectedContact || !isOpen) return null;

    return (
        <>
            {/* Backdrop for mobile/laptop when sidebar open */}
            <div
                className="xl:hidden absolute inset-0 bg-gray-900/20 z-10 rounded-2xl"
                onClick={onClose}
            />

            {/* Column 3: Contact Details sidebar */}
            <div className="absolute right-0 top-0 bottom-0 z-20 xl:relative xl:z-auto w-80 rounded-2xl border border-gray-200 bg-white flex flex-col shrink-0 animate-in slide-in-from-right duration-300 shadow-xl xl:shadow-none h-full">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-lg uppercase tracking-wider">Contact Details</h3>
                    <div className="flex items-center gap-1">
                        <button
                            className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-50"
                            title="View full contact profile"
                            onClick={onViewProfile}
                        >
                            <UserRound className="w-4 h-4" />
                        </button>
                        <button className="xl:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <DetailItem label="Name" value={selectedContact.display_name} icon={<UserPlus className="w-4 h-4" />} />
                    <DetailItem label="Email" value={selectedContact.email || "-"} icon={<Mail className="w-4 h-4" />} />
                    <DetailItem label="Phone" value={(selectedContact as any).phone || (selectedContact as any).phone_number || "-"} icon={<Phone className="w-4 h-4" />} />
                    <DetailItem label="Company" value={selectedContact.company || "-"} icon={<Building className="w-4 h-4" />} />
                    <DetailItem label="Position" value={(selectedContact as any).job_title || (selectedContact as any).position || "-"} icon={<Briefcase className="w-4 h-4" />} />

                    <ConversationDetailExtras conversationId={conversationId} selectedContact={selectedContact} />

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Open Conversations</p>
                            <p className="text-2xl font-black text-gray-900">{inboxDetail?.open_conversation_count ?? 0}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Unread</p>
                            <p className="text-2xl font-black text-primary">{inboxDetail?.unread_count ?? 0}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function DetailItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                {label}
            </div>
            <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-sm font-semibold text-gray-700">
                {value}
            </div>
        </div>
    );
}

// Assignment + Tags + Notes (Phase 3). A separate component (rather than
// hooks called straight inside ConversationDetailSidebar) so its data hooks
// stay legal: this only mounts once the parent's `!selectedContact ||
// !isOpen` guard above has already passed, and an unconditionally-rendered
// component is free to call hooks unconditionally in its own body.
//
// Fetches the active conversation's detail once here (ConversationWithMessages
// - the same query OmnichannelClient already holds for the message list;
// React Query dedupes the two subscriptions against one cache entry, no
// extra network call) and fans the relevant slices out to each section.
function ConversationDetailExtras({
    conversationId,
    selectedContact,
}: {
    conversationId: string | null;
    selectedContact: OmnichannelContact;
}) {
    const { data: conversation } = useConversation(conversationId || "");

    return (
        <>
            <AssignmentSection
                conversationId={conversationId}
                currentUserId={selectedContact.assigned_user_id}
                currentUserFullname={conversation?.assigned_user_fullname || selectedContact.assigned_user_fullname}
            />
            <StatusSection conversationId={conversationId} status={conversation?.status} />
            <PrioritySection conversationId={conversationId} priority={conversation?.priority} />
            <TagsSection conversationId={conversationId} tags={conversation?.tags || []} />
            <NotesSection conversationId={conversationId} notes={conversation?.notes || []} />
        </>
    );
}

interface UserOption {
    value: string;
    label: string;
}

// Reuses the AppAutocomplete + debounced-search picker pattern
// TicketForm.tsx uses for its `assigned_agent_id` field. TicketForm actually
// backs that specific field with useAssignableAgents(), but that hook hits
// the ticket-only `/tickets/assignable-agents` endpoint - the wrong resource
// for a conversation - so this pairs AppAutocomplete with the generic
// useUsers() hook instead (the same one add-lead-form.tsx's assignee picker
// uses, and the exact pairing already sketched - commented out - for the
// manager picker in add-departments.tsx).
function AssignmentSection({
    conversationId,
    currentUserId,
    currentUserFullname,
}: {
    conversationId: string | null;
    currentUserId?: string;
    currentUserFullname?: string;
}) {
    const [search, setSearch] = useState("");
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleSearchChange = useCallback((_event: any, value: string) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            setSearch(value);
        }, 300);
    }, []);

    const { data: usersData, isLoading: isLoadingUsers } = useUsers(1, 20, search);
    const userOptions: UserOption[] = (usersData?.data?.users || []).map((u) => ({ value: u.id, label: u.fullname }));

    const assignMutation = useAssignConversation();

    const currentValue: UserOption | null = currentUserId
        ? userOptions.find((opt) => opt.value === currentUserId) || {
              value: currentUserId,
              label: currentUserFullname || "Assigned user",
          }
        : null;

    const handleAssignChange = (newValue: UserOption | null) => {
        if (!conversationId) return;
        assignMutation.mutate(
            { conversationId, data: { assigned_user_id: newValue?.value ?? null } },
            {
                onError: (error) => notify.error("Error", { description: handleError(error, "Assign Conversation") }),
            }
        );
    };

    return (
        <div className="space-y-2 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                Assigned To
            </div>
            <AppAutocomplete
                isBgWhite
                options={userOptions}
                placeholder="Assign to a user"
                value={currentValue}
                onChange={(_e, newValue) => handleAssignChange(newValue as UserOption | null)}
                onInputChange={handleSearchChange}
                loading={isLoadingUsers}
                disabled={!conversationId || assignMutation.isPending}
            />
        </div>
    );
}

// Conversation lifecycle controls. Close / Solve / Archive / Reopen all hit
// PATCH /conversations/{id}/status; "Reopen" maps to status "open" (reopening
// from a closed/solved/archived state). Follows AssignmentSection's
// mutate-with-onError + hook-driven invalidation pattern.
const STATUS_LABELS: Record<ConversationStatus, string> = {
    open: "Open",
    closed: "Closed",
    solved: "Solved",
    archived: "Archived",
    snoozed: "Snoozed",
};

const STATUS_BADGE_STYLES: Record<ConversationStatus, string> = {
    open: "bg-emerald-50 text-emerald-600 border-emerald-100",
    closed: "bg-gray-100 text-gray-600 border-gray-200",
    solved: "bg-blue-50 text-blue-600 border-blue-100",
    archived: "bg-amber-50 text-amber-600 border-amber-100",
    snoozed: "bg-purple-50 text-purple-600 border-purple-100",
};

const STATUS_ACTIONS: { label: string; value: SettableConversationStatus }[] = [
    { label: "Solve", value: "solved" },
    { label: "Close", value: "closed" },
    { label: "Archive", value: "archived" },
    { label: "Reopen", value: "open" },
];

function StatusSection({ conversationId, status }: { conversationId: string | null; status?: ConversationStatus }) {
    const statusMutation = useSetConversationStatus();
    const current: ConversationStatus = status ?? "open";

    const handleSetStatus = (next: SettableConversationStatus) => {
        if (!conversationId) return;
        statusMutation.mutate(
            { conversationId, data: { status: next } },
            {
                onError: (error) => notify.error("Error", { description: handleError(error, "Update Status") }),
            }
        );
    };

    return (
        <div className="space-y-2 pt-4 border-t border-gray-50">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                    Status
                </div>
                <span
                    className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                        STATUS_BADGE_STYLES[current]
                    )}
                >
                    {STATUS_LABELS[current]}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {STATUS_ACTIONS.map((action) => (
                    <AppButton
                        key={action.value}
                        variantStyle="outline"
                        color="gray"
                        size="small"
                        className="text-xs"
                        disabled={!conversationId || statusMutation.isPending || current === action.value}
                        onClick={() => handleSetStatus(action.value)}
                    >
                        {action.label}
                    </AppButton>
                ))}
            </div>
        </div>
    );
}

// Priority select (Low/Normal/High/Urgent) -> PATCH /conversations/{id}/priority.
const PRIORITY_OPTIONS: { value: ConversationPriority; label: string }[] = [
    { value: "low", label: "Low" },
    { value: "normal", label: "Normal" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
];

function PrioritySection({ conversationId, priority }: { conversationId: string | null; priority?: ConversationPriority }) {
    const priorityMutation = useSetConversationPriority();
    const current: ConversationPriority = priority ?? "normal";

    const handleChange = (next: string) => {
        if (!conversationId || next === current) return;
        priorityMutation.mutate(
            { conversationId, data: { priority: next as ConversationPriority } },
            {
                onError: (error) => notify.error("Error", { description: handleError(error, "Update Priority") }),
            }
        );
    };

    return (
        <div className="space-y-2 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                Priority
            </div>
            <AppSelect
                isBgWhite
                options={PRIORITY_OPTIONS}
                value={current}
                onChange={(e) => handleChange(e.target.value as string)}
                disabled={!conversationId || priorityMutation.isPending}
            />
        </div>
    );
}

// TicketTagsInput.tsx (the ticket module's tag entry UI) is the closest
// precedent in the codebase, but it's hardcoded to useTicketTags() - not a
// generic/reusable component - so this mirrors its recipe instead (same
// AppAutocomplete multiple+freeSolo setup, same Chip styling) wired to the
// conversation tag catalog. Every change sends the full tag-name set, since
// PUT /conversations/{id}/tags is a full replace, not incremental add/remove.
function TagsSection({ conversationId, tags }: { conversationId: string | null; tags: ConversationTag[] }) {
    const { data: tagSuggestions } = useConversationTags();
    const suggestionNames = (tagSuggestions?.tags || []).map((t) => t.name);
    const currentTagNames = tags.map((t) => t.name);

    const setTagsMutation = useSetConversationTags();

    const handleTagsChange = (newValue: string[]) => {
        if (!conversationId) return;
        setTagsMutation.mutate(
            { conversationId, data: { tags: newValue } },
            {
                onError: (error) => notify.error("Error", { description: handleError(error, "Update Tags") }),
            }
        );
    };

    return (
        <div className="space-y-2 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                Tags
            </div>
            <AppAutocomplete
                isBgWhite
                multiple
                freeSolo
                options={suggestionNames}
                value={currentTagNames}
                disabled={!conversationId || setTagsMutation.isPending}
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

// Reverse-chronological, post-only (no edit/delete UI - matches the
// backend's design: notes are an append-only log, not editable records).
function NotesSection({ conversationId, notes }: { conversationId: string | null; notes: ConversationNote[] }) {
    const [noteText, setNoteText] = useState("");
    const createNoteMutation = useCreateConversationNote();

    const sortedNotes = useMemo(
        () => [...notes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        [notes]
    );

    const handleAddNote = () => {
        const note = noteText.trim();
        if (!conversationId || !note) return;
        createNoteMutation.mutate(
            { conversationId, data: { note } },
            {
                onSuccess: () => setNoteText(""),
                onError: (error) => notify.error("Error", { description: handleError(error, "Add Note") }),
            }
        );
    };

    return (
        <div className="space-y-3 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                Notes
            </div>

            {sortedNotes.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {sortedNotes.map((n) => (
                        <div key={n.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-xs font-bold text-gray-700 truncate">{n.user_fullname}</span>
                                <span className="text-[10px] text-gray-400 shrink-0">
                                    {format(new Date(n.created_at), "dd MMM yyyy, HH:mm")}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">{n.note}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-gray-400">No notes yet.</p>
            )}

            <div className="space-y-2">
                <AppTextarea
                    isBgWhite
                    rows={3}
                    placeholder="Add a note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    disabled={!conversationId}
                />
                <AppButton
                    variantStyle="primary"
                    fullWidth
                    onClick={handleAddNote}
                    isLoading={createNoteMutation.isPending}
                    disabled={!conversationId || !noteText.trim()}
                >
                    Add Note
                </AppButton>
            </div>
        </div>
    );
}
