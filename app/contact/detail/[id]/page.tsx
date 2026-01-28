"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Contact, Note, Task } from "@/lib/models/types";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { notify } from "@/lib/notifications";
import EditContactModal from "@/components/modal/EditContact";
import AddTaskModal from "@/components/modal/AddTaskModal";
import DeleteContactModal from "@/components/modal/DeleteContact";
import { useAuth } from "@/lib/context/AuthContext";
import { AppButton } from "@/components/ui/app-button";
import { Box, Divider, Tab, Tabs } from "@mui/material";

// Mock data for tags since API wasn't provided for it
const MOCK_TAGS = ["Lead", "Active Customer", "High Priority"];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  );
}

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { token } = useAuth();

  const [contact, setContact] = useState<Contact | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [value, setValue] = useState(0);
  const [isloadingCreateNote, setisloadingCreateNote] = useState(false);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const getCookie = (name: string) => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1];
  };

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

  const handleSaveNote = async () => {
    setisloadingCreateNote(true);
    if (!newNote.trim()) {
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
          body: JSON.stringify({ note: newNote }),
        },
      );

      if (res.ok) {
        setNewNote("");
        reloadData();
        setisloadingCreateNote(false);
        notify.success("Note added!");
      }
    } catch (error) {
      console.error("Error saving note:", error);
      setisloadingCreateNote(false);
    }
  };

  const handleCreateTask = () => {
    setOpenTaskModal(true);
  };

  if (loading && !contact) {
    return <div className="p-8">Loading...</div>;
  }

  if (!contact) {
    return <div className="p-8">Contact not found</div>;
  }

  return (
    <div className="w-full flex flex-col gap-6 p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
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
          <AppButton onClick={() => setOpenEdit(true)} variantStyle="primary">
            Edit
          </AppButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Column: Details, Tags, Tasks */}
        <div className="flex flex-col gap-6 md:col-span-2">
          {/* Contact Details */}
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

          {/* Tags */}
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {MOCK_TAGS.map((tag) => (
                <span
                  key={tag}
                  className={`px-3 py-1 ${tag === "High Priority" ? "bg-[#FEC7C7] text-[#920E0E]" : "bg-[#E7EBF3] text-[#0D121B]"} rounded-[8px] text-xs font-medium`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Notes & Activity */}
        <div className="flex flex-col gap-6 md:col-span-2">
          {/* Add Note */}
          <div className="flex flex-col gap-2">
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
              >
                <Tab label="Notes" {...a11yProps(0)} />
              </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={`Add a note about ${contact.name}...`}
                className="w-full min-h-[100px] bg-[#F6F6F8] p-3 rounded-lg border border-gray-200 focus:border-primary resize-none placeholder-gray-400 focus:outline-none"
              />
              <div className="flex justify-end mt-2">
                <AppButton
                  onClick={handleSaveNote}
                  variantStyle="primary"
                  disabled={isloadingCreateNote}
                >
                  {isloadingCreateNote ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Save Note"
                  )}
                </AppButton>
              </div>
            </CustomTabPanel>
          </div>

          {/* Activity Timeline */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Activity</h3>

            <div className="relative space-y-8 max-h-[200px] overflow-y-auto">
              {notes.length === 0 && (
                <p className="text-sm text-gray-400">No activity history.</p>
              )}

              {notes.map((note, index) => (
                <div key={note.id} className="relative flex gap-4">
                  {/* Timeline line */}
                  {index !== notes.length - 1 && (
                    <span className="absolute left-5 top-12 h-full w-px bg-gray-200" />
                  )}

                  {/* Avatar */}
                  <div className="relative z-10 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                    {getInitials(note.user_fullname)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900 text-sm">
                        {note.user_fullname}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(note.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {note.note}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Task</h3>
          <AppButton onClick={handleCreateTask} variantStyle="primary">
            Add Task
          </AppButton>
        </div>
        <Divider />

        <div className="flex flex-col relative mt-5 max-h-[150px] overflow-y-auto">
          {tasks.length === 0 && (
            <p className="text-sm text-gray-400">No tasks yet.</p>
          )}
          {tasks.map((task, index) => (
            <div key={task.id} className="relative flex gap-4 pb-10 last:pb-0">
              {/* Status Icon */}
              <div className="shrink-0 z-10 bg-white">
                {task.status === "done" ? (
                  <div className="w-7 h-7 rounded-full bg-[#6739EC] text-white flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="relative">
                    <Circle className="w-7 h-7 text-[#6739EC] stroke-[2.5]" />
                    {/* Connecting Line */}
                    {index !== tasks.length - 1 && (
                      <div className="absolute left-[13px] top-9 bottom-6 w-[2px] h-[40px] bg-[#CFD7E7]" />
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 justify-between items-start pt-0.5 min-w-0 gap-4">
                <div className="flex flex-col gap-1">
                  <span
                    className={`text-base font-semibold ${task.status === "done" ? "text-[#0D121B]" : "text-[#000804/50]"}`}
                  >
                    {task.task_name}
                  </span>
                  {task.description && (
                    <p
                      className={`text-sm ${task.status === "done" ? "text-[#0D121B]" : "text-[#000804/50]"}`}
                    >
                      {task.description ||
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                    </p>
                  )}
                </div>

                {/* Dates */}
                <div className="flex flex-col items-end shrink-0 gap-1">
                  {task.due_date && (
                    <span className="text-sm font-medium text-[#4C669A]/60">
                      {new Date(task.due_date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  <span className="text-sm font-medium text-[#4C669A]/60">
                    {new Date(task.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <EditContactModal
        open={openEdit}
        initialData={contact}
        onClose={() => setOpenEdit(false)}
        onSuccess={reloadData}
        onDelete={() => {
          setOpenEdit(false);
          setOpenDelete(true);
        }}
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
}
