"use client";

import { Box, Typography } from "@mui/material";

// Centered placeholder rendered inside a ChartCard when the series array
// for a chart comes back empty - keeps cards from showing a bare axis grid.
export function ChartEmptyState({ height = 260 }: { height?: number }) {
    return (
        <Box
            sx={{
                height,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Typography variant="body2" sx={{ color: "text.disabled" }}>
                No data for this period
            </Typography>
        </Box>
    );
}

// Null-safe minutes formatter: null/undefined -> null (caller renders the
// em dash), under an hour -> "42m", otherwise -> "3h 24m".
export function formatMinutes(value: number | null | undefined): string | null {
    if (value === null || value === undefined || Number.isNaN(value)) return null;
    const total = Math.round(value);
    if (total < 60) return `${total}m`;
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    return `${hours}h ${mins}m`;
}

// Shared em dash for null-safe cells/stats.
export const DASH = "—";
