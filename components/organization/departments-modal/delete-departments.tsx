"use client";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { AppButton } from "@/components/ui/app-button";
import useDepartments from "@/lib/hooks/useDepartments";
import { notify } from "@/lib/notifications";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";

type DeleteDepartmentProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  departmentId?: string;
};

export default function DeleteDepartmentDialog({
  open,
  setOpen,
  departmentId,
}: DeleteDepartmentProps) {
  const { deleteDepartment, isDeleting } = useDepartments();
  const { token } = useAuth();
  const router = useRouter();

  const handleClose = () => setOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (departmentId) {
      try {
        if (!token) {
          notify.error("No authentication token", {
            description: "Please login to continue",
          });
          router.push("/login");
          return;
        }
        await deleteDepartment(departmentId);
        notify.success("Department deleted successfully");
        handleClose();
      } catch (error) {
        console.error("Failed to delete department:", error);
        notify.error("Failed to delete department");
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: { borderRadius: "12px", p: 1 },
      }}
    >
      <DialogTitle sx={{ pt: 4, px: 4 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: "error.main", mb: 1 }}
        >
          Are you sure you want to delete this department?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This action is permanent and cannot be undone
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogActions sx={{ px: 4, pb: 4, pt: 2, gap: 2 }}>
          <AppButton
            variantStyle="outline"
            color="danger"
            onClick={handleClose}
          >
            Cancel
          </AppButton>
          <AppButton variantStyle="danger" type="submit" isLoading={isDeleting}>
            Delete
          </AppButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
