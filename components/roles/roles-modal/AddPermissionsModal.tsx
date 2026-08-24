import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { Chip } from "@mui/material";
import { AppAutocomplete } from "@/components/ui/app-autocomplete";
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

const ROLE_COLOR_STYLE: Record<
  string,
  { backgroundColor: string; color: string }
> = {
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

export default function AddPermissionsDialog({
  open,
  setOpen,
}: AddPermissionsProps) {
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
            <AppInput
              label="Permission Name"
              placeholder="Enter permission name"
              fullWidth
            />
          </div>
          <div>
            <AppAutocomplete
              multiple
              isBgWhite
              label="Role Access"
              placeholder="Add roles"
              options={[
                "Administrator",
                "Manager",
                "Support",
                "Restricted User",
              ]}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const tagProps = getTagProps({ index });
                  const { key, ...restTagProps } = tagProps;

                  return (
                    <Chip
                      key={key}
                      label={option}
                      variant="filled"
                      {...restTagProps}
                      sx={getChipStyle(option)}
                    />
                  );
                })
              }
            />
          </div>
        </DialogContent>

        {/* Footer */}
        <DialogActions className="px-0! pb-4! gap-3">
          <AppButton
            variantStyle="outline"
            color="gray"
            type="reset"
            onClick={() => setOpen(false)}
            fullWidth
          >
            Cancel
          </AppButton>
          <AppButton
            variantStyle="primary"
            type="submit"
            onClick={handleClose}
            fullWidth
          >
            Save Permissions
          </AppButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
