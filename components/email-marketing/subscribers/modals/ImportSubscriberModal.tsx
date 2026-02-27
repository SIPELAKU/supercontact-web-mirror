"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { Loader2, Upload, FileSpreadsheet, ArrowLeft, ArrowRight } from "lucide-react";
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

interface ColumnMapping {
  excelColumn: string;
  apiField: string | null;
}

const API_FIELDS = [
  { value: null, label: "-- Skip this column --" },
  { value: "name", label: "Name (required)" },
  { value: "email", label: "Email" },
  { value: "phone_number", label: "Phone Number" },
];

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
  
  // Column mapping state
  const [step, setStep] = useState<"upload" | "mapping" | "preview">("upload");
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<SubscriberData[]>([]);

  const handleClose = () => {
    setFile(null);
    setStep("upload");
    setExcelColumns([]);
    setColumnMappings([]);
    setRawData([]);
    setPreviewData([]);
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

  const suggestMapping = (header: string): string | null => {
    const h = header.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    
    if ((h.includes("name") || h.includes("nama")) && !h.includes("email") && !h.includes("last") && !h.includes("first")) return "name";
    if (h === "firstname" || h === "first" || h === "namadepan") return null; // Will need combining
    if (h === "lastname" || h === "last" || h === "namabelakang") return null; // Will need combining
    if (h.includes("phone") || h.includes("telepon") || h.includes("hp") || h.includes("nomor") || h.includes("telp") || h.includes("handphone")) return "phone_number";
    if (h.includes("email") || h.includes("mail") || h.includes("surel")) return "email";
    
    return null;
  };

  const parseFile = async () => {
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

      // Get column headers
      const columns = Object.keys(jsonData[0]);
      setExcelColumns(columns);
      setRawData(jsonData);

      // Create initial mappings with suggestions
      const initialMappings: ColumnMapping[] = columns.map((col) => ({
        excelColumn: col,
        apiField: suggestMapping(col),
      }));
      setColumnMappings(initialMappings);
      setStep("mapping");
    } catch (error: any) {
      notify.error("Error reading file: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMapping = (excelColumn: string, apiField: string | null) => {
    setColumnMappings((prev) =>
      prev.map((m) =>
        m.excelColumn === excelColumn ? { ...m, apiField } : m
      )
    );
  };

  const generatePreview = () => {
    const mapped: SubscriberData[] = rawData.map((row) => {
      const subscriber: any = { name: "", email: "", phone_number: "" };
      
      columnMappings.forEach((mapping) => {
        if (mapping.apiField && row[mapping.excelColumn] !== undefined) {
          const value = String(row[mapping.excelColumn] || "").trim();
          if (mapping.apiField === "name") {
            // Append to name (allows combining multiple columns)
            subscriber.name = subscriber.name ? `${subscriber.name} ${value}` : value;
          } else {
            subscriber[mapping.apiField] = value;
          }
        }
      });
      
      return subscriber as SubscriberData;
    });

    setPreviewData(mapped);
    setStep("preview");
  };

  const hasNameMapping = columnMappings.some((m) => m.apiField === "name");

  const uploadSubscribers = async () => {
    const validSubscribers = previewData.filter((s) => s.name && s.name.trim());

    if (validSubscribers.length === 0) {
      notify.error("No valid subscribers found. Name field is required.");
      return;
    }

    setIsLoading(true);
    const token = await getToken();
    
    try {
      const payload: any = {
        new_contacts: validSubscribers,
        target: mailingListIds && mailingListIds.length > 0 ? "mailing_list" : "subscriber",
      };

      if (mailingListIds && mailingListIds.length > 0) {
        payload.mailing_list_ids = mailingListIds;
      }

      const res = await fetch("/api/proxy/api/v1/subscribers/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

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

      const skipped = previewData.length - validSubscribers.length;
      if (skipped > 0) {
        notify.warning(`${skipped} row(s) skipped due to missing name`);
      }
      notify.success(`Successfully imported ${validSubscribers.length} subscribers`);
      handleClose();
      onSuccess();
    } catch (error: any) {
      notify.error("Failed to upload subscribers to server.", {
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
          className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col animate-in zoom-in-95 duration-200 cursor-default max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 flex flex-col h-full overflow-hidden">
            <h2 className="text-2xl font-bold text-[#5479EE]">Import Subscribers</h2>
            <p className="text-gray-600 text-md mt-1 mb-4">
              {step === "upload" && "Upload an Excel or CSV file to import subscribers in bulk."}
              {step === "mapping" && "Map your file columns to subscriber fields."}
              {step === "preview" && "Review the data before importing."}
            </p>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`flex items-center gap-1 text-sm ${step === "upload" ? "text-[#5479EE] font-medium" : "text-gray-400"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === "upload" ? "bg-[#5479EE] text-white" : "bg-gray-200"}`}>1</span>
                Upload
              </div>
              <div className="w-8 h-px bg-gray-300" />
              <div className={`flex items-center gap-1 text-sm ${step === "mapping" ? "text-[#5479EE] font-medium" : "text-gray-400"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === "mapping" ? "bg-[#5479EE] text-white" : "bg-gray-200"}`}>2</span>
                Map Columns
              </div>
              <div className="w-8 h-px bg-gray-300" />
              <div className={`flex items-center gap-1 text-sm ${step === "preview" ? "text-[#5479EE] font-medium" : "text-gray-400"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === "preview" ? "bg-[#5479EE] text-white" : "bg-gray-200"}`}>3</span>
                Preview
              </div>
            </div>

            {/* Step 1: Upload */}
            {step === "upload" && (
              <>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${dragActive ? "border-[#5479EE] bg-purple-50" : "border-gray-300 bg-white"}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="flex flex-col items-center gap-3">
                      <FileSpreadsheet className="w-12 h-12 text-[#5479EE]" />
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                      <button onClick={() => setFile(null)} className="mt-2 text-red-500 text-sm hover:underline">
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-lg border border-gray-200 flex items-center justify-center mb-4">
                        <Upload className="w-6 h-6 text-gray-600" />
                      </div>
                      <h3 className="text-gray-900 font-medium mb-1">Choose a file or drag & drop it here</h3>
                      <p className="text-gray-500 text-sm mb-4">Support format .xlsx or .csv</p>
                      <input ref={inputRef} type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleChange} />
                      <button
                        onClick={() => inputRef.current?.click()}
                        className="px-6 py-2 border border-[#5479EE] text-[#5479EE] rounded-lg font-medium hover:bg-[#5479EE] hover:text-white transition-colors"
                      >
                        Browse File
                      </button>
                    </>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-8 font-medium">
                  <AppButton onClick={() => setShowCloseConfirmation(true)} variantStyle="outline" color="primary">
                    Cancel
                  </AppButton>
                  <AppButton onClick={parseFile} disabled={isLoading || !file} variantStyle="primary" color="primary">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin w-5 h-5" />
                        Reading...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Next <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </AppButton>
                </div>
              </>
            )}

            {/* Step 2: Column Mapping */}
            {step === "mapping" && (
              <>
                <div className="flex-1 overflow-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left p-3 font-medium text-gray-700">Your Column</th>
                        <th className="text-left p-3 font-medium text-gray-700">Maps To</th>
                        <th className="text-left p-3 font-medium text-gray-700">Sample Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {columnMappings.map((mapping, idx) => (
                        <tr key={mapping.excelColumn} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="p-3 font-medium text-gray-900">{mapping.excelColumn}</td>
                          <td className="p-3">
                            <select
                              value={mapping.apiField || ""}
                              onChange={(e) => updateMapping(mapping.excelColumn, e.target.value || null)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5479EE] focus:border-[#5479EE] outline-none"
                            >
                              {API_FIELDS.map((field) => (
                                <option key={field.label} value={field.value || ""}>
                                  {field.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3 text-gray-500 truncate max-w-[150px]">
                            {rawData[0]?.[mapping.excelColumn] || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-sm text-gray-500 mt-3">
                  Tip: You can map multiple columns to "Name" to combine them (e.g., first_name + last_name).
                </p>

                {!hasNameMapping && (
                  <p className="text-sm text-red-500 mt-2">
                    Please map at least one column to "Name" (required field).
                  </p>
                )}

                <div className="flex justify-between gap-3 mt-6 font-medium">
                  <AppButton onClick={() => setStep("upload")} variantStyle="outline" color="primary">
                    <div className="flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </div>
                  </AppButton>
                  <div className="flex gap-3">
                    <AppButton onClick={() => setShowCloseConfirmation(true)} variantStyle="outline" color="primary">
                      Cancel
                    </AppButton>
                    <AppButton onClick={generatePreview} disabled={!hasNameMapping} variantStyle="primary" color="primary">
                      <div className="flex items-center gap-2">
                        Preview <ArrowRight className="w-4 h-4" />
                      </div>
                    </AppButton>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Preview */}
            {step === "preview" && (
              <>
                <div className="flex-1 overflow-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left p-3 font-medium text-gray-700">#</th>
                        <th className="text-left p-3 font-medium text-gray-700">Name</th>
                        <th className="text-left p-3 font-medium text-gray-700">Email</th>
                        <th className="text-left p-3 font-medium text-gray-700">Phone</th>
                        <th className="text-left p-3 font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 50).map((row, idx) => {
                        const isValid = row.name && row.name.trim();
                        return (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="p-3 text-gray-500">{idx + 1}</td>
                            <td className="p-3 text-gray-900">{row.name || "-"}</td>
                            <td className="p-3 text-gray-500">{row.email || "-"}</td>
                            <td className="p-3 text-gray-500">{row.phone_number || "-"}</td>
                            <td className="p-3">
                              {isValid ? (
                                <span className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded">Valid</span>
                              ) : (
                                <span className="text-red-600 text-xs bg-red-50 px-2 py-1 rounded">Missing name</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 text-sm text-gray-500">
                  Showing {Math.min(50, previewData.length)} of {previewData.length} rows.
                  {previewData.filter((r) => r.name?.trim()).length} valid, {previewData.filter((r) => !r.name?.trim()).length} will be skipped.
                </div>

                <div className="flex justify-between gap-3 mt-6 font-medium">
                  <AppButton onClick={() => setStep("mapping")} variantStyle="outline" color="primary">
                    <div className="flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </div>
                  </AppButton>
                  <div className="flex gap-3">
                    <AppButton onClick={() => setShowCloseConfirmation(true)} variantStyle="outline" color="primary">
                      Cancel
                    </AppButton>
                    <AppButton onClick={uploadSubscribers} disabled={isLoading || previewData.filter((r) => r.name?.trim()).length === 0} variantStyle="primary" color="primary">
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin w-5 h-5" />
                          Importing...
                        </div>
                      ) : (
                        `Import ${previewData.filter((r) => r.name?.trim()).length} Subscribers`
                      )}
                    </AppButton>
                  </div>
                </div>
              </>
            )}
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
