import { ContactChannelChat } from "./ContactChannelChat";

interface ContactConversationsTabProps {
    contactId: string;
    contactName?: string;
}

// Full cross-channel conversation panel for this contact - renders real
// message history inline (with a channel toggle when the contact is active
// on both WhatsApp and Email) and lets staff reply or start a brand-new
// conversation without leaving the Contact page. Replaced the old
// metadata-only summary list that navigated away to /omnichannel.
export const ContactConversationsTab = ({
    contactId,
    contactName,
}: ContactConversationsTabProps) => {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <ContactChannelChat contactId={contactId} contactName={contactName} />
        </div>
    );
};
