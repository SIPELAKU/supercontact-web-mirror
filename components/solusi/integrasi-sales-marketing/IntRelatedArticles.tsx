"use client";

import { Box, Container, Typography, Grid, Paper, Chip } from "@mui/material";
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";
import { blogArticles } from "@/content/blog/registry";

const RELATED_SLUGS = [
    'cara-menghitung-leads-yang-hilang',
    'lead-routing-adalah',
    'checklist-audit-kebocoran-leads',
    'kesalahan-umum-integrasi-sales-marketing',
];

const LABELS = {
    id: {
        badge: 'PELAJARI LEBIH LANJUT',
        title: 'Artikel Terkait',
    },
    en: {
        badge: 'LEARN MORE',
        title: 'Related Articles',
    },
};

export default function IntRelatedArticles() {
    const { language } = useLanguage();
    const t = LABELS[language];

    const articles = RELATED_SLUGS
        .map((slug) => blogArticles.find((a) => a.slug === slug))
        .filter((a): a is NonNullable<typeof a> => Boolean(a));

    if (articles.length === 0) {
        return null;
    }

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'var(--surface-alt)' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography variant="overline" sx={{ color: 'var(--brand-deep)', fontWeight: 700, letterSpacing: 1.5, mb: 2, display: 'block' }}>
                        {t.badge}
                    </Typography>
                    <Typography variant="h2" component="h2" sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#0F172A' }}>
                        {t.title}
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {articles.map((article) => (
                        <Grid item xs={12} sm={6} md={3} key={article.slug}>
                            <Paper
                                component={Link}
                                href={`/blog/${article.slug}`}
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: '18px',
                                    border: '1px solid #E2E8F0',
                                    textDecoration: 'none',
                                    display: 'block',
                                    bgcolor: 'white',
                                    transition: 'border-color 0.2s',
                                    '&:hover': { borderColor: '#597CFF' },
                                }}
                            >
                                <Chip
                                    label={article.category[language]}
                                    size="small"
                                    sx={{ bgcolor: 'var(--surface-tint)', color: 'var(--brand-deep)', fontWeight: 700, mb: 2 }}
                                />
                                <Typography sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.4 }}>
                                    {article.h1[language]}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
