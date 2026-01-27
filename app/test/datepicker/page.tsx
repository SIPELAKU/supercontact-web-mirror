"use client";

import React, { useState } from "react";
import { AppDatePicker, DatePickerValue } from "@/components/ui/app-datepicker";
import { Box, Typography, Divider } from "@mui/material";

export default function DatePickerTestPage() {
  const [singleDate, setSingleDate] = useState<DatePickerValue>(new Date());
  const [rangeDate, setRangeDate] = useState<DatePickerValue>([
    new Date(),
    new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
  ]);

  return (
    <Box className="p-10 max-w-2xl mx-auto space-y-10">
      <Typography variant="h4" className="font-bold text-gray-800">
        DatePicker Component Test
      </Typography>

      <section className="space-y-4">
        <Typography variant="h6" className="text-gray-600">
          Single Date Mode
        </Typography>
        <AppDatePicker
          label="Single Date"
          mode="single"
          value={singleDate}
          onChange={setSingleDate}
          placeholder="Pick a single date"
        />
        <Typography
          variant="body2"
          className="text-gray-500 bg-gray-50 p-2 rounded"
        >
          Value:{" "}
          {singleDate instanceof Date ? singleDate.toISOString() : "null"}
        </Typography>
      </section>

      <Divider />

      <section className="space-y-4">
        <Typography variant="h6" className="text-gray-600">
          Range Date Mode
        </Typography>
        <AppDatePicker
          label="Date Range"
          mode="range"
          value={rangeDate}
          onChange={setRangeDate}
          placeholder="Pick a date range"
        />
        <Typography
          variant="body2"
          className="text-gray-500 bg-gray-50 p-2 rounded"
        >
          Value:{" "}
          {Array.isArray(rangeDate)
            ? `${rangeDate[0]?.toISOString()} - ${rangeDate[1]?.toISOString()}`
            : "null"}
        </Typography>
      </section>

      <section className="space-y-4">
        <Typography variant="h6" className="text-gray-600">
          White Background Variation
        </Typography>
        <AppDatePicker
          label="Search Date (White BG)"
          mode="single"
          isBgWhite
          placeholder="Search..."
        />
      </section>
    </Box>
  );
}
