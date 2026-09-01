"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { Loader2, Upload, FileSpreadsheet, ArrowLeft, ArrowRight, Download } from "lucide-react";
import { notify } from "@/lib/notifications";
import { AppButton } from "@/components/ui/app-button";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { AppDialog } from "@/components/ui/app-dialog";
import { importCompanies, getImportJob } from "@/lib/api/company-intelligence";
import { CompanyImportRow, CompanyImportJobResponse } from "@/lib/types/company-intelligence";

interface ImportCompaniesModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// Everything stays a string while mapping/previewing (exactly what the sheet
// held); numeric fields are converted when the payload is built.
interface CompanyRowDraft {
    name: string;
    [key: string]: string | undefined;
}

interface ColumnMapping {
    excelColumn: string;
    apiField: string | null;
}

interface ApiField {
    value: string | null;
    label: string;
}

// Fixed field list — CompanyImportRow is a closed schema on the API side, so
// unlike the subscriber modal there is no "add custom field" affordance.
const API_FIELDS: ApiField[] = [
    { value: null, label: "-- Skip this column --" },
    { value: "name", label: "Company Name (required)" },
    { value: "domain", label: "Domain" },
    { value: "website", label: "Website" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "industry", label: "Industry" },
    { value: "location", label: "Location / Province" },
    { value: "kabupaten", label: "Kabupaten / City" },
    { value: "kecamatan", label: "Kecamatan / District" },
    { value: "postal_code", label: "Postal Code" },
    { value: "address_line", label: "Address" },
    { value: "nib", label: "NIB" },
    { value: "npwp", label: "NPWP" },
    { value: "kbli_codes", label: "KBLI Codes" },
    { value: "legal_form", label: "Legal Form" },
    { value: "founded_year", label: "Founded Year" },
    { value: "employee_count", label: "Employee Count" },
    { value: "financial_status", label: "Financial Status" },
    { value: "description", label: "Description" },
];

// Optional string fields copied verbatim from the draft into the payload.
const STRING_FIELDS = [
    "domain",
    "website",
    "email",
    "phone",
    "industry",
    "location",
    "kabupaten",
    "kecamatan",
    "postal_code",
    "address_line",
    "nib",
    "npwp",
    "kbli_codes",
    "legal_form",
    "financial_status",
    "description",
] as const;

// The API caps a single request at 5,000 rows — larger files are split into
// multiple jobs, each polled to its own terminal state.
const CHUNK_SIZE = 5000;
const POLL_INTERVAL_MS = 2500;
const TERMINAL_STATUSES = new Set(["Completed", "Failed", "Stopped", "Rolled Back"]);

