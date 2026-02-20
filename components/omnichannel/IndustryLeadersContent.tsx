"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Grid, Paper, Divider, Stack } from "@mui/material";
import { Info, Crown, MapPin, Users, TrendingUp } from "lucide-react";
import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import { AppSelect } from "@/components/ui/app-select";
import { INDUSTRY_OPTIONS } from "@/lib/data/company-intelligence-options";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchIndustryLeaders } from "@/lib/api/company-intelligence";
import { IndustryLeadersGroup, IndustryLeader } from "@/lib/types/company-intelligence";
import { Loader2 } from "lucide-react";

export default function IndustryLeadersContent() {
    const { getToken } = useAuth();
    const [selectedIndustry, setSelectedIndustry] = useState<string>("");
    const [industryGroups, setIndustryGroups] = useState<IndustryLeadersGroup[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchData = async () => {
        setIsLoading(true);
        setError("");
        try {
            const token = await getToken();
            const data = await fetchIndustryLeaders(token, selectedIndustry || undefined);
            setIndustryGroups(data);
        } catch (err: any) {
            console.error("Failed to fetch industry leaders:", err);
            setError(err.message || "Failed to fetch industry leaders");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedIndustry]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Analysis Logic Info Box */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    bgcolor: "aliceblue",
                    border: "1px solid",
                    borderColor: "blue.100",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <TrendingUp className="text-blue-600" size={20} />
                <Typography variant="body2" color="blue.800">
                    <Box component="span" fontWeight="bold">Analysis logic :</Box> Leader are determind automatically by comparing the <Box component="span" fontWeight="bold">Employee Count</Box> of "Completed" companies in the main table. Add new companies to see this change!
                </Typography>
            </Paper>

            {/* Filter Row */}
            <Box sx={{ width: 220 }}>
                <AppAutocomplete
                    options={INDUSTRY_OPTIONS}
                    value={selectedIndustry}
                    onChange={(e, newValue) => setSelectedIndustry(newValue as string)}
                    placeholder="Industry"
                    size="small"
                    isBgWhite
                />
            </Box>

            {/* Grid of Leaders */}
            {isLoading ? (
                <Box display="flex" justifyContent="center" py={8}>
                    <Loader2 className="animate-spin text-blue-600" size={48} />
                </Box>
            ) : error ? (
                <Typography color="error" textAlign="center" py={4}>
                    {error}
                </Typography>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {industryGroups.map((group) => (
                        <Box key={group.industry}>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                {group.industry}
                            </Typography>
                            <Grid container spacing={3}>
                                {group.leaders.map((leader) => (
                                    <Grid item xs={12} sm={6} md={4} key={leader.company_id}>
                                        <LeaderCard leader={leader} industryLabel={group.industry} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    ))}
                    {industryGroups.length === 0 && !isLoading && (
                        <Typography variant="body1" color="text.secondary" textAlign="center" py={8}>
                            No industry leaders found.
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
}

function LeaderCard({ leader, industryLabel }: { leader: IndustryLeader; industryLabel: string }) {
    // Determine crown color based on rank
    const crownColor = leader.rank === 1 ? "#FFD700" : leader.rank === 2 ? "#C0C0C0" : "#CD7F32";

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
                }
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box
                    sx={{
                        px: 1,
                        py: 0.25,
                        bgcolor: "action.hover",
                        borderRadius: 1,
                        fontSize: "0.6875rem",
                        color: "text.secondary",
                        fontWeight: 600,
                        textTransform: "uppercase"
                    }}
                >
                    {industryLabel}
                </Box>
                <Crown size={20} color={crownColor} />
            </Box>

            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2, color: "text.primary" }}>
                {leader.name}
            </Typography>

            <Box
                sx={{
                    bgcolor: "action.hover",
                    borderRadius: 2,
                    p: 1.5,
                    mb: 2.5,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 1.5
                }}
            >
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                        Size Class
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                        {leader.employee_range}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                        Market Pos
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                        #{leader.rank} {leader.market_position}
                    </Typography>
                </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, lineClamp: 3, display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3 }}>
                {leader.description}
            </Typography>
        </Paper>
    );
}
