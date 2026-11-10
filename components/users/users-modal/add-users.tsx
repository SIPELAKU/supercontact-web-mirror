"use client";

import { useState, useMemo } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { AppButton } from "@/components/ui/app-button";
import { useCreateManagedUser } from "@/lib/hooks/useManagedUser";
import useRoles from "@/lib/hooks/useRoles";
import { notify } from "@/lib/notifications";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { handleError } from "@/lib/utils/errorHandler";
import { BranchPicker } from "./BranchPicker";
import { DEPARTMENT_OPTIONS, LEVEL_OPTIONS, positionOptionsFor } from "./userFormOptions";

type AddUserDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};


export default function AddUserDialog({ open, setOpen }: AddUserDialogProps) {
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

  // Hooks
  const { roles: rolesData } = useRoles(1, 100);
  const { mutateAsync: createManagedUser, isPending: isSubmitting } =
    useCreateManagedUser();

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setEmployeeId("");
    setDepartmentName("");
    setDepartmentUuid("");
    setBranchName("");
    setLevel("Staff");
    setPosition("");
    setStatus("Active");
    setRoleId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missingFields = [];
    if (!fullName.trim()) missingFields.push("Full Name");
    if (!email) missingFields.push("Email");
    if (!departmentName) missingFields.push("Department");
    if (!branchName) missingFields.push("Branch");
    if (!roleId) missingFields.push("Role Access");
    if (!position) missingFields.push("Position");

    if (missingFields.length > 0) {
      notify.error(
        `Please fill in the following fields: ${missingFields.join(", ")}`,
      );
      return;
    }

    if (!departmentUuid) {
      notify.error("Error", {
        description: "Choose a branch from the list, or add a new one.",
        duration: 2000,
      });
      return;
    }

    try {
      await createManagedUser({
        fullname: fullName.trim(),
        email: email,
        employee_code: employeeId,
        department_id: departmentUuid,
        user_level: level,
        position: position,
        role_id: roleId,
        status: status,
      });
      notify.success("User added", {
        description: `Invitation sent to ${email}. Ask them to check the spam folder too.`,
      });
      handleClose();
    } catch (error: any) {
      console.error("Failed to create user:", error);
      const message = handleError(error, "Create Managed User");
      notify.error("Failed to create user: ", {
        description: message,
      });
    }
  };


  const roleOptions = useMemo(() => {
    if (!rolesData?.roles) return [];
    return rolesData.roles.map((r: any) => ({
      value: r.id,
      label: r.role_name,
    }));
  }, [rolesData]);

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const confirmClose = () => {
    setOpen(false);
    resetForm();
  }

  const positionOptions = positionOptionsFor(departmentName);

  return (
    <>
      <Dialog
        open={open}
        onClose={() => setShowCloseConfirmation(true)}
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
        <form onSubmit={handleSubmit}>
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
                  options={DEPARTMENT_OPTIONS}
                  placeholder="Select department"
                  value={departmentName}
                  onChange={(e) => {
                    const newDept = e.target.value as string;
                    setDepartmentName(newDept);
                    setBranchName("");
                    setDepartmentUuid("");
                    setPosition(""); // Reset position when department changes
                  }}
                  isBgWhite
                />
              </div>

              {/* Branch */}
              <BranchPicker
                department={departmentName}
                value={branchName}
                selectedId={departmentUuid}
                onChange={(branch, id) => {
                  setBranchName(branch);
                  setDepartmentUuid(id);
                }}
              />

              {/* Level */}
              <div>
                <div className="py-1">
                  <label className="text-sm font-medium">Level</label>
                </div>
                <AppSelect
                  options={LEVEL_OPTIONS}
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

          <DialogActions className="flex justify-end gap-3 px-6 pb-4">
            <AppButton variantStyle="outline" onClick={() => confirmClose()}>
              Cancel
            </AppButton>

            <AppButton
              variantStyle="primary"
              type="submit"
              disabled={isSubmitting || !email}
            >
              {isSubmitting ? "Saving..." : "Save User"}
            </AppButton>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmationPopup
        isOpen={showCloseConfirmation}
        onClose={() => setShowCloseConfirmation(false)}
        onConfirm={() => {
          setShowCloseConfirmation(false);
          confirmClose();
        }}
        title="Are you sure?"
        description="This will discard your current record."
        confirmText="Discard record"
        cancelText="Cancel"
        variant="discard"
      />
    </>
  );
}
