"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { useAuth } from "@/lib/context/AuthContext";
import { Loader2, Upload, FileSpreadsheet, Download, ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import * as XLSX from "xlsx";
import { notify } from "@/lib/notifications";
import { AppButton } from "@/components/ui/app-button";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { useBulkCreateWaRecipients } from "@/lib/hooks/useWaRecipients";
import type { WaRecipientType } from "@/lib/types/whatsapp-marketing";

interface ImportWaRecipientModalProps {
  open: boolean;
  recipientType: WaRecipientType;
  onClose: () => void;
  onSuccess: () => void;
  target?: 'recipient' | 'broadcast_group';
  broadcastGroupId?: string;
}

interface RecipientInputData {
  name: string;
  email?: string;
  phone_number?: string;
  position?: string;
  company?: string;
  address?: string;
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
  { value: "email", label: "Email" },
  { value: "phone_number", label: "Phone Number (required)" },
  { value: "position", label: "Position" },
  { value: "company", label: "Company" },
  { value: "address", label: "Address" },
];

const ImportWaRecipientModal: React.FC<ImportWaRecipientModalProps> = ({
  open,
  recipientType,
  onClose,
  onSuccess,
  target = 'recipient',
  broadcastGroupId,
}) => {
  const { getToken } = useAuth();
  const bulkCreateMutation = useBulkCreateWaRecipients();

  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Column mapping state
  const [step, setStep] = useState<"upload" | "mapping" | "preview">("upload");
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<RecipientInputData[]>([]);

  // Custom fields state
  const [apiFields, setApiFields] = useState<ApiField[]>(DEFAULT_API_FIELDS);
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");

  const isLoading = bulkCreateMutation.isPending;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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

  const suggestMapping = (header: string): string | null => {
    const h = header.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

    if ((h.includes("name") || h.includes("nama")) && !h.includes("email") && !h.includes("last") && !h.includes("first") && !h.includes("company")) return "name";
    if (h.includes("phone") || h.includes("telepon") || h.includes("hp") || h.includes("nomor") || h.includes("telp")) return "phone_number";
    if (h.includes("email") || h.includes("mail") || h.includes("surel")) return "email";
    if (h.includes("position") || h.includes("jabatan") || h.includes("title")) return "position";
    if (h.includes("company") || h.includes("perusahaan") || h.includes("organization")) return "company";
    if (h.includes("address") || h.includes("alamat")) return "address";

    return null;
  };

  const parseFile = async () => {
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
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

    const fieldValue = newFieldName.trim().toLowerCase().replace(/\s+/g, "_");

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
    setColumnMappings(prev =>
      prev.map(m => m.apiField === fieldValue ? { ...m, apiField: null } : m)
    );
  };

  const generatePreview = () => {
    const mapped: RecipientInputData[] = rawData.map((row) => {
      const recipient: RecipientInputData = { name: "" };

      columnMappings.forEach((mapping) => {
        if (mapping.apiField && row[mapping.excelColumn] !== undefined) {
          const value = String(row[mapping.excelColumn] || "").trim();
          if (mapping.apiField === "name") {
            recipient.name = recipient.name ? `${recipient.name} ${value}` : value;
          } else {
            recipient[mapping.apiField] = value;
          }
        }
      });

      return recipient;
    });

    setPreviewData(mapped);
    setStep("preview");
  };

  const hasNameMapping = columnMappings.some((m) => m.apiField === "name");
  const hasPhoneMapping = columnMappings.some((m) => m.apiField === "phone_number");

  const getMappedFields = (): string[] => {
    const fields = new Set<string>();
    columnMappings.forEach(m => {
      if (m.apiField) fields.add(m.apiField);
    });
    return Array.from(fields);
  };

  const uploadRecipients = async () => {
    const validRecipients = previewData
      .filter((r) => r.name?.trim() && r.phone_number?.trim())
      .map(r => ({
        ...r,
      }));

    if (validRecipients.length === 0) {
      notify.error("No valid recipients found. Name and Phone Number are required.");
      return;
    }

    try {
      await bulkCreateMutation.mutateAsync({
        target: target,
        new_contacts: validRecipients,
        ...(target === 'broadcast_group' && broadcastGroupId && { broadcast_group_ids: [broadcastGroupId] })
      });

      const skipped = previewData.length - validRecipients.length;
      if (skipped > 0) {
        notify.warning(`${skipped} row(s) skipped due to missing Name or Phone Number`);
      }
      notify.success(`Successfully imported ${validRecipients.length} recipients`);
      handleClose();
      onSuccess();
    } catch (error: any) {
      notify.error("Failed to upload recipients to server.", {
        description: error.message,
        duration: 10000,
      });
    }
  };

  if (!open || !mounted) return null;

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/50 transition-opacity cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setShowCloseConfirmation(true);
          }}
        />

        <div
          className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl flex flex-col animate-in zoom-in-95 duration-200 z-10 max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#5479EE]">Import Recipients</h2>
              <button
                onClick={() => setShowCloseConfirmation(true)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 text-md mt-1 mb-4">
              {step === "upload" && "Upload an Excel or CSV file to import recipients in bulk."}
              {step === "mapping" && "Map your file columns to recipient fields."}
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
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${dragActive ? "border-[#5479EE] bg-blue-50" : "border-gray-300 bg-white"}`}
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
                  <AppButton onClick={handleClose} variantStyle="outline" color="primary">
                    Cancel
                  </AppButton>
                  <AppButton onClick={parseFile} disabled={!file} variantStyle="primary" color="primary">
                    <div className="flex items-center gap-2">
                      Next <ArrowRight className="w-4 h-4" />
                    </div>
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
                      className="text-sm text-[#5479EE] hover:underline flex items-center gap-1"
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
                        placeholder="Field name (e.g., City, Source)"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5479EE] focus:border-[#5479EE] outline-none"
                        onKeyDown={(e) => e.key === "Enter" && addCustomField()}
                      />
                      <button
                        onClick={addCustomField}
                        className="px-3 py-2 bg-[#5479EE] text-white rounded-lg text-sm hover:bg-[#4368d9]"
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

                  <div className="flex flex-wrap gap-2">
                    {apiFields.filter(f => f.isCustom).map(field => (
                      <span key={field.value} className="inline-flex items-center gap-1 px-2 py-1 bg-[#5479EE]/10 text-[#5479EE] rounded text-xs">
                        {field.label}
                        <button onClick={() => removeCustomField(field.value!)} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {apiFields.filter(f => f.isCustom).length === 0 && (
                      <span className="text-xs text-gray-400">No custom fields added yet (they'll be auto-detected by backend)</span>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left p-3 font-medium text-gray-700">File Column</th>
                        <th className="text-left p-3 font-medium text-gray-700">Recipient Field</th>
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
                  Tip: Columns not matching standard fields will be automatically categorized as custom fields.
                </p>

                {!hasNameMapping && (
                  <p className="text-sm text-red-500 mt-2">
                    Please map at least one column to "Name" (required field).
                  </p>
                )}

                {!hasPhoneMapping && (
                  <p className="text-sm text-red-500 mt-2">
                    Please map at least one column to "Phone Number" (required field).
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
                    <AppButton onClick={generatePreview} disabled={!hasNameMapping || !hasPhoneMapping} variantStyle="primary" color="primary">
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
                        const isValid = row.name && row.name.trim();
                        return (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="p-3 text-gray-500">{idx + 1}</td>
                            {getMappedFields().map(field => (
                              <td key={field} className="p-3 text-gray-900 truncate max-w-[120px]">
                                {row[field] || "-"}
                              </td>
                            ))}
                            <td className="p-3">
                              {row.name?.trim() && row.phone_number?.trim() ? (
                                <span className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded">Valid</span>
                              ) : (
                                <span className="text-red-600 text-xs bg-red-50 px-2 py-1 rounded">
                                  {!row.name?.trim() ? "Missing name" : "Missing phone"}
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
                  Showing {Math.min(50, previewData.length)} of {previewData.length} rows.
                  {" "}{previewData.filter((r) => r.name?.trim() && r.phone_number?.trim()).length} valid, {previewData.filter((r) => !r.name?.trim() || !r.phone_number?.trim()).length} will be skipped.
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
                    <AppButton onClick={uploadRecipients} disabled={isLoading || previewData.filter((r) => r.name?.trim() && r.phone_number?.trim()).length === 0} variantStyle="primary" color="primary">
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin w-5 h-5" />
                          Importing...
                        </div>
                      ) : (
                        `Import ${previewData.filter((r) => r.name?.trim() && r.phone_number?.trim()).length} Recipients`
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
        variant="discard"
      />
    </>,
    document.body
  );
};

export default ImportWaRecipientModal;
