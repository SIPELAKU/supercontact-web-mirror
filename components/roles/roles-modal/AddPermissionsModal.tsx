import { Input } from "@/components/ui/input";
import { Autocomplete, Chip, TextField } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

type AddPermissionsProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const BASE_CHIP_STYLE = {
  fontSize: "12px",
  padding: "0px 6px",
  borderRadius: "12px",
  fontWeight: 500,
};

const ROLE_COLOR_STYLE: Record<string, { backgroundColor: string; color: string }> = {
  Administrator: { backgroundColor: "#E8E4FF", color: "#6A5BF7" },
  Manager: { backgroundColor: "#FFE9C7", color: "#D0941F" },
  Support: { backgroundColor: "#DDF7FF", color: "#2BA8C8" },
  "Restricted User": { backgroundColor: "#FFE0E0", color: "#E45353" },
  Default: { backgroundColor: "#F1F1F1", color: "#666666" },
};

const getChipStyle = (role: string) => ({
  ...BASE_CHIP_STYLE,
  ...(ROLE_COLOR_STYLE[role] || ROLE_COLOR_STYLE.Default),
});

export default function AddPermissionsDialog({ open, setOpen }: AddPermissionsProps) {
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
        <span className="font-semibold text-[#5479EE]">Add Permissions</span>
        <Typography component="p" variant="body2" className="mt-3! text-sm">
          Enter the details to add new permissions
        </Typography>
      </DialogTitle>

      <Divider />

      {/* Content */}
      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-3! px-0! pt-6 pb-8">
          <div>
            <label htmlFor="permission-name">Permission Name</label>
            <Input placeholder="Enter permission name" className="mt-2"></Input>
          </div>
          <div>
            <label htmlFor="assigned">Role Access</label>
            <Autocomplete
              multiple
              options={["Administrator", "Manager", "Support", "Restricted User"]}
              // value={assigned}
              // onChange={(_, newValue) => setAssigned(newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const tagProps = getTagProps({ index });
                  const { key, ...restTagProps } = tagProps;

                  return <Chip key={key} label={option} variant="filled" {...restTagProps} sx={getChipStyle(option)} />;
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Add roles"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "7px",
                      marginTop: "8px",
                      paddingX: "12px",
                      paddingY: "1px",
                      fontSize: "14px",
                    },
                    "& .MuiButtonBase-root": {
                      height: "20px",
                    },
                    "& .MuiChip-label": {
                      paddingX: "8px",
                    },
                    "& .MuiSvgIcon-root": {
                      width: "12px",
                      height: "12px",
                    },
                  }}
                />
              )}
            />
          </div>
        </DialogContent>

        {/* Footer */}
        <DialogActions className="px-0! pb-4!">
          <Button variant="outlined" type="reset" onClick={() => setOpen(false)} className="capitalize!">
            Cancel
          </Button>
          <Button variant="contained" type="submit" className="bg-[#5479EE]! capitalize! hover:bg-[#5479EE]/80!" onClick={handleClose}>
            Save Permissions
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
