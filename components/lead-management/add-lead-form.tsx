"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";

import CustomDealStageSelect from "@/components/pipeline/SelectDealStage";
import { Contact, createLead, CreateLeadData, User } from "@/lib/api";
import { useContacts } from "@/lib/hooks/useContacts";
import { useUsers } from "@/lib/hooks/useUsers";
import { useQueryClient } from "@tanstack/react-query";
import { GrAdd } from "react-icons/gr";
import { useAuth } from "@/lib/context/AuthContext";
import { notify } from "@/lib/notifications";
import { Autocomplete, TextField, createTheme, ThemeProvider } from "@mui/material";

// MUI Theme for consistent styling
const theme = createTheme({
  palette: {
    primary: {
      main: '#5479EE',
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          height: '48px',
          backgroundColor: 'white',
        },
      },
    },
  },
});

// Lead status options with colors
export const leadStatusOptions = [
  { value: "New", label: "New", bgColor: "bg-[#E8F0FF]", textColor: "text-blue-700" },
  { value: "Contacted", label: "Contacted", bgColor: "bg-[#FFF0E8]", textColor: "text-orange-700" },
  { value: "Qualified", label: "Qualified", bgColor: "bg-[#F3EEFF]", textColor: "text-purple-700" },
  { value: "Proposal", label: "Proposal", bgColor: "bg-[#FFE8E8]", textColor: "text-red-700" },
  { value: "Closed - Won", label: "Closed - Won", bgColor: "bg-[#E8FFE8]", textColor: "text-green-700" },
  { value: "Closed - Lost", label: "Closed - Lost", bgColor: "bg-[#E8FFE8]", textColor: "text-green-700" },
];

// Tag options with colors
export const tagOptions = [
  { value: "Urgent", label: "Urgent", bgColor: "bg-[#FFF0E8]", textColor: "text-orange-700" },
  { value: "Renewal", label: "Renewal", bgColor: "bg-[#FFE8F0]", textColor: "text-pink-700" },
  { value: "High Value", label: "High Value", bgColor: "bg-[#F0E8FF]", textColor: "text-purple-700" },
  { value: "Trial User", label: "Trial User", bgColor: "bg-[#F3F4F6]", textColor: "text-gray-700" },
];

interface LeadData {
  name: string;
  email: string;
  phone_number: string;
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
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [assignedToName, setAssignedToName] = useState<string>("");
  const queryClient = useQueryClient();
  const { data: contactsResponse } = useContacts();
  const { data: usersResponse, isLoading: isLoadingUsers, error: usersError } = useUsers();

  // Debug logs
  console.log('Users Response:', usersResponse);
  console.log('Users Response Data:', usersResponse?.data);
  console.log('Is Loading Users:', isLoadingUsers);
  console.log('Users Error:', usersError);
  console.log('Users Array:', usersResponse?.data?.users);
  console.log('Is Loading Users:', isLoadingUsers);
  console.log('Users Error:', usersError);

  const [form, setForm] = useState<LeadData>({
    name: "",
    email: "",
    phone_number: "",
    company: "",
    industry: "Finance",
    companySize: "1-50 Employees",
    officeLocation: "",
    leadStatus: "",
    leadSource: "Web Form",
    assignedTo: "",
    tag: "",
    notes: "",
  });

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

  const handleContactSelect = (contact: Contact | null) => {
    if (!contact) {
      setSelectedContactId("");
      setForm((prev) => ({
        ...prev,
        name: "",
        email: "",
        phone_number: "",
        company: "",
      }));
      return;
    }

    setSelectedContactId(contact.id);
    setForm((prev) => ({
      ...prev,
      name: contact.name,
      email: contact.email,
      phone_number: (contact as any).phone_number || (contact as any).phone || "",
      company: contact.company,
    }));
  };

