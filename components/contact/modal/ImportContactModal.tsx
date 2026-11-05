"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import { useAuth } from "@/lib/context/AuthContext";
import { Loader2, Upload, FileSpreadsheet, Download, ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import { notify } from "@/lib/notifications";
import { AppButton } from "@/components/ui/app-button";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { FileDuplicateDialog } from "@/components/contact/duplicates/FileDuplicateDialog";
import { ImportCheckStep } from "@/components/contact/modal/ImportCheckStep";
import { startImportJob } from "@/lib/api/import-jobs";
import { CONTACT_FILE_RULES, CONTACT_IMPORT_TEMPLATE, suggestContactField } from "@/lib/utils/contactImportRules";
import { importFileReadArgs } from "@/lib/utils/importFileRead";
import {
  applyFileResolutions,
  checkImportFile,
  fileCheckSummary,
  type FileRow,
  type GroupResolution,
} from "@/lib/utils/importFileDuplicates";
import { describeUploadError, ImportPartsError, uploadImportParts } from "@/lib/utils/importJobUpload";
import { downloadImportTemplate } from "@/lib/utils/importTemplate";
import { useImportWatch } from "@/lib/store/importWatch";

interface ImportContactModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ImportStep = "upload" | "mapping" | "check" | "preview";

const STEPS: { key: ImportStep; label: string; description: string }[] = [
  { key: "upload", label: "Upload", description: "Upload an Excel or CSV file to import contacts in bulk." },
  { key: "mapping", label: "Map Columns", description: "Map your file columns to contact fields." },
  { key: "check", label: "Check", description: "Settle duplicate rows and see which rows will be skipped." },
  { key: "preview", label: "Preview", description: "Review the data before importing." },
];

// Above this modal's z-9999 overlay.
const DIALOG_Z_INDEX = 10000;

const plural = (count: number, word: string) => `${count.toLocaleString()} ${word}${count === 1 ? "" : "s"}`;

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
  { value: "phone_number", label: "Phone Number" },
  { value: "position", label: "Position" },
  { value: "company", label: "Company" },
  { value: "address", label: "Address" },
];

