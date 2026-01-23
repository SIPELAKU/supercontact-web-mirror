"use client";

import React, { useEffect, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Cookies from "js-cookie";

const MySwal = withReactContent(Swal);

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

const ModalContent: React.FC<ModalContentProps> = ({
  onClose,
  onSubmit,
}) => {
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
  contactId: number | string;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({
  open,
  onClose,
  onSuccess,
  contactId,
}) => {
  const reactRootRef = useRef<Root | null>(null);

  const handleSubmit = async (data: NoteData) => {
    const token = Cookies.get("access_token");
    
    if (!token) {
      MySwal.fire({
        icon: "error",
        title: "Authentication required",
        text: "Please login again",
      });
      return;
    }

    const res = await fetch("/api/proxy/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        contact_id: contactId,
        note: data.content,
        reminder_date: `${data.reminder_date}T${data.reminder_time}:00.000Z`,
      }),
    });

    MySwal.close();
    onClose();   
    if (res.ok) {
      onSuccess();
      MySwal.close();

      MySwal.fire({
        icon: "success",
        title: "Notes saved!",
        timer: 1200,
        showConfirmButton: false,
      });
    } else {
      MySwal.fire({
        icon: "error",
        title: "Failed to save notes",
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
      customClass: {
      popup: `
            w-[92%]
            sm:w-full
            sm:max-w-lg
            md:max-w-xl
            rounded-xl
            `,
        },
      padding: 0,

      didOpen: () => {
        const container = document.getElementById(
          "react-swal-container"
        );
        if (container) {
          reactRootRef.current = createRoot(container);
          reactRootRef.current.render(
            <ModalContent
              onClose={() => {
                MySwal.close();
                onClose();
              }}
              onSubmit={handleSubmit}
            />
          );
        }
      },

      didClose: ()=>{
        onClose()
      },
      willClose: () => {
        if (reactRootRef.current) {
          reactRootRef.current.unmount();
          reactRootRef.current = null;
        }
      },
    });
  }, [open]);

  return null;
};

export default AddNoteModal;
