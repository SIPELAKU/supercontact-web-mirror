import { Input } from "@/components/ui/input";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

type AddRoleProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function AddRoleDialog({ open, setOpen }: AddRoleProps) {
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
        className: "rounded-lg! px-6 py-2 ",
      }}
    >
      <DialogTitle className="px-0! py-2!">
        <span className="font-semibold text-[#5479EE]">Add Role</span>
        <Typography component="p" variant="body2" className="mt-3! text-sm">
          Enter the details to add new role
        </Typography>
      </DialogTitle>

      <Divider />

      {/* Content */}
      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-3! px-0! pt-6 pb-8">
          <label htmlFor="role-name">Role Name</label>
          <Input placeholder="Enter role name" className="mt-2"></Input>
        </DialogContent>

        {/* Footer */}
        <DialogActions className="px-0! pb-4!">
          <Button
            variant="outlined"
            type="reset"
            onClick={() => setOpen(false)}
            className="capitalize!"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            className="bg-[#5479EE]! capitalize! hover:bg-[#5479EE]/80!"
            onClick={handleClose}
          >
            Save Role
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