const ImportContactModal: React.FC<ImportContactModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAuth();
  const watchImport = useImportWatch((state) => state.watch);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Column mapping state
  const [step, setStep] = useState<ImportStep>("upload");
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  // The file's rows as contact fields, trimmed (built when leaving Mapping).
  const [mappedRows, setMappedRows] = useState<FileRow[]>([]);

  // FE-6: the file check, the choices for its duplicate groups (keyed by the
  // group's position) and the group whose dialog is open.
  const check = useMemo(() => checkImportFile(mappedRows, CONTACT_FILE_RULES), [mappedRows]);
  const [resolutions, setResolutions] = useState<Record<number, GroupResolution>>({});
  const [openGroup, setOpenGroup] = useState<number | null>(null);
  const summary = fileCheckSummary(check, resolutions);
  // What Import sends; null while a group still needs a choice.
  const rowsToSend = useMemo(
    () => (summary.needChoice > 0 ? null : applyFileResolutions(mappedRows, check, resolutions)),
    [summary.needChoice, mappedRows, check, resolutions],
  );

  // Custom fields state
  const [apiFields, setApiFields] = useState<ApiField[]>(DEFAULT_API_FIELDS);
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleClose = () => {
    setFile(null);
    setStep("upload");
    setColumnMappings([]);
    setRawData([]);
    setMappedRows([]);
    setResolutions({});
    setOpenGroup(null);
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

  const parseFile = async () => {
    if (!file) return;
    setIsLoading(true);

    try {
      const data = await file.arrayBuffer();
      // xlsx is loaded on demand: this modal only needs it once the user
      // actually picks a file, and a static import put ~400 kB of SheetJS
      // into the first load of every page that can open this modal.
      const XLSX = await import("xlsx");
      // A CSV is read as UTF-8 text with every cell kept as text, so
      // "0812…" keeps its 0 and "tökö" stays readable (importFileRead.ts).
      const { data: input, options } = importFileReadArgs(file.name, data);
      const workbook = XLSX.read(input, options);
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
        apiField: suggestContactField(col),
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

  // Leaving Mapping: the rows as contact fields, then the file check runs on
  // them (useMemo above). Earlier choices belong to the old rows: cleared.
  const buildRows = () => {
    const mapped: FileRow[] = rawData.map((row) => {
      const contact: FileRow = { name: "" };

      columnMappings.forEach((mapping) => {
        if (mapping.apiField && row[mapping.excelColumn] !== undefined) {
          const value = String(row[mapping.excelColumn] || "").trim();
          if (mapping.apiField === "name") {
            // Several columns mapped to Name are joined, skipping empty ones.
            contact.name = [contact.name, value].filter(Boolean).join(" ");
          } else {
            contact[mapping.apiField] = value;
          }
        }
      });

      return contact;
    });

    setMappedRows(mapped);
    setResolutions({});
    setStep("check");
  };

  const hasNameMapping = columnMappings.some((m) => m.apiField === "name");
  // Rows need an email or a phone number (FE-6), so one of them must be mapped.
  const hasContactMapping = columnMappings.some((m) => m.apiField === "email" || m.apiField === "phone_number");

  const getMappedFields = (): string[] => {
    const fields = new Set<string>();
    columnMappings.forEach(m => {
      if (m.apiField) fields.add(m.apiField);
    });
    return Array.from(fields);
  };

  const uploadContacts = async () => {
    if (!rowsToSend || rowsToSend.length === 0) return;

    // Locks the Import button (disabled while isLoading) until every part is
    // sent, so the file cannot go out twice (FE-3).
    setIsLoading(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");

      // Like Subscribers (FE-5): every part of up to IMPORT_CHUNK_SIZE rows
      // (2,000, FE-9) is a job of its own. Rows are created by the jobs, not
      // by these requests.
      // Duplicates inside the file are settled before the split, so the parts
      // never repeat one another (BE Q-6).
      const { jobIds } = await uploadImportParts({
        rows: rowsToSend,
        rowsKey: "contacts",
        fileName: file?.name,
        send: (body) => startImportJob(token, "contacts", body),
      });
      // The import dock follows the file (FE-1).
      watchImport({ module: "contacts", fileName: file?.name || "Contacts import", jobIds });

      notify.success("Contact import started", {
        description:
          `${plural(rowsToSend.length, "row")} ${rowsToSend.length === 1 ? "is" : "are"} being imported in the background` +
          (jobIds.length > 1 ? ` in ${jobIds.length} parts` : "") +
          ". Track the progress in Import History.",
      });
      // Not a warning: skipping these rows is the rule, it is only recorded.
      if (summary.skipped > 0) {
        notify.info(`${plural(summary.skipped, "row")} without email or phone ${summary.skipped === 1 ? "was" : "were"} skipped`);
      }
      if (summary.invalid > 0) {
        notify.warning(`${plural(summary.invalid, "invalid row")} ${summary.invalid === 1 ? "was" : "were"} not imported`);
      }
      handleClose();
      onSuccess();
    } catch (error: any) {
      notify.error("Failed to upload contacts to server.", {
        description: describeUploadError(error),
        duration: 10000,
      });
      // Earlier parts were imported: follow them and show them.
      if (error instanceof ImportPartsError && error.jobIds.length > 0) {
        watchImport({ module: "contacts", fileName: file?.name || "Contacts import", jobIds: error.jobIds });
        onSuccess();
      }
    } finally {
      setIsLoading(false);
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
          className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col animate-in zoom-in-95 duration-200 z-10 max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 flex flex-col h-full overflow-hidden">
            <h2 className="text-2xl font-bold text-[#5479EE]">Import Contact</h2>
            <p className="text-gray-600 text-md mt-1 mb-4">
              {STEPS.find((s) => s.key === step)?.description}
            </p>

            {/* Step indicator */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {STEPS.map((s, index) => (
                <React.Fragment key={s.key}>
                  {index > 0 && <div className="w-6 h-px bg-gray-300" />}
                  <div className={`flex items-center gap-1 text-sm ${step === s.key ? "text-[#5479EE] font-medium" : "text-gray-400"}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === s.key ? "bg-[#5479EE] text-white" : "bg-gray-200"}`}>
                      {index + 1}
                    </span>
                    {s.label}
                  </div>
                </React.Fragment>
              ))}
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

                <div className="flex justify-between items-center mt-4">
                  <button
                    type="button"
                    onClick={() =>
                      downloadImportTemplate(CONTACT_IMPORT_TEMPLATE).catch(() =>
                        notify.error("Failed to download the template"),
                      )
                    }
                    className="text-sm text-[#5479EE] hover:underline flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" /> Download Template
                  </button>
                </div>

                <div className="flex justify-end gap-3 mt-8 font-medium">
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
                        placeholder="Enter field name (e.g., Department, Notes)"
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
                  Tip: You can map multiple columns to "Name" to combine them. Add custom fields for additional data.
                </p>

                {!hasNameMapping && (
                  <p className="text-sm text-red-500 mt-2">
                    Please map at least one column to "Name" (required field).
                  </p>
                )}
                {!hasContactMapping && (
                  <p className="text-sm text-red-500 mt-2">
                    Please map a column to "Email" or "Phone Number". Rows without both are skipped.
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
                    <AppButton
                      onClick={buildRows}
                      disabled={!hasNameMapping || !hasContactMapping}
                      variantStyle="primary"
                      color="primary"
                    >
                      <div className="flex items-center gap-2">
                        Check <ArrowRight className="w-4 h-4" />
                      </div>
                    </AppButton>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Check (FE-6) */}
            {step === "check" && (
              <>
                <ImportCheckStep check={check} resolutions={resolutions} onOpenGroup={setOpenGroup} />

                {summary.needChoice > 0 && (
                  <p className="text-sm text-amber-700 mt-3">
                    Resolve every duplicate group that needs a choice to continue.
                  </p>
                )}

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
                      onClick={() => setStep("preview")}
                      disabled={!rowsToSend || rowsToSend.length === 0}
                      variantStyle="primary"
                      color="primary"
                    >
                      <div className="flex items-center gap-2">
                        Preview <ArrowRight className="w-4 h-4" />
                      </div>
                    </AppButton>
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Preview, exactly the rows Import sends */}
            {step === "preview" && rowsToSend && (
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
                      </tr>
                    </thead>
                    <tbody>
                      {rowsToSend.slice(0, 50).map((row, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="p-3 text-gray-500">{idx + 1}</td>
                          {getMappedFields().map(field => (
                            <td key={field} className="p-3 text-gray-900 truncate max-w-[120px]">
                              {row[field] || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 text-sm text-gray-500">
                  Showing {Math.min(50, rowsToSend.length).toLocaleString()} of {plural(rowsToSend.length, "row")} to import.
                </div>

                <div className="flex justify-between gap-3 mt-6 font-medium">
                  <AppButton onClick={() => setStep("check")} variantStyle="outline" color="primary" disabled={isLoading}>
                    <div className="flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </div>
                  </AppButton>
                  <div className="flex gap-3">
                    <AppButton onClick={handleClose} variantStyle="outline" color="primary" disabled={isLoading}>
                      Cancel
                    </AppButton>
                    <AppButton
                      onClick={uploadContacts}
                      disabled={isLoading || rowsToSend.length === 0}
                      variantStyle="primary"
                      color="primary"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin w-5 h-5" />
                          Importing...
                        </div>
                      ) : (
                        `Import ${plural(rowsToSend.length, "Contact")}`
                      )}
                    </AppButton>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <FileDuplicateDialog
        rows={mappedRows}
        group={openGroup === null ? null : check.groups[openGroup] ?? null}
        resolution={openGroup === null ? undefined : resolutions[openGroup]}
        onResolve={(resolution) => {
          if (openGroup !== null) setResolutions((prev) => ({ ...prev, [openGroup]: resolution }));
          setOpenGroup(null);
        }}
        onClose={() => setOpenGroup(null)}
        zIndex={DIALOG_Z_INDEX}
      />

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

export default ImportContactModal;
