"use client";

import { useEffect, useRef, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { Globe, Loader2, Mail, MapPin, Pencil, Phone, Trash2, Upload } from "lucide-react";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { notify } from "@/lib/notifications";
import { useDeleteCompanyLogo, useUploadCompanyLogo } from "@/lib/hooks/useMyCompany";
import type { CompanyGeneral } from "@/lib/types/company-profile";
import { companyInitials, websiteHref, websiteLabel } from "./companyIdentity";
import { LOGO_ACCEPT, logoFileError } from "./companyLogo";
import LogoCropDialog from "./LogoCropDialog";

interface CompanyIdentityCardProps {
  /** From the profile overview, which every role can read. */
  name: string;
  /**
   * `GET /companies` - Admin only. Brings the logo and the contact line;
   * without it the card shows the monogram and the name.
   */
  company?: CompanyGeneral;
  isLoading?: boolean;
  /** Admin: an edit button on the logo uploads or removes it. */
  canEditLogo?: boolean;
}

// Resolves once the browser has the image (or gave up), so a swap to it
// doesn't show an empty box first.
const preloadImage = (src: string | null | undefined) =>
  new Promise<void>((resolve) => {
    if (!src) return resolve();
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });

/**
 * The company's logo and name at the top of Company Profile, with its contact
 * details. No logo (or one that fails to load) shows the initials instead.
 * An Admin changes the logo from the edit button on its corner.
 */
export default function CompanyIdentityCard({ name, company, isLoading, canEditLogo = false }: CompanyIdentityCardProps) {
  // The URL that failed to load; a new logo URL gets a fresh try.
  const [brokenLogo, setBrokenLogo] = useState<string | null>(null);
  // The picked file, shown at once while it uploads.
  const [preview, setPreview] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  // The picked file, being adjusted in the "Adjust logo" dialog.
  const [cropSource, setCropSource] = useState<{ url: string; name: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const upload = useUploadCompanyLogo();
  const remove = useDeleteCompanyLogo();

  // Free an object URL once it is replaced or the card goes away.
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);
  useEffect(() => () => {
    if (cropSource) URL.revokeObjectURL(cropSource.url);
  }, [cropSource]);

  if (isLoading) return <CompanyIdentitySkeleton />;

  const displayName = company?.name || name;
  const logoUrl = company?.logo_url?.trim() || null;
  const logoSrc = preview ?? (logoUrl && brokenLogo !== logoUrl ? logoUrl : null);
  const busy = upload.isPending || remove.isPending;

  const pickFile = () => {
    setMenuAnchor(null);
    fileInput.current?.click();
  };

  // A picked file is checked, then adjusted in the dialog before it uploads.
  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Lets the same file be picked again.
    event.target.value = "";
    if (!file) return;

    const error = logoFileError(file);
    if (error) {
      notify.error("Logo not uploaded", { description: error });
      return;
    }
    setCropSource({ url: URL.createObjectURL(file), name: file.name });
  };

  const uploadLogo = async (file: File) => {
    setPreview(URL.createObjectURL(file));
    try {
      const updated = await upload.mutateAsync(file);
      // Keep the preview until the stored logo is in, so it doesn't blink.
      await preloadImage(updated.logo_url);
      notify.success("Company logo updated");
    } catch (err) {
      notify.error("Logo not uploaded", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setPreview(null);
    }
  };

  const handleAdjusted = (file: File) => {
    setCropSource(null);
    uploadLogo(file);
  };

  const handleRemove = async () => {
    try {
      await remove.mutateAsync();
      notify.success("Company logo removed");
    } catch (err) {
      notify.error("Logo not removed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setConfirmRemove(false);
    }
  };

  const details = [
    company?.website && {
      icon: Globe,
      content: (
        <a href={websiteHref(company.website)} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
          {websiteLabel(company.website)}
        </a>
      ),
    },
    company?.email && {
      icon: Mail,
      content: <a href={`mailto:${company.email}`} className="hover:text-slate-900 hover:underline">{company.email}</a>,
    },
    company?.phone_number && {
      icon: Phone,
      content: <a href={`tel:${company.phone_number}`} className="hover:text-slate-900 hover:underline">{company.phone_number}</a>,
    },
    company?.city && { icon: MapPin, content: <span>{company.city}</span> },
  ].filter(Boolean) as { icon: typeof Globe; content: React.ReactNode }[];

  return (
    <Card className="rounded-2xl! shadow-lg!">
      <CardContent className="p-6!">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="relative shrink-0">
            <div className="relative flex h-18 w-18 items-center justify-center overflow-hidden bg-white">
              {logoSrc ? (
                // A plain <img>: the logo lives on BE storage, whose host is not
                // in next.config's images.remotePatterns.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoSrc}
                  alt={`${displayName} logo`}
                  className="h-full w-full object-contain"
                  onError={() => logoSrc === logoUrl && setBrokenLogo(logoUrl)}
                />
              ) : (
                <span
                  aria-label={`${displayName} initials`}
                  className="flex h-full w-full items-center justify-center bg-brand-light text-xl font-semibold text-brand"
                >
                  {companyInitials(displayName)}
                </span>
              )}
              {busy && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60" aria-busy="true">
                  <Loader2 className="h-5 w-5 animate-spin text-brand" aria-label="Saving logo" />
                </div>
              )}
            </div>

            {canEditLogo && (
              <>
                <button
                  type="button"
                  disabled={busy}
                  // With a logo: a menu to change or remove it. Without: straight to the file picker.
                  onClick={(event) => (logoUrl ? setMenuAnchor(event.currentTarget) : pickFile())}
                  aria-label={logoUrl ? "Edit company logo" : "Upload company logo"}
                  title={logoUrl ? "Edit logo" : "Upload logo"}
                  className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-600 shadow-sm transition hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-60"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <input ref={fileInput} type="file" accept={LOGO_ACCEPT} className="hidden" onChange={handleFile} />
                <LogoCropDialog
                  key={cropSource?.url ?? "closed"}
                  source={cropSource}
                  onCancel={() => setCropSource(null)}
                  onConfirm={handleAdjusted}
                />
              </>
            )}
          </div>

          <div className="min-w-0">
            <Typography className="truncate text-lg! font-semibold! text-slate-900!">{displayName}</Typography>
            {details.length > 0 && (
              <div className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-600">
                {details.map(({ icon: Icon, content }, i) => (
                  <span key={i} className="inline-flex min-w-0 items-center gap-1.5">
                    <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    <span className="truncate">{content}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={pickFile} sx={{ fontSize: 14, gap: 1.25 }}>
          <Upload className="h-4 w-4" /> Upload new logo
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            setConfirmRemove(true);
          }}
          sx={{ fontSize: 14, gap: 1.25, color: "error.main" }}
        >
          <Trash2 className="h-4 w-4" /> Remove logo
        </MenuItem>
      </Menu>

      <ConfirmationPopup
        isOpen={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={handleRemove}
        title="Remove company logo?"
        description="The company profile will show its initials instead. You can upload a new logo at any time."
        confirmText="Remove"
        variant="danger"
        isLoading={remove.isPending}
      />
    </Card>
  );
}

function CompanyIdentitySkeleton() {
  return (
    <Card className="rounded-2xl! shadow-lg!" aria-busy="true">
      <CardContent className="p-6!">
        <div className="flex animate-pulse items-center gap-5">
          <div className="h-18 w-18 shrink-0 bg-gray-200" />
          <div className="flex-1 space-y-2.5">
            <div className="h-5 w-56 rounded bg-gray-200" />
            <div className="h-4 w-80 max-w-full rounded bg-gray-100" />
          </div>
        </div>
        <span className="sr-only">Loading company...</span>
      </CardContent>
    </Card>
  );
}
