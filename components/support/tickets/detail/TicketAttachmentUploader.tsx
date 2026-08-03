"use client";

import { useRef, useState } from "react";
import { Upload, X, FileText } from "lucide-react";
import { notify } from "@/lib/notifications";

const MAX_FILES = 10;
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

interface TicketAttachmentUploaderProps {
    onUpload: (files: File[]) => Promise<void> | void;
    isUploading?: boolean;
}

export function TicketAttachmentUploader({ onUpload, isUploading }: TicketAttachmentUploaderProps) {
    const [dragActive, setDragActive] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
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

    const addFiles = (fileList: FileList) => {
        const incoming = Array.from(fileList);
        const oversized = incoming.filter((f) => f.size > MAX_SIZE_BYTES);
        if (oversized.length > 0) {
            notify.error(`${oversized[0].name} exceeds the 10MB limit`);
        }
        const valid = incoming.filter((f) => f.size <= MAX_SIZE_BYTES);
        setPendingFiles((prev) => {
            const merged = [...prev, ...valid].slice(0, MAX_FILES);
            return merged;
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            addFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            addFiles(e.target.files);
        }
        e.target.value = "";
    };

    const removePending = (index: number) => {
        setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUploadClick = async () => {
        if (pendingFiles.length === 0) return;
        await onUpload(pendingFiles);
        setPendingFiles([]);
    };

    return (
        <div className="flex flex-col gap-3">
            <div
                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors ${dragActive ? "border-[#5479EE] bg-blue-50" : "border-gray-300 bg-white"
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <Upload className="w-6 h-6 text-gray-500 mb-2" />
                <p className="text-sm text-gray-600">Drag & drop files, or</p>
                <input ref={inputRef} type="file" multiple className="hidden" onChange={handleChange} />
                <button
                    onClick={() => inputRef.current?.click()}
                    className="mt-2 px-4 py-1.5 border border-[#5479EE] text-[#5479EE] rounded-lg text-sm font-medium hover:bg-[#5479EE] hover:text-white transition-colors"
                >
                    Browse Files
                </button>
                <p className="text-[11px] text-gray-400 mt-2">Max {MAX_FILES} files, 10MB each</p>
            </div>

            {pendingFiles.length > 0 && (
                <div className="flex flex-col gap-2">
                    {pendingFiles.map((file, index) => (
                        <div
                            key={`${file.name}-${index}`}
                            className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                        >
                            <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                            <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                            <button
                                onClick={() => removePending(index)}
                                className="text-gray-400 hover:text-red-600 shrink-0"
                                aria-label="Remove file"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={handleUploadClick}
                        disabled={isUploading}
                        className="self-end px-4 py-1.5 bg-[#5479EE] text-white rounded-lg text-sm font-medium hover:bg-[#3F66E0] transition-colors disabled:opacity-50"
                    >
                        {isUploading ? "Uploading..." : `Upload ${pendingFiles.length} file(s)`}
                    </button>
                </div>
            )}
        </div>
    );
}
