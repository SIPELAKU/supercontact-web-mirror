"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function DateRangePicker() {
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const isSelected = !!(range?.from && range?.to);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`flex items-center gap-2 px-3 py-2 h-8 rounded-lg border text-sm transition-all
            ${isSelected ? "bg-[#5479EE] text-white" : "bg-white text-black"}
          `}
        >
          {/* <CalendarIcon className={`h-4 w-4 ${isSelected ? "text-white" : "text-black"}`} /> */}

          {isSelected ? (
            <span>
              {format(range!.from!, "PP")} — {format(range!.to!, "PP")}
            </span>
          ) : (
            <span>Date Range</span>
          )}
          {open ? (
            <ChevronUp className="h-4 w-4 opacity-50" />
          ) : (
            <ChevronDown className="h-4 w-4 opacity-50" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="p-0 w-fit">
        <Calendar mode="range" selected={range} onSelect={setRange} />
      </PopoverContent>
      {/* <PopoverContent className="p-0">
        <Calendar
          mode="range"
          //   numberOfMonths={2}
          selected={range}
          onSelect={setRange}
        />
      </PopoverContent> */}
    </Popover>
  );
}
