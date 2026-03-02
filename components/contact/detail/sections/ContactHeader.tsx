import { Contact } from "@/lib/models/types";
import { AppButton } from "@/components/ui/app-button";

interface ContactHeaderProps {
    contact: Contact;
    onEdit: () => void;
}

export const ContactHeader = ({ contact, onEdit }: ContactHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#5479EE] flex items-center justify-center text-white overflow-hidden text-2xl font-semibold">
                    <img
                        src={`https://ui-avatars.com/api/?name=${contact.name}&background=5479EE&color=fff`}
                        alt={contact.name}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{contact.name}</h1>
                    <p className="text-gray-500">
                        {contact.position} at {contact.company}
                    </p>
                </div>
            </div>
            <div className="flex gap-3">
                <AppButton onClick={onEdit} variantStyle="primary">
                    Edit
                </AppButton>
            </div>
        </div>
    );
};
