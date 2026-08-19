"use client";

import { Box, Typography, Paper, Grid } from "@mui/material";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import PageHero from '@/components/marketing/PageHero';

export default function CrmSalesHero() {
    useLanguage();

    return (
        <PageHero
            badge={strings.hero_slide_badge_produk}
            title={strings.crm_sales_hero_title}
            description={strings.crm_sales_hero_desc}
            trackSource="produk/crm-sales"
            visual={<CrmSalesHeroVisual />}
        />
    );
}

// Right-side hero visual, also reused by the homepage hero slider
// (components/home/HeroSlider.tsx) so the slide matches this page exactly.
export function CrmSalesHeroVisual() {
    return (
        <Box
            sx={{
                position: 'relative',
                perspective: '1000px',
                // Hover group container
                '&:hover .main-card': {
                    transform: 'rotate(-2deg) translateY(-10px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
                },
                '&:hover .inner-col-1': {
                    transform: 'translateY(0)',
                },
                '&:hover .inner-col-2': {
                    transform: 'translateY(0)',
                },
                '&:hover .inner-col-3': {
                    transform: 'translateY(0)',
                }
            }}
        >
            {/* Main Background Card */}
            <Paper
                className="main-card"
                elevation={24}
                sx={{
                    bgcolor: 'white',
                    borderRadius: '16px',
                    p: { xs: 3, md: 4 },
                    transform: 'rotate(2deg) translateY(0)', // Initially rotated & slightly unaligned
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                }}
            >
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1D20', mb: 0.5 }}>
                            {strings.crm_sales_pipeline_title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {strings.crm_sales_pipeline_subtitle}
                        </Typography>
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: '#E4F8EE',
                        color: '#059669',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                    }}>
                        <TrendingUpIcon fontSize="small" />
                        +12%
                    </Box>
                </Box>

                {/* Board columns */}
                <Grid container spacing={2}>
                    {/* Column 1 */}
                    <Grid item xs={4}>
                        <Box className="inner-col-1" sx={{ transition: 'transform 0.5s ease-out', transform: 'translateY(15px)' }}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 700, mb: 1.5 }}>
                                {strings.formatString(strings.crm_sales_card_new_prospects, '12')}
                            </Typography>

                            <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', p: 1.5, mb: 1, bgcolor: '#FAFAFA' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>PT. Maju Jaya</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Rp 45.000.000</Typography>
                            </Paper>

                            <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', p: 1.5, bgcolor: '#FAFAFA' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>Toko Sentosa</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Rp 12.500.000</Typography>
                            </Paper>
                        </Box>
                    </Grid>

                    {/* Column 2 */}
                    <Grid item xs={4}>
                        <Box className="inner-col-2" sx={{ transition: 'transform 0.5s ease-out', transitionDelay: '0.05s', transform: 'translateY(5px)' }}>
                            <Typography variant="subtitle2" sx={{ color: '#F59E0B', fontSize: '0.7rem', fontWeight: 700, mb: 1.5 }}>
                                {strings.formatString(strings.crm_sales_card_negotiation, '5')}
                            </Typography>

                            <Box sx={{
                                border: '1px solid #3B82F6',
                                borderRadius: '8px',
                                p: 1.5,
                                bgcolor: '#F0F9FF',
                                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
                                position: 'relative'
                            }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E3A8A', mb: 0.5 }}>CV. Abadi</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #9CA3AF' }} />
                                    <Typography variant="caption" sx={{ color: '#4B5563' }}>{strings.crm_sales_follow_up}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Column 3 */}
                    <Grid item xs={4}>
                        <Box className="inner-col-3" sx={{ transition: 'transform 0.5s ease-out', transitionDelay: '0.1s', transform: 'translateY(-10px)' }}>
                            <Typography variant="subtitle2" sx={{ color: '#10B981', fontSize: '0.7rem', fontWeight: 700, mb: 1.5 }}>
                                {strings.formatString(strings.crm_sales_card_won, '8')}
                            </Typography>

                            <Box sx={{
                                border: '1px solid #10B981',
                                borderRadius: '8px',
                                p: 1.5,
                                bgcolor: '#ECFDF5',
                                boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.1)'
                            }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#065F46', mb: 0.5 }}>Bapak Budi</Typography>
                                <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>{strings.crm_sales_closed_won}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}
