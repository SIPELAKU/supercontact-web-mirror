import { useMemo, useState } from "react";
import { Autocomplete, Chip, TextField } from "@mui/material";
import { MessageCircle, X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { EmptyState } from "@/components/ui/empty-state";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { fetchWithTimeout } from "@/lib/api/api-client";
import { useCreateWaRecipient } from "@/lib/hooks/useWaRecipients";
import type { GroupBroadcast, GroupBroadcastsResponse } from "@/lib/types/whatsapp-marketing";

interface ContactWhatsAppTabProps {
    contactId: string;
    isRecipient: boolean;
    broadcastGroups: { id: string; name: string }[];
    token: string;
    onChanged: () => void;
}

async function fetchBroadcastGroupOptions(token: string): Promise<GroupBroadcast[]> {
    const res = await fetchWithTimeout(
        `${process.env.NEXT_PUBLIC_API_URL}/broadcast-groups?page=1&limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    const json: GroupBroadcastsResponse = await res.json();
    if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to load broadcast groups");
    }
    return json.data.broadcast_groups;
}

async function deleteRecipientFromBroadcastGroup(
    token: string,
    broadcastGroupId: string,
    recipientId: string
): Promise<void> {
    const res = await fetchWithTimeout(
        `${process.env.NEXT_PUBLIC_API_URL}/broadcast-groups/${broadcastGroupId}/recipients/${recipientId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
    );
    const json = await res.json();
    if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to remove recipient from broadcast group");
    }
}

export const ContactWhatsAppTab = ({
    contactId,
    isRecipient,
    broadcastGroups,
    token,
    onChanged,
}: ContactWhatsAppTabProps) => {
    const [options, setOptions] = useState<GroupBroadcast[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [selected, setSelected] = useState<GroupBroadcast | null>(null);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const createRecipient = useCreateWaRecipient();

    const joinedIds = useMemo(() => new Set(broadcastGroups.map((g) => g.id)), [broadcastGroups]);
    const availableOptions = options.filter((o) => !joinedIds.has(o.id));

    const loadOptions = async () => {
        setLoadingOptions(true);
        try {
            setOptions(await fetchBroadcastGroupOptions(token));
        } catch (err) {
            notify.error("Error", { description: handleError(err, "Load Broadcast Groups") });
        } finally {
            setLoadingOptions(false);
        }
    };

    const handleAdd = async () => {
        if (!selected) return;
        try {
            await createRecipient.mutateAsync({
                target: "broadcast_group",
                type_request: "from_contacts",
                contact_ids: [contactId],
                broadcast_group_ids: [selected.id],
            });
            notify.success("Added", { description: `Added to "${selected.name}".` });
            setSelected(null);
            onChanged();
        } catch (err) {
            notify.error("Error", { description: handleError(err, "Add to Broadcast Group") });
        }
    };

    const handleRemove = async (group: { id: string; name: string }) => {
        setRemovingId(group.id);
        try {
            await deleteRecipientFromBroadcastGroup(token, group.id, contactId);
            notify.success("Removed", { description: `Removed from "${group.name}".` });
            onChanged();
        } catch (err) {
            notify.error("Error", { description: handleError(err, "Remove from Broadcast Group") });
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500">Recipient status</span>
                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isRecipient ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}
                >
                    {isRecipient ? "Active recipient" : "Not a recipient"}
                </span>
            </div>

            <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-gray-700">Broadcast groups</h3>
                {broadcastGroups.length === 0 ? (
                    <EmptyState
                        icon={MessageCircle}
                        title="Not in any broadcast group"
                        description="Add this contact to a broadcast group to start including them in WhatsApp broadcasts."
                    />
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {broadcastGroups.map((group) => (
                            <Chip
                                key={group.id}
                                label={group.name}
                                component="a"
                                href={`/whatsapp-marketing/group-broadcasting/${group.id}`}
                                clickable
                                onDelete={() => handleRemove(group)}
                                deleteIcon={
                                    removingId === group.id ? undefined : <X size={14} />
                                }
                                disabled={removingId === group.id}
                                sx={{ borderRadius: "8px" }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Autocomplete
                    size="small"
                    sx={{ width: 280 }}
                    options={availableOptions}
                    getOptionLabel={(o) => o.name}
                    loading={loadingOptions}
                    value={selected}
                    onChange={(_, val) => setSelected(val)}
                    onOpen={() => {
                        if (options.length === 0) loadOptions();
                    }}
                    renderInput={(params) => (
                        <TextField {...params} placeholder="Add to a broadcast group" />
                    )}
                />
                <AppButton
                    variantStyle="primary"
                    disabled={!selected || createRecipient.isPending}
                    onClick={handleAdd}
                >
                    {createRecipient.isPending ? "Adding..." : "Add"}
                </AppButton>
            </div>
        </div>
    );
};
