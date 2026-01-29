"use client";

import { useState, useMemo, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { Search } from "lucide-react";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { AppButton } from "@/components/ui/app-button";
import { useUsers } from "@/lib/hooks/useUsers";
import { useCreateManagedUser } from "@/lib/hooks/useManagedUser";
import { useDebounce } from "@/lib/hooks/useDebounce";
import useRoles from "@/lib/hooks/useRoles";
import useDepartments from "@/lib/hooks/useDepartments";
import { notify } from "@/lib/notifications";

type AddUserDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function AddUserDialog({ open, setOpen }: AddUserDialogProps) {
  // Form State
  const [email, setEmail] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [departmentUuid, setDepartmentUuid] = useState("");
  const [branchName, setBranchName] = useState("");
  const [level, setLevel] = useState("Staff");
  const [position, setPosition] = useState("Support Agent");
  const [status, setStatus] = useState("Active");
  const [roleId, setRoleId] = useState("");

  // UI State
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);

  const debouncedEmail = useDebounce(email, 300);
  const debouncedBranch = useDebounce(branchName, 300);

  // Hooks
  const { data: usersResponse } = useUsers(1, 10, debouncedEmail);
  const { departments: allDepartments } = useDepartments(0, 100);

  const { departments: branchDepartments } = useDepartments(0, 100, "", {
    department: departmentName,
  });

  const { roles: rolesData } = useRoles(1, 100);
  const { mutateAsync: createManagedUser, isPending: isSubmitting } =
    useCreateManagedUser();

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEmail("");
    setSelectedEmail("");
    setDepartmentName("");
    setDepartmentUuid("");
    setBranchName("");
    setLevel("Staff");
    setPosition("Support Agent");
    setStatus("Active");
    setRoleId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmail || !departmentUuid || !roleId) {
      notify.error(
        "Please fill in all required fields and select an email from the suggestions.",
      );
      return;
    }

    try {
      await createManagedUser({
        email: selectedEmail,
        department_id: departmentUuid,
        user_level: level,
        position: position,
        role_id: roleId,
        status: status,
      });
      notify.success("User created successfully");
      handleClose();
    } catch (error: any) {
      console.error("Failed to create user:", error);
      notify.error("Failed to create user: ", {
        description: error.message || "Failed to create user",
      });
    }
  };

  const filteredEmails = usersResponse?.data?.manage_users || [];

  // Filter branches based on input and selected department
  const branches = useMemo(() => {
    const list = branchDepartments.map((d) => d.branch);
    return Array.from(new Set(list)).filter((b) =>
      b.toLowerCase().includes(branchName.toLowerCase()),
    );
  }, [branchDepartments, branchName]);

  const handleEmailSelect = (emailVal: string) => {
    setEmail(emailVal);
    setSelectedEmail(emailVal);
    setShowEmailDropdown(false);
  };

  const handleBranchSelect = (branchVal: string) => {
    setBranchName(branchVal);
    // When branch is selected, update departmentId if it changes
    const deptMatch = branchDepartments.find(
      (d) => d.branch === branchVal && d.department === departmentName,
    );
    if (deptMatch) {
      setDepartmentUuid(deptMatch.id);
    }
    setShowBranchDropdown(false);
  };

  const roleOptions = useMemo(() => {
    if (!rolesData?.roles) return [];
    return rolesData.roles.map((r: any) => ({
      value: r.id,
      label: r.role_name,
    }));
  }, [rolesData]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
          boxShadow: 3,
        },
      }}
    >
      <DialogTitle>
        <span className="text-2xl font-bold text-[#5479EE]">Add User</span>
      </DialogTitle>

      <div className="px-6 pb-3">
        <Typography
          component="p"
          variant="body2"
          className="text-md mt-0 font-semibold text-gray-600"
        >
          Fill in the details below to create a new user account
        </Typography>
      </div>

      <Divider />

      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-6 pt-6 overflow-visible">
          {/* Email */}
          <div className="relative">
            <label className="text-sm font-medium">Email</label>
            <AppInput
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSelectedEmail("");
                setShowEmailDropdown(true);
              }}
              onFocus={() => setShowEmailDropdown(email.length > 0)}
              onBlur={() => setTimeout(() => setShowEmailDropdown(false), 200)}
              isBgWhite
              autoComplete="off"
            />
            {showEmailDropdown && filteredEmails.length > 0 && (
              <div className="absolute z-1500 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredEmails.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleEmailSelect(u.email)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">
                      {u.fullname}
                    </div>
                    <div className="text-sm text-gray-500">{u.email}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 overflow-visible">
            {/* Department */}
            <div>
              <div className="py-1">
                <label className="text-sm font-medium">Department</label>
              </div>
              <AppSelect
                options={[
                  { value: "", label: "Select department" },
                  { value: "Marketing", label: "Marketing" },
                  { value: "Sales", label: "Sales" },
                  { value: "Engineering", label: "Engineering" },
                  { value: "Human Resources", label: "Human Resources" },
                  { value: "Customer Support", label: "Customer Support" },
                ]}
                placeholder="Select department"
                value={departmentName}
                onChange={(e) => {
                  setDepartmentName(e.target.value as string);
                  setBranchName("");
                  setDepartmentUuid("");
                }}
                isBgWhite
              />
            </div>

            {/* Branch */}
            <div className="relative">
              <label className="text-sm font-medium">Branch</label>
              <div className="relative mt-2">
                <AppInput
                  startIcon={<Search size={18} />}
                  placeholder="Search for a Branch"
                  value={branchName}
                  onChange={(e) => {
                    setBranchName(e.target.value);
                    setShowBranchDropdown(true);
                  }}
                  onFocus={() => setShowBranchDropdown(branchName.length > 0)}
                  onBlur={() =>
                    setTimeout(() => setShowBranchDropdown(false), 200)
                  }
                  isBgWhite
                  autoComplete="off"
                />
                {showBranchDropdown && branches.length > 0 && (
                  <div className="absolute z-1500 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {branches.map((b, i) => (
                      <div
                        key={i}
                        onClick={() => handleBranchSelect(b)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="text-gray-900">{b}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Level */}
            <div>
              <div className="py-1">
                <label className="text-sm font-medium">Level</label>
              </div>
              <AppSelect
                options={[
                  { value: "Manager", label: "Manager" },
                  { value: "Staff", label: "Staff" },
                ]}
                placeholder="Select level"
                value={level}
                onChange={(e) => setLevel(e.target.value as string)}
                isBgWhite
              />
            </div>

            {/* Role / Role Access */}
            <div>
              <div className="py-1">
                <label className="text-sm font-medium">Role Access</label>
              </div>
              <AppSelect
                options={roleOptions}
                placeholder="Select role"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value as string)}
                isBgWhite
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Position */}
            <div>
              <div className="py-1">
                <label className="text-sm font-medium">Position</label>
              </div>
              <AppSelect
                options={[
                  { value: "Support Agent", label: "Support Agent" },
                  { value: "Frontend Engineer", label: "Frontend Engineer" },
                  { value: "HR Generalist", label: "HR Generalist" },
                  { value: "Content Specialist", label: "Content Specialist" },
                  { value: "Sales Development", label: "Sales Development" },
                ]}
                placeholder="Select position"
                value={position}
                onChange={(e) => setPosition(e.target.value as string)}
                isBgWhite
              />
            </div>

            {/* Status */}
            <div>
              <div className="py-1">
                <label className="text-sm font-medium">Status</label>
              </div>
              <AppSelect
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" },
                  { value: "Pending", label: "Pending" },
                ]}
                placeholder="Select status"
                value={status}
                onChange={(e) => setStatus(e.target.value as string)}
                isBgWhite
              />
            </div>
          </div>
        </DialogContent>

        <DialogActions className="flex justify-end gap-3 px-2 pb-4">
          <AppButton variantStyle="outline" onClick={handleClose}>
            Cancel
          </AppButton>

          <AppButton
            variantStyle="primary"
            type="submit"
            disabled={isSubmitting || !selectedEmail}
          >
            {isSubmitting ? "Saving..." : "Save User"}
          </AppButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
