import { Contact } from "@/lib/models/types";
import { Divider } from "@mui/material";

interface ContactInfoProps {
    contact: Contact;
}

export const ContactInfo = ({ contact }: ContactInfoProps) => {
    return (
        <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Contact Details</h3>
            <Divider />
            <div className="flex flex-col gap-4 mt-4">
                <div className="grid grid-cols-4 gap-2 text-sm">
                    <span className="text-gray-500 col-span-1">Email</span>
                    <span className="col-span-3 font-medium text-start break-all">
                        {contact.email || "-"}
                    </span>
                </div>
                <Divider />
                <div className="grid grid-cols-4 gap-2 text-sm">
                    <span className="text-gray-500 col-span-1">Phone Number</span>
                    <span className="col-span-3 font-medium text-start break-all">
                        {contact.phone_number || "-"}
                    </span>
                </div>
                <Divider />
                <div className="grid grid-cols-4 gap-2 text-sm">
                    <span className="text-gray-500 col-span-1">Company</span>
                    <span className="col-span-3 font-medium text-start break-all">
                        {contact.company || "-"}
                    </span>
                </div>
                <Divider />
                <div className="grid grid-cols-4 gap-2 text-sm">
                    <span className="text-gray-500 col-span-1">Job Title</span>
                    <span className="col-span-3 font-medium text-start break-all">
                        {contact.position || "-"}
                    </span>
                </div>
                <Divider />
                <div className="grid grid-cols-4 gap-2 text-sm">
                    <span className="text-gray-500 col-span-1">Address</span>
                    <span className="col-span-3 font-medium text-start break-all">
                        {contact.address || "-"}
                    </span>
                </div>
            </div>
        </div>
    );
};
