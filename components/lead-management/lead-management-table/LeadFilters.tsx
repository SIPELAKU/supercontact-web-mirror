"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Lead } from "@/lib/models/types";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
// import Grid from '@mui/material/Grid'
// import CardContent from '@mui/material/CardContent'
// import FormControl from '@mui/material/FormControl'
// import InputLabel from '@mui/material/InputLabel'
// import MenuItem from '@mui/material/MenuItem'
// import Select from '@mui/material/Select'

import DateRangePicker from "@/components/ui/daterangepicker";

import type { DateRange } from "react-day-picker";

export default function LeadFilters({
  leads,
  setFilteredLeads,
}: {
  leads: Lead[];
  setFilteredLeads: (value: Lead[]) => void;
}) {
  // Filter states
  const [status, setStatus] = useState("All");
  const [source, setSource] = useState("All");
  const [assignedto, setAssignedto] = useState("All");
  const assignedToOptions = Array.from(
  new Set(leads.map((l) => l.user.fullname).filter(Boolean))
);
  // FIXED: must follow DateRange type exactly
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  /* -------------------------
     FILTER LOGIC
  -------------------------- */
  useEffect(() => {
    let filtered = [...leads];

    // Status filter
    if (status !== "All") {
      filtered = filtered.filter((item) => item.status === status);
    }

    // Source filter
    if (source !== "All") {
      filtered = filtered.filter((item) => item.source === source);
    }

    // Assigned To filter
    if (assignedto !== "All") {
      filtered = filtered.filter((item) => item.user.fullname === assignedto);
      console.log('filtered assignedto', filtered);
    }

    // Date Range filter
    if (dateRange.from && dateRange.to) {
  const from = new Date(dateRange.from);
  from.setHours(0, 0, 0, 0);

  const to = new Date(dateRange.to);
  to.setHours(23, 59, 59, 999);
      console.log('from', from);
      console.log('to', to);
  filtered = filtered.filter((item) => {
    const created = new Date(item.last_contacted);
    return created >= from && created <= to;
  });
  console.log('filtered dateRange', filtered);
}


    setFilteredLeads(filtered);
  }, [status, source, assignedto, dateRange, leads]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3 max-w-[1000px]">
        {/* STATUS FILTER */}
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger
            className={cn(
              "h-8 w-36",
              status !== "All"
                ? "bg-[#5479EE] text-white [&>svg]:text-white [&>svg]:stroke-white"
                : "bg-white !text-black [&>svg]:!text-black [&>svg]:!stroke-black"
            )}
          >
            {status !== "All" ? <span>Status: {status}</span> : <span>Status</span>}
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Qualified">Qualified</SelectItem>
              <SelectItem value="Proposal">Proposal</SelectItem>
              <SelectItem value="Closed-Won">Closed-Won</SelectItem>
              <SelectItem value="Closed-Lost">Closed-Lost</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        

        {/* SOURCE FILTER */}
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger
            className={cn(
              "h-8 w-36",
              source !== "All"
                ? "bg-[#5479EE] text-white [&>svg]:text-white [&>svg]:stroke-white"
                : "bg-white !text-black [&>svg]:!text-black [&>svg]:!stroke-black"
            )}
          >
            {source !== "All" ? (
              <span>Source: {source}</span>
            ) : (
              <span>Source</span>
            )}
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Web Form">Web Form</SelectItem>
              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
              <SelectItem value="Manual Entry">Manual Entry</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* ASSIGNED TO FILTER */}
        {/* <Select value={assignedto} onValueChange={setAssignedto}>
          <SelectTrigger
            className={cn(
              "h-8 w-36",
              assignedto !== "All"
                ? "bg-[#5479EE] text-white [&>svg]:text-white [&>svg]:stroke-white"
                : "bg-white !text-black [&>svg]:!text-black [&>svg]:!stroke-black"
            )}
          >
            {assignedto !== "All" ? (
              <span>Assigned To: {assignedto}</span>
            ) : (
              <span>Assigned To</span>
            )}
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Mike">Mike</SelectItem>
              <SelectItem value="Chris">Chris</SelectItem>
              <SelectItem value="Joko">Joko</SelectItem>
              <SelectItem value="Budi">Budi</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select> */}
        {/* ASSIGNED TO FILTER */}
        <Select value={assignedto} onValueChange={setAssignedto}>
          <SelectTrigger
            className={cn(
              "h-8 w-36",
              assignedto !== "All"
                ? "bg-[#5479EE] text-white [&>svg]:text-white [&>svg]:stroke-white"
                : "bg-white !text-black [&>svg]:!text-black [&>svg]:!stroke-black"
            )}
          >
            {assignedto !== "All" ? (
              <span>Assigned To: {assignedto}</span>
            ) : (
              <span>Assigned To</span>
            )}
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectItem value="All">All</SelectItem>

              {assignedToOptions.map((user) => (
                <SelectItem key={user} value={user}>
                  {user}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {/* DATE RANGE */}
        <DateRangePicker
          value={dateRange}
          onChange={(range) =>
            setDateRange(
              range ?? { from: undefined, to: undefined } // correct reset
            )
          }
        />
      </div>
    </div>
  );
}
