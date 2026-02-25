"use client";

import { ArrowLeft } from "lucide-react";
import { NewChatUser } from "@/lib/api/chat";

interface ContactListProps {
    userList: NewChatUser[];
    setViewMode: (mode: "inbox" | "contacts") => void;
    onSelectContact: (user: NewChatUser) => void;
}

export default function ContactList({
    userList,
    setViewMode,
    onSelectContact,
}: ContactListProps) {
    const groupedContacts = userList.reduce((acc, user) => {
        const letter = user.fullname.charAt(0).toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(user);
        return acc;
    }, {} as Record<string, NewChatUser[]>);

    return (
        <div className="bg-white rounded-[16px] shadow-sm border border-gray-200/60 flex flex-col flex-1 overflow-hidden h-full">
            <div className="p-4 md:p-6 border-b border-gray-100 flex items-center gap-4">
                <button
                    onClick={() => setViewMode("inbox")}
                    className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h2 className="text-lg font-bold text-[#5479EE]">
                    Start Conversation
                </h2>
            </div>

            <div className="px-6 py-4">{/* Search input placeholder */}</div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
                {Object.keys(groupedContacts)
                    .sort()
                    .map((letter) => (
                        <div key={letter} className="mb-6">
                            <h3 className="text-[#5479EE] font-bold text-lg mb-3">
                                {letter}
                            </h3>
                            <div className="space-y-4">
                                {groupedContacts[letter].map((contact) => (
                                    <div
                                        key={contact.id}
                                        onClick={() => onSelectContact(contact)}
                                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold bg-indigo-100 text-[#5479EE]`}
                                            >
                                                {contact.avatar ? (
                                                    <img
                                                        src={contact.avatar}
                                                        className="w-full h-full rounded-full object-cover"
                                                        alt={contact.fullname}
                                                    />
                                                ) : (
                                                    contact.avatar_initial
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 group-hover:text-[#5479EE] transition-colors">
                                                    {contact.fullname}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {contact.position}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}
