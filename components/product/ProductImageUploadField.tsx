"use client";

import React, { useRef, useState } from "react";
import { CircularProgress, IconButton } from "@mui/material";
import { ImageIcon, Upload, X } from "lucide-react";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { useAuth } from "@/lib/context/AuthContext";
import { PRODUCT_IMAGE_MAX_BYTES, PRODUCT_IMAGE_MIME_ALLOWED, uploadProductImage } from "@/lib/api/products";

/** The server's refusal, word for word, so the local check reads the same. */
export const PRODUCT_IMAGE_RULE_COPY = "Berkas harus JPG/PNG/WebP/GIF maksimal 10 MB";

interface ProductImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  /** A server-side refusal routed to this field (details.field === "file" | "image_url"). */
  error?: string;
}

/**
 * Upload a product image, or paste a URL - copy of the WA template media
 * field with the product limits. The upload is stateless (no product id),
 * so it works before the first save; only the returned URL is stored on the
 * product (`image_url`). Cancelling after an upload leaves an orphan file in
 * storage - accepted in Phase 1, a tenant-scoped ledger is the follow-up.
 */
export default function ProductImageUploadField({ value, onChange, disabled, error }: ProductImageUploadFieldProps) {
  const { getToken } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [previewBroken, setPreviewBroken] = useState(false);

  const handleFile = async (file: File) => {
    setLocalError(null);
    // Checked locally first so the tenant is told before spending the upload;
    // the server checks again.
    if (!PRODUCT_IMAGE_MIME_ALLOWED.includes(file.type) || file.size > PRODUCT_IMAGE_MAX_BYTES) {
      setLocalError(PRODUCT_IMAGE_RULE_COPY);
      return;
    }
    setUploading(true);
    try {
      const token = await getToken();
      const result = await uploadProductImage(token, file);
      onChange(result.url);
      setPreviewBroken(false);
    } catch (e: any) {
      setLocalError(e?.message || "Gagal mengunggah gambar");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const shownError = error ?? localError ?? undefined;

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-900">
        Gambar produk
        <span className="text-gray-400 font-normal ml-2 text-xs">(opsional)</span>
      </label>
      <div className="flex items-start gap-3">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          {value && !previewBroken ? (
            // Plain <img>: next/image would throw for the storage host, which is
            // not in `remotePatterns` and differs per tier.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Pratinjau gambar produk"
              className="h-full w-full object-cover"
              onError={() => setPreviewBroken(true)}
            />
          ) : (
            <ImageIcon size={24} className="text-gray-300" />
          )}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <AppInput
                name="imageUrl"
                isBgWhite
                placeholder="https://..."
                value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                  setPreviewBroken(false);
                }}
                disabled={disabled || uploading}
                inputProps={{ maxLength: 1024 }}
                error={!!shownError}
                helperText={shownError}
              />
            </div>
            <AppButton
              variantStyle="outline"
              size="small"
              startIcon={uploading ? <CircularProgress size={14} /> : <Upload size={16} />}
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? "Mengunggah…" : "Unggah"}
            </AppButton>
            {value && !disabled && (
              <IconButton size="small" onClick={() => onChange("")} aria-label="Hapus gambar">
                <X size={16} />
              </IconButton>
            )}
          </div>
          {!shownError && (
            <p className="text-xs text-gray-500">
              Unggah gambar (JPG/PNG/WebP/GIF, maks 10 MB) atau tempel URL gambar publik.
            </p>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={PRODUCT_IMAGE_MIME_ALLOWED.join(",")}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
