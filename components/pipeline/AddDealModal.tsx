"use client";

import { useEffect, useMemo, useState } from "react";
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
import { DatePicker } from "@/components/ui-mui/date-picker";
import { AddDealModalProps } from "@/lib/type/Pipeline";
import CustomSelectStage from "@/components/pipeline/SelectDealStage"
import { useGetPipelineStore } from "@/lib/store/pipeline";
import type { DealForm, reqBody } from "@/lib/store/pipeline";
import { useGetContactStore } from "@/lib/store/contact";

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
  type FormErrors = Partial<Record<keyof reqBody, string>>;
  const { listContact, fetchContact, loading, clearContact } = useGetContactStore();
  const { listPipeline, postFormPipeline, id, setEditId, stage, updateFormPipeline } = useGetPipelineStore();
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<DealForm>({
    deal_name: "",
    client_account: "",
    deal_stage: "",
    expected_close_date: undefined,
    amount: 0,
    probability_of_close: "0",
    notes: ""
  });

  const reset = () =>
    setFormData({
      deal_name: "",
      client_account: "",
      deal_stage: "",
      expected_close_date: undefined,
      amount: 0,
      probability_of_close: "0",
      notes: ""
    });


  const deal = useMemo(() => {
    if (!id) return null;

    return listPipeline
      .flatMap(stage => stage.deals)
      .find(d => d.id === id) ?? null;
  }, [id, listPipeline]);


  useEffect(() => {
    if (!deal) return;

    setFormData({
      deal_name: deal.deal_name ?? "",
      client_account: deal.company?.id ?? "",
      deal_stage: stage ?? "",
      expected_close_date: deal.expected_close_date
        ? new Date(deal.expected_close_date)
        : undefined,
      amount: deal.amount ?? 0,
      probability_of_close: String(deal.probability_of_close ?? 0),
      notes: deal.notes ?? "",
    });
  }, [deal, stage]);

  const selectedContactOption = useMemo(() => {
    if (!deal?.company) return null;

    return {
      value: deal.company.id,
      label: deal.company.name,
    };
  }, [deal]);

  const contactOptions = useMemo(() => {
    if (!selectedContactOption) return listContact;

    const exists = listContact.some(
      (c) => c.value === selectedContactOption.value
    );

    return exists
      ? listContact
      : [selectedContactOption, ...listContact];
  }, [listContact, selectedContactOption]);


  const validateForm = (data: DealForm): FormErrors => {
    const errs: FormErrors = {};

    if (!data.deal_name.trim()) {
      errs.deal_name = "Deal name is required";
    }

    if (!data.client_account) {
      errs.client_account = "Client is required";
    }

    if (!data.deal_stage) {
      errs.deal_stage = "Deal stage is required";
    }

    if (!data.expected_close_date) {
      errs.expected_close_date = "Expected close date is required";
    }

    if (data.amount <= 0) {
      errs.amount = "Amount must be greater than 0";
    }

    if (
      Number(data.probability_of_close) < 0 ||
      Number(data.probability_of_close) > 100
    ) {
      errs.probability_of_close = "Probability must be between 0–100";
    }

    return errs;
  };

  function toApiDate(date?: Date): string {
    if (!date) return "";

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  }


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    const body: reqBody = {
      ...formData,
      expected_close_date: toApiDate(formData.expected_close_date),
      probability_of_close: Number(formData.probability_of_close)
    };

    if (!id) {
      const response = await postFormPipeline(body)

      if (response.success) {
        reset();
        onOpenChange(false);
      }
    } else {
      const response = await updateFormPipeline(body, id)

      if (response.success) {
        reset();
        onOpenChange(false);
      }
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
            {id === "" ? "Add New Pipeline" : "Update Pipeline"}
          </h2>
        </div>

        <form className="mt-6 space-y-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Deal Name</Label>
              <Input
                disabled={id ? true : false}
                placeholder="Enter deal name"
                value={formData.deal_name}
                onChange={(e) =>
                  setFormData({ ...formData, deal_name: e.target.value })
                }
                className="h-12 rounded-xl bg-white border-gray-300"
              />
              {errors.deal_name && (
                <p className="text-sm text-red-500 mt-1">{errors.deal_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Client/Account</label>
              <CustomSelectStage
                isSearch={true}
                disabled={id ? true : false}
                loading={loading}
                value={formData.client_account}
                placeholder="Select Client"
                onSearch={(q) => {
                  const keyword = q.trim();
                  if (keyword.length < 1) {
                    clearContact();
                    return;
                  }
                  fetchContact({ query: q })
                }}
                onChange={(value: string) => setFormData({ ...formData, client_account: value })}
                data={contactOptions}
                className="bg-white rounded-md"
              />
              {errors.client_account && (
                <p className="text-sm text-red-500 mt-1">{errors.client_account}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Deal Stage</label>
              <CustomSelectStage
                value={formData.deal_stage}
                disabled={id ? true : false}
                onChange={(value: string) => setFormData({ ...formData, deal_stage: value })}
                data={dealStages}
                className="bg-white rounded-md"
              />
              {errors.deal_stage && (
                <p className="text-sm text-red-500 mt-1">{errors.deal_stage}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Expected Close Date
              </Label>
              <DatePicker
                mode="single"
                value={formData.expected_close_date}
                onChange={(date) => {
                  setFormData({
                    ...formData,
                    expected_close_date: date,
                  });
                }}
                placeholder="Select close date"
              />
              {errors.expected_close_date && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.expected_close_date}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Amount</Label>
              <Input
                type="number"
                disabled={id ? true : false}
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
                className="h-12 rounded-xl bg-white border-gray-300"
              />
              {errors.amount && (
                <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">   Probability of Close (%)</label>
              <CustomSelectStage
                value={String(formData.probability_of_close)}
                onChange={(e) =>
                  setFormData({ ...formData, probability_of_close: e })
                }
                placeholder="0"
                data={[
                  { label: "20%", value: "20" },
                  { label: "40%", value: "40" },
                  { label: "60%", value: "60" },
                  { label: "80%", value: "80" },
                  { label: "100%", value: "100" },
                ]}
                className="bg-white rounded-md"
              />
              {errors.probability_of_close && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.probability_of_close}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Notes</Label>
            <Textarea
              disabled={id ? true : false}
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
                setErrors({})
                setEditId("")
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
              {id ? "Update Deal" : "Save Deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
