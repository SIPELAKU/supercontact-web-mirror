"use client";

import CustomDealStageSelect from "@/components/pipeline/SelectDealStage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { updateLead, UpdateLeadData, User } from "@/lib/api";
import { useUsers } from "@/lib/hooks/useUsers";
import { Lead } from "@/lib/models/types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { logger } from "../../lib/utils/logger";
import { useAuth } from "@/lib/context/AuthContext";

//export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal" | "Closed - Won" | "Closed - Lost";
export const leadStatusOptions = [
  { value: "New", label: "New", bgColor: "bg-[#E8F0FF]", textColor: "text-blue-700" },
  { value: "Contacted", label: "Contacted", bgColor: "bg-[#FFF0E8]", textColor: "text-orange-700" },
  { value: "Qualified", label: "Qualified", bgColor: "bg-[#F3EEFF]", textColor: "text-purple-700" },
  { value: "Proposal", label: "Proposal", bgColor: "bg-[#FFE8E8]", textColor: "text-red-700" },
  { value: "Closed - Won", label: "Closed - Won", bgColor: "bg-[#EDFDEC]", textColor: "text-[#5BC557]" },
  { value: "Closed - Lost", label: "Closed - Lost", bgColor: "bg-[#FCE8E8]", textColor: "text-[#C0392B]" },
];
// const statusColors: Record<LeadStatus, string> = {
//   "New": "bg-[#EBEBEB] text-[#617589]",
//   "Contacted": "bg-[#E8F4FD] text-[#2980B9]",
//   "Qualified": "bg-[#F7EEFF] text-[#6B21A8]",
//   "Proposal": "bg-[#FEF5E7] text-[#F39C12]",
//   "Closed - Won": "bg-[#EDFDEC] text-[#5BC557]",
//   "Closed - Lost": "bg-[#FCE8E8] text-[#C0392B]",
// };
// Tag options with colors
export const tagOptions = [
  { value: "Urgent", label: "Urgent", bgColor: "bg-[#FFF0E8]", textColor: "text-orange-700" },
  { value: "Renewal", label: "Renewal", bgColor: "bg-[#FFE8F0]", textColor: "text-pink-700" },
  { value: "High Value", label: "High Value", bgColor: "bg-[#F0E8FF]", textColor: "text-purple-700" },
  { value: "Trial User", label: "Trial User", bgColor: "bg-[#F3F4F6]", textColor: "text-gray-700" },
];

interface LeadDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
}

interface FormData {
  industry: string;
  companySize: string;
  officeLocation: string;
  leadStatus: string;
  leadSource: string;
  assignedTo: string;
  tag: string;
  notes: string;
}

