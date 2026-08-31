"use client";

import { Box, Container, Typography, Grid, Paper, Chip } from "@mui/material";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/lib/context/LanguageContext";
import { blogArticles } from "@/content/blog/registry";

const LABELS = {
    id: {
        badge: 'BLOG SMARTSALES',
        title: 'Panduan Sales, Marketing & CRM',
        subtitle: 'Artikel praktis seputar integrasi sales dan marketing, lead management, dan cara kerja CRM — ditulis untuk membantu Anda, bukan hanya untuk mesin pencari.',
    },
    en: {
        badge: 'SMARTSALES BLOG',
        title: 'Sales, Marketing & CRM Guides',
        subtitle: 'Practical articles on sales-marketing integration, lead management, and how CRM works — written to help you, not just search engines.',
    },
};

function formatDate(iso: string, language: 'id' | 'en') {
    const date = new Date(iso);
    return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function BlogIndexClient() {
    const { language } = useLanguage();
    const t = LABELS[language];

    return (
        <Box sx={{ bgcolor: 'white' }}>
            <Navbar />

            <Box
                sx={{
                    pt: { xs: 12, md: 16 },
                    pb: { xs: 8, md: 10 },
                    background: 'var(--gradient-brand)',
                    color: 'white',
                    textAlign: 'center',
                }}
            >
                <Container maxWidth="md">
                    <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 1.5, opacity: 0.9 }}>
                        {t.badge}
                    </Typography>
                    <Typography variant="h1" sx={{ fontWeight: 800, fontSize: { xs: '2.25rem', md: '3rem' }, mb: 3 }}>
                        {t.title}
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.125rem', opacity: 0.92, lineHeight: 1.7, maxWidth: '650px', mx: 'auto' }}>
                        {t.subtitle}
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
                <Grid container spacing={4}>
                    {blogArticles.filter((a) => !a.slug.startsWith('_')).map((article) => (
                        <Grid item xs={12} md={6} key={article.slug}>
                            <Paper
                                component={Link}
                                href={`/blog/${article.slug}`}
                                elevation={0}
                                sx={{
                                    p: 4,
                                    height: '100%',
                                    borderRadius: '20px',
                                    border: '1px solid #E2E8F0',
                                    textDecoration: 'none',
                                    display: 'block',
                                    transition: 'border-color 0.2s',
                                    '&:hover': { borderColor: '#597CFF' },
                                }}
                            >
                                <Chip
                                    label={article.category[language]}
                                    size="small"
                                    sx={{ bgcolor: 'var(--surface-tint)', color: 'var(--brand-deep)', fontWeight: 700, mb: 2 }}
                                />
                                <Typography variant="h6" component="h2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5 }}>
                                    {article.h1[language]}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6, mb: 2 }}>
                                    {article.description[language]}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                                    {formatDate(article.publishedDate, language)}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            <Footer />
        </Box>
    );
}
