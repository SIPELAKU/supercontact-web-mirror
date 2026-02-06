import UnifiedInbox from "@/components/omnichannel/UnifiedInbox";

export const metadata = {
    title: "Unified Inbox | SuperContact",
    description: "Manage all your client communications in one place.",
};

export default function OmnichannelPage() {
    return (
        <div className="p-6 h-[calc(100vh)] bg-[#f4f7fe] overflow-hidden">
            <UnifiedInbox />
        </div>
    );
}
