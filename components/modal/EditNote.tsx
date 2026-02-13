import { notify } from "@/lib/notifications";
import { Note } from "@/lib/models/types";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";

import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppTextarea } from "@/components/ui/app-textarea";
import { AppDatePicker } from "@/components/ui/app-datepicker";
// Removed AppTimePicker
import { parse, format as formatDate } from "date-fns";
import { DateCalendar, StaticTimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { enGB } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { handleError } from "@/lib/utils/errorHandler";

interface ModalContentProps {
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    content: string;
    date: string;
    time: string;
  }) => void;
  initialData: Note | null;
  id: string | null;
}

interface LocalNoteState {
  id: string;
  title: string;
  content: string;
  date: string;
  time: string;
}

const ModalContent: React.FC<ModalContentProps> = ({
  onClose,
  onSubmit,
  initialData,
}) => {
  const [local, setLocal] = useState<LocalNoteState>({
    id: "",
    title: "",
    content: "",
    date: "",
    time: new Date().toISOString(),
  });

  useEffect(() => {
    if (initialData) {
      let timeStr = new Date().toISOString();
      if (initialData.reminder_time) {
        try {
          // Try parsing if it's "HH:mm:ss" or "HH:mm"
          const today = new Date();
          const parsedTime = parse(initialData.reminder_time, "HH:mm:ss", today);
          if (!isNaN(parsedTime.getTime())) {
            timeStr = parsedTime.toISOString();
          } else {
            // Fallback for other formats if necessary, or keep current time
            const parsedTimeSimple = parse(initialData.reminder_time, "HH:mm", today);
            if (!isNaN(parsedTimeSimple.getTime())) {
              timeStr = parsedTimeSimple.toISOString();
            }
          }
        } catch (e) {
          console.error("Error parsing time:", e);
        }
      }

      setLocal({
        id: initialData.id,
        title: initialData.title || "",
        content: initialData.content || "",
        date: initialData.reminder_date || "",
        time: timeStr,
      });
    }
  }, [initialData]);

  const handleTimeChange = (newTime: Date | null) => {
    if (newTime) {
      setLocal((prev) => ({ ...prev, time: newTime.toISOString() }));
    }
  };

  const handleDateChange = (val: unknown) => {
    const date = val as Date | null;
    setLocal((s: LocalNoteState) => ({
      ...s,
      date: date ? formatDate(date, "yyyy-MM-dd") : "",
    }));
  };

  const dateValue = local.date
    ? parse(local.date, "yyyy-MM-dd", new Date())
    : null;

  return (
    <div className="flex flex-col w-full p-5 md:p-6 text-start">
      <h2 className="text-xl md:text-2xl font-semibold text-[#5479EE]">
        Edit Notes
      </h2>
      <p className="text-gray-600 text-sm md:text-md mt-1">
        Update the details below to edit Notes.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Title</label>
          <AppInput
            value={local.title}
            onChange={(e) =>
              setLocal((s: LocalNoteState) => ({ ...s, title: e.target.value }))
            }
            placeholder="Enter Title Notes"
            fullWidth
            isBgWhite
            rounded="12px"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Content</label>
          <AppTextarea
            value={local.content}
            onChange={(
              e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            ) =>
              setLocal((s: LocalNoteState) => ({
                ...s,
                content: e.target.value,
              }))
            }
            placeholder="Write your notes here"
            rows={4}
            fullWidth
            isBgWhite
            rounded="12px"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Set Reminder
          </label>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="border border-gray-200 rounded-lg p-1 flex justify-center bg-[#fafafa]">
              <DateCalendar
                value={dateValue}
                onChange={(newDate) => handleDateChange(newDate)}
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

            <div className="border border-gray-200 rounded-lg p-1 flex justify-center bg-[#fafafa]">
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                <StaticTimePicker
                  orientation="portrait"
                  value={local.time ? new Date(local.time) : null}
                  onChange={handleTimeChange}
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
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8 font-medium">
        <AppButton variantStyle="soft" color="gray" onClick={onClose}>
          Cancel
        </AppButton>

        <AppButton onClick={() => onSubmit(local)} variantStyle="primary">
          Save Changes
        </AppButton>
      </div>
    </div>
  );
};

interface EditNoteModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: Note | null;
  id: string;
}

const EditNoteModal: React.FC<EditNoteModalProps> = ({
  open,
  onClose,
  onSuccess,
  initialData,
  id,
}) => {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: {
    title: string;
    content: string;
    date: string;
    time: string;
  }) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (!token) {
        notify.error("Authentication required. Please login again.", {
          description: "Please login again to continue.",
        });
        router.push("/login");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notes?note_id=${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: data.title,
            content: data.content,
            reminder_date: data.date,
            reminder_time: formatDate(new Date(data.time), "HH:mm:ss"),
          }),
        },
      );

      if (res.ok) {
        notify.success("Notes updated!");
        onSuccess();
        onClose();
      } else {
        notify.error("Failed to update notes");
      }
    } catch (error) {
      const message = handleError(error, "Updating note")
      notify.error("Error", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-170 max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalContent
          id={id}
          onClose={onClose}
          onSubmit={handleSubmit}
          initialData={initialData}
        />
      </div>
    </div>
  );
};

export default EditNoteModal;
