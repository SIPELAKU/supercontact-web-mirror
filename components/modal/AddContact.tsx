"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import React, { useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import { ContactReq } from "@/lib/models/types";

const MySwal = withReactContent(Swal);

interface InputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputProps> = ({ label, value, onChange, placeholder }) => {
  return (
    <div className="flex flex-col w-full gap-2">
      <label className="font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          mt-1 px-4 py-3 border border-gray-300 rounded-lg 
          placeholder-gray-400 text-md font-medium
          focus:outline-none focus:ring-2 focus:ring-purple-400
        "
      />
    </div>
  );
};

interface ModalContentProps {
  onClose: () => void;
  onSubmit: (data: ContactReq) => void;
}

const ModalContent: React.FC<ModalContentProps> = ({ onClose, onSubmit }) => {
  const [local, setLocal] = React.useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    job_title: "",
    address: "",
  });

  return (
    <div className="flex flex-col w-full p-6 text-start">
      <h2 className="text-2xl font-semibold text-[#6739EC]">Add New Contact</h2>
      <p className="text-gray-600 text-md mt-1">
        Fill in the details below to add a new contact to your CRM.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <InputField
          label="Name"
          value={local.name}
          onChange={(e) => setLocal((s) => ({ ...s, name: e.target.value }))}
          placeholder="Enter name"
        />

        <InputField
          label="Phone Number"
          value={local.phone}
          onChange={(e) => setLocal((s) => ({ ...s, phone: e.target.value }))}
          placeholder="Enter phone number"
        />

        <InputField
          label="Email"
          value={local.email}
          onChange={(e) => setLocal((s) => ({ ...s, email: e.target.value }))}
          placeholder="Enter email"
        />

        <InputField
          label="Company"
          value={local.company}
          onChange={(e) => setLocal((s) => ({ ...s, company: e.target.value }))}
          placeholder="Enter company"
        />
        <InputField
          label="Job Tittle"
          value={local.job_title}
          onChange={(e) => setLocal((s) => ({ ...s, job_title: e.target.value }))}
          placeholder="Enter job tittle"
        />
        <InputField
          label="Address"
          value={local.address}
          onChange={(e) => setLocal((s) => ({ ...s, address: e.target.value }))}
          placeholder="Enter address"
        />
      </div>

      <div className="flex justify-end gap-3 mt-8 font-medium">
        <button onClick={onClose} className="px-5 py-4 rounded-lg bg-gray-200 text-gray-700">
          Cancel
        </button>

        <button
          onClick={() => onSubmit(local)}
          className="px-6 py-4 rounded-lg bg-[#6739EC] text-white"
        >
          Save Contact
        </button>
      </div>
    </div>
  );
};

interface AddContactModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddContactModal: React.FC<AddContactModalProps> = ({ open, onClose, onSuccess }) => {
  const reactRootRef = useRef<Root | null>(null);
  const handleSubmit = async (data: ContactReq) => {
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        job_title: data.job_title,
        company: data.company,
        address: data.address,
      }),
    });

    const text = await res.text();

    let result: any = {};
    try {
      result = JSON.parse(text);
    } catch {
      result = {};
    }

    if (!res.ok) {
      const message =
        result?.error?.message ?? "Failed to add contact";

      const details =
        result?.error?.details?.errors
          ?.map((e: any) => `• ${e.loc.join(".")}: ${e.msg}`)
          .join("<br/>");

      MySwal.fire({
        icon: "error",
        title: message,
        html: details || message,
      });
      return;
    }

    onSuccess();
    onClose();
    MySwal.close();

    MySwal.fire({
      icon: "success",
      title: "Contact added!",
      timer: 1200,
      showConfirmButton: false,
    });
  } catch (err) {
    MySwal.fire({
      icon: "error",
      title: "Network error",
      text: "Please try again later",
    });
  }
};


  useEffect(() => {
    if (!open) return;

    MySwal.fire({
      html: `<div id="react-swal-container"></div>`,
      showConfirmButton: false,
      allowOutsideClick: true,
      width: "600px",
      padding: 0,

      didOpen: () => {
        const container = document.getElementById("react-swal-container");
        if (container) {
          reactRootRef.current = createRoot(container);
          reactRootRef.current.render(<ModalContent onClose={() => { MySwal.close(); onClose(); }} onSubmit={handleSubmit} />);
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

export default AddContactModal;
