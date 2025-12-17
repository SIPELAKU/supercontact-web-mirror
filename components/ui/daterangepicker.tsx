"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  value?: DateRange; // must always contain { from, to }
  onChange?: (range: DateRange | undefined) => void;
  className?: string;
}

export default function DateRangePicker({
  value,
  onChange,
  className
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  // Internal fallback state must ALWAYS have full DateRange shape
  const [internalRange, setInternalRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  // Use external value if provided (controlled mode)
  const range = value ?? internalRange;

  // Sync internal state when controlled value changes
  useEffect(() => {
    if (value) {
      setInternalRange(value);
    }
  }, [value]);

  const handleSelect = (newRange: DateRange | undefined) => {
    if (onChange) onChange(newRange);
    else if (newRange) setInternalRange(newRange);
  };

  const isSelected = !!(range.from && range.to);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(`flex items-center justify-between w-full h-12 px-4 pr-[14px] bg-white border border-gray-300 rounded-xl text-gray-600 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 outline-none text-sm transition-all
            ${isSelected ? "bg-[#5479EE] text-white" : "bg-white text-gray-600"}
          `, className)}
          style={{
            backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 14px center'
          }}
        >
          {isSelected ? (
            <span className="truncate text-left">
              {format(range.from!, "PP")} — {format(range.to!, "PP")}
            </span>
          ) : (
            <span className="text-left">Select Date Range</span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent side="bottom" align="start" className="p-0 w-fit">
        <Calendar
          mode="range"
          selected={range}      // must be { from, to }
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
