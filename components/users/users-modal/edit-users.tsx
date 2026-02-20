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
import useDepartments from "@/lib/hooks/useDepartments";
import { useUpdateManagedUser } from "@/lib/hooks/useManagedUser";
import { useDebounce } from "@/lib/hooks/useDebounce";
import useRoles from "@/lib/hooks/useRoles";
import { ManageUser } from "@/lib/types/manage-users";
import { notify } from "@/lib/notifications";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { handleError } from "@/lib/utils/errorHandler";

const DEPARTMENT_POSITIONS: Record<string, string[]> = {
  "Marketing": ["Brand Manager", "Content writer", "Performance Marketing", "Marketing Coordinator", "SEO specialist"],
  "Sales": ["Sales Manager", "Business Development", "Sales Executive", "Account Manager"],
  "Customer Support": ["CS Manager", "CS Representative"],
  "Human Resources": ["HR Manager", "HR Generalist"],
};


type EditUserDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: ManageUser;
};

export default function EditUserDialog({
  open,
  setOpen,
  user,
}: EditUserDialogProps) {
  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [departmentUuid, setDepartmentUuid] = useState("");
  const [branchName, setBranchName] = useState("");
  const [level, setLevel] = useState("Staff");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState("Active");
  const [roleId, setRoleId] = useState("");

  // UI State
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);

  const debouncedBranch = useDebounce(branchName, 300);

  // Hooks
  const { departments: allDepartments } = useDepartments(0, 100);

  const { departments: branchDepartments } = useDepartments(0, 100, "", {
    department: departmentName,
  });

  const { roles: rolesData } = useRoles(1, 100);
  const { mutateAsync: updateManagedUser, isPending: isSubmitting } =
    useUpdateManagedUser();

  // Populate form with user data
  useEffect(() => {
    if (user) {
      setFullName(user.fullname || "");
      setEmail(user.email || "");
      setEmployeeId(user.employee_code || "");
      if (user.status) {
        setStatus(
          user.status.charAt(0).toUpperCase() + user.status.slice(1) || "Active",
        );
      }
      setPosition(user.position || "");
      setDepartmentName(user.department?.department_name || "");
      setBranchName(user.department?.branch || "");
      setDepartmentUuid(user.department?.id || "");
      setRoleId(user.role?.id || "");
      setLevel(user.level || "Staff");
    }
  }, [user]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentUuid || !roleId) {
      notify.error("Please select a department/branch and a role.");
      return;
    }

    try {
      const response = await updateManagedUser({
        id: String(user.id),
        data: {
          fullname: fullName.trim(),
          email: email,
          employee_code: employeeId,
          department_id: departmentUuid,
          user_level: level,
          position: position,
          role_id: roleId,
          status: status,
        },
      });
      notify.success("User edited successfully");
      handleClose();
    } catch (error: any) {
      console.log("error", error);
      console.error("Failed to edit user:", error);
      const message = handleError(error, "Edit Managed User");
      notify.error("Failed to edit user: ", {
        description: message,
      });
    }
  };



  // Filter branches based on input and selected department
  const branches = useMemo(() => {
    const list = branchDepartments.map((d) => d.branch);
    return Array.from(new Set(list)).filter((b) =>
      b.toLowerCase().includes(branchName.toLowerCase()),
    );
  }, [branchDepartments, branchName]);



  const handleBranchSelect = (branchVal: string) => {
    setBranchName(branchVal);
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

  // Calculate position options based on department
  const positionOptions = useMemo(() => {
    if (!departmentName || !DEPARTMENT_POSITIONS[departmentName]) {
      return [];
    }
    return DEPARTMENT_POSITIONS[departmentName].map(pos => ({
      value: pos,
      label: pos,
    }));
  }, [departmentName]);

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
        <span className="text-2xl font-bold text-[#5479EE]">Edit User</span>
      </DialogTitle>

      <div className="px-6 pb-3">
        <Typography
          component="p"
          variant="body2"
          className="text-md mt-0 font-semibold text-gray-600"
        >
          Update the user's profile information and settings
        </Typography>
      </div>

      <Divider />

      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-6 pt-6 overflow-visible">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 overflow-visible">
            {/* Email */}
            <div className="relative">
              <div className="py-1">
                <label className="text-sm font-medium">Email</label>
              </div>
              <AppInput
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                isBgWhite
                autoComplete="off"
              />
            </div>

            {/* Full Name */}
            <div className="relative">
              <div className="py-1">
                <label className="text-sm font-medium">Full Name</label>
              </div>
              <AppInput
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                isBgWhite
                autoComplete="off"
              />
            </div>

            {/* Employee ID */}
            <div className="relative">
              <div className="py-1">
                <label className="text-sm font-medium">Employee ID</label>
              </div>
              <AppInput
                placeholder="Enter employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                isBgWhite
                autoComplete="off"
              />
            </div>

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
                  setPosition(""); // Reset position when department changes
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
                  { value: "Admin", label: "Admin" },
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

            {/* Position */}
            <div>
              <div className="py-1">
                <label className="text-sm font-medium">Position</label>
              </div>
              <AppSelect
                options={positionOptions}
                placeholder={
                  departmentName ? "Select position" : "Select department first"
                }
                value={position}
                onChange={(e) => setPosition(e.target.value as string)}
                isBgWhite
                disabled={!departmentName}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save User"}
          </AppButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
