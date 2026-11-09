"use client";

import { Contact } from "@/lib/models/types";
import { Divider } from "@mui/material";
import { useCustomFieldDefinitionsFor } from "@/lib/hooks/useCustomFieldDefinitions";
import { formatCustomFieldValue } from "@/lib/utils/customFieldValues";
import { contactSourceLabel } from "@/lib/constants/contact-source";
import { format } from "date-fns";

interface ContactInfoProps {
    contact: Contact;
}

export const ContactInfo = ({ contact }: ContactInfoProps) => {
    // Defined contact fields print their label (and format by type); legacy
    // free-form keys keep the humanised key.
    const { definitions } = useCustomFieldDefinitionsFor("contact");
    const byKey = new Map(definitions.map((d) => [d.field_key, d]));

    return (
        <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Contact Details</h3>
            <Divider />
            <div className="flex flex-col gap-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <span className="text-gray-500 col-span-1">Email</span>
                    <span className="col-span-1 md:col-span-3 font-medium text-start break-all">
                        {contact.email || "-"}
                    </span>
                </div>
                <Divider />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <span className="text-gray-500 col-span-1">Phone Number</span>
                    <span className="col-span-1 md:col-span-3 font-medium text-start break-all">
                        {contact.phone_number || "-"}
                    </span>
                </div>
                <Divider />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <span className="text-gray-500 col-span-1">Company</span>
                    <span className="col-span-1 md:col-span-3 font-medium text-start break-all">
                        {contact.company || "-"}
                    </span>
                </div>
                <Divider />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <span className="text-gray-500 col-span-1">Job Title</span>
                    <span className="col-span-1 md:col-span-3 font-medium text-start break-all">
                        {contact.position || "-"}
                    </span>
                </div>
                <Divider />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <span className="text-gray-500 col-span-1">Address</span>
                    <span className="col-span-1 md:col-span-3 font-medium text-start break-all">
                        {contact.address || "-"}
                    </span>
                </div>

                <Divider />
                {/* Phase 3 reference columns, ABOVE the custom-field loop:
                    built-in typed fields first, tenant-defined ones after -
                    the ordering the edit modal establishes. */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <span className="text-gray-500 col-span-1">Tipe Pelanggan</span>
                    <span className="col-span-1 md:col-span-3 font-medium text-start break-all">
                        {contact.customer_type?.name || "-"}
                    </span>
                </div>
                <Divider />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <span className="text-gray-500 col-span-1">Wilayah</span>
                    <span className="col-span-1 md:col-span-3 font-medium text-start break-all">
                        {contact.region?.name || "-"}
                    </span>
                </div>
                <Divider />
                {/* BE-1.1. The latest channel, not the first one: IMP-9 stamps
                    source_updated_at when a later channel replaced it. */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <span className="text-gray-500 col-span-1">Source</span>
                    <span className="col-span-1 md:col-span-3 font-medium text-start break-all">
                        <span className={contact.source ? undefined : "text-gray-400"}>
                            {contactSourceLabel(contact.source)}
                        </span>
                        {contact.source_updated_at && (
                            <span className="ml-1 font-normal text-gray-500">
                                · updated {format(new Date(contact.source_updated_at), "dd MMM yyyy")}
                            </span>
                        )}
                    </span>
                </div>

                {/* Custom Fields - the value can be a string, a number, a boolean,
                    a list or (legacy rows) a nested object; every shape formats
                    to text instead of being handed to React as a child. */}
                {contact.custom_fields && Object.keys(contact.custom_fields).length > 0 && (
                    <>
                        {Object.entries(contact.custom_fields).map(([key, value]) => {
                            const def = byKey.get(key);
                            return (
                                <div key={key}>
                                    <Divider />
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mt-4">
                                        <span className={`text-gray-500 col-span-1 ${def ? "" : "capitalize"}`}>
                                            {def ? def.label : key.replace(/_/g, " ")}
                                        </span>
                                        <span className="col-span-1 md:col-span-3 font-medium text-start break-all">
                                            {formatCustomFieldValue(value, def?.field_type)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </div>
    );
};
