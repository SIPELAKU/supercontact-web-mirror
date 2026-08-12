"use client";

import { Box, Container, Typography, Stack, Button, Breadcrumbs, Paper, Chip } from "@mui/material";
import Link from "next/link";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/lib/context/LanguageContext";
import { BlogArticle } from "@/content/blog/types";
import { blogArticles } from "@/content/blog/registry";

const LABELS = {
    id: {
        breadcrumbHome: 'Beranda',
        breadcrumbBlog: 'Blog',
        relatedTitle: 'Artikel Terkait',
        faqTitle: 'Pertanyaan Terkait',
        by: 'Oleh',
        updated: 'Diperbarui',
    },
    en: {
        breadcrumbHome: 'Home',
        breadcrumbBlog: 'Blog',
        relatedTitle: 'Related Articles',
        faqTitle: 'Related Questions',
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

export default function BlogArticleTemplate({ article }: { article: BlogArticle }) {
    const { language } = useLanguage();
    const t = LABELS[language];

    const related = article.relatedSlugs
        .map((slug) => blogArticles.find((a) => a.slug === slug))
        .filter((a): a is BlogArticle => Boolean(a))
        .slice(0, 3);

    return (
        <Box sx={{ bgcolor: 'white' }}>
            <Navbar />

            <Box sx={{ pt: { xs: 12, md: 16 }, pb: { xs: 6, md: 8 }, bgcolor: '#F8FAFC' }}>
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
                        sx={{ bgcolor: '#EEF2FF', color: '#3854D6', fontWeight: 700, mb: 3 }}
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
                <Stack spacing={3}>
                    {article.body.map((block, index) => {
                        if (block.type === 'h2') {
                            return (
                                <Typography
                                    key={index}
                                    variant="h4"
                                    component="h2"
                                    sx={{ fontWeight: 800, color: '#0F172A', mt: 2, fontSize: { xs: '1.5rem', md: '1.75rem' } }}
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
                                    sx={{ p: 3, borderRadius: '16px', bgcolor: '#EEF2FF', borderLeft: '4px solid #597CFF' }}
                                >
                                    <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.7, fontWeight: 600 }}>
                                        {block.text[language]}
                                    </Typography>
                                </Paper>
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
                        background: 'linear-gradient(135deg, #597CFF 0%, #7692FF 100%)',
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
                            color: '#3854D6',
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
