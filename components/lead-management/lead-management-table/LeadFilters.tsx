"use client";

import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { Lead } from "@/lib/models/types";
import DateRangePicker from "@/components/ui/daterangepicker";
import type { DateRange } from "react-day-picker";

export default function LeadFilters({
  leads,
  setFilteredLeads,
}: {
  leads: Lead[];
  setFilteredLeads: (value: Lead[]) => void;
}) {
  // Placeholder default state = ""
  const [status, setStatus] = useState(""); 
  const [source, setSource] = useState(""); 
  const [assignedto, setAssignedto] = useState(""); 

  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  const assignedToOptions = Array.from(
    new Set(leads.map((l) => l.user.fullname).filter(Boolean))
  );

  useEffect(() => {
    let filtered = [...leads];

    if (status && status !== "All") filtered = filtered.filter((l) => l.status === status);
    if (source && source !== "All") filtered = filtered.filter((l) => l.source === source);
    if (assignedto && assignedto !== "All")
      filtered = filtered.filter((l) => l.user.fullname === assignedto);

    if (dateRange.from && dateRange.to) {
      const from = new Date(dateRange.from);
      from.setHours(0, 0, 0, 0);
      const to = new Date(dateRange.to);
      to.setHours(23, 59, 59, 999);

      filtered = filtered.filter((l) => {
        const last = new Date(l.last_contacted);
        return last >= from && last <= to;
      });
    }

    setFilteredLeads(filtered);
  }, [status, source, assignedto, dateRange, leads]);

  return (
    <CardContent>
      <Grid container spacing={2}>
        {/* STATUS */}
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select Status
              </MenuItem>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="New">New</MenuItem>
              <MenuItem value="Contacted">Contacted</MenuItem>
              <MenuItem value="Qualified">Qualified</MenuItem>
              <MenuItem value="Proposal">Proposal</MenuItem>
              <MenuItem value="Closed-Won">Closed-Won</MenuItem>
              <MenuItem value="Closed-Lost">Closed-Lost</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* SOURCE */}
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <Select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select Source
              </MenuItem>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Web Form">Web Form</MenuItem>
              <MenuItem value="WhatsApp">WhatsApp</MenuItem>
              <MenuItem value="Manual Entry">Manual Entry</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* ASSIGNED TO */}
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <Select
              value={assignedto}
              onChange={(e) => setAssignedto(e.target.value)}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select Assigned To
              </MenuItem>
              <MenuItem value="All">All</MenuItem>
              {assignedToOptions.map((user) => (
                <MenuItem key={user} value={user}>
                  {user}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* DATE RANGE */}
        <Grid item xs={12} sm={3}>
          <DateRangePicker
            value={dateRange}
            onChange={(range) =>
              setDateRange(range ?? { from: undefined, to: undefined })
            }
            className="w-[310px]"
          />
        </Grid>
      </Grid>
    </CardContent>
  );
}
