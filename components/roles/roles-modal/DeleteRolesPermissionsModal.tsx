"use client";

import { AppButton } from "@/components/ui/app-button";
import { useAuth } from "@/lib/context/AuthContext";
import useRoles from "@/lib/hooks/useRoles";
import { notify } from "@/lib/notifications";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";

type DeleteRolesPermissionsProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  roleId: string;
};

export default function DeleteRolesPermissionsModal({
  open,
  setOpen,
  roleId,
}: DeleteRolesPermissionsProps) {
  const handleClose = () => setOpen(false);
  const { token } = useAuth();
  const router = useRouter();
  const { deleteRole, isDeleting } = useRoles();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      handleClose();
    } catch (error) {
      notify.error("Failed to delete role", {
        description: "Please try again later",
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        className: "rounded-lg!",
      }}
    >
      <DialogTitle className="relative px-8 pt-8 pb-4">
        <span className="font-semibold text-red-500">
          Are you sure you want to delete this role?
        </span>
        <Typography
          component="p"
          variant="body2"
          className="mt-1 text-sm text-gray-500"
        >
          This action is permanent and cannot be undone
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogActions className="mr-2.5! py-6!">
          <AppButton
            variantStyle="outline"
            color="danger"
            type="reset"
            onClick={() => setOpen(false)}
          >
            Cancel
          </AppButton>
          <AppButton
            variantStyle="danger"
            color="danger"
            type="submit"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Role"}
          </AppButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
