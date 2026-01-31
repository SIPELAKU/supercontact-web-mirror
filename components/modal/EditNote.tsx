"use client";

import { notify } from "@/lib/notifications";
import { Note } from "@/lib/models/types";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";

import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppTextarea } from "@/components/ui/app-textarea";
import { AppDatePicker } from "@/components/ui/app-datepicker";
import { AppTimePicker } from "@/components/ui/app-timepicker";
import { parse, format as formatDate } from "date-fns";
import { DateCalendar } from "@mui/x-date-pickers";
import { useRouter } from "next/navigation";

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
    time: "",
  });

  // Time state
  const [hour, setHour] = useState("09");
  const [min, setMin] = useState("30");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  const syncTime = (h: string, m: string, p: "AM" | "PM") => {
    setLocal((prev) => ({ ...prev, time: `${h}:${m} ${p}` }));
  };

  useEffect(() => {
    if (initialData) {
      const timeStr = initialData.reminder_time || "09:30 AM";
      // Simple parse for HH:mm AM/PM
      const match = timeStr.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
      if (match) {
        setHour(match[1]);
        setMin(match[2]);
        setPeriod(match[3].toUpperCase() as "AM" | "PM");
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
            reminder_time: convertTo24Hour(data.time),
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
      notify.error("Server error. Please try again later.");
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
        className="bg-white rounded-xl shadow-xl w-full max-w-[601px] max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200 cursor-default"
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
