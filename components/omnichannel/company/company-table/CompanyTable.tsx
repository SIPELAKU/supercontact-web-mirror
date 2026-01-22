"use client";

import { CompanyType } from "@/lib/types/Company";
import { Chip, LinearProgress, SxProps, Theme } from "@mui/material";
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
  company: CompanyType[];
  isLoading: boolean;
  error: string | null | undefined;
}

const BASE_CHIP_STYLE: SxProps<Theme> = {
  fontSize: "12px",
  padding: "0px 8px",
  borderRadius: "9999px",
  fontWeight: 500,
};

type ChipColors = { backgroundColor: string; color: string };

type Industry = CompanyType["industry"];
type Status = CompanyType["status"];

const INDUSTRY_CHIP_STYLE: Record<Industry | "Default", ChipColors> = {
  SaaS: { backgroundColor: "#E8E4FF", color: "#6A5BF7" },
  Manufacturing: { backgroundColor: "#FFE0E0", color: "#D94B4B" },
  Logistics: { backgroundColor: "#FFF3D1", color: "#D0941F" },
  Finance: { backgroundColor: "#E2F8E8", color: "#1D8F4E" },
  Healthcare: { backgroundColor: "#DDF7FF", color: "#1C93B8" },
  Default: { backgroundColor: "#F1F5F9", color: "#334155" },
};

const STATUS_CHIP_STYLE: Record<Status | "Default", ChipColors> = {
  Connected: { backgroundColor: "#E4FFD9", color: "#3B9B2B" },
  Enriching: { backgroundColor: "#FFF5D9", color: "#D2941F" },
  Disconnected: { backgroundColor: "#FFE0E0", color: "#D94B4B" },
  Default: { backgroundColor: "#F1F5F9", color: "#334155" },
};

export const getIndustryChipStyle = (industry: Industry): SxProps<Theme> => ({
  ...BASE_CHIP_STYLE,
  ...(INDUSTRY_CHIP_STYLE[industry] ?? INDUSTRY_CHIP_STYLE.Default),
});

export const getStatusChipStyle = (status: Status): SxProps<Theme> => ({
  ...BASE_CHIP_STYLE,
  ...(STATUS_CHIP_STYLE[status] ?? STATUS_CHIP_STYLE.Default),
});

export default function CompanyTable({ company, isLoading, error }: CompanyTableProps) {
  const router = useRouter();

  const currentPath = usePathname();

  if (isLoading) return <CompanyTableSkeleton />;
  if (error) return <CompanyTableError message="" />;
  if (company.length === 0) return <CompanyTableDataNotFound />;
  return (
    <Table>
      <TableHead>
        <TableRow className="bg-[#EEF2FD]!">
          <TableCell>
            <input type="checkbox" />
          </TableCell>
          <TableCell>Company Name</TableCell>
          <TableCell>Industry</TableCell>
          <TableCell>Location</TableCell>
          <TableCell>Employees</TableCell>
          <TableCell>Insight Score</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {company?.map((company) => (
          <TableRow key={company.id} className="h-[55px]">
            <TableCell>
              <input type="checkbox" />
            </TableCell>

            <TableCell onClick={() => router.push(`${currentPath}/1`)} className="cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF2FD] text-sm font-semibold text-[#6A5BF7]">{company.name.charAt(0)}</div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{company.name}</span>
                  <span className="text-xs text-gray-500">{company.email}</span>
                </div>
              </div>
            </TableCell>

            {/* Industry chip */}
            <TableCell>
              <Chip label={company.industry} sx={getIndustryChipStyle(company.industry)} />
            </TableCell>

            <TableCell>{company.location}</TableCell>

            <TableCell>{company.employees}</TableCell>

            {/* Insight Score: bar + number */}
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="w-24">
                  <LinearProgress
                    variant="determinate"
                    value={company.insightScore}
                    sx={{
                      height: 8,
                      borderRadius: 9999,
                      backgroundColor: "#E5E7EB",

                      "& .MuiLinearProgress-bar": {
                        backgroundColor:
                          company.insightScore > 80
                            ? "#22C55E" // green-500
                            : company.insightScore > 50
                            ? "#FACC15" // yellow-400 (opsional)
                            : "#EF4444", // red-500
                      },
                    }}
                  />
                </div>
                <span className="text-sm font-semibold">{company.insightScore}</span>
              </div>
            </TableCell>

            {/* Status chip */}
            <TableCell>
              <Chip label={company.status} sx={getStatusChipStyle(company.status)} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
