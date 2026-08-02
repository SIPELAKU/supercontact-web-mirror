"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Contact, Note, Task } from "@/lib/models/types";
import { notify } from "@/lib/notifications";
import EditContactModal from "@/components/contact/modal/EditContactModal";
import AddTaskModal from "@/components/contact/modal/AddTaskModal";
import DeleteContactModal from "@/components/contact/modal/DeleteContactModal";
import { useAuth } from "@/lib/context/AuthContext";
import { CircularProgress, Box, Tab, Tabs } from "@mui/material";
import { handleError } from "@/lib/utils/errorHandler";
import PageHeader from "@/components/ui/page-header";

import { ContactHeader } from "./sections/ContactHeader";
import { ContactInfo } from "./sections/ContactInfo";
import { ContactTags } from "./sections/ContactTags";
import { ContactNotes } from "./sections/ContactNotes";
import { ContactTasks } from "./sections/ContactTasks";
import { ContactEmailTab } from "./sections/ContactEmailTab";
import { ContactWhatsAppTab } from "./sections/ContactWhatsAppTab";

// Mock data for tags since API wasnt provided for it
const MOCK_TAGS = ["Lead", "Active Customer", "High Priority"];

type ProfileTab = "overview" | "activity" | "email" | "whatsapp";
const VALID_TABS: ProfileTab[] = ["overview", "activity", "email", "whatsapp"];

export const ContactDetailClient = () => {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const { token } = useAuth();

    const [activeTab, setActiveTab] = useState<ProfileTab>(() => {
        const fromUrl = searchParams.get("tab") as ProfileTab | null;
        return fromUrl && VALID_TABS.includes(fromUrl) ? fromUrl : "overview";
    });

    const [contact, setContact] = useState<Contact | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openTaskModal, setOpenTaskModal] = useState(false);
    const [isloadingCreateNote, setisloadingCreateNote] = useState(false);

    const fetchContact = async () => {
        try {
            if (!token) {
                notify.error("Token not found. Please log in again.");
                router.push("/login");
                return;
            }
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/contacts/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            if (res.ok) {
                const data = await res.json();
                setContact(data.data || data); // Handle potential wrapper
                setNotes(data.data.contact_notes || []);
                setTasks(data.data.contact_tasks || []);
            }
        } catch (error) {
            console.error("Error fetching contact:", error);
        }
    };

    const reloadData = async () => {
        setLoading(true);
        await fetchContact();
        setLoading(false);
    };

    useEffect(() => {
        if (id) {
            reloadData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleTabChange = useCallback(
        (tab: ProfileTab) => {
            setActiveTab(tab);
            router.replace(`/contact/detail/${id}?tab=${tab}`, { scroll: false });
        },
        [id, router]
    );

    const handleSaveNote = async (noteText: string) => {
        setisloadingCreateNote(true);
        if (!noteText.trim()) {
            setisloadingCreateNote(false);
            return;
        }

        if (!token) {
            notify.error("Token not found. Please log in again.");
            router.push("/login");
            return;
        }

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/contacts/${id}/notes`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ note: noteText }),
                },
            );

            if (res.ok) {
                reloadData();
                setisloadingCreateNote(false);
                notify.success("Note added!");
            } else {
                const errorData = await res.json();
                const message = handleError(errorData, "Adding note")
                notify.error("Error", {
                    description: message,
                });
            }
        } catch (error) {
            const message = handleError(error, "Adding note")
            notify.error("Error", {
                description: message,
            });
            setisloadingCreateNote(false);
        }
    };

    const handleCreateTask = () => {
        setOpenTaskModal(true);
    };

    if (loading && !contact) {
        return (
            <div className="flex items-center justify-center h-screen gap-4">
                <CircularProgress size={30} />
            </div>
        );
    }

    if (!contact) {
        return (
            <div className="flex flex-col items-center justify-center h-screen border border-dashed border-gray-200 rounded-xl bg-gray-50">
                <p className="text-gray-500 font-medium">No contact found.</p>
                <p className="text-sm text-gray-400 mt-1">Try again with valid ID.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8 space-y-6">
            <PageHeader
                title={contact.name}
                breadcrumbs={[{ label: "Contacts", href: "/contact" }, { label: contact.name }]}
            />

            <ContactHeader contact={contact} onEdit={() => setOpenEdit(true)} />

            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, val) => handleTabChange(val)}
                    sx={{
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontWeight: 500,
                            fontSize: "14px",
                            minWidth: "auto",
                            padding: "10px 4px",
                            marginRight: "28px",
                            color: "#6B7280",
                        },
                        "& .Mui-selected": { color: "#5479EE!important" },
                        "& .MuiTabs-indicator": { backgroundColor: "#5479EE" },
                    }}
                >
                    <Tab label="Overview" value="overview" disableRipple />
                    <Tab label="Activity" value="activity" disableRipple />
                    <Tab label="Email" value="email" disableRipple />
                    <Tab label="WhatsApp" value="whatsapp" disableRipple />
                </Tabs>
            </Box>

            {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="flex flex-col gap-6 md:col-span-2">
                        <ContactInfo contact={contact} />
                    </div>
                    <div className="flex flex-col gap-6 md:col-span-2">
                        <ContactTags tags={MOCK_TAGS} />
                    </div>
                </div>
            )}

            {activeTab === "activity" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ContactNotes
                        contactName={contact.name}
                        notes={notes}
                        onSaveNote={handleSaveNote}
                        isSaving={isloadingCreateNote}
                    />
                    <ContactTasks tasks={tasks} onAddTask={handleCreateTask} />
                </div>
            )}

            {activeTab === "email" && token && (
                <ContactEmailTab
                    contactId={id}
                    isSubscriber={contact.is_subscriber}
                    mailingLists={contact.mailing_lists || []}
                    token={token}
                    onChanged={reloadData}
                />
            )}

            {activeTab === "whatsapp" && token && (
                <ContactWhatsAppTab
                    contactId={id}
                    isRecipient={contact.is_recipient}
                    broadcastGroups={contact.broadcast_groups || []}
                    token={token}
                    onChanged={reloadData}
                />
            )}

            <EditContactModal
                open={openEdit}
                initialData={contact}
                onClose={() => setOpenEdit(false)}
                onSuccess={reloadData}
            />
            <DeleteContactModal
                open={openDelete}
                initialData={contact}
                onClose={() => setOpenDelete(false)}
                onSuccess={reloadData}
            />
            <AddTaskModal
                open={openTaskModal}
                onClose={() => setOpenTaskModal(false)}
                onSuccess={reloadData}
                contactId={id}
            />
        </div>
    );
};
