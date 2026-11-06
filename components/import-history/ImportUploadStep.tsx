"use client";

import React, { useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { notify } from "@/lib/notifications";
import { downloadImportTemplate, type ImportTemplateConfig } from "@/lib/utils/importTemplate";

interface ImportUploadStepProps {
  file: File | null;
  onFile: (file: File | null) => void;
  template: ImportTemplateConfig;
}

const VALID_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/vnd.ms-excel",
];
const VALID_EXTENSIONS = [".xlsx", ".xls", ".csv"];

// First step of the import wizard: pick or drop the file, or get the template.
export const ImportUploadStep = ({ file, onFile, template }: ImportUploadStepProps) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = (picked: File) => {
    const extension = "." + picked.name.split(".").pop()?.toLowerCase();
    if (VALID_TYPES.includes(picked.type) || VALID_EXTENSIONS.includes(extension)) onFile(picked);
    else notify.error("Please upload an .xlsx or .csv file");
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) accept(e.dataTransfer.files[0]);
  };

  return (
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
            <button onClick={() => onFile(null)} className="mt-2 text-red-500 text-sm hover:underline">
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
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                if (e.target.files?.[0]) accept(e.target.files[0]);
              }}
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
        <button
          type="button"
          onClick={() => downloadImportTemplate(template).catch(() => notify.error("Failed to download the template"))}
          className="text-sm text-[#5479EE] hover:underline flex items-center gap-1"
        >
          <Download className="w-4 h-4" /> Download Template
        </button>
      </div>
    </>
  );
};
