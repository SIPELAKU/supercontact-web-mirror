"use client";

import Link from "next/link";
import { Box, Container, Typography, Paper, Stack, Button, Chip } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export interface CompareRow {
    dim: string;
    smartsales: string;
    competitor: string;
}
export interface CompareData {
    competitor: string;
    heroTitle: string;
    heroSubtitle: string;
    intro: string;
    rows: CompareRow[];
    chooseSmartSales: string[];
    chooseCompetitor: string[];
}

export default function ComparisonClient({ data }: { data: CompareData }) {
    return (
        <Box sx={{ bgcolor: "white" }}>
            <Navbar />

            {/* Hero */}
            <Box sx={{ pt: { xs: 12, md: 16 }, pb: { xs: 6, md: 8 }, background: "var(--gradient-brand)", color: "white", textAlign: "center" }}>
                <Container maxWidth="md">
                    <Chip label="PERBANDINGAN" size="small" sx={{ bgcolor: "rgba(255,255,255,.18)", color: "white", fontWeight: 700, letterSpacing: 1, mb: 2 }} />
                    <Typography variant="h1" sx={{ fontWeight: 800, fontSize: { xs: "2rem", md: "2.9rem" }, lineHeight: 1.1, mb: 2 }}>
                        {data.heroTitle}
                    </Typography>
                    <Typography sx={{ fontSize: "1.125rem", opacity: 0.92, lineHeight: 1.7, maxWidth: 640, mx: "auto" }}>
                        {data.heroSubtitle}
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
                <Typography variant="body1" sx={{ fontSize: "1.1rem", color: "#334155", lineHeight: 1.8, mb: 5 }}>
                    {data.intro}
                </Typography>

                {/* Tabel perbandingan */}
                <Box sx={{ overflowX: "auto", borderRadius: "16px", border: "1px solid #E2E8F0", mb: 5 }}>
                    <Box component="table" sx={{ width: "100%", minWidth: 560, borderCollapse: "collapse" }}>
                        <Box component="thead">
                            <Box component="tr">
                                <Box component="th" sx={{ textAlign: "left", p: 2, bgcolor: "var(--surface-alt)", color: "#0F172A", fontWeight: 700, borderBottom: "2px solid #E2E8F0", width: "26%" }} />
                                <Box component="th" sx={{ textAlign: "left", p: 2, bgcolor: "var(--surface-tint)", color: "var(--brand-deep)", fontWeight: 800, borderBottom: "2px solid #E2E8F0" }}>SmartSales</Box>
                                <Box component="th" sx={{ textAlign: "left", p: 2, bgcolor: "var(--surface-alt)", color: "#0F172A", fontWeight: 800, borderBottom: "2px solid #E2E8F0" }}>{data.competitor}</Box>
                            </Box>
                        </Box>
                        <Box component="tbody">
                            {data.rows.map((r, i) => (
                                <Box component="tr" key={i}>
                                    <Box component="td" sx={{ p: 2, fontWeight: 700, color: "#0F172A", verticalAlign: "top", borderBottom: i === data.rows.length - 1 ? "none" : "1px solid #E2E8F0" }}>{r.dim}</Box>
                                    <Box component="td" sx={{ p: 2, color: "#334155", lineHeight: 1.6, verticalAlign: "top", bgcolor: "rgba(89,124,255,.04)", borderBottom: i === data.rows.length - 1 ? "none" : "1px solid #E2E8F0" }}>{r.smartsales}</Box>
                                    <Box component="td" sx={{ p: 2, color: "#334155", lineHeight: 1.6, verticalAlign: "top", borderBottom: i === data.rows.length - 1 ? "none" : "1px solid #E2E8F0" }}>{r.competitor}</Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>

                {/* Kapan pilih mana */}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mb: 5 }}>
                    <Paper elevation={0} sx={{ p: 3.5, borderRadius: "16px", border: "1px solid #E2E8F0", borderTop: "4px solid #597CFF" }}>
                        <Typography sx={{ fontWeight: 800, color: "#0F172A", mb: 2 }}>Pilih SmartSales jika…</Typography>
                        <Stack component="ul" spacing={1.2} sx={{ pl: 2.5, m: 0 }}>
                            {data.chooseSmartSales.map((t, i) => (
                                <Typography component="li" key={i} sx={{ color: "#334155", lineHeight: 1.6 }}>{t}</Typography>
                            ))}
                        </Stack>
                    </Paper>
                    <Paper elevation={0} sx={{ p: 3.5, borderRadius: "16px", border: "1px solid #E2E8F0" }}>
                        <Typography sx={{ fontWeight: 800, color: "#0F172A", mb: 2 }}>{data.competitor} mungkin lebih cocok jika…</Typography>
                        <Stack component="ul" spacing={1.2} sx={{ pl: 2.5, m: 0 }}>
                            {data.chooseCompetitor.map((t, i) => (
                                <Typography component="li" key={i} sx={{ color: "#334155", lineHeight: 1.6 }}>{t}</Typography>
                            ))}
                        </Stack>
                    </Paper>
                </Box>

                {/* Disclaimer integritas */}
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: "12px", bgcolor: "var(--surface-alt)", border: "1px solid #E2E8F0", mb: 5 }}>
                    <Typography variant="body2" sx={{ color: "#64748B", lineHeight: 1.6 }}>
                        Perbandingan ini disusun berdasarkan positioning publik masing-masing produk dan bersifat umum. Fitur dan harga dapat berubah — sebaiknya verifikasi detail terbaru langsung ke masing-masing penyedia sebelum memutuskan.
                    </Typography>
                </Paper>

                {/* CTA */}
                <Box sx={{ p: { xs: 4, md: 5 }, borderRadius: "24px", background: "var(--gradient-brand)", textAlign: "center" }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "white", mb: 1.5 }}>Coba SmartSales sendiri</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,.9)", mb: 3 }}>Cara terbaik membandingkan adalah mencobanya langsung.</Typography>
                    <Button component={Link} href="/register" variant="contained" endIcon={<ArrowForwardIcon />} sx={{ bgcolor: "white", color: "var(--brand-deep)", fontWeight: 700, px: 4, py: 1.5, borderRadius: "8px", textTransform: "none", fontSize: "1rem", "&:hover": { bgcolor: "rgba(255,255,255,.9)" } }}>
                        Coba Gratis
                    </Button>
                </Box>
            </Container>

            <Footer />
        </Box>
    );
}
