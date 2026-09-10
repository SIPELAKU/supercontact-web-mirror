import Link from "next/link";
import { Box, Container, Typography, Paper } from "@mui/material";

export interface RelatedReadingItem {
    href: string;
    title: string;
    desc?: string;
}

// Section reusable "Pelajari lebih lanjut" — menautkan halaman komersial
// (solusi/produk) ke artikel blog klaster yang relevan. Glue topical-authority
// dua arah: halaman uang berotoritas mengalirkan link ke klaster blog.
export default function RelatedReading({
    eyebrow = "PELAJARI LEBIH LANJUT",
    heading,
    items,
}: {
    eyebrow?: string;
    heading: string;
    items: RelatedReadingItem[];
}) {
    if (!items.length) return null;
    return (
        <Box component="section" sx={{ py: { xs: 6, md: 9 }, bgcolor: "#F8FAFC" }}>
            <Container maxWidth="lg">
                <Typography variant="overline" sx={{ color: "#597CFF", fontWeight: 700, letterSpacing: 1.5 }}>
                    {eyebrow}
                </Typography>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 800, color: "#0F172A", mt: 1, mb: 4, fontSize: { xs: "1.5rem", md: "1.9rem" } }}>
                    {heading}
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2.5 }}>
                    {items.map((it) => (
                        <Paper
                            key={it.href}
                            component={Link}
                            href={it.href}
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: "16px",
                                border: "1px solid #E2E8F0",
                                bgcolor: "white",
                                textDecoration: "none",
                                display: "block",
                                height: "100%",
                                transition: "border-color .2s, box-shadow .2s",
                                "&:hover": { borderColor: "#597CFF", boxShadow: "0 8px 24px rgba(89,124,255,.10)" },
                            }}
                        >
                            <Typography sx={{ fontWeight: 700, color: "#0F172A", mb: it.desc ? 1 : 0 }}>
                                {it.title} →
                            </Typography>
                            {it.desc && (
                                <Typography variant="body2" sx={{ color: "#64748B", lineHeight: 1.6 }}>
                                    {it.desc}
                                </Typography>
                            )}
                        </Paper>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
