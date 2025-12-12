"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui-mui/dialog";
import { Button } from "@/components/ui-mui/button";
import { Input } from "@/components/ui-mui/input";
import { Label } from "@/components/ui-mui/label";
import { Textarea } from "@/components/ui-mui/textarea";
import { Select, SelectItem } from "@/components/ui-mui/select";
import { CustomDatePicker } from "@/components/ui-mui/date-picker";
import { AddDealModalProps } from "@/lib/type/Pipeline";
import CustomSelectStage from "@/components/pipeline/SelectDealStage"

export const dealStages = [
  { value: "prospect", label: "Prospect", bgColor: "bg-[#F3F4F6]", textColor: "text-gray-700" },
  { value: "qualified", label: "Qualified", bgColor: "bg-[#F3EEFF]", textColor: "text-purple-700" },
  { value: "negotiation", label: "Negotiation", bgColor: "bg-[#EAF6FF]", textColor: "text-blue-700" },
  { value: "proposal", label: "Proposal", bgColor: "bg-[#FFF6E8]", textColor: "text-orange-700" },
  { value: "closed-won", label: "Closed/Won", bgColor: "bg-[#E8FFE8]", textColor: "text-green-700" },
  { value: "closed-lost", label: "Closed/Lost", bgColor: "bg-[#FFE8E8]", textColor: "text-red-700" },
]

export function AddDealModal({ open, onOpenChange }: AddDealModalProps) {
  const [formData, setFormData] = useState({
    dealName: "",
    clientAccount: "",
    dealStage: "",
    expectedCloseDate: new Date(),
    amount: "",
    probability: "",
    notes: "",
  });

  const reset = () =>
    setFormData({
      dealName: "",
      clientAccount: "",
      dealStage: "",
      expectedCloseDate: new Date(),
      amount: "",
      probability: "",
      notes: "",
    });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submit:", formData);
    reset();
    onOpenChange(false);
  };

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
            Add New Pipeline
          </h2>
        </div>

        <form className="mt-6 space-y-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Deal Name</Label>
              <Input
                placeholder="Enter deal name"
                value={formData.dealName}
                onChange={(e) =>
                  setFormData({ ...formData, dealName: e.target.value })
                }
                className="h-12 rounded-xl bg-white border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Client/Account</Label>
              <Input
                placeholder="Enter client name"
                value={formData.clientAccount}
                onChange={(e) =>
                  setFormData({ ...formData, clientAccount: e.target.value })
                }
                className="h-12 rounded-xl bg-white border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Deal Stage</label>

            <CustomSelectStage
                value={formData.dealStage}
                onChange={(value: string) => setFormData({ ...formData, dealStage: value })}
                dealStages={dealStages}
                className="bg-white rounded-md"
              />
            </div>

            {/* Expected Close Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Expected Close Date
              </Label>
              <CustomDatePicker
                value={formData.expectedCloseDate}
                onChange={(value) =>
                  setFormData({ ...formData, expectedCloseDate: value })
                }
                placeholder="Select close date"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="h-12 rounded-xl bg-white border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Probability of Close (%)
              </Label>
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="0"
                value={formData.probability}
                onChange={(e) =>
                  setFormData({ ...formData, probability: e.target.value })
                }
                className="h-12 rounded-xl bg-white border-gray-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Notes</Label>
            <Textarea
              placeholder="Add any relevant notes here..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="rounded-xl min-h-12 bg-white border-gray-300 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
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
              Save Deal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
