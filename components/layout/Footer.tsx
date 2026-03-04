'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Image from 'next/image';

// Icons
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import GoogleIcon from '@mui/icons-material/Google';
import StoreButton from '../ui/StoreButton';

import { strings } from '@/lib/utils/strings';
import { useLanguage } from '@/lib/context/LanguageContext';

const Footer = () => {
    useLanguage();
    const currentYear = new Date().getFullYear();

    return (
        <Box component="footer" sx={{ bgcolor: '#062141', color: 'white' }}>
            {/* Main Footer Content */}
            <Box sx={{ py: { xs: 6, md: 10 } }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4} sx={{ alignItems: 'flex-start' }}>
                        {/* Brand & Newsletter Section */}
                        <Grid item xs={12} md={5}>
                            <Box sx={{ mb: 4 }}>
                                <Image
                                    src="/assets/sc-logo-primary.png"
                                    alt="SmartSales Logo"
                                    width={150}
                                    height={40}
                                    style={{ filter: 'brightness(0) invert(1)' }}
                                />
                            </Box>
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4, maxWidth: 350, lineHeight: 1.6 }}>
                                {strings.footer_desc}
                            </Typography>
                            <Box component="form" sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: { xs: '100%', md: 'auto' }, gap: 1.5, alignItems: 'center' }}>
                                <TextField
                                    label={strings.footer_newsletter_label}
                                    variant="outlined"
                                    placeholder={strings.footer_newsletter_placeholder}
                                    size="small"
                                    fullWidth
                                    sx={{
                                        maxWidth: { xs: '100%', md: 240 },
                                        '& .MuiOutlinedInput-root': {
                                            color: 'white',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                            '&:hover fieldset': { borderColor: 'white' },
                                            '&.Mui-focused fieldset': { borderColor: 'white' },
                                        },
                                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)', '&.Mui-focused': { color: 'white' } },
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    sx={{
                                        bgcolor: 'white',
                                        color: '#062141',
                                        fontWeight: 600,
                                        px: 3,
                                        py: 1.1,
                                        width: { xs: '100%', md: 'auto' },
                                        borderRadius: '8px',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                                        textTransform: 'none',
                                    }}
                                >
                                    {strings.footer_subscribe_btn}
                                </Button>
                            </Box>
                        </Grid>

                        {/* Navigation Links - SmartSales */}
                        <Grid item xs={6} md={2.3}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: 'white' }}>
                                {strings.footer_col_sales}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Link href="#" underline="none" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>{strings.product_menu_crm}</Link>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Link href="#" underline="none" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>Premium</Link>
                                    <Box sx={{ bgcolor: 'white', color: '#062141', px: 1, py: 0.2, borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>{strings.footer_new_badge}</Box>
                                </Box>
                                <Link href="#" underline="none" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>{strings.solution}</Link>
                                <Link href="#" underline="none" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>SmartSales Web</Link>
                            </Box>
                        </Grid>

                        {/* Navigation Links - Need Help? */}
                        <Grid item xs={6} md={2.3}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: 'white' }}>
                                {strings.footer_col_help}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Link href="#" underline="none" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>{strings.footer_kb}</Link>
                                <Link href="#" underline="none" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>{strings.footer_guides}</Link>
                                <Link href="#" underline="none" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>{strings.footer_templates}</Link>
                                <Link href="#" underline="none" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>{strings.footer_integrations}</Link>
                            </Box>
                        </Grid>

                        {/* App Download Section */}
                        <Grid item xs={12} md={2.4}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: 'white' }}>
                                {strings.footer_col_download}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <StoreButton store="apple" sx={{ bgcolor: '#04162d', '&:hover': { bgcolor: '#0a2a51' } }} />
                                <StoreButton store="google" sx={{ bgcolor: '#04162d', '&:hover': { bgcolor: '#0a2a51' } }} />
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Bottom Bar Container */}
            <Box sx={{ bgcolor: '#04162d', py: 4 }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            {strings.formatString(strings.footer_copyright, { year: currentYear.toString() })}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
                                <GitHubIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
                                <FacebookIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
                                <TwitterIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
                                <GoogleIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default Footer;
