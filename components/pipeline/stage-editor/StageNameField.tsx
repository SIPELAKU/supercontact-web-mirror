"use client";

// A stage's name. The six default stages get a dropdown of suggestions plus
// "Custom name…", which swaps the dropdown for a text field with Cancel (back
// to the dropdown and the suggestion it had). An added stage only has the
// text field.

import { useRef, useState } from "react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { STAGE_NAME_MAX, nameSuggestions, type StageDraftRow } from "./stageRules";

const CUSTOM = "__custom__";

interface StageNameFieldProps {
  row: StageDraftRow;
  onChange: (name: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function StageNameField({ row, onChange, error, disabled }: StageNameFieldProps) {
  const suggestions = nameSuggestions(row);
  const match = suggestions?.find((option) => option.toLowerCase() === row.name.trim().toLowerCase());
  // A saved name outside the list opens as a custom one.
  const [custom, setCustom] = useState(Boolean(suggestions) && !match);
  // Where Cancel goes back to: the suggestion picked last, else the default name.
  const lastSuggestion = useRef(match ?? suggestions?.[0] ?? "");
  // Focus the text field only when the user just picked "Custom name…", not
  // for a saved custom name when the dialog opens.
  const [justPicked, setJustPicked] = useState(false);
  const label = `Name of ${row.name || "the new stage"}`;

  const textField = (autoFocus: boolean) => (
    <AppInput
      value={row.name}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Stage name"
      height="40px"
      disabled={disabled}
      autoFocus={autoFocus}
      error={Boolean(error)}
      helperText={error}
      inputProps={{ maxLength: STAGE_NAME_MAX, "aria-label": label }}
    />
  );

  if (!suggestions) return textField(false);

  if (custom) {
    return (
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">{textField(justPicked)}</div>
        <AppButton
          variantStyle="outline"
          onClick={() => {
            setCustom(false);
            onChange(lastSuggestion.current);
          }}
          disabled={disabled}
          aria-label={`Cancel the custom name and choose from the suggestions`}
          sx={{ height: 40, minWidth: 0, px: 2 }}
        >
          Cancel
        </AppButton>
      </div>
    );
  }

  return (
    <AppSelect
      value={match ?? ""}
      onChange={(event) => {
        const value = String(event.target.value);
        if (value === CUSTOM) {
          setJustPicked(true);
          setCustom(true);
          return;
        }
        lastSuggestion.current = value;
        onChange(value);
      }}
      options={[...suggestions.map((name) => ({ value: name, label: name })), { value: CUSTOM, label: "Custom name…" }]}
      height="40px"
      disabled={disabled}
      error={Boolean(error)}
      helperText={error}
      inputProps={{ "aria-label": label }}
    />
  );
}
