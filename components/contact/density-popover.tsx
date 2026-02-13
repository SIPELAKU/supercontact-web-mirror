"use client";

import { useState } from "react";
import {
  SlidersHorizontal,
  AlignJustify,
  AlignLeft,
  StretchVertical,
} from "lucide-react";
import { Popover } from "@mui/material";
import { cn } from "@/lib/utils";
import { AppButton } from "../ui/app-button";

export type Density = "compact" | "standard" | "comfortable";

interface DensityPopoverProps {
  density: Density;
  onChange: (density: Density) => void;
}

export default function DensityPopover({
  density,
  onChange,
}: DensityPopoverProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const options: { value: Density; label: string; icon: React.ReactNode }[] = [
    {
      value: "compact",
      label: "Compact",
      icon: <AlignJustify size={16} />,
    },
    {
      value: "standard",
      label: "Standard",
      icon: <AlignLeft size={16} />,
    },
    {
      value: "comfortable",
      label: "Comfortable",
      icon: <StretchVertical size={16} />,
    },
  ];

  return (
    <>
      <AppButton
        onClick={handleClick}
        variantStyle="soft"
        startIcon={<SlidersHorizontal size={16} />}
      >
        Density
      </AppButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            className:
              "w-[180px] p-2 rounded-xl mt-1.5 shadow-lg border border-gray-100",
            style: {
              boxShadow:
                "0px 10px 15px -3px rgba(0, 0, 0, 0.05), 0px 4px 6px -2px rgba(0, 0, 0, 0.025)",
            },
          },
        }}
      >
        <div className="flex flex-col gap-1">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                handleClose();
              }}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                density === option.value
                  ? "bg-[#DDE4FC] text-[#6739EC]"
                  : "text-gray-700 hover:bg-gray-100",
              )}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      </Popover>
    </>
  );
}
