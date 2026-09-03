// components/whatsapp-marketing/templates/create/MediaUploadField.tsx
"use client";

import React, { useRef, useState } from 'react';
import { Box, Typography, Stack, CircularProgress, IconButton } from '@mui/material';
import { Upload, X, Link2 } from 'lucide-react';
import { AppInput } from '@/components/ui/app-input';
import { AppButton } from '@/components/ui/app-button';
import { useAuth } from '@/lib/context/AuthContext';
import { uploadTemplateMedia } from '@/lib/api/whatsapp-marketing';
import {
  MEDIA_MIME_ALLOWED,
  maxBytesFor,
  formatBytes,
  STORAGE_MAX_BYTES,
} from '@/lib/constants/whatsapp-limits';

interface MediaUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  isReadOnly?: boolean;
  /** Rendered under the field - used for the variable controls on the media slot. */
  children?: React.ReactNode;
}

/**
 * Upload a file, or paste a URL.
 *
 * Both, deliberately. Uploading is what most people want, but a variable in the
 * media slot - `{{1}}` resolved per recipient at send time - is a real pattern
 * that an upload button alone would make impossible.
 */
export default function MediaUploadField({
  value,
  onChange,
  label = 'Media',
  isReadOnly,
  children,
}: MediaUploadFieldProps) {
  const { getToken } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // Check locally first so the tenant is told before spending the upload.
    // The server checks again - the browser is not the only way in.
    const limit = maxBytesFor(file.type);
    if (!MEDIA_MIME_ALLOWED.includes(file.type)) {
      setError('Tipe berkas tidak didukung WhatsApp.');
      return;
    }
    if (file.size > limit) {
      const note =
        limit === STORAGE_MAX_BYTES
          ? ' (batas penyimpanan, lebih ketat dari WhatsApp)'
          : '';
      setError(`Berkas melebihi ${formatBytes(limit)}${note}.`);
      return;
    }

    setUploading(true);
    try {
      const token = await getToken();
      const result = await uploadTemplateMedia(token, file);
      onChange(result.url);
    } catch (e: any) {
      setError(e?.message || 'Gagal mengunggah berkas');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <Box>
      {isReadOnly ? (
        <Typography variant="body2" fontWeight="medium" mb={0.5}>
          {label}
        </Typography>
      ) : null}

      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Box sx={{ flexGrow: 1 }}>
          <AppInput
            isBgWhite
            label={isReadOnly ? undefined : label}
            placeholder="https://example.com/image.png"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={isReadOnly || uploading}
          />
        </Box>
        {!isReadOnly && (
          <Box sx={{ pt: label && !isReadOnly ? '26px' : 0 }}>
            <AppButton
              variantStyle="outline"
              size="small"
              startIcon={
                uploading ? <CircularProgress size={14} /> : <Upload size={16} />
              }
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? 'Mengunggah…' : 'Unggah'}
            </AppButton>
          </Box>
        )}
        {!isReadOnly && value ? (
          <Box sx={{ pt: '26px' }}>
            <IconButton size="small" onClick={() => onChange('')} aria-label="Hapus media">
              <X size={16} />
            </IconButton>
          </Box>
        ) : null}
      </Stack>

      <input
        ref={inputRef}
        type="file"
        hidden
        accept={MEDIA_MIME_ALLOWED.join(',')}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error ? (
        <Typography variant="caption" color="error" display="block" mt={0.5}>
          {error}
        </Typography>
      ) : null}

      {!isReadOnly && !error ? (
        <Stack direction="row" spacing={0.5} alignItems="center" mt={0.5}>
          <Link2 size={12} color="#6B7280" />
          <Typography variant="caption" color="text.secondary">
            Gambar maks 5 MB; video &amp; dokumen maks 10 MB. URL harus tetap bisa
            diakses publik — Twilio mengambilnya saat approval dan setiap kirim.
          </Typography>
        </Stack>
      ) : null}

      {children}
    </Box>
  );
}
