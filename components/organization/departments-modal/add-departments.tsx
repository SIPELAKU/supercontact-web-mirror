"use client";

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import useDepartments from "@/lib/hooks/useDepartments";
import { Poppins } from "next/font/google";
import { useAuth } from "@/lib/context/AuthContext";
import { notify } from "@/lib/notifications";
import { useRouter } from "next/navigation";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

type AddDepartmentDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function AddDepartmentDialog({
  open,
  setOpen,
}: AddDepartmentDialogProps) {
  const { token } = useAuth();
  const router = useRouter();
  const { addDepartment, isAdding } = useDepartments();
  const [formData, setFormData] = useState({
    department: "",
    branch: "",
    // manager_name: "",
  });

  const handleClose = () => setOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) {
        notify.error("You are not authenticated", {
          description: "Please login to add a department",
        });
        router.push("/login");
        return;
      }
      await addDepartment(formData);
      notify.success("Department added successfully", {
        description: "The department has been added successfully",
      });
      // reset form
      setFormData({
        department: "",
        branch: "",
        // manager_name: "",
      });
      handleClose();
    } catch (error) {
      console.error("Failed to add department:", error);
      notify.error("Failed to add department", {
        description: "Please try again",
      });
    }
  };

  const departmentOptions = [
    { value: "Human Resources", label: "Human Resources" },
    { value: "Engineering", label: "Engineering" },
    { value: "Marketing", label: "Marketing" },
    { value: "Sales", label: "Sales" },
    { value: "Finance", label: "Finance" },
    { value: "Customer Support", label: "Customer Support" },
  ];

  return (
    <Dialog
      open={open}
      onClose={() => {
        setFormData({
          department: "",
          branch: "",
          // manager_name: "",
        });
        handleClose();
      }}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: "16px", p: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#5479EE" }}>
          Add Department
        </Typography>
      </DialogTitle>

      <div className="px-6 pb-3">
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "text.secondary" }}
        >
          Enter the details to add a new department
        </Typography>
      </div>

      <Divider />

      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Department */}
            <div className="space-y-2">
              <h2
                className={`text-sm font-semibold mb-1 text-[#262B43]/90 ${poppins.className}`}
              >
                Department
              </h2>
              <AppSelect
                placeholder="Select department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    department: e.target.value as string,
                  })
                }
                options={departmentOptions}
                isBgWhite
              />
            </div>

            {/* Branch */}
            <div className="space-y-2">
              <h2
                className={`text-sm font-semibold mb-1 text-[#262B43]/90 ${poppins.className}`}
              >
                Branch
              </h2>
              <AppInput
                placeholder="e.q Headquarters"
                value={formData.branch}
                onChange={(e) =>
                  setFormData({ ...formData, branch: e.target.value })
                }
                isBgWhite
              />
            </div>
            {/* Manager */}
            {/* <AppInput
              label="Manager"
              placeholder="Search for a Manager"
              value={formData.manager_name}
              onChange={(e) =>
                setFormData({ ...formData, manager_name: e.target.value })
              }
              startIcon={<Search size={18} className="text-gray-500" />}
              helperText="Assign an existing manager. Their manager ID will be linked automatically"
              isBgWhite
            /> */}
          </div>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 4, pt: 2, gap: 2 }}>
          <AppButton
            variantStyle="outline"
            color="gray"
            onClick={() => {
              setFormData({
                department: "",
                branch: "",
                // manager_name: "",
              });
              handleClose();
            }}
            sx={{ px: 4 }}
          >
            Cancel
          </AppButton>

          <AppButton
            variantStyle="primary"
            type="submit"
            sx={{ px: 4 }}
            isLoading={isAdding}
          >
            Save Department
          </AppButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
