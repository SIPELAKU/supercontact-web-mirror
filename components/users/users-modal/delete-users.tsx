"use client";

import { AppButton } from "@/components/ui/app-button";
import { useAuth } from "@/lib/context/AuthContext";
import { useDeleteManagedUser } from "@/lib/hooks/useManagedUser";
import { notify } from "@/lib/notifications";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";

type DeleteUserProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  managedUserId: string | undefined;
};

export default function DeleteUserDialog({
  open,
  setOpen,
  managedUserId,
}: DeleteUserProps) {
  const handleClose = () => setOpen(false);
  const { mutateAsync: deleteManagedUser, isPending: isSubmitting } =
    useDeleteManagedUser();
  const { token } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managedUserId) {
      notify.error("Please select a user.");
      return;
    }

    if (!token) {
      notify.error("You are not authorized to delete this user.", {
        description: "Please login first.",
      });
      router.push("/login");
      return;
    }

    try {
      const response = await deleteManagedUser(managedUserId);
      console.log("response", response);
      notify.success("User deleted successfully");
      handleClose();
    } catch (error: any) {
      console.log("error", error);
      console.error("Failed to delete user:", error);
      notify.error("Failed to edit user: ", {
        description: error.message || "Failed to edit user",
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
        sx: {
          borderRadius: 3,
          p: 1,
          boxShadow: 3,
        },
      }}
    >
      <DialogTitle className="relative px-8 pt-8 pb-6">
        <span className="font-semibold text-red-500">
          Are you sure you want to delete this user?
        </span>
        <Typography
          component="p"
          variant="body2"
          className="mt-3 text-sm text-gray-500"
        >
          This action is permanent and cannot be undone
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogActions className="mr-2.5! py-6!">
          <AppButton
            variantStyle="outline"
            color="danger"
            onClick={() => setOpen(false)}
          >
            Cancel
          </AppButton>
          <AppButton
            variantStyle="danger"
            color="danger"
            type="submit"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Deleting..." : "Delete User"}
          </AppButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
