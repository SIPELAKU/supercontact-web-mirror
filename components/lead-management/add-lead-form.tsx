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
import { Select, SelectItem } from "@/components/ui-mui/select";
import { GrAdd } from "react-icons/gr";

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

  const [form, setForm] = useState<LeadData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    industry: "Finance",
    companySize: "1-50 employees",
    officeLocation: "",
    leadStatus: "Contacted",
    leadSource: "Web Form",
    assignedTo: "",
    tag: "Urgent",
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
      companySize: "1-50 employees",
      officeLocation: "",
      leadStatus: "Contacted",
      leadSource: "Web Form",
      assignedTo: "",
      tag: "Urgent",
      notes: "",
    });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submit:", form);
    onSave?.(form);
    reset();
    setOpen(false);
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
                <Input
                  placeholder="Enter name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="h-12 rounded-xl bg-white border-gray-300"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="h-12 rounded-xl bg-white border-gray-300"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                <Input
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="h-12 rounded-xl bg-white border-gray-300"
                />
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Company</Label>
                <Input
                  placeholder="Enter company name"
                  value={form.company}
                  onChange={(e) => updateField("company", e.target.value)}
                  className="h-12 rounded-xl bg-white border-gray-300"
                />
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Industry</Label>
                <Select
                  value={form.industry}
                  onChange={(val) => updateField("industry", val)}
                >
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </Select>
              </div>

              {/* Company Size */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Company Size</Label>
                <Select
                  value={form.companySize}
                  onChange={(val) => updateField("companySize", val)}
                >
                  <SelectItem value="1-50 employees">1-50 employees</SelectItem>
                  <SelectItem value="51-200 employees">51-200 employees</SelectItem>
                  <SelectItem value="201-500 employees">201-500 employees</SelectItem>
                  <SelectItem value="501-1000 employees">501-1000 employees</SelectItem>
                  <SelectItem value="1000+ employees">1000+ employees</SelectItem>
                </Select>
              </div>

              {/* Office Location */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Office Location</Label>
                <Input
                  placeholder="Enter Office Location"
                  value={form.officeLocation}
                  onChange={(e) => updateField("officeLocation", e.target.value)}
                  className="h-12 rounded-xl bg-white border-gray-300"
                />
              </div>

              {/* Lead Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Lead Status</Label>
                <Select
                  value={form.leadStatus}
                  onChange={(val) => updateField("leadStatus", val)}
                >
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Unqualified">Unqualified</SelectItem>
                  <SelectItem value="Converted">Converted</SelectItem>
                </Select>
              </div>

              {/* Lead Source */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Lead Source</Label>
                <Select
                  value={form.leadSource}
                  onChange={(val) => updateField("leadSource", val)}
                >
                  <SelectItem value="Web Form">Web Form</SelectItem>
                  <SelectItem value="Social Media">Social Media</SelectItem>
                  <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Cold Call">Cold Call</SelectItem>
                  <SelectItem value="Trade Show">Trade Show</SelectItem>
                </Select>
              </div>

              {/* Assigned To */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Assigned To</Label>
                <Input
                  placeholder="Enter name"
                  value={form.assignedTo}
                  onChange={(e) => updateField("assignedTo", e.target.value)}
                  className="h-12 rounded-xl bg-white border-gray-300"
                />
              </div>
            </div>

            {/* Tag */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Tag</Label>
              <Select
                value={form.tag}
                onChange={(val) => updateField("tag", val)}
              >
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="High Priority">High Priority</SelectItem>
                <SelectItem value="Medium Priority">Medium Priority</SelectItem>
                <SelectItem value="Low Priority">Low Priority</SelectItem>
                <SelectItem value="Hot Lead">Hot Lead</SelectItem>
                <SelectItem value="Cold Lead">Cold Lead</SelectItem>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Notes</Label>
              <Textarea
                placeholder="Add any relevant notes here..."
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                className="rounded-xl min-h-24 bg-white border-gray-300 resize-none"
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
                className="
                  px-8 h-11 rounded-xl
                  bg-[#5479EE] hover:bg-[#3f58ce] 
                  text-white
                "
              >
                Save Lead
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
