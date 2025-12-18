"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui-mui/dialog";
import { Button } from "@/components/ui-mui/button";
import { Input } from "@/components/ui-mui/input";
import { Label } from "@/components/ui-mui/label";
import { Textarea } from "@/components/ui-mui/textarea";

import CustomDealStageSelect from "@/components/pipeline/SelectDealStage";
import { GrAdd } from "react-icons/gr";
import { useAuth } from "@/lib/context/AuthContext";
import { createLead, CreateLeadData } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

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

interface LeadData {
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  companySize: string;
  officeLocation: string;
  leadStatus: string;
  leadSource: string;
  assignedTo: string;
  tag: string;
  notes: string;
}

interface AddLeadFormProps {
  onSave?: (data: LeadData) => void;
}

export default function AddLeadForm({ onSave }: AddLeadFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<LeadData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    industry: "Finance",
    companySize: "1-50 Karyawan",
    officeLocation: "",
    leadStatus: "",
    leadSource: "Web Form",
    assignedTo: "",
    tag: "",
    notes: "",
  });

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () =>
    setForm({
      name: "",
      email: "",
      phone: "",
      company: "",
      industry: "Finance",
      companySize: "1-50 Karyawan",
      officeLocation: "",
      leadStatus: "",
      leadSource: "Web Form",
      assignedTo: "",
      tag: "",
      notes: "",
    });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = await getToken();
      
      // Create lead with all data in one request
      const leadData: CreateLeadData = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        industry: form.industry,
        company_size: form.companySize,
        office_location: form.officeLocation,
        lead_status: form.leadStatus,
        lead_source: form.leadSource,
        assigned_to: form.assignedTo || "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Default UUID if empty
        tag: form.tag,
        notes: form.notes,
      };

      await createLead(token, leadData);

      // Refresh the leads data
      queryClient.invalidateQueries({ queryKey: ["leads"] });

      // Call the onSave callback if provided
      onSave?.(form);

      // Reset form and close modal
      reset();
      setOpen(false);
      
      console.log("Lead created successfully!");
    } catch (error) {
      console.error("Error creating lead:", error);
      // You might want to show a toast notification here
      alert("Failed to create lead. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button 
        className="bg-[#5479EE] text-white hover:bg-[#4366d9]"
        onClick={() => setOpen(true)}
      >
        <GrAdd className="text-lg mr-2" /> Add New Lead
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
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
              Add New Leads
            </h2>
          </div>

          <form className="mt-6 space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Name */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Name</Label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full h-12 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Email</Label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full h-12 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full h-12 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Company</Label>
                <input
                  type="text"
                  placeholder="Enter company name"
                  value={form.company}
                  onChange={(e) => updateField("company", e.target.value)}
                  className="w-full h-12 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
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
                  <option value="1-50 Karyawan">1-50 Karyawan</option>
                  <option value="51-200 Karyawan">51-200 Karyawan</option>
                  <option value="201+ Karyawan">201+ Karyawan</option>
                  {/* <option value="501-1000 Karyawan">501-1000 Karyawan</option>
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
                  dealStages={leadStatusOptions}
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

              {/* Assigned To */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Assigned To</Label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={form.assignedTo}
                  onChange={(e) => updateField("assignedTo", e.target.value)}
                  className="w-full h-12 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Tag */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Tag</Label>
              <CustomDealStageSelect
                value={form.tag}
                onChange={(val) => updateField("tag", val)}
                dealStages={tagOptions}
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
                onClick={() => {
                  reset();
                  setOpen(false);
                }}
                className="
                  px-8 h-11 rounded-xl
                  border-gray-300 text-gray-600
                "
              >
                Cancel
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
                {isSubmitting ? "Creating..." : "Save Lead"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
