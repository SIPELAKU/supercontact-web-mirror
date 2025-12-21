"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type RangeValue = {
  start?: Date;
  end?: Date;
};

type BaseProps = {
  minDate?: Date;
  maxDate?: Date;
  disableWeekend?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};


type SingleDateProps = BaseProps & {
  mode?: "single";
  value?: Date;
  onChange?: (value: Date | undefined) => void;
};

type RangeDateProps = BaseProps & {
  mode: "range";
  value?: RangeValue;
  onChange?: (value: RangeValue | undefined) => void;
};



type DatePickerProps = SingleDateProps | RangeDateProps;


const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const isSameDay = (a?: Date, b?: Date) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();


export function DatePicker({
  mode = "single",
  value,
  onChange,
  minDate,
  maxDate,
  disableWeekend = false,
  placeholder = "Select date",
  disabled = false,
  className,
}: DatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    value instanceof Date
      ? value
      : value && "start" in value && value.start
        ? value.start
        : today
  );

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const formatSingle = (d?: Date) =>
    d
      ? `${String(d.getDate()).padStart(2, "0")} - ${String(
        d.getMonth() + 1
      ).padStart(2, "0")} - ${d.getFullYear()}`
      : "";

  const formatRange = (v?: RangeValue) => {
    if (!v?.start) return "";
    if (!v.end) return formatSingle(v.start);
    return `${formatSingle(v.start)} – ${formatSingle(v.end)}`;
  };

  const isDisabled = (date: Date) => {
    if (disableWeekend) {
      const d = date.getDay();
      if (d === 0 || d === 6) return true;
    }
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handleSelect = (date: Date) => {
    if (mode === "single") {
      (onChange as SingleDateProps["onChange"])?.(date);
      setOpen(false);
      return;
    }

    const range = value as RangeValue | undefined;

    if (!range?.start || range.end) {
      (onChange as RangeDateProps["onChange"])?.({
        start: date,
        end: undefined,
      });
    } else {
      (onChange as RangeDateProps["onChange"])?.({
        start: date < range.start ? date : range.start,
        end: date < range.start ? range.start : date,
      });
      setOpen(false);
    }
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const range = mode === "range" ? (value as RangeValue) : undefined;


  return (
    <div ref={containerRef} className="relative w-full">

      <div
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm",
          "hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
          !value && "text-gray-400",
          className
        )}
      >
        <CalendarIcon className="h-4 w-4 text-gray-500" />
        {mode === "single"
          ? value instanceof Date
            ? formatSingle(value)
            : placeholder
          : value
            ? formatRange(value as RangeValue)
            : placeholder}
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white p-4 shadow-lg">

          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentMonth(new Date(year, month - 1))
              }}
              className="rounded-md p-1 hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex gap-2">
              {currentMonth.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentMonth(new Date(year, month + 1))
              }}
              className="rounded-md p-1 hover:bg-gray-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-gray-400">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-sm">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(year, month, day);

              const disabledDay = isDisabled(date);

              const selected =
                mode === "single"
                  ? value instanceof Date && isSameDay(value, date)
                  : isSameDay(range?.start, date) ||
                  isSameDay(range?.end, date);

              const inRange =
                mode === "range" &&
                range?.start &&
                range?.end &&
                date > range.start &&
                date < range.end;

              return (
                <button
                  key={day}
                  disabled={disabledDay}
                  onClick={() => handleSelect(date)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md transition",
                    disabledDay &&
                    "cursor-not-allowed text-gray-300",
                    selected &&
                    "bg-blue-600 text-white",
                    inRange &&
                    "bg-blue-100 text-blue-700",
                    !selected &&
                    !disabledDay &&
                    "hover:bg-gray-100 text-gray-700"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
