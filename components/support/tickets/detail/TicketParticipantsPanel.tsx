"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Mail, Plus, Search, User, UserPlus, X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { usePermission } from "@/lib/hooks/usePermission";
import { useAssignableAgents } from "@/lib/hooks/useTickets";
import { useContacts } from "@/lib/hooks/useContacts";
import {
    useAddTicketParticipant,
    useDeleteTicketParticipant,
    useTicketParticipants,
} from "@/lib/hooks/useTicketCollab";
import type { TicketParticipant } from "@/lib/api/ticket-collab";
import { notify } from "@/lib/notifications";

interface TicketParticipantsPanelProps {
    ticketId: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A small debounce so the agent/contact search doesn't fire on every keystroke.
function useDebounced(value: string, delay = 300) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export function TicketParticipantsPanel({ ticketId }: TicketParticipantsPanelProps) {
    const { can } = usePermission();
    const canWrite = can(["tickets:write:my", "tickets:write:team", "tickets"]);

    const { data: participants = [], isLoading } = useTicketParticipants(ticketId);
    const addMutation = useAddTicketParticipant(ticketId);
    const deleteMutation = useDeleteTicketParticipant(ticketId);

    const [openForm, setOpenForm] = useState<"follower" | "cc" | null>(null);

    const followers = useMemo(
        () => participants.filter((p) => p.role === "follower"),
        [participants]
    );
    const ccs = useMemo(() => participants.filter((p) => p.role === "cc"), [participants]);

    // --- Add follower (agent picker) ---
    const [agentQuery, setAgentQuery] = useState("");
    const agentSearch = useDebounced(agentQuery);
    const { data: agentData, isFetching: agentsLoading } = useAssignableAgents(agentSearch);
    const agents: { id: string; fullname: string; email?: string }[] = agentData?.data || [];
    const existingFollowerIds = useMemo(
        () => new Set(followers.map((f) => f.user_id).filter(Boolean) as string[]),
        [followers]
    );
    const availableAgents = agents.filter((a) => !existingFollowerIds.has(a.id));

    // --- Add CC (email or contact picker) ---
    const [ccEmail, setCcEmail] = useState("");
    const [contactQuery, setContactQuery] = useState("");
    const contactSearch = useDebounced(contactQuery);
    const { data: contactData, isFetching: contactsLoading } = useContacts(contactSearch);
    const contacts = contactData?.data?.contacts || [];

    const closeForm = () => {
        setOpenForm(null);
        setAgentQuery("");
        setCcEmail("");
        setContactQuery("");
    };

    const handleAdd = async (payload: Parameters<typeof addMutation.mutateAsync>[0]) => {
        try {
            await addMutation.mutateAsync(payload);
            notify.success(payload.role === "follower" ? "Follower added" : "CC added");
            closeForm();
        } catch (err: any) {
            notify.error(err?.message || "Failed to add participant");
        }
    };

    const handleAddCcEmail = () => {
        const email = ccEmail.trim();
        if (!EMAIL_RE.test(email)) {
            notify.warning("Invalid email", { description: "Enter a valid email address." });
            return;
        }
        handleAdd({ role: "cc", email });
    };

    const handleRemove = async (participant: TicketParticipant) => {
        try {
            await deleteMutation.mutateAsync(participant.id);
        } catch (err: any) {
            notify.error(err?.message || "Failed to remove participant");
        }
    };

    const searchInputClass =
        "w-full rounded-lg border border-gray-200 bg-[#F6F6F8] py-2 pl-8 pr-3 text-sm placeholder-gray-400 focus:border-primary focus:outline-none";

    const renderChip = (participant: TicketParticipant, label: string, icon: React.ReactNode) => (
        <span
            key={participant.id}
            className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
        >
            {icon}
            <span className="max-w-[220px] truncate">{label}</span>
            {canWrite && (
                <button
                    onClick={() => handleRemove(participant)}
                    className="text-gray-400 hover:text-red-600"
                    aria-label={`Remove ${label}`}
                >
                    <X size={12} />
                </button>
            )}
        </span>
    );

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h4 className="mb-3 text-xs font-bold uppercase text-gray-400">Followers &amp; CC</h4>

            {isLoading ? (
                <p className="text-sm text-gray-400">Loading participants...</p>
            ) : (
                <div className="space-y-5">
                    {/* Followers */}
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Followers
                            </span>
                            {canWrite && (
                                <button
                                    onClick={() => setOpenForm(openForm === "follower" ? null : "follower")}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-[#5479EE] hover:underline"
                                >
                                    <UserPlus size={13} /> Add follower
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {followers.length === 0 && (
                                <span className="text-xs text-gray-400">No followers yet.</span>
                            )}
                            {followers.map((p) =>
                                renderChip(p, p.user_name || p.email || "Unknown", <User size={12} />)
                            )}
                        </div>

                        {openForm === "follower" && canWrite && (
                            <div className="mt-3 rounded-lg border border-gray-200 p-3">
                                <div className="relative">
                                    <Search
                                        size={14}
                                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        autoFocus
                                        value={agentQuery}
                                        onChange={(e) => setAgentQuery(e.target.value)}
                                        placeholder="Search agents by name..."
                                        className={searchInputClass}
                                    />
                                </div>
                                <div className="mt-2 max-h-48 overflow-y-auto">
                                    {agentsLoading && (
                                        <div className="flex items-center gap-2 px-1 py-2 text-xs text-gray-400">
                                            <Loader2 className="animate-spin" size={12} /> Searching...
                                        </div>
                                    )}
                                    {!agentsLoading && availableAgents.length === 0 && (
                                        <p className="px-1 py-2 text-xs text-gray-400">No agents found.</p>
                                    )}
                                    {availableAgents.map((agent) => (
                                        <button
                                            key={agent.id}
                                            disabled={addMutation.isPending}
                                            onClick={() => handleAdd({ role: "follower", user_id: agent.id })}
                                            className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <span className="font-medium text-gray-800">{agent.fullname}</span>
                                            {agent.email && (
                                                <span className="ml-2 truncate text-xs text-gray-400">
                                                    {agent.email}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CC */}
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                CC
                            </span>
                            {canWrite && (
                                <button
                                    onClick={() => setOpenForm(openForm === "cc" ? null : "cc")}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-[#5479EE] hover:underline"
                                >
                                    <Plus size={13} /> Add CC
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {ccs.length === 0 && (
                                <span className="text-xs text-gray-400">No one CC&apos;d yet.</span>
                            )}
                            {ccs.map((p) =>
                                renderChip(
                                    p,
                                    p.contact_name || p.email || "Unknown",
                                    <Mail size={12} />
                                )
                            )}
                        </div>

                        {openForm === "cc" && canWrite && (
                            <div className="mt-3 space-y-3 rounded-lg border border-gray-200 p-3">
                                {/* Enter an email address */}
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Mail
                                            size={14}
                                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                                        />
                                        <input
                                            value={ccEmail}
                                            onChange={(e) => setCcEmail(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleAddCcEmail();
                                                }
                                            }}
                                            placeholder="Enter an email address..."
                                            className={searchInputClass}
                                        />
                                    </div>
                                    <AppButton
                                        onClick={handleAddCcEmail}
                                        disabled={addMutation.isPending || !ccEmail.trim()}
                                    >
                                        Add
                                    </AppButton>
                                </div>

                                {/* Or pick a contact */}
                                <div>
                                    <p className="mb-1 text-[11px] uppercase tracking-wide text-gray-400">
                                        or pick a contact
                                    </p>
                                    <div className="relative">
                                        <Search
                                            size={14}
                                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                                        />
                                        <input
                                            value={contactQuery}
                                            onChange={(e) => setContactQuery(e.target.value)}
                                            placeholder="Search contacts by name or email..."
                                            className={searchInputClass}
                                        />
                                    </div>
                                    <div className="mt-2 max-h-40 overflow-y-auto">
                                        {contactsLoading && (
                                            <div className="flex items-center gap-2 px-1 py-2 text-xs text-gray-400">
                                                <Loader2 className="animate-spin" size={12} /> Searching...
                                            </div>
                                        )}
                                        {!contactsLoading &&
                                            contactSearch.trim().length >= 2 &&
                                            contacts.length === 0 && (
                                                <p className="px-1 py-2 text-xs text-gray-400">
                                                    No contacts found.
                                                </p>
                                            )}
                                        {contacts.map((contact: any) => (
                                            <button
                                                key={contact.id}
                                                disabled={addMutation.isPending}
                                                onClick={() =>
                                                    handleAdd({ role: "cc", contact_id: contact.id })
                                                }
                                                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                <span className="font-medium text-gray-800">
                                                    {contact.name}
                                                </span>
                                                {contact.email && (
                                                    <span className="ml-2 truncate text-xs text-gray-400">
                                                        {contact.email}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
