import React, { useState } from "react";
import { Maximize2, X } from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
} from "@mui/material";

interface ErrorDetail {
  field: string;
  message: string;
}

interface ApiErrorDisplayProps {
  errors: ErrorDetail[];
  maxHeight?: string;
}

/**
 * A specialized component to display a list of API validation errors.
 * Designed to be used inside alert descriptions or notifications.
 */
export const ApiErrorDisplay: React.FC<ApiErrorDisplayProps> = ({
  errors,
  maxHeight = "200px"
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!errors || errors.length === 0) return null;

  const ErrorList = ({ isModal = false }: { isModal?: boolean }) => (
    <div className={`space-y-2.5 ${isModal ? "p-1" : ""}`}>
      {errors.map((err, i) => (
        <div
          key={i}
          className={`border-l-2 pl-3 py-0.5 transition-all ${isModal
              ? "border-red-200 hover:border-red-400 bg-red-50/30 rounded-r"
              : "border-white/20 hover:border-white/40"
            }`}
        >
          <div className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${isModal ? "text-red-600/70" : "text-white/60"
            }`}>
            {err.field.replace(/_/g, " ")}
          </div>
          <div className={`text-[13px] font-medium leading-snug ${isModal ? "text-gray-800" : "text-white"
            }`}>
            {err.message}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div
        className="mt-2 overflow-y-auto pr-2 custom-scrollbar"
        style={{ maxHeight }}
      >
        <ErrorList />

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
          }
        `}</style>
      </div>

      {errors.length > 2 && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFullScreen(true);
          }}
          className="mt-3 flex items-center gap-1.5 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] font-bold uppercase tracking-wider text-white transition-all border border-white/10"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          View All {errors.length} Errors
        </button>
      )}

      <Dialog
        open={isFullScreen}
        onClose={() => setIsFullScreen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '12px' }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#FEE2E2' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, bgcolor: '#F34E4E', borderRadius: '8px', display: 'flex' }}>
              <X className="w-5 h-5 text-white" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Validation Errors Detail
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => setIsFullScreen(false)}
            sx={{ color: '#991B1B' }}
          >
            <X className="w-6 h-6" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ mb: 3, color: '#6B7280', fontWeight: 500 }}>
            Found {errors.length} validation issues that need to be fixed before proceeding.
          </Typography>
          <Box sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 1 }}>
            <ErrorList isModal />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
