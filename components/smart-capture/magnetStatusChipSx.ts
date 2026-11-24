import { darkChip, darkTint } from "@/lib/constants/theme";
import type { SmartCaptureStatus } from "@/lib/models/types";

/**
 * Colours of the lead magnet status chip, in the list and on the detail
 * page: green Active, grey Draft, red otherwise. In dark mode a faint tile
 * with a lighter text instead of the pastel.
 */
export function magnetStatusChipSx(status: SmartCaptureStatus) {
  const isActive = status === "Active";
  const isDraft = status === "Draft";
  const color = isActive ? "#16A34A" : isDraft ? "#64748B" : "#EF4444";
  return {
    bgcolor: isActive ? "#DCFCE7" : isDraft ? "#F1F5F9" : "#FEE2E2",
    color,
    "&:hover": { bgcolor: isActive ? "#DCFCE7" : isDraft ? "#E2E8F0" : "#FECACA" },
    // After "&:hover", so the dark tile also wins over the pastel hover.
    ".dark &": darkChip(color),
    ".dark &:hover": { bgcolor: darkTint(color, 28) },
  };
}
