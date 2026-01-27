"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import React, { useState, useRef } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { Loader2, Upload, FileSpreadsheet, X, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { ContactReq } from "@/lib/models/types";
import { notify } from "@/lib/notifications";
import { AppButton } from "../ui/app-button";

const MySwal = withReactContent(Swal);

interface ImportContactModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ImportContactModal: React.FC<ImportContactModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "application/vnd.ms-excel",
    ];
    // Check extension as well because mime types can be tricky
    const validExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    if (
      validTypes.includes(file.type) ||
      validExtensions.includes(fileExtension)
    ) {
      setFile(file);
    } else {
      notify.error("Please upload an .xlsx or .csv file");
    }
  };

  const normalizeHeader = (header: string) => {
    const h = header
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    if (h.includes("name")) return "name";
    if (h.includes("phone")) return "phone_number";
    if (h.includes("email")) return "email";
    if (h.includes("position")) return "position";
    if (h.includes("company")) return "company";
    if (h.includes("address")) return "address";
    return header;
  };

  const processFile = async () => {
    if (!file) return;
    setIsLoading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (jsonData.length === 0) {
        throw new Error("File is empty");
      }

      // Map keys to API format
      const contacts: ContactReq[] = jsonData.map((row: any) => {
        const contact: any = {};
        Object.keys(row).forEach((key) => {
          const normalizedKey = normalizeHeader(key);
          if (
            [
              "name",
              "email",
              "phone_number",
              "company",
              "position",
              "address",
            ].includes(normalizedKey)
          ) {
            contact[normalizedKey] = String(row[key] || "").trim();
          }
        });
        return contact as ContactReq;
      });

      // Filter out empty rows (must have at least name or email or phone)
      const validContacts = contacts.filter(
        (c) => c.name || c.email || c.phone_number,
      );

      if (validContacts.length === 0) {
        throw new Error("No valid contacts found in file");
      }

      await uploadContacts(validContacts);
    } catch (error: any) {
      notify.error("Error Processing File: ", error.message);
      setIsLoading(false);
    }
  };

  const uploadContacts = async (contacts: ContactReq[]) => {
    const token = await getToken();
    try {
      const res = await fetch("/api/proxy/contacts/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contacts }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to upload contacts");
      }

      notify.success(`Successfully imported ${contacts.length} contacts`);
      setFile(null);
      onSuccess();
      onClose();
    } catch (error: any) {
      notify.error("Failed to upload contacts to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-xl flex flex-col animate-in zoom-in-95 duration-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-[#5479EE]">Import Contact</h2>
          <p className="text-gray-600 text-md mt-1 mb-6">
            Fill in the details below to import a new contact to your CRM.
          </p>

          <div
            className={`
              border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors
              ${
                dragActive
                  ? "border-[#5479EE] bg-purple-50"
                  : "border-gray-300 bg-white"
              }
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex flex-col items-center gap-3">
                <FileSpreadsheet className="w-12 h-12 text-[#5479EE]" />
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <button
                  onClick={() => setFile(null)}
                  className="mt-2 text-red-500 text-sm hover:underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-lg border border-gray-200 flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="text-gray-900 font-medium mb-1">
                  Choose a file or drag & drop it here
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Support format .xlsx or .csv
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleChange}
                />
                <button
                  onClick={() => inputRef.current?.click()}
                  className="px-6 py-2 border border-[#5479EE] text-[#5479EE] rounded-lg font-medium hover:bg-[#5479EE] hover:text-white transition-colors"
                >
                  Browse File
                </button>
              </>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            <a
              href="/documents/template_contacts.xlsx"
              download
              className="text-sm text-[#5479EE] hover:underline flex items-center gap-1"
            >
              <Download className="w-4 h-4" /> Download Template
            </a>
          </div>

          <div className="flex justify-end gap-3 mt-8 font-medium">
            <AppButton onClick={onClose} variantStyle="outline" color="primary">
              Cancel
            </AppButton>

            <AppButton
              onClick={processFile}
              disabled={isLoading || !file}
              variantStyle="primary"
              color="primary"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-5 h-5" />
                  Importing...
                </div>
              ) : (
                "Import Data"
              )}
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportContactModal;
