import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { strings } from '@/lib/utils/strings';

const CompanyHero = () => {
    return (
        <Box sx={{
            background: 'linear-gradient(180deg, #4264D0 0%, #2A408E 100%)',
            color: 'white',
            height: { xs: 'auto', md: '583px' },
            minHeight: { xs: '450px', md: '583px' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            py: { xs: 8, sm: 8, md: 4, lg: 6 }
        }}>
            <Container maxWidth="lg">
                <Typography
                    variant="h3"
                    component="h1"
                    fontWeight={700}
                    gutterBottom
                    sx={{
                        mb: 3,
                        fontSize: { xs: '2rem', md: '40px' },
                        lineHeight: 1.2
                    }}
                >
                    {strings.company_hero_title}
                </Typography>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 400,
                        maxWidth: '740px',
                        mx: 'auto',
                        mb: 5,
                        opacity: 0.9,
                        lineHeight: 1.8,
                        fontSize: { xs: '1rem', md: '20px' }
                    }}
                >
                    {strings.company_hero_desc}
                </Typography>
                <Button
                    href="https://solvera.id/hubungi-kami"
                    target="_blank"
                    variant="contained"
                    size="large"
                    sx={{
                        bgcolor: 'white',
                        color: '#4264D0',
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 5,
                        py: 1.8,
                        '&:hover': {
                            bgcolor: '#f8f9fa'
                        }
                    }}
                >
                    {strings.company_contact_btn}
                </Button>
            </Container>
        </Box>
    );
};

export default CompanyHero;
