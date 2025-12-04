"use client";

import LeadManagement from "@/components/lead-management/lead-management";
import { useLeads } from "@/lib/hooks/useLeads";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import DateRangePicker from "@/components/ui/daterangepicker";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import AddLeadForm from "@/components/lead-management/add-lead-form";
import { useState } from "react";
import {useViewMode} from "@/lib/hooks/useLeadStore";

export default function LeadManagementPage() {
  const { data, isLoading, error } = useLeads();
  const [status, setStatus] = useState<string>("");
    const [source, setSource] = useState<string>("");
    const [assignedto, setAssignedto] = useState<string>("");
    const {viewMode,setViewMode} = useViewMode();

  console.log('data', data)
  return (
    
    <div className="w-full max-w-[1118px] mx-auto px-4 space-y-6">
  <Card className="bg-[#DDE4FC] h-36 w-full max-w-[1118px] mx-auto mt-[33px]">
          <div className="flex justify-between items-center px-6 h-full">
            <div>
              <p className="text-lg font-semibold mb-1">
                Lead Management Component
              </p>
              <p>Sales &bull; Lead Management</p>
            </div>
            <AddLeadForm />
          </div>
        </Card>

        {/* Filters + View Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 max-w-[1000px]">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger
                className={cn(
                  "h-8 w-36",
                  status
                    ? "bg-[#5479EE] text-white [&>svg]:text-white [&>svg]:stroke-white"
                    : "bg-white !text-black [&>svg]:!text-black [&>svg]:!stroke-black"
                )}
              >
                {status ? <span>Status: {status}</span> : <span>Status</span>}
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

            <Select value={source} onValueChange={setSource}>
              <SelectTrigger
                className={cn(
                  "h-8 w-36",
                  source
                    ? "bg-[#5479EE] text-white [&>svg]:text-white [&>svg]:stroke-white"
                    : "bg-white !text-black [&>svg]:!text-black [&>svg]:!stroke-black"
                )}
              >
                {source ? <span>Source: {source}</span> : <span>Source</span>}
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

            <Select value={assignedto} onValueChange={setAssignedto}>
              <SelectTrigger
                className={cn(
                  "h-8 w-36",
                  assignedto
                    ? "bg-[#5479EE] text-white [&>svg]:text-white [&>svg]:stroke-white"
                    : "bg-white !text-black [&>svg]:!text-black [&>svg]:!stroke-black"
                )}
              >
                {assignedto ? (
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
            </Select>
                <DateRangePicker />
            
          </div>

          {/* Tabs */}
          <div>
            <Tabs
              value={viewMode}
              onValueChange={(val) =>
                setViewMode(val as "table-view" | "kanban-view")
              }
              className="h-8"
            >
              <TabsList>
                <TabsTrigger value="table-view">Table View</TabsTrigger>
                <TabsTrigger value="kanban-view">Kanban View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        {isLoading ? <p>Loading...</p> : error ? <p className="text-red-500">Error: {error.message}</p> : !data ? <p>No leads found.</p> :
        <LeadManagement data={data} />}
        </div>
        
  )
}
