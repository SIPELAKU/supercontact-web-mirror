"use client";

import { cn } from "@/lib/utils";
import {
  MenuItem,
  Select as MUISelect,
  FormControl,
  SelectChangeEvent,
  OutlinedInput,
} from "@mui/material";

export interface DealStage {
  value: string;
  label: string;
  bgColor: string;
  textColor: string;
}

interface DealStageSelectProps {
  value: string;
  onChange: (val: string) => void;
  dealStages: DealStage[];
  className?: string;
}

export function DealStageSelect({
  value,
  onChange,
  dealStages,
  className,
}: DealStageSelectProps) {
  return (
    <FormControl fullWidth className={cn("min-w-[220px]", className)}>
      <MUISelect
        value={value}
        onChange={(e: SelectChangeEvent) => onChange(e.target.value as string)}
        displayEmpty
        renderValue={(selected) => {
          if (!selected) return "Select Stage";

          const stage = dealStages.find((x) => x.value === selected);
          if (!stage) return selected;

          return (
            <span
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                stage.bgColor,
                stage.textColor
              )}
            >
              {stage.label}
            </span>
          );
        }}
        input={
          <OutlinedInput
            className="
              bg-white rounded-xl h-11 pr-10 
              border border-gray-300
            "
            sx={{ "& fieldset": { border: "none" } }}
          />
        }
        MenuProps={{
          PaperProps: {
            className: "bg-white border border-gray-200 rounded-lg shadow-lg mt-1",
          },
        }}
      >
        {dealStages.map((stage) => (
          <MenuItem key={stage.value} value={stage.value} className="py-2">
            <div
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium w-fit",
                stage.bgColor,
                stage.textColor
              )}
            >
              {stage.label}
            </div>
          </MenuItem>
        ))}
      </MUISelect>
    </FormControl>
  );
}
