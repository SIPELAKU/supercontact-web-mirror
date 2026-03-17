"use client";

import { Box, Container, Typography, Button, Paper, Avatar, InputBase, IconButton } from "@mui/material";
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CallIcon from '@mui/icons-material/Call';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import SendIcon from '@mui/icons-material/Send';
import AttachmentIcon from '@mui/icons-material/Attachment';
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { SearchIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { getWhatsAppLink } from "@/lib/utils/wa-link";

// Custom icons for the mockup

const WhatsAppIconMock = () => (
    <Box sx={{
        width: 16, height: 16, borderRadius: '50%', bgcolor: '#25D366',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
    }}>
        <CallIcon sx={{ fontSize: 10 }} />
    </Box>
);

export default function OmniHero() {
    useLanguage();
    const pathname = usePathname();

    return (
        <Box
            sx={{
                width: '100%',
                bgcolor: '#597CFF', // Standard blue from the image
                pt: { xs: 12, md: 16 },
                pb: { xs: 10, md: 16 },
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 6, alignItems: 'center' }}>

                    {/* Left Side Info */}
                    <Box sx={{ flex: 1, maxWidth: { xs: '100%', lg: '50%' } }}>
                        {/* Badge */}
                        <Box sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            bgcolor: 'rgba(0, 0, 0, 0.15)',
                            px: 2,
                            py: 0.75,
                            borderRadius: '999px',
                            mb: 3
                        }}>
                            <ChatBubbleOutlineIcon sx={{ color: 'white', fontSize: 16 }} />
                            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.8rem' }}>
                                {strings.omni_hero_badge}
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
                            {strings.omni_hero_title}
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
                            {strings.omni_hero_desc}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                onClick={() => window.open(getWhatsAppLink(pathname), '_blank')}
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
                                {strings.omni_hero_btn_trial}
                            </Button>
                            {/* <Button
                                variant="outlined"
                                startIcon={<PlayCircleOutlineIcon />}
                                sx={{
                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                    color: 'white',
                                    fontWeight: 600,
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    '&:hover': {
                                        borderColor: 'white',
                                        bgcolor: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }}
                            >
                                {strings.omni_hero_btn_demo}
                            </Button> */}
                        </Box>
                    </Box>

                    {/* Right Side Unified Inbox Mockup */}
                    <Box sx={{ flex: 1, width: '100%', position: 'relative', perspective: '1000px' }}>
                        <Box
                            sx={{
                                transform: { lg: 'rotate(2deg) translateY(0)' },
                                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    transform: { lg: 'rotate(0deg) translateY(-10px)' },
                                    boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.4)'
                                },
                                borderRadius: '16px',
                                overflow: 'hidden',
                                boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.25)',
                                bgcolor: '#F8FAFC',
                                border: '1px solid rgba(255,255,255,0.4)',
                            }}
                        >
                            {/* Mac OS Window Header */}
                            <Box sx={{
                                display: 'flex', alignItems: 'center', px: 2, py: 1.5,
                                bgcolor: 'white', borderBottom: '1px solid #E2E8F0'
                            }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F56' }} />
                                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
                                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27C93F' }} />
                                </Box>
                                <Typography sx={{ mx: 'auto', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                                    Unified Inbox
                                </Typography>
                                <Box sx={{
                                    px: 1.5, py: 0.5, borderRadius: '12px', bgcolor: '#DCFCE7',
                                    color: '#16A34A', fontSize: '0.7rem', fontWeight: 700
                                }}>
                                    Online
                                </Box>
                            </Box>

                            {/* Inbox Body */}
                            <Box sx={{ display: 'flex', height: 380 }}>
                                {/* Sidebar Chat List */}
                                <Box sx={{ width: '35%', borderRight: '1px solid #E2E8F0', bgcolor: 'white', display: 'flex', flexDirection: 'column' }}>
                                    <Box sx={{ p: 1.5, borderBottom: '1px solid #F1F5F9' }}>
                                        <Paper elevation={0} sx={{
                                            display: 'flex', alignItems: 'center', px: 1.5, py: 0.5,
                                            bgcolor: '#F1F5F9', borderRadius: '8px'
                                        }}>
                                            <SearchIcon className="text-[#94A3B8] text-[18px] mr-1" />
                                            <InputBase placeholder="Cari chat..." sx={{ fontSize: '0.8rem', flex: 1 }} />
                                        </Paper>
                                    </Box>

                                    {/* Chat Items */}
                                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                        {/* Active Chat */}
                                        <Box sx={{ display: 'flex', p: 1.5, bgcolor: '#F1F5F9', cursor: 'pointer', position: 'relative' }}>
                                            <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, bgcolor: '#3B82F6' }} />
                                            <Avatar sx={{ width: 40, height: 40, bgcolor: '#E2E8F0', mr: 1.5 }} />
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E293B' }}>Andi Setiawan</Typography>
                                                    <WhatsAppIconMock />
                                                </Box>
                                                <Typography variant="caption" sx={{ color: '#3B82F6', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                                                    Apakah stok masih ...
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Inactive Chat 1 */}
                                        <Box sx={{ display: 'flex', p: 1.5, borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }}>
                                            <Avatar sx={{ width: 40, height: 40, bgcolor: '#E2E8F0', mr: 1.5 }} />
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#64748B' }}>Budi Santoso</Typography>
                                                    <WhatsAppIconMock />
                                                </Box>
                                                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    Terima kasih atas in...
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Inactive Chat 2 */}
                                        <Box sx={{ display: 'flex', p: 1.5, cursor: 'pointer' }}>
                                            <Avatar sx={{ width: 40, height: 40, bgcolor: '#E2E8F0', mr: 1.5 }} />
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#64748B' }}>PT. Makmur</Typography>
                                                    <WhatsAppIconMock />
                                                </Box>
                                                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    Bisa kirim penawar...
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Main Chat Area */}
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
                                    {/* Chat Header */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #F1F5F9' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <WhatsAppIconMock />
                                            <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: '0.9rem' }}>Andi Setiawan</Typography>
                                        </Box>
                                        <Button
                                            size="small"
                                            startIcon={<AssignmentOutlinedIcon sx={{ fontSize: 16 }} />}
                                            sx={{
                                                bgcolor: '#EFF6FF', color: '#3B82F6', fontSize: '0.7rem',
                                                fontWeight: 600, textTransform: 'none', px: 1.5, py: 0.5, borderRadius: '6px'
                                            }}
                                        >
                                            Buat Tiket
                                        </Button>
                                    </Box>

                                    {/* Chat Messages */}
                                    <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden', bgcolor: '#F8FAFC' }}>
                                        <Typography sx={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.7rem', my: 1 }}>Hari ini, 10:24 AM</Typography>

                                        {/* Customer Message */}
                                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                                            <Avatar sx={{ width: 28, height: 28, bgcolor: '#CBD5E1' }} />
                                            <Box sx={{
                                                bgcolor: 'white', p: 1.5, borderRadius: '0 12px 12px 12px',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)', maxWidth: '80%',
                                                border: '1px solid #E2E8F0'
                                            }}>
                                                <Typography sx={{ fontSize: '0.85rem', color: '#334155' }}>
                                                    Halo admin, saya mau tanya apakah produk tas warna navy yang di post terbaru masih ada stoknya?
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Agent Message (Faded initially, acting like it's being typed or just sent) */}
                                        <Box sx={{ display: 'flex', gap: 1.5, alignSelf: 'flex-end', opacity: 0.9 }}>
                                            <Box sx={{
                                                bgcolor: '#E0E7FF', p: 1.5, borderRadius: '12px 0 12px 12px',
                                                maxWidth: '100%', border: '1px solid #C7D2FE'
                                            }}>
                                                <Typography sx={{ fontSize: '0.85rem', color: '#1E3A8A' }}>
                                                    Halo Kak Andi! 👋 Terima kasih sudah menghubungi kami. Sebentar ya Kak, kami cek terlebih dahulu stoknya di gudang.
                                                </Typography>
                                            </Box>
                                            <Avatar sx={{ width: 28, height: 28, bgcolor: '#93C5FD' }} />
                                        </Box>
                                    </Box>

                                    {/* Chat Input */}
                                    <Box sx={{ p: 2, borderTop: '1px solid #F1F5F9' }}>
                                        <Paper elevation={0} sx={{
                                            display: 'flex', alignItems: 'center', px: 2, py: 1,
                                            border: '1px solid #E2E8F0', borderRadius: '24px', bgcolor: '#F8FAFC'
                                        }}>
                                            <AttachmentIcon sx={{ color: '#94A3B8', mr: 1, fontSize: 20 }} />
                                            <InputBase placeholder="Ketik balasan..." sx={{ flex: 1, fontSize: '0.85rem' }} />
                                            <IconButton size="small" sx={{ color: '#94A3B8' }}>
                                                <SendIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Paper>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                </Box>
            </Container>
        </Box>
    );
}
