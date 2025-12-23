"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  className?: string;
}

export default function DateRangePicker({
  value,
  onChange,
  className
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  // Internal fallback state
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
    const updatedRange = newRange ?? { from: undefined, to: undefined };
    
    if (onChange) {
      onChange(updatedRange);
    } else {
      setInternalRange(updatedRange);
    }
    
    // Only close popover when both dates are selected AND it's a complete range
    // Don't close if user is still selecting the range
    if (updatedRange.from && updatedRange.to && updatedRange.from !== updatedRange.to) {
      setOpen(false);
    }
  };

  const isSelected = !!(range.from && range.to);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center justify-between w-full h-12 px-4 bg-white border border-gray-300 rounded-xl text-gray-600 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 outline-none text-sm transition-all hover:border-gray-400",
            isSelected && "bg-[#5479EE] text-white border-[#5479EE]",
            className
          )}
        >
          <span className="truncate text-left">
            {isSelected ? (
              `${format(range.from!, "MMM dd, yyyy")} — ${format(range.to!, "MMM dd, yyyy")}`
            ) : (
              "Select Date Range"
            )}
          </span>
          <CalendarIcon className="h-4 w-4 ml-2 flex-shrink-0" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={range.from}
          selected={range}
          onSelect={handleSelect}
          numberOfMonths={1}
        />
      </PopoverContent>
    </Popover>
  );
}
