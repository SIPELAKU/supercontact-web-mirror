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
import { CustomDatePicker } from "@/components/ui-mui/date-picker";
import { AddDealModalProps } from "@/lib/type/Pipeline";
import CustomSelectStage from "@/components/pipeline/SelectDealStage"
import { reqBody, useGetPipelineStore } from "@/lib/store/pipeline";
import { useGetContactStore } from "@/lib/store/contact/contact";

export const dealStages = [
  { value: "all", label: "All", bgColor: "bg-white", textColor: "text-black" },
  { value: "Prospect", label: "Prospect", bgColor: "bg-[#F3F4F6]", textColor: "text-gray-700" },
  { value: "Qualified", label: "Qualified", bgColor: "bg-[#F3EEFF]", textColor: "text-purple-700" },
  { value: "Negotiation", label: "Negotiation", bgColor: "bg-[#EAF6FF]", textColor: "text-blue-700" },
  { value: "Proposal", label: "Proposal", bgColor: "bg-[#FFF6E8]", textColor: "text-orange-700" },
  { value: "Closed - Won", label: "Closed/Won", bgColor: "bg-[#E8FFE8]", textColor: "text-green-700" },
  { value: "Closed - Lost", label: "Closed/Lost", bgColor: "bg-[#FFE8E8]", textColor: "text-red-700" },
]

export function AddDealModal({ open, onOpenChange }: AddDealModalProps) {
  const { listContact } = useGetContactStore();
  const { postFormPipeline } = useGetPipelineStore();
  const [formData, setFormData] = useState<reqBody>({
    deal_name: "",
    client_account: "",
    deal_stage: "",
    expected_close_date: new Date().toISOString(),
    amount: 0,
    probability_of_close: 0,
    notes: ""
  });

  const reset = () =>
    setFormData({
      deal_name: "",
      client_account: "",
      deal_stage: "",
      expected_close_date: new Date().toISOString(),
      amount: 0,
      probability_of_close: 0,
      notes: ""
    });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const body: reqBody = {
      ...formData,
      expected_close_date: new Date(formData.expected_close_date).toISOString(),
    };

    const response = await postFormPipeline(body)

    if (response.success) {
      reset();
      onOpenChange(false);
    }
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
                value={formData.deal_name}
                onChange={(e) =>
                  setFormData({ ...formData, deal_name: e.target.value })
                }
                className="h-12 rounded-xl bg-white border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Client/Account</label>

              <CustomSelectStage
                value={formData.client_account}
                onChange={(value: string) => setFormData({ ...formData, client_account: value })}
                dealStages={listContact}
                className="bg-white rounded-md"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Deal Stage</label>

              <CustomSelectStage
                value={formData.deal_stage}
                onChange={(value: string) => setFormData({ ...formData, deal_stage: value })}
                dealStages={dealStages}
                className="bg-white rounded-md"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Expected Close Date
              </Label>
              <CustomDatePicker
                value={new Date(formData.expected_close_date)}
                onChange={(value: Date) =>
                  setFormData({ ...formData, expected_close_date: value.toISOString() })
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
                  setFormData({ ...formData, amount: Number(e.target.value) })
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
                value={formData.probability_of_close}
                onChange={(e) =>
                  setFormData({ ...formData, probability_of_close: Number(e.target.value) })
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
