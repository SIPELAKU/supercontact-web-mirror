"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { DateCalendar, StaticTimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { enGB } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/notifications";
import { Modal, Box } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { handleError } from "@/lib/utils/errorHandler";

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contactId: string;
}

interface User {
  id: string;
  fullname: string;
}

export default function AddTaskModal({
  open,
  onClose,
  onSuccess,
  contactId,
}: AddTaskModalProps) {
  const router = useRouter();
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { token } = useAuth();

  // Time state
  const [time, setTime] = useState<Date | null>(new Date());

  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");

  // Search & Selection State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false); // To track if list should be shown

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users when debounced search changes
  useEffect(() => {
    const fetchUsers = async () => {
      // Don't fetch if the search term matches the selected user (user just selected)
      // or if modal isn't open
      if (!open || (selectedUser && searchTerm === selectedUser.fullname))
        return;

      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("access_token="))
          ?.split("=")[1];

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users?page=1&limit=10&search=${debouncedSearch}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await res.json();
        setUsers(data.data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [debouncedSearch, open, selectedUser, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsSearching(true);
    // If user types, invalidate previous selection if it doesn't match
    if (selectedUser && e.target.value !== selectedUser.fullname) {
      setSelectedUser(null);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchTerm(user.fullname);
    setIsSearching(false); // Hide the list
  };

  const handleSubmit = async () => {
    if (!token) {
      notify.error("Token not found. Please log in again.");
      router.push("/login");
      return;
    }
    if (!taskName.trim()) {
      notify.error("Task name is required");
      return;
    }

    if (!date) {
      notify.error("Date is required");
      return;
    }

    setLoading(true);

    // Construct due_date
    const dueDate = new Date(date);
    if (time) {
      dueDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contacts/${contactId}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            task_name: taskName,
            due_date: dueDate.toISOString(),
            priority: priority,
            assignee_id: selectedUser?.id,
            description: description,
          }),
        },
      );

      if (res.ok) {
        notify.success("Task created!");
        onSuccess();
        onClose();
        // Reset form
        setTaskName("");
        setDescription("");
        setDate(new Date());
        setTime(new Date());
        setPriority("Medium");
        setSearchTerm("");
        setSelectedUser(null);
      } else {
        const errorData = await res.json();
        const message = handleError(errorData, "Adding task")
        notify.error("Error", {
          description: message,
        });
      }
    } catch (error) {
      const message = handleError(error, "Adding task")
      notify.error("Error", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const handleClose = () => {
    onClose();
    // Reset input
    setTaskName("");
    setDescription("");
    setDate(new Date());
    setTime(new Date());
    setPriority("Medium");
    setSearchTerm("");
    setSelectedUser(null);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={() => setShowCloseConfirmation(true)}
        aria-labelledby="add-task-modal-title"
        aria-describedby="add-task-modal-description"
        className="flex items-center justify-center p-4"
      >
        <Box className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative flex flex-col gap-6 max-h-[90vh] overflow-y-auto focus:outline-none">
          {/* Header */}
          <div>
            <h2
              id="add-task-modal-title"
              className="text-xl font-bold text-blue-600"
            >
              Add Task
            </h2>
            <p
              id="add-task-modal-description"
              className="text-sm text-gray-500 mt-1"
            >
              Fill in the details below to create a new task for your team.
            </p>
          </div>

          {/* Task Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Task Name
            </label>
            <Input
              placeholder="Follow up on the quarterly report"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              placeholder="Add description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none transition-all"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Due Date
            </label>

            {/* Time Picker */}
            <div className="border border-gray-200 rounded-lg p-1 flex justify-center bg-[#fafafa] mb-4">
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={enGB}
              >
                <StaticTimePicker
                  orientation="portrait"
                  value={time}
                  onChange={(newTime) => setTime(newTime)}
                  ampm={false}
                  slotProps={{
                    actionBar: { actions: [] },
                  }}
                  sx={{
                    backgroundColor: "#fafafa",
                    borderRadius: "12px",
                    "& .MuiPickersLayout-contentWrapper": {
                      alignItems: "center",
                    },
                  }}
                />
              </LocalizationProvider>
            </div>

            {/* Calendar */}
            <div className="border border-gray-200 rounded-lg p-1 flex justify-center bg-[#fafafa]">
              <DateCalendar
                value={date}
                onChange={(newDate) => setDate(newDate || undefined)}
                sx={{
                  width: "100%",
                  "& .MuiPickersDay-root.Mui-selected": {
                    backgroundColor: "#2563eb", // blue-600
                  },
                  "& .MuiPickersDay-root.Mui-selected:hover": {
                    backgroundColor: "#1d4ed8",
                  },
                  "& .MuiPickersCalendarHeader-root": {
                    paddingLeft: "16px",
                    paddingRight: "8px",
                  },
                }}
              />
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Priority
            </label>
            <div className="flex gap-2">
              {(["Low", "Medium", "High"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-4 py-2 rounded-md text-sm transition-colors border ${priority === p
                    ? "bg-blue-50 text-blue-600 border-blue-600 font-medium"
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Assign To */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Assign to
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Start typing to search"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9"
              />
              {users.length > 0 && isSearching && (
                <div className="mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-auto absolute z-10 w-full">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      {user.fullname}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className={`flex gap-3 justify-end ${selectedUser ? "mt-0" : "mt-2"} pt-4 border-t border-gray-100`}
          >
            <AppButton
              variantStyle="outline"
              onClick={onClose}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Cancel
            </AppButton>
            <AppButton
              variantStyle="primary"
              onClick={handleSubmit}
              isLoading={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Saving..." : "Save Task"}
            </AppButton>
          </div>
        </Box>
      </Modal>

      <ConfirmationPopup
        isOpen={showCloseConfirmation}
        onClose={() => setShowCloseConfirmation(false)}
        onConfirm={() => {
          setShowCloseConfirmation(false);
          handleClose();
        }}
        title="Are you sure?"
        description="This will discard your current record."
        confirmText="Discard record"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