  const contacts = contactsResponse?.data?.contacts || [];

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
    // Always show dropdown when typing
    setShowUserDropdown(true);
  };

  const filteredUsers = usersResponse?.data?.users?.filter(user =>
    assignedToName.length === 0 || user.fullname.toLowerCase().includes(assignedToName.toLowerCase())
  ) || [];

  const reset = () => {
    setForm({
      name: "",
      email: "",
      phone_number: "",
      company: "",
      industry: "Finance",
      companySize: "1-50 Employees",
      officeLocation: "",
      leadStatus: "",
      leadSource: "Web Form",
      assignedTo: "",
      tag: "",
      notes: "",
    });
    setSelectedContactId("");
    setSelectedUserId("");
    setAssignedToName("");
    setShowUserDropdown(false);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedContactId) newErrors.name = "Please search or select from the list";

    // Email validation: standard check for @ and domain
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation: numbers only, min 10
    const phoneRegex = /^\d{10,}$/;
    if (!form.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!phoneRegex.test(form.phone_number)) {
      newErrors.phone_number = "Phone number must be at least 10 digits and numbers only";
    }

    if (!form.company.trim()) newErrors.company = "Company is required";
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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      // Create lead with all data in one request
      const leadData: CreateLeadData = {
        // Contact details (always include these as requested)
        name: form.name,
        email: form.email,
        phone_number: form.phone_number,
        company: form.company,

        // Conditional contact_id
        ...(selectedContactId ? { contact_id: selectedContactId } : {}),

        // Lead specific fields
        industry: form.industry,
        company_size: form.companySize.replace(/\s*-\s*/g, "-"),
        office_location: form.officeLocation,
        lead_status: form.leadStatus,
        lead_source: form.leadSource,
        assigned_to: selectedUserId || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
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
      notify.error("Failed to create lead. Please try again.");
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
            <ThemeProvider theme={theme}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Name with Autocomplete */}
                <div className="space-y-2 relative">
                  <Label className="text-sm font-medium text-gray-700">Name</Label>
                  <Autocomplete
                    freeSolo
                    options={contacts}
                    getOptionLabel={(option) => {
                      if (typeof option === 'string') return option;
                      return option.name;
                    }}
                    value={contacts.find(c => c.id === selectedContactId) || form.name}
                    onChange={(event, newValue) => {
                      if (typeof newValue === 'string') {
                        updateField("name", newValue);
                        setSelectedContactId("");
                      } else if (newValue) {
                        handleContactSelect(newValue);
                      } else {
                        handleContactSelect(null);
                      }
                    }}
                    onInputChange={(event, newInputValue) => {
                      if (newInputValue !== form.name) {
                        updateField("name", newInputValue);
                        setSelectedContactId("");
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Search existing contacts or enter new name"
                        error={!!errors.name}
                        helperText={errors.name}
                        variant="outlined"
                        fullWidth
                      />
                    )}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: errors.name ? '#ef4444' : '#d1d5db',
                        },
                        '&:hover fieldset': {
                          borderColor: errors.name ? '#ef4444' : '#9ca3af',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: errors.name ? '#ef4444' : '#5479EE',
                        },
                      },
                    }}
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
                    className={`w-full h-12 px-4 bg-white border rounded-lg text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    value={form.phone_number}
                    onChange={(e) => updateField("phone_number", e.target.value)}
                    className={`w-full h-12 px-4 bg-white border rounded-lg text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all ${errors.phone_number ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Company</Label>
                  <input
                    type="text"
                    placeholder="Enter company name"
                    value={form.company}
                    onChange={(e) => updateField("company", e.target.value)}
                    className={`w-full h-12 px-4 bg-white border rounded-lg text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all ${errors.company ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
                </div>

                {/* Industry */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Industry</Label>
                  <select
                    value={form.industry}
                    onChange={(e) => updateField("industry", e.target.value)}
                    className={`w-full h-12 px-4 pr-10 bg-white border rounded-lg text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none appearance-none transition-all bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] bg-no-repeat bg-[right_12px_center] ${errors.industry ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Industry</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="SaaS">SaaS</option>
                  </select>
                  {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry}</p>}
                </div>

                {/* Company Size */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Company Size</Label>
                  <select
                    value={form.companySize}
                    onChange={(e) => updateField("companySize", e.target.value)}
                    className={`w-full h-12 px-4 pr-10 bg-white border rounded-lg text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none appearance-none transition-all bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] bg-no-repeat bg-[right_12px_center] ${errors.companySize ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Company Size</option>
                    <option value="1-50 Employees">1 - 50 Employees</option>
                    <option value="51-200 Employees">51 - 200 Employees</option>
                    <option value="201+ Employees">201+ Employees</option>
                    {/* <option value="501-1000 Employees">501-1000 Employees</option>
                  <option value="1000+ Employees">1000+ Employees</option> */}
                  </select>
                  {errors.companySize && <p className="text-red-500 text-xs mt-1">{errors.companySize}</p>}
                </div>

                {/* Office Location */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Office Location</Label>
                  <input
                    type="text"
                    placeholder="Enter Office Location"
                    value={form.officeLocation}
                    onChange={(e) => updateField("officeLocation", e.target.value)}
                    className={`w-full h-12 px-4 bg-white border rounded-lg text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all ${errors.officeLocation ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.officeLocation && <p className="text-red-500 text-xs mt-1">{errors.officeLocation}</p>}
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
                  <select
                    value={form.leadSource}
                    onChange={(e) => updateField("leadSource", e.target.value)}
                    className={`w-full h-12 px-4 pr-10 bg-white border rounded-lg text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none appearance-none transition-all bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] bg-no-repeat bg-[right_12px_center] ${errors.leadSource ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Lead Source</option>
                    <option value="Manual Entry">Manual Entry</option>
                    <option value="Web Form">Web Form</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                  {errors.leadSource && <p className="text-red-500 text-xs mt-1">{errors.leadSource}</p>}
                </div>

                {/* Assigned To with Autocomplete */}
                <div className="space-y-2 relative">
                  <Label className="text-sm font-medium text-gray-700">Assigned To</Label>
                  <TextField
                    placeholder="Search and select user"
                    value={assignedToName}
                    onChange={(e) => handleAssignedToChange(e.target.value)}
                    onFocus={() => {
                      setShowUserDropdown(true);
                    }}
                    onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
                    error={!!errors.assignedTo}
                    helperText={errors.assignedTo}
                    variant="outlined"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '48px',
                        '& fieldset': {
                          borderColor: errors.assignedTo ? '#ef4444' : '#d1d5db',
                        },
                        '&:hover fieldset': {
                          borderColor: errors.assignedTo ? '#ef4444' : '#9ca3af',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: errors.assignedTo ? '#ef4444' : '#5479EE',
                        },
                      },
                    }}
                  />
                  {/* User Dropdown */}
                  {showUserDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {isLoadingUsers ? (
                        <div className="px-4 py-3 text-gray-500 text-center">
                          Loading users...
                        </div>
                      ) : usersError ? (
                        <div className="px-4 py-3 text-red-500 text-center">
                          Error loading users: {usersError.message}
                        </div>
                      ) : filteredUsers.length > 0 ? (
                        filteredUsers.slice(0, 5).map((user) => (
                          <div
                            key={user.id}
                            onClick={() => handleUserSelect(user)}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{user.fullname}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-sm text-gray-500 capitalize">{user.role}</div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500 text-center">
                          No users found
                        </div>
                      )}
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
            </ThemeProvider>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
