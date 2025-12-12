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
import PageHeader from "@/components/ui-mui/page-header"
import {useViewMode} from "@/lib/hooks/useLeadStore";

export default function LeadManagementPage() {
  const { data, isLoading, error } = useLeads();
  const [status, setStatus] = useState<string>("");
    const [source, setSource] = useState<string>("");
    const [assignedto, setAssignedto] = useState<string>("");
    const {viewMode,setViewMode} = useViewMode();

  console.log('data', data)
  return (
    
    <div className="w-full max-w-full mx-auto px-4 space-y-6 ">
  {/* <Card className="bg-[#DDE4FC] h-36 w-full max-w-full mx-auto ">
          <div className="flex justify-between items-center px-6 h-full">
            <div>
              <p className="text-lg font-semibold mb-1">
                Lead Management Component
              </p>
              <p>Sales &bull; Lead Management</p>
            </div>
            
          </div>
        </Card> */}
        <PageHeader
                title="Lead Management"
                breadcrumbs={[
                  { label: "Sales" },
                  { label: "Lead Management" },
                ]}
              />
          {/* Tabs */}
          <div className="flex justify-between">
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
            <AddLeadForm />
          </div>

        
        {isLoading ? <p>Loading...</p> : error ? <p className="text-red-500">Error: {error.message}</p> : !data ? <p>No leads found.</p> :
        <LeadManagement data={data} />}


        </div>
        
  )
}
