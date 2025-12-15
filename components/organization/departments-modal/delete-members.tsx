"use client";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";

type DeleteMemberProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function DeleteMemberDialog({ open, setOpen }: DeleteMemberProps) {
  const handleClose = () => setOpen(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
          <Button
            variant="outlined"
            type="reset"
            className="rounded-lg! capitalize! border-red-500! text-red-500! hover:border-red-700!"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            className="rounded-lg! capitalize! bg-red-500! hover:bg-red-500/80!"
            onClick={handleClose}
          >
            Delete Member
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