export default function LeadDetailModal({ open, onOpenChange, lead }: LeadDetailModalProps) {
  const { getToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [assignedToName, setAssignedToName] = useState<string>("");
  const queryClient = useQueryClient();
  const { data: usersResponse } = useUsers();

  const [form, setForm] = useState<FormData>({
    industry: "",
    companySize: "",
    officeLocation: "",
    leadStatus: "",
    leadSource: "",
    assignedTo: "",
    tag: "",
    notes: "",
  });

  // Populate form when lead changes
  useEffect(() => {
    if (lead) {
      setForm({
        industry: lead.industry || "",
        companySize: lead.company_size,
        officeLocation: lead.office_location || "",
        leadStatus: lead.lead_status,
        leadSource: lead.lead_source,
        assignedTo: lead.user?.id || "",
        tag: lead.tag,
        notes: lead.notes,
      });

      // Set assigned user
      if (lead.user) {
        setSelectedUserId(lead.user.id);
        setAssignedToName(lead.user.fullname);
      }
    }
  }, [lead]);

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleUserSelect = (user: User) => {
    setSelectedUserId(user.id);
    setAssignedToName(user.fullname);
    updateField("assignedTo", user.id);
    setShowUserDropdown(false);
  };

  const handleAssignedToChange = (value: string) => {
    setAssignedToName(value);
    setSelectedUserId("");
    updateField("assignedTo", "");
    setShowUserDropdown(value.length > 0);
  };

  const filteredUsers = usersResponse?.data?.users?.filter(user =>
    user.fullname.toLowerCase().includes(assignedToName.toLowerCase())
  ) || [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!lead) return;

    setIsSubmitting(true);

    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      const updateData: UpdateLeadData = {
        contact_id: lead.contact.id,
        name: lead.contact.name,
        email: lead.contact.email,
        phone_number: lead.contact.phone_number,
        company: lead.contact.company,
        industry: form.industry,
        company_size: form.companySize.replace(/\s*-\s*/g, "-"),
        office_location: form.officeLocation,
        lead_status: form.leadStatus,
        lead_source: form.leadSource,
        assigned_to: selectedUserId || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        tag: form.tag,
        notes: form.notes,
      };

      // Validate required fields
      if (!updateData.industry || !updateData.company_size || !updateData.lead_status || !updateData.lead_source) {
        throw new Error("Please fill in all required fields");
      }

      logger.info("Updating lead", { leadId: lead.id, updateData });

      await updateLead(token, lead.id, updateData);

      // Refresh the leads data and wait for it to complete
      await queryClient.refetchQueries({ queryKey: ["leads"] });

      // Close modal
      onOpenChange(false);

      logger.info("Lead updated successfully!", { leadId: lead.id });

      // Show success message
      alert("Lead updated successfully!");
    } catch (error: any) {
      logger.error("Error updating lead", {
        leadId: lead.id,
        error: error.message,
        updateData: {
          contact_id: lead.contact.id,
          industry: form.industry,
          company_size: form.companySize,
          office_location: form.officeLocation,
          lead_status: form.leadStatus,
          lead_source: form.leadSource,
          assigned_to: selectedUserId || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          tag: form.tag,
          notes: form.notes,
        }
      });

      // Show more specific error message
      const errorMessage = error.message === "UNAUTHORIZED"
        ? "Session expired. Please login again."
        : `Failed to update lead: ${error.message}`;

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          max-w-[820px] 
          w-full 
          px-10 py-8 
          rounded-3xl 
          bg-white
          border border-gray-200
        "
      >
        <div className="mt-2">
          <h2 className="text-2xl font-semibold text-[#5479EE]">
            Detail Lead
          </h2>
        </div>

        <form className="mt-6 space-y-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Name (Read-only) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Name</Label>
              <input
                type="text"
                value={lead.contact.name}
                readOnly
                className="w-full h-12 px-4 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
              />
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <input
                type="email"
                value={lead.contact.email}
                readOnly
                className="w-full h-12 px-4 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
              />
            </div>

            {/* Phone (Read-only) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
              <input
                type="text"
                value={lead.contact.phone_number}
                readOnly
                className="w-full h-12 px-4 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
              />
            </div>

            {/* Company (Read-only) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Company</Label>
              <input
                type="text"
                value={lead.contact.company}
                readOnly
                className="w-full h-12 px-4 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
              />
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Industry</Label>
              <select
                value={form.industry}
                onChange={(e) => updateField("industry", e.target.value)}
                className="w-full h-12 px-4 pr-10 bg-white border border-gray-300 rounded-lg text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none appearance-none transition-all bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] bg-no-repeat bg-[right_12px_center]"
              >
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Logistics">Logistics</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="SaaS">SaaS</option>
              </select>
            </div>

            {/* Company Size */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Company Size</Label>
              <select
                value={form.companySize}
                onChange={(e) => updateField("companySize", e.target.value)}
                className="w-full h-12 px-4 pr-10 bg-white border border-gray-300 rounded-lg text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none appearance-none transition-all bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] bg-no-repeat bg-[right_12px_center]"
              >
                <option value="1-50 Employees">1 - 50 Employees</option>
                <option value="51-200 Employees">51 - 200 Employees</option>
                <option value="201+ Employees">201+ Employees</option>
                {/* <option value="501 - 1000 Employees">501-1000 Employees</option>
                <option value="1000+ Employees">1000+ Karyawan</option> */}
              </select>
            </div>

            {/* Office Location */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Office Location</Label>
              <input
                type="text"
                placeholder="Enter Office Location"
                value={form.officeLocation}
                onChange={(e) => updateField("officeLocation", e.target.value)}
                className="w-full h-12 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            {/* Lead Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Lead Status</Label>
              <CustomDealStageSelect
                value={form.leadStatus}
                onChange={(val) => updateField("leadStatus", val)}
                data={leadStatusOptions}
                placeholder="Select lead status"
                className="bg-white rounded-lg"
              />
            </div>

            {/* Lead Source */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Lead Source</Label>
              <select
                value={form.leadSource}
                onChange={(e) => updateField("leadSource", e.target.value)}
                className="w-full h-12 px-4 pr-10 bg-white border border-gray-300 rounded-lg text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none appearance-none transition-all bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] bg-no-repeat bg-[right_12px_center]"
              >
                <option value="Manual Entry">Manual Entry</option>
                <option value="Web Form">Web Form</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>

            {/* Assigned To with Autocomplete */}
            <div className="space-y-2 relative">
              <Label className="text-sm font-medium text-gray-700">Assigned To</Label>
              <input
                type="text"
                placeholder="Search and select user"
                value={assignedToName}
                onChange={(e) => handleAssignedToChange(e.target.value)}
                onFocus={() => setShowUserDropdown(assignedToName.length > 0)}
                onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
                className="w-full h-12 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />

              {/* User Dropdown */}
              {showUserDropdown && filteredUsers.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredUsers.slice(0, 5).map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{user.fullname}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-sm text-gray-500 capitalize">{user.role}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tag */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Tag</Label>
            <CustomDealStageSelect
              value={form.tag}
              onChange={(val) => updateField("tag", val)}
              data={tagOptions}
              placeholder="Select tag"
              className="bg-white rounded-lg"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Notes</Label>
            <textarea
              placeholder="Add any relevant notes here..."
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="
                px-8 h-11 rounded-xl
                border-gray-300 text-gray-600
              "
            >
              Close
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="
                px-8 h-11 rounded-xl
                bg-[#5479EE] hover:bg-[#3f58ce] 
                text-white
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isSubmitting ? "Updating..." : "Update Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}