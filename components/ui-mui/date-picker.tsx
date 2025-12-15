"use client";

import { useState } from "react";
import {
  PopoverComponent as Popover,
} from "@/components/ui-mui/popover";
import { Input } from "@/components/ui-mui/input";
import { Button } from "@/components/ui-mui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

type Props = {
  value?: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
};

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CustomDatePicker({ value, onChange, placeholder }: Props) {
  const [viewDate, setViewDate] = useState(value || new Date());

  const [open, setOpen] = useState(false);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const selectDate = (day: number) => {
    const date = new Date(year, month, day);
    onChange(date);
    setOpen(false)
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const format = (d?: Date | null) => {
    if (!d) return "";
    return d.toLocaleDateString("en-US");
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>

      <Popover.Trigger>
        <div className="relative w-full">
          <Input
            readOnly
            className="h-10 pr-10 cursor-pointer bg-white"
            value={format(value)}
            placeholder={placeholder || "Select Date"}
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </Popover.Trigger>

      <Popover.Content className="p-4 w-72">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <p className="font-medium">
            {viewDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </p>

          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 mb-2">
          {daysOfWeek.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-sm">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={"empty-" + i}></div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isSelected =
              value &&
              value.getFullYear() === year &&
              value.getMonth() === month &&
              value.getDate() === day;

            return (
              <button
                key={day}
                onClick={() => selectDate(day)}
                className={`
                  h-9 w-9 flex items-center justify-center rounded-md
                  hover:bg-gray-100
                  transition
                  ${
                    isSelected
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-gray-900"
                  }
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
