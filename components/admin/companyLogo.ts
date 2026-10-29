// The rules POST /internal/company-profile/logo applies, checked before the
// upload so a wrong file fails at once with a clear message.

const LOGO_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const LOGO_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];

/** For the file picker. */
export const LOGO_ACCEPT = LOGO_TYPES.join(",");

export const LOGO_MAX_BYTES = 10 * 1024 * 1024;

/** Why this file can't be the logo, or null when it can. */
export function logoFileError(file: { name: string; type: string; size: number }): string | null {
  // Some systems hand over no MIME type; the extension decides then.
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const isImage = file.type ? LOGO_TYPES.includes(file.type) : LOGO_EXTENSIONS.includes(extension);
  if (!isImage) return "Use a JPG, PNG, GIF or WebP image.";
  if (file.size > LOGO_MAX_BYTES) return "The logo must be 10 MB or smaller.";
  return null;
}
