import { useState } from "react";
import { Chip, Menu, MenuItem } from "@mui/material";
import { AppButton } from "@/components/ui/app-button";
import { SmartCapture, SmartCaptureStatus } from "@/lib/models/types";
import { Trash2, ChevronDown, Archive, Play, Pause } from "lucide-react";
import { useUpdateSmartCaptureStatus } from "@/lib/hooks/useSmartCaptures";
import { notify } from "@/lib/notifications";

interface DetailHeaderProps {
  data: SmartCapture;
  onEdit: () => void;
  onDelete: () => void;
}

export const DetailHeader = ({ data, onDelete }: DetailHeaderProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { mutate, isPending } = useUpdateSmartCaptureStatus();

  const status = data.status;
  const isActive = status === 'Active';
  const isDraft = status === 'Draft';
  const isInactive = status === 'Inactive';
  const isArchived = status === 'Archived';

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    // if (isActive) {
    //   notify.info("Active campaigns are locked and cannot be changed.");
    //   return;
    // }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (newStatus: SmartCaptureStatus) => {
    mutate({ ids: [data.id], status: newStatus }, {
      onSuccess: () => {
        notify.success(`Status updated to ${newStatus}`);
        handleClose();
      },
      onError: (err: any) => {
        notify.error(err.message || "Failed to update status");
      }
    });
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{data.name}</h1>
            <div className="relative">
              <Chip
                label={isPending ? "Updating..." : status}
                size="small"
                onClick={handleClick}
                icon={!isPending ? <ChevronDown size={14} /> : undefined}
                disabled={isPending}
                sx={{
                  bgcolor: isActive ? '#DCFCE7' : isDraft ? '#F1F5F9' : '#FEE2E2',
                  color: isActive ? '#16A34A' : isDraft ? '#64748B' : '#EF4444',
                  fontWeight: 600,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  '&:hover': {
                    bgcolor: isActive ? '#DCFCE7' : isDraft ? '#E2E8F0' : '#FECACA',
                  },
                  transition: 'all 0.2s',
                  '.MuiChip-icon': {
                    color: 'inherit',
                    ml: 0.5,
                    mr: -0.5,
                  }
                }}
              />
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                    border: '1px solid #F1F5F9',
                    minWidth: '140px',
                  }
                }}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              >
                {!isActive && (
                  <MenuItem
                    onClick={() => handleStatusChange('Active')}
                    disabled={isActive}
                    sx={{ fontSize: '13px', fontWeight: 500, py: 1.5, color: '#16A34A' }}
                  >
                    Set as Active
                  </MenuItem>
                )}
                {!isInactive && (
                  <MenuItem
                    onClick={() => handleStatusChange('Inactive')}
                    disabled={isInactive}
                    sx={{ fontSize: '13px', fontWeight: 500, py: 1.5, color: '#EF4444' }}
                  >
                    Set as Inactive
                  </MenuItem>
                )}
                {/* {!isDraft && (
                  <MenuItem
                    onClick={() => handleStatusChange('Draft')}
                    disabled={isDraft}
                    sx={{ fontSize: '13px', fontWeight: 500, py: 1.5, color: '#64748B' }}
                  >
                    Set as Draft
                  </MenuItem>
                )} */}
                {!isArchived && (
                  <MenuItem
                    onClick={() => handleStatusChange('Archived')}
                    disabled={isArchived}
                    sx={{ fontSize: '13px', fontWeight: 500, py: 1.5, color: '#64748B' }}
                  >
                    Set as Archived
                  </MenuItem>
                )}
              </Menu>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Magnet Code: <span className="font-mono">{data.code}</span> • Created on {new Date(data.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        {!isActive && (
          <AppButton
            onClick={() => handleStatusChange('Active')}
            color="success"
            variantStyle="primary"
            startIcon={<Play size={16} />}
            className="flex-1 md:flex-none"
            disabled={isPending}
          >
            {isDraft ? "Publish" : "Activate"}
          </AppButton>
        )}
        {isActive && (
          <>
            <AppButton
              onClick={() => handleStatusChange('Inactive')}
              color="danger"
              variantStyle="outline"
              startIcon={<Pause size={16} />}
              className="flex-1 md:flex-none"
              disabled={isPending}
            >
              Deactivate
            </AppButton>
            <AppButton
              onClick={() => handleStatusChange('Archived')}
              color="gray"
              variantStyle="outline"
              startIcon={<Archive size={16} />}
              className="flex-1 md:flex-none"
              disabled={isPending}
            >
              Archive
            </AppButton>
          </>
        )}
        <AppButton
          onClick={onDelete}
          color="danger"
          variantStyle="outline"
          startIcon={<Trash2 size={16} />}
          className="flex-1 md:flex-none"
        >
          Delete
        </AppButton>
      </div>
    </div>
  );
};
