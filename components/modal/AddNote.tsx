"use client";

import { notify } from "@/lib/notifications";
import { useAuth } from "@/lib/context/AuthContext";
import React, { useEffect, useRef, useState } from "react";

interface InputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
}) => (
  <div className="flex flex-col gap-2">
    <label className="font-medium text-gray-700">{label}</label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="
        px-4 py-3 border border-gray-300 rounded-lg
        placeholder-gray-400 text-md
        focus:outline-none focus:ring-2 focus:ring-purple-400
      "
    />
  </div>
);

interface TextAreaProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextAreaField: React.FC<TextAreaProps> = ({
  label,
  value,
  onChange,
  placeholder,
}) => (
  <div className="flex flex-col gap-2">
    <label className="font-medium text-gray-700">{label}</label>
    <textarea
      rows={4}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="
        px-4 py-3 border border-gray-300 rounded-lg
        placeholder-gray-400 text-md resize-none
        focus:outline-none focus:ring-2 focus:ring-purple-400
      "
    />
  </div>
);

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
    reminder_time: "",
  });

  return (
    <div className="flex flex-col w-full p-5 md:p-2 text-start">
      <h2 className="text-xl md:text-2xl font-semibold text-[#6739EC]">
        Add New Notes
      </h2>
      <p className="text-gray-600 text-sm md:text-md mt-1">
        Fill in the details below to add a new Notes.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <InputField
          label="Title"
          value={local.title}
          onChange={(e) => setLocal((s) => ({ ...s, title: e.target.value }))}
          placeholder="Enter Title Notes"
        />

        <TextAreaField
          label="Content"
          value={local.content}
          onChange={(e) => setLocal((s) => ({ ...s, content: e.target.value }))}
          placeholder="Write your notes here"
        />

        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700">Set Reminder</label>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="date"
              value={local.reminder_date}
              onChange={(e) =>
                setLocal((s) => ({ ...s, reminder_date: e.target.value }))
              }
              className="border border-gray-300 px-4 py-3 rounded-lg"
            />

            <input
              type="time"
              value={local.reminder_time}
              onChange={(e) =>
                setLocal((s) => ({ ...s, reminder_time: e.target.value }))
              }
              className="border border-gray-300 px-4 py-3 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8 font-medium">
        <button
          onClick={onClose}
          className="px-5 py-3 rounded-lg bg-gray-200 text-gray-700"
        >
          Cancel
        </button>

        <button
          onClick={() => onSubmit(local)}
          className="px-6 py-3 rounded-lg bg-[#6739EC] text-white"
        >
          Save Notes
        </button>
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
  const { getToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: NoteData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const token = await getToken();

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
          reminder_time: data.reminder_time,
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
      notify.error("Authentication required. Please login again.");
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
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalContent onClose={onClose} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default AddNoteModal;
