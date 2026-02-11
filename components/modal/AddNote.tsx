"use client";

import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppTextarea } from "@/components/ui/app-textarea";
import { AppTimePicker } from "@/components/ui/app-timepicker";
import { useAuth } from "@/lib/context/AuthContext";
import { notify } from "@/lib/notifications";
import { format as formatDate, parse } from "date-fns";
import React, { useState } from "react";

import { DateCalendar } from "@mui/x-date-pickers";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

interface NoteData {
  title: string;
  content: string;
  reminder_date: string;
  reminder_time: string;
}

interface ModalContentProps {
  onClose: () => void;
  onSubmit: (data: NoteData) => void;
}

const ModalContent: React.FC<ModalContentProps> = ({ onClose, onSubmit }) => {
  const [local, setLocal] = useState<NoteData>({
    title: "",
    content: "",
    reminder_date: "",
    reminder_time: "09:30 AM",
  });

  // Time state
  const [hour, setHour] = useState("09");
  const [min, setMin] = useState("30");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  const syncTime = (h: string, m: string, p: "AM" | "PM") => {
    setLocal((prev) => ({ ...prev, reminder_time: `${h}:${m} ${p}` }));
  };

  const handleHourChange = (val: string) => {
    setHour(val);
    syncTime(val, min, period);
  };

  const handleMinuteChange = (val: string) => {
    setMin(val);
    syncTime(hour, val, period);
  };

  const handlePeriodChange = (val: "AM" | "PM") => {
    setPeriod(val);
    syncTime(hour, min, val);
  };

  const handleDateChange = (val: unknown) => {
    const date = val as Date | null;
    setLocal((s: NoteData) => ({
      ...s,
      reminder_date: date ? formatDate(date, "yyyy-MM-dd") : "",
    }));
  };

  const dateValue = local.reminder_date
    ? parse(local.reminder_date, "yyyy-MM-dd", new Date())
    : null;

  return (
    <div
      className={`flex flex-col w-full p-5 md:p-6 text-start ${poppins.className}`}
    >
      <h2 className="text-xl md:text-2xl font-semibold text-[#5479EE]">
        Add New Notes
      </h2>
      <p className="text-gray-600 text-sm md:text-md mt-1">
        Fill in the details below to add a new Notes.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[16px] font-medium text-gray-700">Title</label>
          <AppInput
            value={local.title}
            onChange={(e) =>
              setLocal((s: NoteData) => ({ ...s, title: e.target.value }))
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
            ) => setLocal((s: NoteData) => ({ ...s, content: e.target.value }))}
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

            <AppTimePicker
              label="Time"
              hour={hour}
              minute={min}
              period={period}
              onHourChange={handleHourChange}
              onMinuteChange={handleMinuteChange}
              onPeriodChange={handlePeriodChange}
              isBgWhite
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8 font-medium">
        <AppButton variantStyle="outline" color="primary" onClick={onClose}>
          Cancel
        </AppButton>

        <AppButton onClick={() => onSubmit(local)} variantStyle="primary">
          Save Notes
        </AppButton>
      </div>
    </div>
  );
};

interface AddNoteModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: NoteData) => {
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

      const convertTo24Hour = (time12h: string): string => {
        if (!time12h) throw new Error("TIME_EMPTY");

        const [time, modifier] = time12h.trim().split(" "); // "09:30", "AM"
        let [hours, minutes] = time.split(":").map(Number);

        if (isNaN(hours) || isNaN(minutes)) {
          throw new Error("INVALID_TIME_FORMAT");
        }

        if (modifier === "PM" && hours !== 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          reminder_date: data.reminder_date,
          reminder_time: convertTo24Hour(data.reminder_time),
        }),
      });

      if (res.ok) {
        notify.success("Notes saved!");
        onSuccess();
        onClose();
      } else {
        notify.error("Failed to save notes");
      }
    } catch (error) {
      notify.error("Failed to save notes");
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
        className="bg-white rounded-xl shadow-xl w-full max-w-150.25 max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalContent onClose={onClose} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default AddNoteModal;
