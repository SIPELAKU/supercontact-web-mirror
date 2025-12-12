"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { GrAdd } from "react-icons/gr";

interface LeadData {
  name: string;
  email: string;
  phone: string;
  company: string;
  source: "Web" | "WhatsApp" | "Manual Entry";
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
    source: "Web",
    notes: "",
  });

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave?.(form); // send data back to parent
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#5479EE] text-white">
          <GrAdd className="text-3xl text-white mr-3" /> Add New Leads
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-[#5479EE]">
            Add New Lead
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <label>Name</label>
            <Input
              placeholder="Enter name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>

          <div>
            <label>Email</label>
            <Input
              placeholder="Enter email address"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          <div>
            <label>Phone Number</label>
            <Input
              placeholder="Enter phone number"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>

          <div>
            <label>Company</label>
            <Input
              placeholder="Enter company name"
              value={form.company}
              onChange={(e) => updateField("company", e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <label>Lead Source</label>
            <Select
              value={form.source}
              onValueChange={(val) => updateField("source", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Web">Web</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Manual Entry">Manual Entry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <label>Notes</label>
            <Textarea
              placeholder="Add any relevant notes here…"
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="ghost"
            className="bg-gray-200"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button className="bg-[#5479EE]" onClick={handleSave}>
            Save Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
