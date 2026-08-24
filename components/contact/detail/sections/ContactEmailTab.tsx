import { useMemo, useState } from "react";
import { Autocomplete, Chip, TextField } from "@mui/material";
import { Mail, X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { EmptyState } from "@/components/ui/empty-state";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { fetchMailingLists } from "@/lib/api/email-marketing/mailing-lists";
import { createSubscriber } from "@/lib/api/email-marketing/subscribers";
import { deleteMailingListSubscriber } from "@/lib/api/email-marketing/mailing-lists";
import type { MailingList } from "@/lib/types/email-marketing";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";

interface ContactEmailTabProps {
    contactId: string;
    isSubscriber: boolean;
    mailingLists: { id: string; name: string }[];
    token: string;
    onChanged: () => void;
}

export const ContactEmailTab = ({
    contactId,
    isSubscriber,
    mailingLists,
    token,
    onChanged,
}: ContactEmailTabProps) => {
    const [options, setOptions] = useState<MailingList[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [selected, setSelected] = useState<MailingList | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);

    const joinedIds = useMemo(() => new Set(mailingLists.map((l) => l.id)), [mailingLists]);
    const availableOptions = options.filter((o) => !joinedIds.has(o.id));

    const loadOptions = async () => {
        setLoadingOptions(true);
        try {
            const res = await fetchMailingLists(token, 1, 50);
            setOptions(res.data.mailing_lists);
        } catch (err) {
            notify.error("Error", { description: handleError(err, "Load Mailing Lists") });
        } finally {
            setLoadingOptions(false);
        }
    };

    const handleAdd = async () => {
        if (!selected) return;
        setIsAdding(true);
        try {
            await createSubscriber(token, {
                target: "mailing_list",
                type_request: "from_contacts",
                contact_ids: [contactId],
                mailing_list_ids: [selected.id],
            });
            notify.success("Added", { description: `Added to "${selected.name}".` });
            setSelected(null);
            onChanged();
        } catch (err) {
            notify.error("Error", { description: handleError(err, "Add to Mailing List") });
        } finally {
            setIsAdding(false);
        }
    };

    const handleConfirmRemove = async () => {
        if (!removeTarget) return;
        const list = removeTarget;
        setRemovingId(list.id);
        try {
            await deleteMailingListSubscriber(token, list.id, contactId);
            notify.success("Removed", { description: `Removed from "${list.name}".` });
            setRemoveTarget(null);
            onChanged();
        } catch (err) {
            notify.error("Error", { description: handleError(err, "Remove from Mailing List") });
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500">Subscriber status</span>
                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isSubscriber ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}
                >
                    {isSubscriber ? "Subscribed" : "Not a subscriber"}
                </span>
            </div>

            <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-gray-700">Mailing lists</h3>
                {mailingLists.length === 0 ? (
                    <EmptyState
                        icon={Mail}
                        title="Not on any mailing list"
                        description="Add this contact to a mailing list to start including them in email campaigns."
                    />
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {mailingLists.map((list) => (
                            <Chip
                                key={list.id}
                                label={list.name}
                                component="a"
                                href={`/email-marketing/mailing-lists/${list.id}`}
                                clickable
                                onDelete={() => setRemoveTarget(list)}
                                deleteIcon={
                                    removingId === list.id ? undefined : <X size={14} />
                                }
                                disabled={removingId === list.id}
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
                        <TextField {...params} placeholder="Add to a mailing list" />
                    )}
                />
                <AppButton
                    variantStyle="primary"
                    disabled={!selected || isAdding}
                    onClick={handleAdd}
                >
                    {isAdding ? "Adding..." : "Add"}
                </AppButton>
            </div>

            <ConfirmationPopup
                isOpen={!!removeTarget}
                onClose={() => setRemoveTarget(null)}
                onConfirm={handleConfirmRemove}
                title="Remove from Mailing List"
                description={`Remove this contact from "${removeTarget?.name ?? ""}"? They will no longer receive campaigns sent to this list.`}
                confirmText="Remove"
                cancelText="Cancel"
                variant="danger"
                isLoading={removingId === removeTarget?.id}
            />
        </div>
    );
};
