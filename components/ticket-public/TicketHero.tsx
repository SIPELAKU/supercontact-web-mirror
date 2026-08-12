"use client";

import { Box, Container, Typography, Button, Paper } from "@mui/material";
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckIcon from '@mui/icons-material/Check';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { usePathname } from "next/navigation";
import { getWhatsAppLink } from "@/lib/utils/wa-link";
import { trackCtaClick } from '@/lib/analytics/events';

export default function TicketHero() {
    useLanguage();
    const pathname = usePathname();

    return (
        <Box
            sx={{
                width: '100%',
                bgcolor: '#597CFF', // Standard blue
                pt: { xs: 12, md: 16 },
                pb: { xs: 10, md: 16 },
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 8, alignItems: 'center' }}>

                    {/* Left Side Info */}
                    <Box sx={{ flex: 1, maxWidth: { xs: '100%', lg: '50%' } }}>
                        {/* Badge */}
                        <Box sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            bgcolor: 'rgba(0, 0, 0, 0.2)',
                            px: 2,
                            py: 0.75,
                            borderRadius: '999px',
                            mb: 3
                        }}>
                            <ConfirmationNumberIcon sx={{ color: 'white', fontSize: 16 }} />
                            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.8rem' }}>
                                {strings.ticket_hero_badge}
                            </Typography>
                        </Box>

                        <Typography
                            variant="h2"
                            component="h1"
                            sx={{
                                color: 'white',
                                fontWeight: 800,
                                fontSize: { xs: '2.5rem', md: '3.5rem' },
                                lineHeight: 1.2,
                                mb: 3
                            }}
                        >
                            {strings.ticket_hero_title}
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontSize: { xs: '1rem', md: '1.125rem' },
                                mb: 5,
                                maxWidth: '95%',
                                lineHeight: 1.6
                            }}
                        >
                            {strings.ticket_hero_desc}
                        </Typography>

                        <Button
                            variant="contained"
                            onClick={() => { trackCtaClick('produk/ticket', 'hero_cta'); window.open(getWhatsAppLink(pathname), '_blank'); }}
                            sx={{
                                bgcolor: 'white',
                                color: '#597CFF',
                                fontWeight: 700,
                                px: 4,
                                py: 1.5,
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontSize: '1rem',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.9)'
                                }
                            }}
                        >
                            {strings.ticket_hero_btn}
                        </Button>
                    </Box>

                    {/* Right Side Ticket Creation Mockup */}
                    <Box sx={{ flex: 1, width: '100%', position: 'relative', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                        {/* Chat Message Bubble Mockup (Top Left overlap) */}
                        <Paper
                            elevation={12}
                            sx={{
                                position: 'absolute',
                                left: { xs: '0%', md: '-10%' },
                                top: '10%',
                                zIndex: 2,
                                borderRadius: '12px',
                                width: { xs: '80%', md: 320 },
                                p: 2,
                                bgcolor: 'white',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: -15,
                                    right: 40,
                                    width: 30,
                                    height: 30,
                                    bgcolor: '#60A5FA',
                                    borderRadius: '5px',
                                    transform: 'rotate(45deg)',
                                    zIndex: -1
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <ChatBubbleOutlineIcon sx={{ color: '#22C55E', fontSize: 18 }} />
                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                                    Pesan Pelanggan Masuk
                                </Typography>
                            </Box>
                            <Box sx={{ bgcolor: '#F1F5F9', p: 1.5, borderRadius: '8px', mb: 2 }}>
                                <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontStyle: 'italic' }}>
                                    "Halo min, pesanan saya dengan resi #12345 kok statusnya batal otomatis ya? Padahal sudah bayar."
                                </Typography>
                            </Box>
                            <Button
                                fullWidth
                                variant="contained"
                                size="small"
                                startIcon={<AddCircleOutlineIcon sx={{ fontSize: 16 }} />}
                                sx={{
                                    bgcolor: '#3B82F6',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: '6px'
                                }}
                            >
                                Buat Tiket Keluhan
                            </Button>
                        </Paper>

                        {/* Ticket Details Mockup (Bottom Right overlap) */}
                        <Paper
                            elevation={16}
                            sx={{
                                position: 'absolute',
                                right: { xs: '0%', md: '-10%' },
                                bottom: '0%',
                                zIndex: 3,
                                borderRadius: '12px',
                                width: { xs: '90%', md: 320 },
                                p: 3,
                                bgcolor: 'white',
                                transform: { lg: 'rotate(3deg)' },
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: { lg: 'rotate(0deg) translateY(-5px)' }
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#1E293B' }}>
                                    Detail Tiket Baru
                                </Typography>
                                <Box sx={{
                                    bgcolor: '#FEE2E2', color: '#EF4444', px: 1, py: 0.25,
                                    borderRadius: '12px', fontSize: '0.65rem', fontWeight: 700
                                }}>
                                    High Priority
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', mb: 0.5 }}>
                                        JUDUL TIKET
                                    </Typography>
                                    <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '6px', p: 1, bgcolor: '#F8FAFC' }}>
                                        <Typography sx={{ fontSize: '0.8rem', color: '#334155' }}>Komplain Resi #12345 Batal</Typography>
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', mb: 0.5 }}>
                                        TUGASKAN KE (ASSIGNEE)
                                    </Typography>
                                    <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '6px', p: 1, bgcolor: '#F8FAFC' }}>
                                        <Typography sx={{ fontSize: '0.8rem', color: '#334155' }}>Rina (Tim Resolusi)</Typography>
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', mb: 0.5 }}>
                                        STATUS
                                    </Typography>
                                    <Box sx={{ display: 'inline-flex', bgcolor: '#DBEAFE', color: '#3B82F6', px: 1.5, py: 0.5, borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                        Open
                                    </Box>
                                </Box>
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                sx={{
                                    mt: 3,
                                    bgcolor: '#22C55E',
                                    '&:hover': { bgcolor: '#16A34A' },
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    borderRadius: '6px'
                                }}
                                startIcon={<CheckIcon />}
                            >
                                Simpan Tiket
                            </Button>
                        </Paper>

                    </Box>

                </Box>
            </Container>
        </Box>
    );
}
