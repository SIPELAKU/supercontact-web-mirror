"use client";

import CustomDealStageSelect from "@/components/pipeline/SelectDealStage";
import { AppButton } from "@/components/ui/app-button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { updateLead, UpdateLeadData, User } from "@/lib/api";
import { useUsers } from "@/lib/hooks/useUsers";
import { Lead } from "@/lib/models/types";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { AppTextarea } from "@/components/ui/app-textarea";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { logger } from "../../lib/utils/logger";
import { notify } from "@/lib/notifications";
import { useAuth } from "@/lib/context/AuthContext";
import { LockedContactField, LOCKED_FIELD_LABELS } from "./LockedContactField";
import { useActiveSalesChannels } from "@/lib/hooks/useCommercialContext";

//export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal" | "Closed - Won" | "Closed - Lost";
export const leadStatusOptions = [
  { value: "New", label: "New", bgColor: "bg-[#E8F0FF]", textColor: "text-blue-700" },
  { value: "Contacted", label: "Contacted", bgColor: "bg-[#FFF0E8]", textColor: "text-orange-700" },
  { value: "Qualified", label: "Qualified", bgColor: "bg-[#F3EEFF]", textColor: "text-purple-700" },
  { value: "Unqualified", label: "Unqualified", bgColor: "bg-[#FFE8E8]", textColor: "text-red-700" },
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
  name: string;
  email: string;
  phone_number: string;
  company: string;
  industry: string;
  companySize: string;
  officeLocation: string;
  leadStatus: string;
  leadSource: string;
  /** Phase 3 (spec I6). "" = leave it as it is / let the server derive it. */
  salesChannelId: string;
  assignedTo: string;
  tag: string;
  notes: string;
}

