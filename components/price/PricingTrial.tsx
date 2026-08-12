import React from 'react';
import { Box, Typography, Button, Container, Grid } from '@mui/material';
import Image from 'next/image';
import { strings } from '@/lib/utils/strings';
import { AppButton } from '../ui/app-button';
import { NO_WA } from '@/lib/constants/constants';
import { trackCtaClick } from '@/lib/analytics/events';

const PricingTrial = () => {
    return (
        <Box sx={{
            bgcolor: '#EEF2FF',
            minHeight: { xs: 'auto', md: '238px' },
            py: { xs: 10, md: 0 },
            borderRadius: { xs: 0, md: '24px' },
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            mt: { xs: 0, md: 10 } // Added margin top to accommodate illustration overflow on desktop
        }}>
            <Container maxWidth="lg">
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={7} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                        <Typography
                            variant="h4"
                            fontWeight={700}
                            color="primary.main"
                            gutterBottom
                            sx={{ fontSize: { xs: '1.75rem', md: '32px' }, lineHeight: 1.2 }}
                        >
                            {strings.trial_title}
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                                mb: 4,
                                maxWidth: { xs: '100%', md: '500px' },
                                mx: { xs: 'auto', md: 0 },
                                fontSize: '15px'
                            }}
                        >
                            {strings.trial_subtitle}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                            <AppButton
                                variantStyle="primary"
                                size="medium"
                                onClick={() => {
                                    trackCtaClick('price', 'trial_banner_cta');
                                    const message = encodeURIComponent(strings.trial_wa_interest_msg)
                                    window.open(`https://wa.me/${NO_WA}?text=${message}`, '_blank')
                                }}
                            >
                                {strings.trial_button}
                            </AppButton>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                        <Box sx={{
                            position: 'relative',
                            width: { xs: '180px', md: '230px' },
                            height: { xs: '180px', md: '230px' },
                            mt: { xs: 0, md: -15 }, // Pull illustration up beyond the box on desktop
                            mb: { xs: -4, md: 0 }, // Adjust bottom margin on mobile to fit background
                            zIndex: 1,
                            transition: 'all 0.3s ease-in-out'
                        }}>
                            <Image
                                src="/assets/pricing-illustration.png"
                                alt="Start Trial"
                                width={230}
                                height={230}
                                style={{
                                    objectFit: 'contain',
                                    width: '100%',
                                    height: 'auto'
                                }}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default PricingTrial;
