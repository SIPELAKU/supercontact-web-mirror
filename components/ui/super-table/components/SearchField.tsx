"use client";

// components/ui/super-table/components/SearchField.tsx
//
// Replaces MRT's built-in global-filter field.
//
// MRT's version is a bare TextField that grows an X only once it has content,
// carries no hint of WHAT is being searched, and has no way in from the
// keyboard - on a list you search dozens of times a day, that last one is the
// expensive part. This one:
//   · states its scope in the placeholder ("Cari nama, email, atau perusahaan")
//   · focuses on "/" from anywhere on the page, and clears + blurs on Escape
//   · keeps a persistent clear button so the control never changes width
//   · announces the result count to screen readers via aria-live

import * as React from "react";
import { IconButton, InputAdornment, TextField, Tooltip } from "@mui/material";
import { Search, X } from "lucide-react";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Shown under the field for screen readers; e.g. "12.431 kontak". */
  resultLabel?: string;
}

export function SearchField({
  value,
  onChange,
  placeholder = "Cari…",
  resultLabel,
}: SearchFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      // "/" is a plain character inside any writable field, so it must only
      // be a shortcut when the user is not already typing somewhere.
      const el = document.activeElement as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <TextField
      inputRef={inputRef}
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        // Escape clears rather than just blurring: a stale search term is the
        // most common reason a list "has no rows".
        if (value) {
          e.stopPropagation();
          onChange("");
        } else {
          inputRef.current?.blur();
        }
      }}
      placeholder={placeholder}
      aria-label={placeholder}
      sx={{
        width: { xs: "100%", sm: 260 },
        "& .MuiOutlinedInput-root": { borderRadius: 2, height: 40 },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search size={16} className="text-gray-400" />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            {value ? (
              <Tooltip arrow title="Hapus pencarian (Esc)">
                <IconButton
                  size="small"
                  edge="end"
                  onClick={() => {
                    onChange("");
                    inputRef.current?.focus();
                  }}
                  aria-label="Hapus pencarian"
                >
                  <X size={15} />
                </IconButton>
              </Tooltip>
            ) : (
              // A dimmed "/" hint occupies the same box the clear button will,
              // so the field never jumps width when you start typing.
              <kbd
                aria-hidden
                className="rounded border border-gray-200 px-1.5 py-0.5 text-[11px] leading-none text-gray-400"
              >
                /
              </kbd>
            )}
          </InputAdornment>
        ),
      }}
      helperText={
        // Visually hidden: sighted users read the count in the footer, but a
        // screen-reader user needs to hear that the list changed under them.
        resultLabel ? (
          <span className="sr-only" aria-live="polite">
            {resultLabel}
          </span>
        ) : undefined
      }
      FormHelperTextProps={{ sx: { m: 0, height: 0 } }}
    />
  );
}
