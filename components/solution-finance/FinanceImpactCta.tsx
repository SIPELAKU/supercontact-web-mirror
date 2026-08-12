"use client";

import { Box, Container, Typography, Grid, Button } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { usePathname } from "next/navigation";
import { getWhatsAppLink } from "@/lib/utils/wa-link";
import { trackCtaClick } from '@/lib/analytics/events';

export default function FinanceImpactCta() {
    useLanguage();
    const pathname = usePathname();

    const metrics = [
        { val: strings.fin_impact1_val, desc: strings.fin_impact1_desc, color: '#597CFF' },
        { val: strings.fin_impact2_val, desc: strings.fin_impact2_desc, color: '#597CFF' },
        { val: strings.fin_impact3_val, desc: strings.fin_impact3_desc, color: '#597CFF' },
        { val: strings.fin_impact4_val, desc: strings.fin_impact4_desc, color: '#597CFF' }
    ];

    return (
        <Box>
            {/* Impact Section - Light Base */}
            <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F0F4FF' }}>
                <Container maxWidth="lg">
                    <Typography
                        variant="h3"
                        component="h2"
                        align="center"
                        sx={{ fontWeight: 800, color: '#111827', mb: { xs: 6, md: 8 }, fontSize: { xs: '1.75rem', md: '2.5rem' } }}
                    >
                        {strings.fin_impact_title}
                    </Typography>
                    <Grid container spacing={4}>
                        {metrics.map((m, idx) => (
                            <Grid item xs={6} md={3} key={idx}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography
                                        variant="h2"
                                        sx={{ fontWeight: 800, color: m.color, mb: 1, fontSize: { xs: '2.5rem', md: '3.5rem' } }}
                                    >
                                        {m.val}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#4B5563', fontWeight: 600, px: 2 }}>
                                        {m.desc}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* CTA Section - Solid Blue Banner */}
            <Box sx={{ bgcolor: '#597CFF', py: { xs: 10, md: 14 } }}>
                <Container maxWidth="md">
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography
                            variant="h2"
                            component="h2"
                            sx={{ fontWeight: 800, color: 'white', mb: 3, fontSize: { xs: '2rem', md: '3rem' }, lineHeight: 1.2 }}
                        >
                            {strings.fin_cta_title}
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{ color: 'rgba(255,255,255,0.9)', mb: 6, fontSize: { xs: '1rem', md: '1.25rem' }, lineHeight: 1.7 }}
                        >
                            {strings.fin_cta_desc}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => { trackCtaClick('solusi/keuangan', 'impact_cta'); window.open(getWhatsAppLink(pathname), '_blank'); }}
                            sx={{
                                bgcolor: 'white',
                                color: '#597CFF',
                                fontWeight: 800,
                                px: { xs: 4, md: 6 },
                                py: { xs: 1.5, md: 2 },
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontSize: { xs: '1.1rem', md: '1.25rem' },
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.9)',
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.2s'
                            }}
                        >
                            {strings.fin_cta_btn}
                        </Button>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}
