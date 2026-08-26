"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { Loader2, Upload, FileSpreadsheet, ArrowLeft, ArrowRight, Plus, X, Download } from "lucide-react";
import { notify } from "@/lib/notifications";
import { ApiErrorDisplay } from "@/components/ui/api-error-display";
import { AppButton } from "@/components/ui/app-button";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { AppDialog } from "@/components/ui/app-dialog";

interface ImportSubscriberModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mailingListIds?: string[];
}

interface SubscriberData {
  name: string;
  email?: string;
  phone_number?: string;
  [key: string]: string | undefined;
}

interface ColumnMapping {
  excelColumn: string;
  apiField: string | null;
}

interface ApiField {
  value: string | null;
  label: string;
  isCustom?: boolean;
}

const DEFAULT_API_FIELDS: ApiField[] = [
  { value: null, label: "-- Skip this column --" },
  { value: "name", label: "Name (required)" },
  { value: "email", label: "Email (required)" },
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
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<SubscriberData[]>([]);

  // Custom fields state
  const [apiFields, setApiFields] = useState<ApiField[]>(DEFAULT_API_FIELDS);
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");

  const handleClose = () => {
    setFile(null);
    setStep("upload");
    setColumnMappings([]);
    setRawData([]);
    setPreviewData([]);
    setApiFields(DEFAULT_API_FIELDS);
    setShowAddField(false);
    setNewFieldName("");
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

  // People were guessing the column names. A template removes the guess, and
  // the auto-mapper below recognises exactly these headers.
  const downloadTemplate = async () => {
    const XLSX = await import("xlsx");
    const rows = [
      ["Name", "Email", "Phone Number"],
      ["Budi Santoso", "budi@example.com", "081234567890"],
      ["Sari Dewi", "sari@example.com", "081298765432"],
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "Subscribers");
    XLSX.writeFile(wb, "Subscribers_Import_Template.xlsx");
  };

  const suggestMapping = (header: string): string | null => {
    const h = header.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

    if ((h.includes("name") || h.includes("nama")) && !h.includes("email") && !h.includes("last") && !h.includes("first")) return "name";
    if (h === "firstname" || h === "first" || h === "namadepan") return null;
    if (h === "lastname" || h === "last" || h === "namabelakang") return null;
    if (h.includes("phone") || h.includes("telepon") || h.includes("hp") || h.includes("nomor") || h.includes("telp") || h.includes("handphone")) return "phone_number";
    if (h.includes("email") || h.includes("mail") || h.includes("surel")) return "email";

    return null;
  };

  const parseFile = async () => {
    if (!file) return;
    setIsLoading(true);

    try {
      const data = await file.arrayBuffer();
      // xlsx is loaded on demand: this modal only needs it once the user
      // actually picks a file, and a static import put ~400 kB of SheetJS
      // into the first load of every page that can open this modal.
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (jsonData.length === 0) {
        throw new Error("File is empty");
      }

      const columns = Object.keys(jsonData[0]);
      setRawData(jsonData);

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

  const addCustomField = () => {
    if (!newFieldName.trim()) return;

    // Convert to snake_case for API field value
    const fieldValue = newFieldName.trim().toLowerCase().replace(/\s+/g, "_");

    // Check if field already exists
    if (apiFields.some(f => f.value === fieldValue)) {
      notify.error("This field already exists");
      return;
    }

    setApiFields(prev => [
      ...prev,
      { value: fieldValue, label: newFieldName.trim(), isCustom: true }
    ]);
    setNewFieldName("");
    setShowAddField(false);
  };

  const removeCustomField = (fieldValue: string) => {
    setApiFields(prev => prev.filter(f => f.value !== fieldValue));
    // Also remove any mappings using this field
    setColumnMappings(prev =>
      prev.map(m => m.apiField === fieldValue ? { ...m, apiField: null } : m)
    );
  };

  const generatePreview = () => {
    const mapped: SubscriberData[] = rawData.map((row) => {
      const subscriber: SubscriberData = { name: "" };

      columnMappings.forEach((mapping) => {
        if (mapping.apiField && row[mapping.excelColumn] !== undefined) {
          const value = String(row[mapping.excelColumn] || "").trim();
          if (mapping.apiField === "name") {
            subscriber.name = subscriber.name ? `${subscriber.name} ${value}` : value;
          } else {
            subscriber[mapping.apiField] = value;
          }
        }
      });

      return subscriber;
    });

    setPreviewData(mapped);
    setStep("preview");
  };

  // Rows the API would reject, plus duplicates *within the file* — the latter
  // used to sail through and turn into "skipped" rows in the job result long
  // after the user had walked away.
  const previewSummary = (() => {
    const seen = new Set<string>();
    let valid = 0;
    let missingName = 0;
    let missingEmail = 0;
    let duplicates = 0;

    for (const row of previewData) {
      const name = row.name?.trim();
      const email = row.email?.trim().toLowerCase();
      if (!name) { missingName++; continue; }
      if (!email) { missingEmail++; continue; }
      if (seen.has(email)) { duplicates++; continue; }
      seen.add(email);
      valid++;
    }
    return { valid, missingName, missingEmail, duplicates, total: previewData.length };
  })();

  const rowIssue = (row: SubscriberData, index: number): string | null => {
    if (!row.name?.trim()) return "Missing name";
    if (!row.email?.trim()) return "Missing email";
    const email = row.email.trim().toLowerCase();
    const firstIndex = previewData.findIndex(
      (r) => r.email?.trim().toLowerCase() === email && r.name?.trim()
    );
    return firstIndex !== -1 && firstIndex < index ? "Duplicate email" : null;
  };

  const hasNameMapping = columnMappings.some((m) => m.apiField === "name");
  const hasEmailMapping = columnMappings.some((m) => m.apiField === "email");

  // Get all mapped fields for preview table headers
  const getMappedFields = (): string[] => {
    const fields = new Set<string>();
    columnMappings.forEach(m => {
      if (m.apiField) fields.add(m.apiField);
    });
    return Array.from(fields);
  };

  const uploadSubscribers = async () => {
    // Must match what the preview counted, duplicates included — otherwise the
    // button promises "Import 900" and quietly posts 1,000.
    const seenEmails = new Set<string>();
    const validSubscribers = previewData.filter((s) => {
      const name = s.name?.trim();
      const email = s.email?.trim().toLowerCase();
      if (!name || !email || seenEmails.has(email)) return false;
      seenEmails.add(email);
      return true;
    });

    if (validSubscribers.length === 0) {
      notify.error("No valid subscribers found. Name and Email fields are required.");
      return;
    }

    setIsLoading(true);
    const token = await getToken();

    try {
      const CHUNK_SIZE = 10000;
      const chunks = [];
      for (let i = 0; i < validSubscribers.length; i += CHUNK_SIZE) {
        chunks.push(validSubscribers.slice(i, i + CHUNK_SIZE));
      }

      let totalCreated = 0;
      let totalSkipped = 0;
      let totalFailed = 0;

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const payload: any = {
          new_contacts: chunk,
          target: mailingListIds && mailingListIds.length > 0 ? "mailing_list" : "subscriber",
        };

        if (file?.name) {
          payload.file_name = chunks.length > 1 ? `${file.name} (Part ${i + 1}/${chunks.length})` : file.name;
        }

        if (mailingListIds && mailingListIds.length > 0) {
          payload.mailing_list_ids = mailingListIds;
        }

        const res = await fetch("/api/proxy/subscribers/bulk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const text = await res.text();
          try {
            const resJson = JSON.parse(text);
            if (resJson?.error?.details && Array.isArray(resJson.error.details)) {
              // Group unique errors by field and message
              const uniqueErrors = Array.from(
                new Set(
                  resJson.error.details.map((d: any) =>
                    JSON.stringify({ field: d.field, message: d.message })
                  )
                )
              ).map((s: any) => JSON.parse(s));

              const description = <ApiErrorDisplay errors={uniqueErrors} />;

              notify.error(`Failed to upload subscribers (Part ${i + 1}).`, {
                description,
                duration: 10000,
              });
              setIsLoading(false);
              return;
            } else if (resJson?.error?.message) {
              throw new Error(resJson.error.message);
            }
          } catch (e: any) {
            if (e instanceof Error) throw e;
          }
          throw new Error(text || `Failed to upload subscribers (Part ${i + 1})`);
        }

        const resJson = await res.json();
        const successData = resJson.data || {};
        totalCreated += (successData.created_rows || 0);
        totalSkipped += (successData.skipped_rows || 0);
        totalFailed += (successData.failed_rows || 0);
      }

      const description = (
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/20">
          <div className="flex flex-col">
            <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Created</span>
            <span className="text-xl font-bold text-white leading-tight">{totalCreated}</span>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Skipped</span>
            <span className="text-xl font-bold text-white leading-tight">{totalSkipped}</span>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Failed</span>
            <span className="text-xl font-bold text-white leading-tight">{totalFailed}</span>
          </div>
        </div>
      );

      notify.success(chunks.length > 1 ? `Subscribers import process started (${chunks.length} batches)` : "Subscribers import process started", {
        description,
        duration: 10000,
      });

      handleClose();
      onSuccess();
    } catch (error: any) {
      // If we already handled the notification inside the try block for detailed errors,
      // this part will only be reached for other types of errors.
      notify.error("Failed to upload subscribers to server.", {
        description: typeof error.message === 'string' ? error.message.replace(/_/g, " ") : error.message,
        duration: 10000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* AppDialog, not a hand-rolled `fixed inset-0` overlay: this wizard had
          no role="dialog", no aria-modal, no focus trap and no close-on-Escape,
          so a keyboard user could tab straight out of it into the page behind
          and had no way to dismiss it. */}
      <AppDialog
        open={open}
        onClose={() => setShowCloseConfirmation(true)}
        title="Import Subscribers"
        description={
          step === "upload"
            ? "Upload an Excel or CSV file to import subscribers in bulk."
            : step === "mapping"
              ? "Map your file columns to subscriber fields."
              : "Review the data before importing."
        }
        maxWidth="md"
      >
        <div className="flex flex-col" style={{ maxHeight: "62vh" }}>
          <div className="flex flex-col overflow-hidden">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`flex items-center gap-1 text-sm ${step === "upload" ? "text-brand font-medium" : "text-gray-400"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === "upload" ? "bg-brand text-white" : "bg-gray-200"}`}>1</span>
                Upload
              </div>
              <div className="w-8 h-px bg-gray-300" />
              <div className={`flex items-center gap-1 text-sm ${step === "mapping" ? "text-brand font-medium" : "text-gray-400"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === "mapping" ? "bg-brand text-white" : "bg-gray-200"}`}>2</span>
                Map Columns
              </div>
              <div className="w-8 h-px bg-gray-300" />
              <div className={`flex items-center gap-1 text-sm ${step === "preview" ? "text-brand font-medium" : "text-gray-400"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === "preview" ? "bg-brand text-white" : "bg-gray-200"}`}>3</span>
                Preview
              </div>
            </div>

            {/* Step 1: Upload */}
            {step === "upload" && (
              <>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${dragActive ? "border-brand bg-brand-light/40" : "border-gray-300 bg-white"}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="flex flex-col items-center gap-3">
                      <FileSpreadsheet className="w-12 h-12 text-brand" />
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
                      <h3 className="text-gray-900 font-medium mb-1">Choose a file or drag &amp; drop it here</h3>
                      <p className="text-gray-500 text-sm mb-4">Supports .xlsx and .csv</p>
                      <input ref={inputRef} type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleChange} />
                      <button
                        onClick={() => inputRef.current?.click()}
                        className="px-6 py-2 border border-brand text-brand rounded-lg font-medium hover:bg-brand hover:text-white transition-colors"
                      >
                        Browse File
                      </button>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
                  <AppButton
                    onClick={downloadTemplate}
                    variantStyle="text"
                    startIcon={<Download className="w-4 h-4" />}
                  >
                    Download template
                  </AppButton>
                  <span className="text-xs text-gray-500">
                    Name and Email are required; other columns are optional.
                  </span>
                </div>

                <div className="flex justify-end gap-3 mt-4 font-medium">
                  <AppButton onClick={handleClose} variantStyle="outline" color="primary">
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
                {/* Custom fields section */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Available Fields</span>
                    <button
                      onClick={() => setShowAddField(true)}
                      className="text-sm text-brand hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Custom Field
                    </button>
                  </div>

                  {showAddField && (
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        placeholder="Enter field name (e.g., Company, Address)"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none"
                        onKeyDown={(e) => e.key === "Enter" && addCustomField()}
                      />
                      <button
                        onClick={addCustomField}
                        className="px-3 py-2 bg-brand text-white rounded-lg text-sm hover:bg-brand-hover"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => { setShowAddField(false); setNewFieldName(""); }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Show custom fields as tags */}
                  <div className="flex flex-wrap gap-2">
                    {apiFields.filter(f => f.isCustom).map(field => (
                      <span key={field.value} className="inline-flex items-center gap-1 px-2 py-1 bg-brand/10 text-brand rounded text-xs">
                        {field.label}
                        <button onClick={() => removeCustomField(field.value!)} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {apiFields.filter(f => f.isCustom).length === 0 && (
                      <span className="text-xs text-gray-400">No custom fields added yet</span>
                    )}
                  </div>
                </div>

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
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none"
                            >
                              {apiFields.map((field) => (
                                <option key={field.label} value={field.value || ""}>
                                  {field.label}{field.isCustom ? " (custom)" : ""}
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
                  Tip: You can map multiple columns to "Name" to combine them. Add custom fields for additional data.
                </p>

                {(!hasNameMapping || !hasEmailMapping) && (
                  <p className="text-sm text-red-500 mt-2">
                    Please map at least one column to "Name" and "Email" (required fields).
                  </p>
                )}

                <div className="flex justify-between gap-3 mt-6 font-medium">
                  <AppButton onClick={() => setStep("upload")} variantStyle="outline" color="primary">
                    <div className="flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </div>
                  </AppButton>
                  <div className="flex gap-3">
                    <AppButton onClick={handleClose} variantStyle="outline" color="primary">
                      Cancel
                    </AppButton>
                    <AppButton onClick={generatePreview} disabled={!hasNameMapping || !hasEmailMapping} variantStyle="primary" color="primary">
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
                        {getMappedFields().map(field => (
                          <th key={field} className="text-left p-3 font-medium text-gray-700 capitalize">
                            {field.replace(/_/g, " ")}
                          </th>
                        ))}
                        <th className="text-left p-3 font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 50).map((row, idx) => {
                        const issue = rowIssue(row, idx);
                        return (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="p-3 text-gray-500">{idx + 1}</td>
                            {getMappedFields().map(field => (
                              <td key={field} className="p-3 text-gray-900 truncate max-w-[120px]">
                                {row[field] || "-"}
                              </td>
                            ))}
                            <td className="p-3">
                              {!issue ? (
                                <span className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded">Valid</span>
                              ) : (
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    issue === "Duplicate email"
                                      ? "text-amber-700 bg-amber-50"
                                      : "text-red-600 bg-red-50"
                                  }`}
                                >
                                  {issue}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 text-sm text-gray-500">
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      Showing {Math.min(50, previewSummary.total)} of {previewSummary.total} rows
                    </span>
                    <span className="text-green-700 font-medium">
                      {previewSummary.valid} will be imported
                    </span>
                    {previewSummary.missingName > 0 && (
                      <span className="text-red-600">
                        {previewSummary.missingName} skipped — no name
                      </span>
                    )}
                    {previewSummary.missingEmail > 0 && (
                      <span className="text-red-600">
                        {previewSummary.missingEmail} skipped — no email
                      </span>
                    )}
                    {previewSummary.duplicates > 0 && (
                      <span className="text-amber-700">
                        {previewSummary.duplicates} skipped — duplicate email in this file
                      </span>
                    )}
                  </div>

                  {previewSummary.valid > 10000 && (
                    <div className="mt-2 p-3 bg-blue-50 text-blue-700 rounded-lg flex items-start gap-2">
                      <div className="w-5 h-5 shrink-0 mt-0.5">ℹ️</div>
                      <p>
                        Since your data contains more than 10,000 rows, it will be automatically split into multiple batches to ensure a stable import process. You will see multiple entries in the Import History.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between gap-3 mt-6 font-medium">
                  <AppButton onClick={() => setStep("mapping")} variantStyle="outline" color="primary">
                    <div className="flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </div>
                  </AppButton>
                  <div className="flex gap-3">
                    <AppButton onClick={handleClose} variantStyle="outline" color="primary">
                      Cancel
                    </AppButton>
                    <AppButton
                      onClick={uploadSubscribers}
                      disabled={isLoading || previewSummary.valid === 0}
                      variantStyle="primary"
                      color="primary"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin w-5 h-5" />
                          Importing…
                        </div>
                      ) : (
                        `Import ${previewSummary.valid} subscriber${previewSummary.valid === 1 ? "" : "s"}`
                      )}
                    </AppButton>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </AppDialog>

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
        variant="discard"
      />
    </>
  );
};

export default ImportSubscriberModal;
