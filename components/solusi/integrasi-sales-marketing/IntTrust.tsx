"use client";

import { Box, Container, Typography, Grid, Stack } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import ApartmentIcon from '@mui/icons-material/Apartment';
import VerifiedIcon from '@mui/icons-material/Verified';
import HubIcon from '@mui/icons-material/Hub';
import LockIcon from '@mui/icons-material/Lock';
import { ClientLogos } from '@/components/ui/ClientLogos';

export default function IntTrust() {
    useLanguage();

    const items = [
        { title: strings.sol_int_trust1_title, desc: strings.sol_int_trust1_desc, icon: <ApartmentIcon /> },
        { title: strings.sol_int_trust2_title, desc: strings.sol_int_trust2_desc, icon: <VerifiedIcon /> },
        { title: strings.sol_int_trust3_title, desc: strings.sol_int_trust3_desc, icon: <HubIcon /> },
        { title: strings.sol_int_trust4_title, desc: strings.sol_int_trust4_desc, icon: <LockIcon /> },
    ];

    return (
        <>
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F8FAFC' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography variant="overline" sx={{ color: '#3854D6', fontWeight: 700, letterSpacing: 1.5, mb: 2, display: 'block' }}>
                        {strings.sol_int_trust_badge}
                    </Typography>
                    <Typography variant="h2" component="h2" sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#0F172A' }}>
                        {strings.sol_int_trust_title}
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {items.map((item, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Stack direction="row" spacing={2.5} alignItems="flex-start">
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: '14px',
                                        bgcolor: 'white',
                                        border: '1px solid #E2E8F0',
                                        color: '#3854D6',
                                        display: 'flex',
                                        flexShrink: 0,
                                    }}
                                >
                                    {item.icon}
                                </Box>
                                <Box>
                                    <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 800, mb: 0.5, color: '#0F172A' }}>
                                        {item.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7 }}>
                                        {item.desc}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
        <ClientLogos />
        </>
    );
}
