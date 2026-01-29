import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import React, { useState, useEffect } from "react";
import { Poppins } from "next/font/google";
import { useAuth } from "@/lib/context/AuthContext";
import { notify } from "@/lib/notifications";
import { useRouter } from "next/navigation";
import useRoles from "@/lib/hooks/useRoles";
import {
  PERMISSIONS,
  formatPermissionLabel,
} from "@/lib/constants/permissions";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

type EditRoleModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  roleId: string;
  initialRoleName: string;
  initialPermissions: string[];
};

export default function EditRoleModalDialog({
  open,
  setOpen,
  roleId,
  initialRoleName,
  initialPermissions,
}: EditRoleModalProps) {
  const handleClose = () => setOpen(false);
  const { token } = useAuth();
  const router = useRouter();
  const { editRole, isLoading: isEditing } = useRoles();

  const [roleName, setRoleName] = useState<string>(initialRoleName);
  const [permissions, setPermissions] = useState<string[]>(initialPermissions);

  useEffect(() => {
    if (open) {
      setRoleName(initialRoleName);
      setPermissions(initialPermissions);
    }
  }, [open, initialRoleName, initialPermissions]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!token) {
        notify.error("Unauthorized", {
          description: "Please login to edit a role",
        });
        router.push("/login");
        return;
      }

      // Convert all permissions to lower case
      const formattedPermissions = permissions;
      await editRole(roleName, formattedPermissions, roleId);

      notify.success("Success", {
        description: "Role updated successfully",
      });
      handleClose();
    } catch (error) {
      notify.error("Error", {
        description: "Failed to update role",
      });
      console.error(error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        className: "rounded-2xl! px-8 py-4",
        sx: {
          borderRadius: "16px",
        },
      }}
    >
      <DialogTitle className="px-0! pt-4 pb-2!">
        <h1
          className={`font-bold text-[#5479EE] text-2xl mb-2 ${poppins.className}`}
        >
          Edit Role
        </h1>
        <p className={`text-[#262B43]/90 text-[14px] ${poppins.className}`}>
          Update the details for this role
        </p>
      </DialogTitle>

      <div className="w-full h-px bg-[#E2E8F0] my-4" />

      {/* Content */}
      <form onSubmit={handleSubmit}>
        <DialogContent className="px-0! py-2! space-y-6!">
          {/* Role Name */}
          <div className="space-y-2">
            <h2
              className={`text-sm font-bold mb-1 text-[#262B43]/90 ${poppins.className}`}
            >
              Role Name
            </h2>
            <AppInput
              placeholder="Enter role name"
              isBgWhite
              fullWidth
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <h2
              className={`text-sm font-bold text-[#262B43]/90 ${poppins.className}`}
            >
              Permission
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-3 ps-3">
              {PERMISSIONS.map((permission) => (
                <div
                  key={permission}
                  className="flex items-center justify-between"
                >
                  <h2 className={`text-sm text-[#374151] ${poppins.className}`}>
                    {formatPermissionLabel(permission)}
                  </h2>
                  <AppInput
                    type="checkbox"
                    isBgWhite
                    checked={permissions.includes(permission)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPermissions([...permissions, permission]);
                      } else {
                        setPermissions(
                          permissions.filter((p) => p !== permission),
                        );
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </DialogContent>

        {/* Footer */}
        <DialogActions className="px-0! pt-8 pb-4! flex gap-3 justify-end mt-4">
          <AppButton variantStyle="outline" onClick={handleClose}>
            Cancel
          </AppButton>
          <AppButton variantStyle="primary" type="submit" isLoading={isEditing}>
            {isEditing ? "Saving..." : "Save Role"}
          </AppButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
