"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { Loader2, Upload, FileSpreadsheet, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { notify } from "@/lib/notifications";
import { AppButton } from "@/components/ui/app-button";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";

interface ImportSubscriberModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mailingListIds?: string[];
}

interface SubscriberData {
  name: string;
  email: string;
  phone_number?: string;
}

const ImportSubscriberModal: React.FC<ImportSubscriberModalProps> = ({
  open,
  onClose,
  onSuccess,
  mailingListIds,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setFile(null);
    onClose();
  };

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

  const normalizeHeader = (header: string): string => {
    const h = header
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    
    console.log("[ImportSubscriber] normalizeHeader input:", header, "-> normalized:", h);
    
    // Check for name variations (but not email which contains 'name')
    if ((h.includes("name") || h.includes("nama")) && !h.includes("email")) return "name";
    // Check for phone variations
    if (h.includes("phone") || h.includes("telepon") || h.includes("hp") || h.includes("nomor") || h.includes("telp") || h.includes("handphone")) return "phone_number";
    // Check for email variations
    if (h.includes("email") || h.includes("mail") || h.includes("surel")) return "email";
    
    return header;
  };

  const processFile = async () => {
    console.log("[ImportSubscriber] processFile called, file:", file);
    if (!file) {
      console.log("[ImportSubscriber] No file selected");
      return;
    }
    setIsLoading(true);

    try {
      console.log("[ImportSubscriber] Reading file...");
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      console.log("[ImportSubscriber] Parsed data:", jsonData);

      if (jsonData.length === 0) {
        throw new Error("File is empty");
      }

      // Map keys to API format
      const subscribers: SubscriberData[] = jsonData.map((row: any) => {
        const subscriber: any = {};
        Object.keys(row).forEach((key) => {
          const normalizedKey = normalizeHeader(key);
          if (["name", "email", "phone_number"].includes(normalizedKey)) {
            subscriber[normalizedKey] = String(row[key] || "").trim();
          }
        });
        return subscriber as SubscriberData;
      });

      console.log("[ImportSubscriber] Mapped subscribers:", subscribers);

      // Filter out rows without required fields (name only)
      const validSubscribers = subscribers.filter(
        (s) => s.name && s.name.trim()
      );

      console.log("[ImportSubscriber] Valid subscribers:", validSubscribers);

      if (validSubscribers.length === 0) {
        throw new Error("No valid subscribers found. Name field is required.");
      }

      const filteredCount = subscribers.length - validSubscribers.length;
      if (filteredCount > 0) {
        notify.warning(`${filteredCount} row(s) skipped due to missing name`);
      }

      await uploadSubscribers(validSubscribers);
    } catch (error: any) {
      console.error("[ImportSubscriber] Error:", error);
      notify.error("Error Processing File: " + error.message);
      setIsLoading(false);
    }
  };

  const uploadSubscribers = async (subscribers: SubscriberData[]) => {
    console.log("[ImportSubscriber] uploadSubscribers called with", subscribers.length, "subscribers");
    const token = await getToken();
    console.log("[ImportSubscriber] Token obtained:", token ? "yes" : "no");
    try {
      const payload: any = {
        new_contacts: subscribers,
        target: mailingListIds && mailingListIds.length > 0 ? "mailing_list" : "subscriber",
      };

      if (mailingListIds && mailingListIds.length > 0) {
        payload.mailing_list_ids = mailingListIds;
      }

      console.log("[ImportSubscriber] Sending payload:", JSON.stringify(payload, null, 2));
      console.log("[ImportSubscriber] Making POST request to /api/proxy/subscribers/bulk");

      const res = await fetch("/api/proxy/subscribers/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("[ImportSubscriber] Response status:", res.status);

      if (!res.ok) {
        const text = await res.text();
        let errorMessage = text;
        try {
          const resJson = JSON.parse(text);
          if (resJson?.error?.details && Array.isArray(resJson.error.details)) {
            const uniqueErrors = Array.from(
              new Set(
                resJson.error.details.map(
                  (d: any) => `${d.field}: ${d.message}`
                )
              )
            );
            errorMessage = uniqueErrors.join(", ");
          } else if (resJson?.error?.message) {
            errorMessage = resJson.error.message;
          }
        } catch {}
        throw new Error(errorMessage || "Failed to upload subscribers");
      }

      notify.success(`Successfully imported ${subscribers.length} subscribers`);
      handleClose();
      onSuccess();
    } catch (error: any) {
      notify.error("Failed to upload subscribers to server. Please try again.", {
        description: error.message,
        duration: 10000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200 cursor-pointer"
        style={{ minHeight: '100vh', minWidth: '100vw' }}
        onClick={(e) => {
          e.stopPropagation();
          setShowCloseConfirmation(true);
        }}
      >
        <div
          className="bg-white rounded-xl shadow-xl w-full max-w-xl flex flex-col animate-in zoom-in-95 duration-200 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#5479EE]">Import Subscribers</h2>
            <p className="text-gray-600 text-md mt-1 mb-6">
              Upload an Excel or CSV file to import subscribers in bulk.
            </p>

            <div
              className={`
              border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors
              ${dragActive
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

            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Required column: <span className="font-medium">Name</span>
              </p>
              <p className="text-sm text-gray-500">
                Optional columns: <span className="font-medium">Email</span>, <span className="font-medium">Phone Number</span>
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-8 font-medium">
              <AppButton onClick={() => setShowCloseConfirmation(true)} variantStyle="outline" color="primary">
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

      <ConfirmationPopup
        isOpen={showCloseConfirmation}
        onClose={() => setShowCloseConfirmation(false)}
        onConfirm={() => {
          setShowCloseConfirmation(false);
          handleClose();
        }}
        title="Are you sure?"
        description="This will cancel your import process."
        confirmText="Discard"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};

export default ImportSubscriberModal;