const ImportCompaniesModal: React.FC<ImportCompaniesModalProps> = ({
    open,
    onClose,
    onSuccess,
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
    const [previewData, setPreviewData] = useState<CompanyRowDraft[]>([]);

    // Background job polling survives the modal being closed (the component
    // stays mounted with open=false); only unmount cancels it.
    const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pollCancelledRef = useRef(false);

    // The poll chain runs minutes after import start; going through a ref
    // means completion always calls the LATEST onSuccess (fetchDiscover is
    // re-created when filters/pagination change - a closure captured at
    // start time would refetch with the stale criteria and overwrite the
    // visible table).
    const onSuccessRef = useRef(onSuccess);
    useEffect(() => {
        onSuccessRef.current = onSuccess;
    }, [onSuccess]);

    useEffect(() => {
        return () => {
            pollCancelledRef.current = true;
            if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
        };
    }, []);

    const handleClose = () => {
        setFile(null);
        setStep("upload");
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

    // The auto-mapper below recognises exactly these headers, so the template
    // maps 1:1 with zero manual work.
    const downloadTemplate = async () => {
        try {
            // The dynamic import can reject (offline, CDN hiccup) - without a
            // catch the button silently does nothing.
            const XLSX = await import("xlsx");
            const rows = [
                [
                    "Name", "Domain", "Website", "Email", "Phone", "Industry", "Location",
                    "Kabupaten", "Kecamatan", "Postal Code", "Address", "NIB", "NPWP",
                    "KBLI Codes", "Legal Form", "Founded Year", "Employee Count",
                    "Financial Status", "Description",
                ],
                [
                    "PT Maju Bersama", "majubersama.co.id", "https://majubersama.co.id",
                    "info@majubersama.co.id", "0215551234", "Manufacturing", "Jawa Barat",
                    "Bekasi", "Cikarang Selatan", "17530", "Jl. Industri Raya No. 12",
                    "1234567890123", "01.234.567.8-901.000", "2511;2512", "PT", "2005",
                    "150", "Stable", "Steel fabrication for construction",
                ],
            ];
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "Companies");
            XLSX.writeFile(wb, "Companies_Import_Template.xlsx");
        } catch {
            notify.error(
                "Could not load the spreadsheet library - check your connection and try again."
            );
        }
    };

    const suggestMapping = (header: string): string | null => {
        const h = header.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

        // Specific identifiers first so e.g. "Domain Name" never lands on name.
        if (h.includes("kbli")) return "kbli_codes";
        if (h.includes("npwp")) return "npwp";
        if (h === "nib" || h.includes("nomorindukberusaha")) return "nib";
        if (h.includes("email") || h.includes("surel")) return "email";
        if (h.includes("website") || h.includes("situs")) return "website";
        if (h.includes("domain")) return "domain";
        if (h.includes("phone") || h.includes("telepon") || h.includes("telp") || h === "hp" || h.includes("handphone")) return "phone";
        if (h.includes("kabupaten") || h.includes("regency") || h === "kota" || h === "city") return "kabupaten";
        if (h.includes("kecamatan") || h.includes("district")) return "kecamatan";
        if (h.includes("postal") || h.includes("kodepos") || h.includes("zip")) return "postal_code";
        if (h.includes("address") || h.includes("alamat")) return "address_line";
        if (h.includes("industry") || h.includes("industri") || h.includes("sektor") || h.includes("sector")) return "industry";
        if (h.includes("location") || h.includes("lokasi") || h.includes("provinsi") || h.includes("province")) return "location";
        if (h.includes("legalform") || h.includes("badanhukum") || h.includes("badanusaha") || h.includes("bentukusaha")) return "legal_form";
        if (h.includes("founded") || h.includes("berdiri") || h === "tahun" || h === "year") return "founded_year";
        if (h.includes("employee") || h.includes("karyawan") || h.includes("pegawai") || h.includes("headcount")) return "employee_count";
        if (h.includes("financial") || h.includes("keuangan")) return "financial_status";
        if (h.includes("description") || h.includes("deskripsi") || h.includes("about") || h.includes("tentang")) return "description";
        // Exact-ish matches only: a "contains" fallback would grab headers
        // like "Contact Name" / "PIC Name" / "Nama PIC" and, combined with
        // the multi-column name concatenation, corrupt every company name.
        // Anything else containing name/nama stays unmapped for the user to
        // assign in step 2.
        if (["name", "nama", "company", "perusahaan", "companyname", "namaperusahaan", "businessname"].includes(h)) return "name";

        return null;
    };

    const parseFile = async () => {
        if (!file) return;
        setIsLoading(true);

        try {
            const data = await file.arrayBuffer();
            // xlsx is loaded on demand: this modal only needs it once the user
            // actually picks a file, and a static import would put ~400 kB of
            // SheetJS into the first load of every page that can open it.
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

    const generatePreview = () => {
        const mapped: CompanyRowDraft[] = rawData.map((row) => {
            const draft: CompanyRowDraft = { name: "" };

            columnMappings.forEach((mapping) => {
                if (mapping.apiField && row[mapping.excelColumn] !== undefined) {
                    const value = String(row[mapping.excelColumn] || "").trim();
                    if (mapping.apiField === "name") {
                        draft.name = draft.name ? `${draft.name} ${value}` : value;
                    } else {
                        draft[mapping.apiField] = value;
                    }
                }
            });

            return draft;
        });

        setPreviewData(mapped);
        setStep("preview");
    };

    // Mirrors the API's enqueue-time dedup key: normalized domain when there
    // is one, else normalized name + location — so the preview's duplicate
    // count matches what the server would otherwise report as skipped.
    const rowKey = (row: CompanyRowDraft): string => {
        const domain = (row.domain || "")
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\//, "")
            .replace(/^www\./, "")
            .split("/")[0];
        if (domain) return `d:${domain}`;
        return `n:${row.name.trim().toLowerCase()}|${(row.location || "").trim().toLowerCase()}`;
    };

    const previewSummary = (() => {
        const seen = new Set<string>();
        let valid = 0;
        let missingName = 0;
        let duplicates = 0;

        for (const row of previewData) {
            if (!row.name?.trim()) { missingName++; continue; }
            const key = rowKey(row);
            if (seen.has(key)) { duplicates++; continue; }
            seen.add(key);
            valid++;
        }
        return { valid, missingName, duplicates, total: previewData.length };
    })();

    const rowIssue = (row: CompanyRowDraft, index: number): string | null => {
        if (!row.name?.trim()) return "Missing name";
        const key = rowKey(row);
        const firstIndex = previewData.findIndex(
            (r) => r.name?.trim() && rowKey(r) === key
        );
        return firstIndex !== -1 && firstIndex < index ? "Duplicate" : null;
    };

    const hasNameMapping = columnMappings.some((m) => m.apiField === "name");
    const unmappedColumns = columnMappings.filter((m) => !m.apiField);

    // Get all mapped fields for preview table headers
    const getMappedFields = (): string[] => {
        const fields = new Set<string>();
        columnMappings.forEach((m) => {
            if (m.apiField) fields.add(m.apiField);
        });
        return Array.from(fields);
    };

    const fieldLabel = (field: string): string =>
        API_FIELDS.find((f) => f.value === field)?.label.replace(" (required)", "") ||
        field.replace(/_/g, " ");

    const draftToRow = (draft: CompanyRowDraft): CompanyImportRow => {
        const row: CompanyImportRow = { name: draft.name.trim() };
        for (const field of STRING_FIELDS) {
            const value = draft[field]?.trim();
            if (value) row[field] = value;
        }
        const foundedYear = parseInt((draft.founded_year || "").trim(), 10);
        if (Number.isFinite(foundedYear)) row.founded_year = foundedYear;
        const employeeCount = parseInt((draft.employee_count || "").trim(), 10);
        if (Number.isFinite(employeeCount)) row.employee_count = employeeCount;
        return row;
    };

    const finishPolling = (jobs: CompanyImportJobResponse[]) => {
        const created = jobs.reduce((sum, j) => sum + (j.created_rows || 0), 0);
        const skipped = jobs.reduce((sum, j) => sum + (j.skipped_rows || 0), 0);
        const failed = jobs.reduce((sum, j) => sum + (j.failed_rows || 0), 0);
        const failedJob = jobs.find((j) => j.status === "Failed");
        const summary = `${created} imported, ${skipped} skipped, ${failed} failed.`;

        if (failedJob) {
            notify.error("Company import failed", {
                description: failedJob.messages?.[0] || summary,
                duration: 10000,
            });
        } else {
            notify.success("Company import completed", {
                description: summary,
                duration: 10000,
            });
        }
        onSuccessRef.current();
    };

    const startPolling = (jobIds: string[]) => {
        // Re-arm: StrictMode's dev-only mount->cleanup->remount cycle leaves
        // the ref stuck at true from the first cleanup, which would silently
        // cancel every future poll (no completion toast, no refresh).
        pollCancelledRef.current = false;
        const done = new Map<string, CompanyImportJobResponse>();
        let consecutiveErrors = 0;

        const tick = async () => {
            if (pollCancelledRef.current) return;
            try {
                const token = await getToken();
                const pending = jobIds.filter((id) => !done.has(id));
                const jobs = await Promise.all(pending.map((id) => getImportJob(token, id)));
                consecutiveErrors = 0;
                for (const job of jobs) {
                    if (TERMINAL_STATUSES.has(job.status)) done.set(job.id, job);
                }
                if (done.size === jobIds.length) {
                    finishPolling(Array.from(done.values()));
                    return;
                }
            } catch {
                consecutiveErrors++;
                if (consecutiveErrors >= 5) {
                    notify.error(
                        "Lost track of the company import job. Check back later — the import keeps running in the background."
                    );
                    return;
                }
            }
            pollTimerRef.current = setTimeout(tick, POLL_INTERVAL_MS);
        };

        pollTimerRef.current = setTimeout(tick, POLL_INTERVAL_MS);
    };

    const uploadCompanies = async () => {
        // Must match what the preview counted, duplicates included — otherwise
        // the button promises "Import 900" and quietly posts 1,000.
        const seenKeys = new Set<string>();
        const validRows = previewData.filter((row) => {
            if (!row.name?.trim()) return false;
            const key = rowKey(row);
            if (seenKeys.has(key)) return false;
            seenKeys.add(key);
            return true;
        });

        if (validRows.length === 0) {
            notify.error("No valid companies found. Company Name is required.");
            return;
        }

        setIsLoading(true);
        // Hoisted out of the try so the catch can tell a total failure from
        // a partial one (earlier chunks already queued as jobs).
        const jobIds: string[] = [];
        let totalChunks = 0;

        try {
            // getToken inside the try: an expired/unrefreshable session must
            // surface as an error toast, not strand the button on
            // "Importing…" with an unhandled rejection.
            const token = await getToken();
            const rows = validRows.map(draftToRow);
            const chunks: CompanyImportRow[][] = [];
            for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
                chunks.push(rows.slice(i, i + CHUNK_SIZE));
            }
            totalChunks = chunks.length;

            let totalQueued = 0;
            let totalSkipped = 0;

            // The API caps file_name at 255 chars - truncate the base name,
            // leaving room for the part suffix, so a long filename can't
            // turn the whole request into a 422.
            const baseFileName = file?.name ? file.name.slice(0, 230) : undefined;
            for (let i = 0; i < chunks.length; i++) {
                const fileName = baseFileName
                    ? chunks.length > 1
                        ? `${baseFileName} (Part ${i + 1}/${chunks.length})`
                        : baseFileName
                    : undefined;
                const result = await importCompanies(token, {
                    file_name: fileName,
                    rows: chunks[i],
                });
                totalQueued += result.queued_rows || 0;
                totalSkipped += result.skipped_rows || 0;
                // No job is created when every row deduped against existing data.
                if (result.job_id) jobIds.push(result.job_id);
            }

            const description = (
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/20">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Queued</span>
                        <span className="text-xl font-bold text-white leading-tight">{totalQueued}</span>
                    </div>
                    <div className="w-px h-8 bg-white/20"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Skipped</span>
                        <span className="text-xl font-bold text-white leading-tight">{totalSkipped}</span>
                    </div>
                </div>
            );

            if (jobIds.length === 0) {
                notify.success("Nothing to import — all rows already exist", {
                    description,
                    duration: 10000,
                });
                handleClose();
                onSuccess();
                return;
            }

            notify.success(
                jobIds.length > 1
                    ? `Company import started (${jobIds.length} batches)`
                    : "Company import started",
                { description, duration: 10000 }
            );

            handleClose();
            startPolling(jobIds);
        } catch (error: any) {
            const detail =
                typeof error.message === "string"
                    ? error.message.replace(/_/g, " ")
                    : error.message;
            if (jobIds.length > 0) {
                // Partial failure: earlier chunks are already queued and keep
                // running - poll them to completion, and close the modal so a
                // naive retry can't re-post rows that were already imported.
                notify.error(
                    `Import partially failed - only ${jobIds.length} of ${totalChunks} batches could be queued; they keep running in the background. The remaining rows were not submitted.`,
                    { description: detail, duration: 10000 }
                );
                handleClose();
                startPolling(jobIds);
            } else {
                notify.error("Failed to import companies.", {
                    description: detail,
                    duration: 10000,
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AppDialog
                open={open}
                onClose={() => setShowCloseConfirmation(true)}
                title="Import Companies"
                description={
                    step === "upload"
                        ? "Upload an Excel or CSV file to import companies in bulk."
                        : step === "mapping"
                            ? "Map your file columns to company fields."
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
                                        Company Name is required; other columns are optional.
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
                                    Tip: You can map multiple columns to &quot;Company Name&quot; to combine them.
                                    KBLI codes may share one cell separated by &quot;;&quot; (e.g. 4663;4752).
                                </p>

                                {unmappedColumns.length > 0 && (
                                    <p className="text-sm text-amber-700 mt-2">
                                        {unmappedColumns.length} column{unmappedColumns.length === 1 ? "" : "s"} not mapped and will be ignored:{" "}
                                        {unmappedColumns.map((m) => m.excelColumn).join(", ")}
                                    </p>
                                )}

                                {!hasNameMapping && (
                                    <p className="text-sm text-red-500 mt-2">
                                        Please map at least one column to &quot;Company Name&quot; (required field).
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
                                                {getMappedFields().map((field) => (
                                                    <th key={field} className="text-left p-3 font-medium text-gray-700">
                                                        {fieldLabel(field)}
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
                                                        {getMappedFields().map((field) => (
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
                                                                        issue === "Duplicate"
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
                                                {previewSummary.missingName} skipped — no company name
                                            </span>
                                        )}
                                        {previewSummary.duplicates > 0 && (
                                            <span className="text-amber-700">
                                                {previewSummary.duplicates} skipped — duplicate in this file
                                            </span>
                                        )}
                                    </div>

                                    {previewSummary.valid > CHUNK_SIZE && (
                                        <div className="mt-2 p-3 bg-blue-50 text-blue-700 rounded-lg flex items-start gap-2">
                                            <div className="w-5 h-5 shrink-0 mt-0.5">ℹ️</div>
                                            <p>
                                                Since your data contains more than {CHUNK_SIZE.toLocaleString()} rows, it will be
                                                automatically split into multiple batches to ensure a stable import process.
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
                                            onClick={uploadCompanies}
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
                                                `Import ${previewSummary.valid} compan${previewSummary.valid === 1 ? "y" : "ies"}`
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

export default ImportCompaniesModal;
