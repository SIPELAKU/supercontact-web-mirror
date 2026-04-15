import { Chip } from "@mui/material";
import { AppButton } from "@/components/ui/app-button";
import { LeadMagnet } from "../../LeadMagnetsTable";
import { Edit, Trash2 } from "lucide-react";

interface DetailHeaderProps {
  data: LeadMagnet;
  onEdit: () => void;
  onDelete: () => void;
}

export const DetailHeader = ({ data, onEdit, onDelete }: DetailHeaderProps) => {
  const isActive = data.status === 'Active';

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
            <Chip
              label={data.status}
              size="small"
              sx={{
                bgcolor: isActive ? '#DCFCE7' : '#F1F5F9',
                color: isActive ? '#16A34A' : '#64748B',
                fontWeight: 600,
                borderRadius: '6px',
                fontSize: '0.75rem',
              }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Magnet ID: <span className="font-mono">{data.id}</span> • Created on April 12, 2026
          </p>
        </div>
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        {/* <AppButton
          onClick={onEdit}
          variantStyle="outline"
          startIcon={<Edit size={16} />}
          className="flex-1 md:flex-none"
        >
          Edit
        </AppButton> */}
        <AppButton
          onClick={onDelete}
          variantStyle="outline"
          className="flex-1 md:flex-none !text-red-500 !border-red-200 hover:!bg-red-50"
          startIcon={<Trash2 size={16} />}
        >
          Delete
        </AppButton>
      </div>
    </div>
  );
};
