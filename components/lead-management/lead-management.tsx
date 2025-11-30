"use client";

import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { GrAdd } from "react-icons/gr";
import { columns, Lead } from "./lead-management-table/columns";
import { DataTable } from "./lead-management-table/data-table";
import KanbanView from "../kanban-view";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "../ui/select";
import { useState } from "react";
import { cn } from "@/lib/utils";
import DateRangePicker from "../ui/daterangepicker";
import AddLeadForm from "./add-lead-form";

export default function LeadManagement({ data }: { data: Lead[] }) {
  const [status, setStatus] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [assignedto, setAssignedto] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table-view" | "kanban-view">(
    "table-view"
  );

  return (
    <div className="bg-[#ECECEC] min-h-screen p-9">
      <div className="max-w-[1440px] mx-auto">
        {/* header card */}
        <Card className="bg-[#DDE4FC] h-36 w-full">
          <div className="flex justify-between items-center px-8 h-full">
            <div>
              <p className="text-lg font-semibold mb-1">
                Lead Management Component
              </p>
              <p>Sales &bull; Lead Management</p>
            </div>

            <div>
              <AddLeadForm />
            </div>
          </div>
        </Card>

        {/* filters + view toggle */}
        <div className="flex items-start justify-between mt-6 gap-4">

          <div className="flex flex-wrap items-center gap-3">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger
                className={cn(
                  "h-8!",
                  status
                    ? "bg-[#5479EE] text-white! [&>svg]:text-white [&>svg]:stroke-white"
                    : "bg-white text-black! [&>svg]:text-black [&>svg]:stroke-black"
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
                  "h-8!",
                  source
                    ? "bg-[#5479EE] text-white! [&>svg]:text-white [&>svg]:stroke-white"
                    : "bg-white text-black! [&>svg]:text-black [&>svg]:stroke-black"
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
                  "h-8!",
                  assignedto
                    ? "bg-[#5479EE] text-white! [&>svg]:text-white [&>svg]:stroke-white"
                    : "bg-white text-black! [&>svg]:text-black [&>svg]:stroke-black"
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

          {/* tabs untuk table atau kanban*/}
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

        {/* content (table / kanban) */}
        <div className="mt-6">
          {viewMode === "table-view" && (
            <DataTable columns={columns} data={data} />
          )}

          {viewMode === "kanban-view" && (
            <div className="w-full overflow-hidden">
              <KanbanView data={data} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
