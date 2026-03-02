"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Contact, Note, Task } from "@/lib/models/types";
import { ArrowLeftIcon } from "lucide-react";
import { notify } from "@/lib/notifications";
import EditContactModal from "@/components/contact/modal/EditContactModal";
import AddTaskModal from "@/components/contact/modal/AddTaskModal";
import DeleteContactModal from "@/components/contact/modal/DeleteContactModal";
import { useAuth } from "@/lib/context/AuthContext";
import { AppButton } from "@/components/ui/app-button";
import { Box, CircularProgress, Divider } from "@mui/material";
import { handleError } from "@/lib/utils/errorHandler";

import { ContactHeader } from "./sections/ContactHeader";
import { ContactInfo } from "./sections/ContactInfo";
import { ContactTags } from "./sections/ContactTags";
import { ContactNotes } from "./sections/ContactNotes";
import { ContactTasks } from "./sections/ContactTasks";

// Mock data for tags since API wasnt provided for it
const MOCK_TAGS = ["Lead", "Active Customer", "High Priority"];

export const ContactDetailClient = () => {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { token } = useAuth();

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
    }, [id]);

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
        <div className="w-full flex flex-col gap-6 p-4 md:p-8 bg-gray-50 min-h-screen">
            <Box className="w-fit">
                <AppButton
                    onClick={() => router.back()}
                    variantStyle="outline"
                    color="primary"
                    startIcon={<ArrowLeftIcon />}
                >
                    Back
                </AppButton>
            </Box>
            <Divider />

            <ContactHeader contact={contact} onEdit={() => setOpenEdit(true)} />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Left Column: Details, Tags, Tasks */}
                <div className="flex flex-col gap-6 md:col-span-2">
                    <ContactInfo contact={contact} />
                    <ContactTags tags={MOCK_TAGS} />
                </div>

                {/* Right Column: Notes & Activity */}
                <div className="flex flex-col gap-6 md:col-span-2">
                    <ContactNotes
                        contactName={contact.name}
                        notes={notes}
                        onSaveNote={handleSaveNote}
                        isSaving={isloadingCreateNote}
                    />
                </div>
            </div>

            <ContactTasks tasks={tasks} onAddTask={handleCreateTask} />

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
