"use client";

import { CompanyIntelligenceItem } from "@/lib/types/company-intelligence";
import { Box, Chip, CircularProgress, LinearProgress, SxProps, Theme } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { usePathname, useRouter } from "next/navigation";
import CompanyTableDataNotFound from "./CompanyTableDataNotFound";
import CompanyTableError from "./CompanyTableError";
import CompanyTableSkeleton from "./CompanyTableSkeleton";

interface CompanyTableProps {
  company: CompanyIntelligenceItem[];
  isLoading: boolean;
  error: string | null | undefined;
  showAction?: boolean;
  showInsightScore?: boolean;
  onDelete?: (id: string) => void;
  onRowClick?: (id: string) => void;
  selectedIds?: string[];
  onSelectOne?: (id: string) => void;
  onSelectAll?: (checked: boolean) => void;
}

const BASE_CHIP_STYLE: SxProps<Theme> = {
  fontSize: "12px",
  padding: "0px 8px",
  borderRadius: "9999px",
  fontWeight: 500,
  minWidth: "80px", // Ensure consistent width
  justifyContent: "center",
};

type ChipColors = { backgroundColor: string; color: string };

// Dynamic color generation based on string hash
const getDynamicChipStyle = (label: string): SxProps<Theme> => {
  if (!label) return BASE_CHIP_STYLE;

  const colors = [
    { backgroundColor: "#E8E4FF", color: "#6A5BF7" }, // Purple
    { backgroundColor: "#FFE0E0", color: "#D94B4B" }, // Red
    { backgroundColor: "#FFF3D1", color: "#D0941F" }, // Orange
    { backgroundColor: "#E2F8E8", color: "#1D8F4E" }, // Green
    { backgroundColor: "#DDF7FF", color: "#1C93B8" }, // Blue
    { backgroundColor: "#FCE7F3", color: "#DB2777" }, // Pink
    { backgroundColor: "#E0F2FE", color: "#0284C7" }, // Sky
  ];

  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  // Special case for "Success" or similar known statuses if needed, otherwise random
  if (label.toLowerCase() === 'success') return { ...BASE_CHIP_STYLE, backgroundColor: "#E6F4EA", color: "#1E8E3E" };
  if (label.toLowerCase() === 'failed') return { ...BASE_CHIP_STYLE, backgroundColor: "#FCE8E6", color: "#C5221F" };
  if (label.toLowerCase() === 'enriching') return { ...BASE_CHIP_STYLE, backgroundColor: "#FFF7E0", color: "#D97706" };

  return {
    ...BASE_CHIP_STYLE,
    ...colors[index],
  };
};

import { Trash2 } from "lucide-react";

export default function CompanyTable({
  company,
  isLoading,
  error,
  showAction = false,
  showInsightScore = true,
  onDelete,
  onRowClick,
  selectedIds = [],
  onSelectOne,
  onSelectAll
}: CompanyTableProps) {
  const router = useRouter();
  const currentPath = usePathname();

  if (error) return <CompanyTableError message="Failed to load company data" />;

  return (
    <Table>
      <TableHead>
        <TableRow className="bg-[#EEF2FD]!">
          <TableCell>
            <input
              type="checkbox"
              checked={company.length > 0 && selectedIds.length === company.length}
              ref={(input) => {
                if (input) {
                  input.indeterminate = selectedIds.length > 0 && selectedIds.length < company.length;
                }
              }}
              onChange={(e) => onSelectAll?.(e.target.checked)}
              disabled={company.length === 0}
            />
          </TableCell>
          <TableCell>Company Name</TableCell>
          <TableCell>Industry</TableCell>
          <TableCell>Location</TableCell>
          <TableCell>Employees</TableCell>
          {showInsightScore && <TableCell>Insight Score</TableCell>}
          <TableCell>Status</TableCell>
          {showAction && <TableCell>Action</TableCell>}
        </TableRow>
      </TableHead>

      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={showInsightScore ? (showAction ? 8 : 7) : (showAction ? 7 : 6)} sx={{ p: 0 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 120,
                }}
              >
                <CircularProgress size={30} />
              </Box>
            </TableCell>
          </TableRow>
        ) : !company || company.length === 0 ? (
          <CompanyTableDataNotFound />
        ) : (
          company?.map((item) => (
            <TableRow
              key={item.id}
              className={`h-[55px] ${onRowClick ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}`}
              onClick={() => onRowClick?.(item.id)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => onSelectOne?.(item.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF2FD] text-sm font-semibold text-[#6A5BF7]">
                    {item.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{item.name}</span>
                    <span className="text-xs text-gray-500">{item.ticker || item.domain || 'N/A'}</span>
                  </div>
                </div>
              </TableCell>

              {/* Industry chip */}
              <TableCell>
                <Chip label={item.industry || 'N/A'} sx={getDynamicChipStyle(item.industry || 'N/A')} />
              </TableCell>

              <TableCell>{item.location || 'N/A'}</TableCell>

              <TableCell>
                {/* Handle range string if API returns it, otherwise format number */}
                {typeof item.employee_count === 'string' ? item.employee_count : `${item.employee_count?.toLocaleString() || '-'}`}
              </TableCell>

              {/* Insight Score: bar + number */}
              {showInsightScore && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-24">
                      <LinearProgress
                        variant="determinate"
                        value={item.match_score || 0}
                        sx={{
                          height: 8,
                          borderRadius: 9999,
                          backgroundColor: "#E5E7EB",

                          "& .MuiLinearProgress-bar": {
                            backgroundColor:
                              (item.match_score || 0) > 80
                                ? "#22C55E" // green-500
                                : (item.match_score || 0) > 50
                                  ? "#FACC15" // yellow-400 (opsional)
                                  : "#EF4444", // red-500
                          },
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold">{item.match_score || 0}</span>
                  </div>
                </TableCell>
              )}

              {/* Status chip */}
              <TableCell>
                <Chip label={item.status || item.financial_status || 'N/A'} sx={getDynamicChipStyle(item.status || item.financial_status || 'N/A')} />
              </TableCell>

              {showAction && (
                <TableCell>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(item.id);
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </TableCell>
              )}
            </TableRow>
          )))}
      </TableBody>
    </Table>
  );
}
