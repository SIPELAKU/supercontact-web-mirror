"use client";

import { Box, Container, Typography, Grid, Stack, Button } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { usePathname } from "next/navigation";
import { getWhatsAppLink } from "@/lib/utils/wa-link";
import { trackCtaClick } from '@/lib/analytics/events';

export default function ITSaaSImpactCta() {
    useLanguage();
    const pathname = usePathname();

    const impacts = [
        {
            value: strings.it_impact1_val,
            label: strings.it_impact1_desc
        },
        {
            value: strings.it_impact2_val,
            label: strings.it_impact2_desc
        },
        {
            value: strings.it_impact3_val,
            label: strings.it_impact3_desc
        },
        {
            value: strings.it_impact4_val,
            label: strings.it_impact4_desc
        }
    ];

    return (
        <Box>
            {/* Impact Section */}
            <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F1F5F9' }}>
                <Container maxWidth="lg">
                    <Typography 
                        variant="h3" 
                        sx={{ 
                            textAlign: 'center', 
                            fontWeight: 800, 
                            mb: 8, 
                            fontSize: { xs: '1.75rem', md: '2.25rem' } 
                        }}
                    >
                        {strings.it_impact_title}
                    </Typography>
                    <Grid container spacing={4} justifyContent="center">
                        {impacts.map((impact, index) => (
                            <Grid item xs={6} md={3} key={index}>
                                <Stack spacing={1} alignItems="center" sx={{ textAlign: 'center' }}>
                                    <Typography 
                                        variant="h2" 
                                        sx={{ 
                                            fontWeight: 800, 
                                            color: '#597CFF',
                                            fontSize: { xs: '2.5rem', md: '3.5rem' }
                                        }}
                                    >
                                        {impact.value}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            fontWeight: 700, 
                                            color: '#475569',
                                            maxWidth: '180px'
                                        }}
                                    >
                                        {impact.label}
                                    </Typography>
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box 
                sx={{ 
                    py: { xs: 8, md: 15 }, 
                    background: 'linear-gradient(135deg, #597CFF 0%, #7B99FF 100%)',
                    textAlign: 'center',
                    color: 'white'
                }}
            >
                <Container maxWidth="md">
                    <Typography 
                        variant="h2" 
                        sx={{ 
                            fontWeight: 800, 
                            mb: 4, 
                            fontSize: { xs: '2.25rem', md: '3.5rem' } 
                        }}
                    >
                        {strings.it_cta_title}
                    </Typography>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            fontSize: '1.125rem', 
                            opacity: 0.9, 
                            mb: 6, 
                            lineHeight: 1.6,
                            maxWidth: '700px',
                            mx: 'auto'
                        }}
                    >
                        {strings.it_cta_desc}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => { trackCtaClick('solusi/it-saas', 'impact_cta'); window.open(getWhatsAppLink(pathname), '_blank'); }}
                        sx={{
                            bgcolor: 'white',
                            color: '#597CFF',
                            fontWeight: 700,
                            px: 6,
                            py: 2,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontSize: '1.125rem',
                            '&:hover': { bgcolor: '#f0f0f0' }
                        }}
                    >
                        {strings.it_cta_btn}
                    </Button>
                </Container>
            </Box>
        </Box>
    );
}
