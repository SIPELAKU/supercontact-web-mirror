"use client";

import { Note } from "@/lib/models/types";
import React, { useEffect, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface InputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputProps> = ({ label, value, onChange, placeholder }) => (
  <div className="flex flex-col w-full gap-2">
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
  <div className="flex flex-col w-full gap-2">
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

interface ModalContentProps {
  onClose: () => void;
  onSubmit: (data: { title: string, content: string, date: string, time: string }) => void;
  initialData: Note | null;
  id: string | null;
}

const ModalContent: React.FC<ModalContentProps> = ({
  onClose,
  onSubmit,
  initialData,
}) => {
  const [local, setLocal] = useState<Note>({
    id: "",
    title: "",
    content: "",
    date: "",
    time: "",
  });

  useEffect(() => {
    if (initialData) {
      setLocal({
        id: initialData.id,
        title: initialData.title || "",
        content: initialData.content || "",
        date: initialData.date || "",
        time: initialData.time ? initialData.time.slice(0, 5) : "",
      });
    }
  }, [initialData]);

  return (
    <div className="flex flex-col w-full p-5 md:p-6 text-start">
      <h2 className="text-xl md:text-2xl font-semibold text-[#6739EC]">
        Edit Notes
      </h2>
      <p className="text-gray-600 text-sm md:text-md mt-1">
        Update the details below to edit Notes.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <InputField
          label="Title"
          value={local.title}
          onChange={(e) =>
            setLocal((s) => ({ ...s, title: e.target.value }))
          }
          placeholder="Enter Title Notes"
        />

        <TextAreaField
          label="Content"
          value={local.content}
          onChange={(e) =>
            setLocal((s) => ({ ...s, content: e.target.value }))
          }
          placeholder="Write your notes here"
        />

        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700">
            Set Reminder
          </label>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="date"
              value={local.date}
              onChange={(e) =>
                setLocal((s) => ({ ...s, date: e.target.value }))
              }
              className="border border-gray-300 px-4 py-3 rounded-lg w-full"
            />

            <input
              type="time"
              value={local.time}
              onChange={(e) =>
                setLocal((s) => ({ ...s, time: e.target.value }))
              }
              className="border border-gray-300 px-4 py-3 rounded-lg w-full md:w-1/2"
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
          Save Changes
        </button>
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
  const reactRootRef = useRef<Root | null>(null);
  
  const handleSubmit = async (data: {
    title: string;
    content: string;
    date: string;
    time: string;
  }) => {
    try {
      // ⬇️ FIX BENAR: TANPA Date(), TANPA TIMEZONE SHIFT
      const reminderTimeFixed = `${data.date}T${data.time}:00.000Z`;

      const res = await fetch(`/api/proxy/notes/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          note: data.content,
          reminder_date: reminderTimeFixed,
        }),
      });

      MySwal.close();
      onClose();

      if (res.ok) {
        onSuccess();
        MySwal.fire({
          icon: "success",
          title: "Notes updated!",
          timer: 1200,
          showConfirmButton: false,
        });
      } else {
        MySwal.fire({
          icon: "error",
          title: "Failed to update notes",
          timer: 1400,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      MySwal.close();
      onClose();
      
      MySwal.fire({
        icon: "error",
        title: "Server error",
        timer: 1400,
        showConfirmButton: false,
      });
    }
  };

  useEffect(() => {
    if (!open) return;

    MySwal.fire({
      html: `<div id="react-swal-container"></div>`,
      showConfirmButton: false,
      allowOutsideClick: true,
      padding: 0,
      customClass: {
        popup: "w-[92%] sm:max-w-lg md:max-w-xl rounded-xl",
      },

      didOpen: () => {
        const container = document.getElementById(
          "react-swal-container"
        );
        if (container) {
          reactRootRef.current = createRoot(container);
          reactRootRef.current.render(
            <ModalContent
              id={id}
              onClose={() => {
                MySwal.close();
                onClose();
              }}
              onSubmit={handleSubmit}
              initialData={initialData}
            />
          );
        }
      },

      willClose: () => {
        if (reactRootRef.current) {
          reactRootRef.current.unmount();
          reactRootRef.current = null;
        }
      },

      didClose: () => {
        onClose();
      },
    });
  }, [open, initialData]);

  return null;
};

export default EditNoteModal;