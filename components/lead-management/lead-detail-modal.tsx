"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui-mui/dialog";
import { Button } from "@/components/ui-mui/button";
import { Label } from "@/components/ui-mui/label";
import CustomDealStageSelect from "@/components/pipeline/SelectDealStage";
import { useAuth } from "@/lib/context/AuthContext";
import { updateLead, UpdateLeadData, User } from "@/lib/api";
import { Lead } from "@/lib/models/types";
import { useQueryClient } from "@tanstack/react-query";
import { useUsers } from "@/lib/hooks/useUsers";

// Lead status options with colors
export const leadStatusOptions = [
  { value: "New", label: "New", bgColor: "bg-[#E8F0FF]", textColor: "text-blue-700" },
  { value: "Contacted", label: "Contacted", bgColor: "bg-[#FFF0E8]", textColor: "text-orange-700" },
  { value: "Qualified", label: "Qualified", bgColor: "bg-[#F3EEFF]", textColor: "text-purple-700" },
  { value: "Unqualified", label: "Unqualified", bgColor: "bg-[#FFE8E8]", textColor: "text-red-700" },
  { value: "Converted", label: "Converted", bgColor: "bg-[#E8FFE8]", textColor: "text-green-700" },
];

// Tag options with colors
export const tagOptions = [
  { value: "Hot Lead", label: "Hot Lead", bgColor: "bg-[#FFE8E8]", textColor: "text-red-700" },
  { value: "Urgent", label: "Urgent", bgColor: "bg-[#FFF0E8]", textColor: "text-orange-700" },
  { value: "High Priority", label: "High Priority", bgColor: "bg-[#FFE8F0]", textColor: "text-pink-700" },
  { value: "Medium Priority", label: "Medium Priority", bgColor: "bg-[#F0E8FF]", textColor: "text-purple-700" },
  { value: "Low Priority", label: "Low Priority", bgColor: "bg-[#F3F4F6]", textColor: "text-gray-700" },
  { value: "Cold Lead", label: "Cold Lead", bgColor: "bg-[#E8F0FF]", textColor: "text-blue-700" },
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [assignedToName, setAssignedToName] = useState<string>("");
  const { getToken } = useAuth();
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
        industry: lead.contact?.company || "",
        companySize: "1 - 50 Karyawan", // Default since not in lead data
        officeLocation: "", // Contact doesn't have address property
        leadStatus: lead.lead_status,
        leadSource: lead.lead_source,
        assignedTo: lead.user?.id || "",
        tag: "Urgent", // Default since not in lead data
        notes: "",
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
      
      const updateData: UpdateLeadData = {
        contact_id: lead.contact.id,
        industry: form.industry,
        company_size: form.companySize,
        office_location: form.officeLocation,
        lead_status: form.leadStatus,
        lead_source: form.leadSource,
        assigned_to: selectedUserId || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        tag: form.tag,
        notes: form.notes,
      };

      await updateLead(token, lead.id, updateData);

      // Refresh the leads data
      queryClient.invalidateQueries({ queryKey: ["leads"] });

      // Close modal
      onOpenChange(false);
      
      console.log("Lead updated successfully!");
    } catch (error) {
      console.error("Error updating lead:", error);
      alert("Failed to update lead. Please try again.");
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
                value={lead.contact.phone}
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
                <option value="Finance">Finance</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other</option>
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
                <option value="1 - 50 Karyawan">1 - 50 Karyawan</option>
                <option value="51 - 200 Karyawan">51 - 200 Karyawan</option>
                <option value="201+ Karyawan">201+ Karyawan</option>
                {/* <option value="501 - 1000 Karyawan">501-1000 Karyawan</option>
                <option value="1000+ Karyawan">1000+ Karyawan</option> */}
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
                <option value="Web Form">Web Form</option>
                <option value="Social Media">Social Media</option>
                <option value="Email Campaign">Email Campaign</option>
                <option value="Referral">Referral</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Trade Show">Trade Show</option>
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