export default function LeadDetailModal({ open, onOpenChange, lead }: LeadDetailModalProps) {
  const { getToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [assignedToName, setAssignedToName] = useState<string>("");
  const queryClient = useQueryClient();
  // lead_assignee: Staff only see themselves, Admin / Manager see everyone.
  const { data: usersResponse } = useUsers(1, 10, undefined, undefined, undefined, "lead_assignee");
  const { data: salesChannelPage } = useActiveSalesChannels({ enabled: open });

  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone_number: "",
    company: "",
    industry: "",
    companySize: "",
    officeLocation: "",
    leadStatus: "",
    leadSource: "",
    salesChannelId: "",
    assignedTo: "",
    tag: "",
    notes: "",
  });

  // Populate form when lead changes
  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.contact?.name || "",
        email: lead.contact?.email || "",
        phone_number: lead.contact?.phone_number || "",
        company: lead.contact?.company || "",
        industry: lead.industry || "",
        companySize: lead.company_size,
        officeLocation: lead.office_location || "",
        leadStatus: lead.lead_status,
        leadSource: lead.lead_source,
        salesChannelId: lead.sales_channel_id ?? "",
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
    // Clear error when user types
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    // Name, email, phone and company are the contact's own and read-only
    // here (BO request 2026-11-04), so they are not validated.
    if (!form.industry) newErrors.industry = "Industry is required";
    if (!form.companySize) newErrors.companySize = "Company size is required";
    if (!form.officeLocation.trim()) newErrors.officeLocation = "Office location is required";
    if (!form.leadStatus) newErrors.leadStatus = "Lead status is required";
    if (!form.leadSource) newErrors.leadSource = "Lead source is required";
    if (!form.assignedTo) newErrors.assignedTo = "Please assign this lead to a user";
    if (!form.tag) newErrors.tag = "Tag is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!lead) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      // No contact fields: the lead's contact cannot be changed here, and the
      // API never stored name/email/phone/company on the lead anyway.
      const updateData: UpdateLeadData = {
        industry: form.industry,
        company_size: form.companySize.replace(/\s*-\s*/g, "-"),
        office_location: form.officeLocation,
        lead_status: form.leadStatus,
        lead_source: form.leadSource,
        // Sent as `null` when cleared so the column is actually emptied, and
        // omitted entirely while the picker has not loaded a value.
        ...(form.salesChannelId !== (lead.sales_channel_id ?? "")
          ? { sales_channel_id: form.salesChannelId || null }
          : {}),
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
      notify.success("Lead updated successfully!");
    } catch (error: any) {
      logger.error("Error updating lead", {
        leadId: lead.id,
        error: error.message,
        updateData: {
          contact_id: lead.contact?.id,
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

      notify.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lead) return null;

  return (
    <>
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

              {/* The lead's contact: read-only once the lead exists (BO request
                  2026-11-04). Edit the contact itself in Contacts. */}
              {(["name", "email", "phone_number", "company"] as const).map((key) => (
                <LockedContactField key={key} label={LOCKED_FIELD_LABELS[key]} value={form[key] || "-"} />
              ))}

              {/* Industry */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Industry</Label>
                <AppSelect
                  value={form.industry}
                  onChange={(e) => updateField("industry", e.target.value as string)}
                  error={!!errors.industry}
                  helperText={errors.industry}
                  height="48px"
                  rounded="8px"
                  options={[
                    { value: "", label: "Select Industry" },
                    { value: "Healthcare", label: "Healthcare" },
                    { value: "Customer Support", label: "Customer Support" },
                    { value: "Logistics", label: "Logistics" },
                    { value: "Manufacturing", label: "Manufacturing" },
                    { value: "SaaS", label: "SaaS" },
                  ]}
                  placeholder="Select Industry"
                  isBgWhite
                />
              </div>

              {/* Company Size */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Company Size</Label>
                <AppSelect
                  value={form.companySize}
                  onChange={(e) => updateField("companySize", e.target.value as string)}
                  error={!!errors.companySize}
                  helperText={errors.companySize}
                  height="48px"
                  rounded="8px"
                  options={[
                    { value: "", label: "Select Company Size" },
                    { value: "1-50 Employees", label: "1 - 50 Employees" },
                    { value: "51-200 Employees", label: "51 - 200 Employees" },
                    { value: "201+ Employees", label: "201+ Employees" },
                  ]}
                  placeholder="Select Company Size"
                  isBgWhite
                />
              </div>

              {/* Office Location */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Office Location</Label>
                <AppInput
                  type="text"
                  placeholder="Enter Office Location"
                  value={form.officeLocation}
                  onChange={(e) => updateField("officeLocation", e.target.value)}
                  error={!!errors.officeLocation}
                  helperText={errors.officeLocation}
                  isBgWhite
                  height="48px"
                  rounded="8px"
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
                  className={errors.leadStatus ? 'border-red-500' : ''}
                />
                {errors.leadStatus && <p className="text-red-500 text-xs mt-1">{errors.leadStatus}</p>}
              </div>

              {/* Lead Source */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Lead Source</Label>
                <AppSelect
                  value={form.leadSource}
                  onChange={(e) => updateField("leadSource", e.target.value as string)}
                  error={!!errors.leadSource}
                  helperText={errors.leadSource}
                  height="48px"
                  rounded="8px"
                  options={[
                    { value: "", label: "Select Lead Source" },
                    { value: "Manual Entry", label: "Manual Entry" },
                    { value: "Web Form", label: "Web Form" },
                    { value: "WhatsApp", label: "WhatsApp" },
                  ]}
                  placeholder="Select Lead Source"
                  isBgWhite
                />
              </div>

              {/* Sales channel (Phase 3, spec I6) - beside Lead Source, which
                  keeps its enum, its icons and its own column filter. */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Kanal Penjualan</Label>
                <AppSelect
                  value={form.salesChannelId}
                  onChange={(e) => updateField("salesChannelId", e.target.value as string)}
                  height="48px"
                  rounded="8px"
                  options={[
                    { value: "", label: "Tanpa kanal" },
                    ...(salesChannelPage?.items ?? []).map((channel) => ({
                      value: channel.id,
                      label: channel.name,
                    })),
                  ]}
                  placeholder="Tanpa kanal"
                  isBgWhite
                />
              </div>

              {/* Assigned To with Autocomplete */}
              <div className="space-y-2 relative">
                <Label className="text-sm font-medium text-gray-700">Assigned To</Label>
                <AppInput
                  type="text"
                  placeholder="Search and select user"
                  value={assignedToName}
                  onChange={(e) => handleAssignedToChange(e.target.value)}
                  onFocus={() => setShowUserDropdown(assignedToName.length > 0)}
                  onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
                  error={!!errors.assignedTo}
                  helperText={errors.assignedTo}
                  isBgWhite
                  height="48px"
                  rounded="8px"
                />

                {/* User Dropdown */}
                {showUserDropdown && filteredUsers.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredUsers.slice(0, 5).map((user) => (
                      <div
                        key={user.id}
                        // Same as the contact picker above: select on
                        // mousedown so the input's blur cannot swallow it.
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleUserSelect(user);
                        }}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{user.fullname}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-sm text-gray-500 capitalize">{user.position}</div>
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
                className={errors.tag ? 'border-red-500' : ''}
              />
              {errors.tag && <p className="text-red-500 text-xs mt-1">{errors.tag}</p>}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Notes</Label>
              <AppTextarea
                placeholder="Add any relevant notes here..."
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                rows={4}
                rounded="8px"
                isBgWhite
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <AppButton
                type="button"
                variantStyle="outline"
                onClick={() => onOpenChange(false)}
                className="
                px-8 h-11 rounded-xl
                border-gray-300 text-gray-600
              "
              >
                Close
              </AppButton>

              <AppButton
                type="submit"
                variantStyle="primary"
                isLoading={isSubmitting}
                className="
                px-8 h-11 rounded-xl
                bg-[#5479EE] hover:bg-[#3f58ce] 
                text-white
              "
              >
                {isSubmitting ? "Updating..." : "Update Lead"}
              </AppButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}