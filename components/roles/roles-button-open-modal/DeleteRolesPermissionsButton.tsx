"use client";

import { DeleteButton } from "@/components/ui/app-action-buttons-table";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { useAuth } from "@/lib/context/AuthContext";
import useRoles from "@/lib/hooks/useRoles";
import { notify } from "@/lib/notifications";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteRolesPermissionsButton({
  roleId,
  roleName,
}: {
  roleId: string;
  roleName: string;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const { token } = useAuth();
  const router = useRouter();
  const { deleteRole, isDeleting } = useRoles();

  const handleOpen = () => {
    setOpen(true);
  };

  // Ported as-is from the deleted DeleteRolesPermissionsModal
  const handleConfirmDelete = () => {
    try {
      if (!token) {
        notify.error("You are not authenticated", {
          description: "Please login to continue",
        });
        router.push("/login");
        return;
      }

      deleteRole(roleId);
      notify.success("Role deleted successfully");
      setOpen(false);
    } catch (error) {
      notify.error("Failed to delete role", {
        description: "Please try again later",
      });
    }
  };

  return (
    <>
      <DeleteButton onClick={handleOpen} disabled={roleName === "Staff" || roleName === "Manager" || roleName === "Admin"} customTitle={roleName === "Staff" || roleName === "Manager" || roleName === "Admin" ? "default role" : "Edit Permissions"} />

      <ConfirmationPopup
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this role?"
        description="This action is permanent and cannot be undone"
        confirmText="Delete Role"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
