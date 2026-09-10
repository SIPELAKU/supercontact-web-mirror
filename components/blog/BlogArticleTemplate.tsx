"use client";

import { Box, Container, Typography, Stack, Button, Breadcrumbs, Paper, Chip } from "@mui/material";
import Link from "next/link";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/lib/context/LanguageContext";
import { BlogArticle, BlogBodyBlock } from "@/content/blog/types";

const LABELS = {
    id: {
        breadcrumbHome: 'Beranda',
        breadcrumbBlog: 'Blog',
        relatedTitle: 'Artikel Terkait',
        faqTitle: 'Pertanyaan Terkait',
        tocTitle: 'Daftar Isi',
        by: 'Oleh',
        updated: 'Diperbarui',
    },
    en: {
        breadcrumbHome: 'Home',
        breadcrumbBlog: 'Blog',
        relatedTitle: 'Related Articles',
        faqTitle: 'Related Questions',
        tocTitle: 'Table of Contents',
        by: 'By',
        updated: 'Updated',
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

// Anchor id dari teks Indonesia agar stabil lintas bahasa (TOC ↔ heading cocok).
function slugify(s: string) {
    return s.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function BlogArticleTemplate({ article, related = [] }: { article: BlogArticle; related?: BlogArticle[] }) {
    const { language } = useLanguage();
    const t = LABELS[language];

    const toc = article.body
        .filter((b): b is Extract<BlogBodyBlock, { type: 'h2' }> => b.type === 'h2')
        .map((b) => ({ id: slugify(b.text.id), label: b.text[language] }));

    return (
        <Box sx={{ bgcolor: 'white' }}>
            <Navbar />

            <Box sx={{ pt: { xs: 12, md: 16 }, pb: { xs: 6, md: 8 }, bgcolor: 'var(--surface-alt)' }}>
                <Container maxWidth="md">
                    <Breadcrumbs
                        separator={<NavigateNextIcon fontSize="small" sx={{ color: '#94A3B8' }} />}
                        sx={{ mb: 4, '& a, & p': { fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', color: '#64748B' } }}
                    >
                        <Link href="/">{t.breadcrumbHome}</Link>
                        <Link href="/blog">{t.breadcrumbBlog}</Link>
                        <Typography component="span" sx={{ color: '#0F172A !important', fontSize: '0.85rem', fontWeight: 600 }}>
                            {article.h1[language]}
                        </Typography>
                    </Breadcrumbs>

                    <Chip
                        label={article.category[language]}
                        size="small"
                        sx={{ bgcolor: 'var(--surface-tint)', color: 'var(--brand-deep)', fontWeight: 700, mb: 3 }}
                    />

                    <Typography
                        variant="h1"
                        sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.75rem' }, lineHeight: 1.2, mb: 3, color: '#0F172A' }}
                    >
                        {article.h1[language]}
                    </Typography>

                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                        {t.by} {article.author[language]} · {formatDate(article.publishedDate, language)}
                        {article.updatedDate && article.updatedDate !== article.publishedDate
                            ? ` · ${t.updated} ${formatDate(article.updatedDate, language)}`
                            : ''}
                    </Typography>

                    <Typography variant="body1" sx={{ fontSize: '1.125rem', color: '#475569', lineHeight: 1.7, mt: 3 }}>
                        {article.intro[language]}
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
                {toc.length >= 3 && (
                    <Paper
                        elevation={0}
                        sx={{ p: 3, mb: 5, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: 'var(--surface-alt)' }}
                    >
                        <Typography sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5, fontSize: '0.95rem' }}>
                            {t.tocTitle}
                        </Typography>
                        <Stack component="ol" spacing={0.8} sx={{ pl: 2.5, m: 0 }}>
                            {toc.map((h) => (
                                <Typography key={h.id} component="li" sx={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
                                    <Link href={`#${h.id}`} style={{ color: '#597CFF', textDecoration: 'none', fontWeight: 600 }}>
                                        {h.label}
                                    </Link>
                                </Typography>
                            ))}
                        </Stack>
                    </Paper>
                )}
                <Stack spacing={3}>
                    {article.body.map((block, index) => {
                        if (block.type === 'h2') {
                            return (
                                <Typography
                                    key={index}
                                    id={slugify(block.text.id)}
                                    variant="h4"
                                    component="h2"
                                    sx={{ fontWeight: 800, color: '#0F172A', mt: 2, fontSize: { xs: '1.5rem', md: '1.75rem' }, scrollMarginTop: '90px' }}
                                >
                                    {block.text[language]}
                                </Typography>
                            );
                        }
                        if (block.type === 'p') {
                            return (
                                <Typography key={index} variant="body1" sx={{ color: '#334155', lineHeight: 1.8, fontSize: '1.05rem' }}>
                                    {block.text[language]}
                                </Typography>
                            );
                        }
                        if (block.type === 'list') {
                            return (
                                <Stack key={index} spacing={1.2} component="ul" sx={{ pl: 3, m: 0 }}>
                                    {block.items[language].map((item, i) => (
                                        <Typography key={i} component="li" variant="body1" sx={{ color: '#334155', lineHeight: 1.7, fontSize: '1.05rem' }}>
                                            {item}
                                        </Typography>
                                    ))}
                                </Stack>
                            );
                        }
                        if (block.type === 'callout') {
                            return (
                                <Paper
                                    key={index}
                                    elevation={0}
                                    sx={{ p: 3, borderRadius: '16px', bgcolor: 'var(--surface-tint)', borderLeft: '4px solid #597CFF' }}
                                >
                                    <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.7, fontWeight: 600 }}>
                                        {block.text[language]}
                                    </Typography>
                                </Paper>
                            );
                        }
                        if (block.type === 'table') {
                            const headers = block.headers[language];
                            const rows = block.rows[language];
                            return (
                                <Box key={index} sx={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                    <Box component="table" sx={{ width: '100%', minWidth: 480, borderCollapse: 'collapse', fontSize: '0.98rem' }}>
                                        <Box component="thead">
                                            <Box component="tr">
                                                {headers.map((h, i) => (
                                                    <Box
                                                        component="th"
                                                        key={i}
                                                        sx={{ textAlign: 'left', p: 1.5, bgcolor: 'var(--surface-alt)', color: '#0F172A', fontWeight: 700, borderBottom: '2px solid #E2E8F0' }}
                                                    >
                                                        {h}
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                        <Box component="tbody">
                                            {rows.map((row, ri) => (
                                                <Box component="tr" key={ri}>
                                                    {row.map((cell, ci) => (
                                                        <Box
                                                            component="td"
                                                            key={ci}
                                                            sx={{ p: 1.5, color: '#334155', lineHeight: 1.6, verticalAlign: 'top', borderBottom: ri === rows.length - 1 ? 'none' : '1px solid #E2E8F0' }}
                                                        >
                                                            {cell}
                                                        </Box>
                                                    ))}
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        }
                        return null;
                    })}
                </Stack>

                {article.faq && article.faq.length > 0 && (
                    <Box sx={{ mt: 8 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 800, color: '#0F172A', mb: 3 }}>
                            {t.faqTitle}
                        </Typography>
                        <Stack spacing={2}>
                            {article.faq.map((item, i) => (
                                <Paper key={i} elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                    <Typography sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>{item.q[language]}</Typography>
                                    <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7 }}>{item.a[language]}</Typography>
                                </Paper>
                            ))}
                        </Stack>
                    </Box>
                )}

                <Box
                    sx={{
                        mt: 8,
                        p: { xs: 4, md: 5 },
                        borderRadius: '24px',
                        background: 'var(--gradient-brand)',
                        textAlign: 'center',
                    }}
                >
                    <Button
                        component={Link}
                        href={article.primaryCtaHref}
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                            bgcolor: 'white',
                            color: 'var(--brand-deep)',
                            fontWeight: 700,
                            px: 4,
                            py: 1.5,
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontSize: '1rem',
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                        }}
                    >
                        {article.primaryCtaLabel[language]}
                    </Button>
                </Box>

                {related.length > 0 && (
                    <Box sx={{ mt: 8 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 800, color: '#0F172A', mb: 3 }}>
                            {t.relatedTitle}
                        </Typography>
                        <Stack spacing={2}>
                            {related.map((r) => (
                                <Paper
                                    key={r.slug}
                                    component={Link}
                                    href={`/blog/${r.slug}`}
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: '16px',
                                        border: '1px solid #E2E8F0',
                                        textDecoration: 'none',
                                        display: 'block',
                                        '&:hover': { borderColor: '#597CFF' },
                                    }}
                                >
                                    <Typography sx={{ fontWeight: 700, color: '#0F172A' }}>{r.h1[language]}</Typography>
                                </Paper>
                            ))}
                        </Stack>
                    </Box>
                )}
            </Container>

            <Footer />
        </Box>
    );
}
