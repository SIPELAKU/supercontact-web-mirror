"use client";

import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import useDepartments from "@/lib/hooks/useDepartments";
import { useUsers } from "@/lib/hooks/useUsers";
import { useMemo } from "react";
import type { DepartmentsType } from "@/lib/types/Departments";
import { Poppins } from "next/font/google";
import { useAuth } from "@/lib/context/AuthContext";
import { notify } from "@/lib/notifications";
import { useRouter } from "next/navigation";
import { handleError } from "@/lib/utils/errorHandler";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

type EditDepartmentsDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  department: DepartmentsType;
};

export default function EditDepartmentsDialog({
  open,
  setOpen,
  department,
}: EditDepartmentsDialogProps) {
  const { token } = useAuth();
  const router = useRouter();
  const { updateDepartment, isEditing } = useDepartments();

  const [formData, setFormData] = useState({
    department: department.department,
    branch: department.branch,
    manager_id: department.manager_id || "",
  });
  const [managerName, setManagerName] = useState("");

  const { data: usersData, isLoading: isLoadingUsers } = useUsers(1, 20, managerName);

  const managerOptions = useMemo(() => {
    return (usersData?.data?.users || []).map((user) => ({
      value: user.id,
      label: `${user.fullname} (${user.email})`,
    }));
  }, [usersData]);

  useEffect(() => {
    setFormData({
      department: department.department,
      branch: department.branch,
      manager_id: department.manager_id || "",
    });
  }, [department]);

  const handleClose = () => setOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) {
        notify.error("You are not authenticated", {
          description: "Please login to edit a department",
        });
        router.push("/login");
        return;
      }
      await updateDepartment(department.id, formData);
      notify.success("Department updated successfully", {
        description: "The department has been updated successfully",
      });
      handleClose();
    } catch (error) {
      const message = handleError(error, "Updating department")
      notify.error("Error", {
        description: message,
        duration: 20000,
      });
    }
  };

  const departmentOptions = [
    { value: "Human Resources", label: "Human Resources" },
    { value: "Engineering", label: "Engineering" },
    { value: "Marketing", label: "Marketing" },
    { value: "Sales", label: "Sales" },
    { value: "Customer Support", label: "Customer Support" },
  ];

  return (
    <Dialog
      open={open}
      onClose={() => {
        setFormData({
          department: department.department,
          branch: department.branch,
          manager_id: department.manager_id || "",
        });
        setManagerName("");
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
          Edit Department
        </Typography>
      </DialogTitle>

      <div className="px-6 pb-3">
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "text.secondary" }}
        >
          Update the department’s information and settings
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
            <div className="space-y-2">
              <h2
                className={`text-sm font-semibold mb-1 text-[#262B43]/90 ${poppins.className}`}
              >
                Manager
              </h2>
              <AppAutocomplete
                options={managerOptions}
                placeholder="Search for a Manager"
                value={managerOptions.find(opt => opt.value === formData.manager_id) || null}
                onChange={(_, newValue) => {
                  setFormData({
                    ...formData,
                    manager_id: newValue && typeof newValue !== 'string' ? (newValue as any).value : ""
                  });
                }}
                onInputChange={(_, value) => setManagerName(value)}
                isBgWhite
              />
              <Typography variant="caption" className="text-gray-500 block mt-1">
                Assign an existing manager. Their manager ID will be linked automatically
              </Typography>
            </div>
          </div>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 4, pt: 2, gap: 2 }}>
          <AppButton
            variantStyle="outline"
            color="gray"
            onClick={() => {
              setFormData({
                department: department.department,
                branch: department.branch,
                manager_id: department.manager_id || "",
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
            isLoading={isEditing}
          >
            Save Changes
          </AppButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
