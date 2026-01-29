"use client";

import { AppButton } from "@/components/ui/app-button";
import { deleteMember } from "@/lib/api/departments";
import { useAuth } from "@/lib/context/AuthContext";
import useDepartments, { useDeleteMember } from "@/lib/hooks/useDepartments";
import { notify } from "@/lib/notifications";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";

type DeleteMemberProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  memberId: string;
  departmentId: string;
};

export default function DeleteMemberDialog({
  open,
  setOpen,
  memberId,
  departmentId,
}: DeleteMemberProps) {
  const handleClose = () => setOpen(false);
  const { token } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (memberId && departmentId) {
      try {
        if (!token) {
          notify.error("No authentication token", {
            description: "Please login to continue",
          });
          router.push("/login");
          return;
        }
        useDeleteMember(departmentId, memberId);
        notify.success("Member deleted successfully");
        handleClose();
      } catch (error) {
        console.error("Failed to delete department:", error);
        notify.error("Failed to delete member");
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
        className: "rounded-lg!",
      }}
    >
      <DialogTitle className="relative px-8 pt-8 pb-4">
        <span className="font-semibold text-red-500">
          Are you sure you want to delete this member?
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
            type="reset"
            onClick={() => setOpen(false)}
          >
            Cancel
          </AppButton>
          <AppButton variantStyle="danger" type="submit">
            Delete Member
          </AppButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
