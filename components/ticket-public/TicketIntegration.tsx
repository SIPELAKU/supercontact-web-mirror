"use client";

import { Box, Container, Typography, Grid, Paper } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";

export default function TicketIntegration() {
    useLanguage();

    const listItems = [
        {
            title: strings.ticket_integ_list1_title,
            desc: strings.ticket_integ_list1_desc
        },
        {
            title: strings.ticket_integ_list2_title,
            desc: strings.ticket_integ_list2_desc
        },
        {
            title: strings.ticket_integ_list3_title,
            desc: strings.ticket_integ_list3_desc
        },
    ];

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
            <Container maxWidth="lg">
                <Grid container spacing={8} alignItems="center">

                    {/* Left Column - Text Content */}
                    <Grid item xs={12} md={6}>
                        <Typography
                            variant="h3"
                            component="h2"
                            sx={{
                                fontWeight: 800,
                                color: '#111827',
                                mb: 3,
                                fontSize: { xs: '2rem', md: '2.5rem' },
                                lineHeight: 1.2
                            }}
                        >
                            {strings.ticket_integ_title}
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color: 'text.secondary',
                                fontSize: '1.125rem',
                                mb: 5,
                                lineHeight: 1.6
                            }}
                        >
                            {strings.ticket_integ_subtitle}
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                            {listItems.map((item, index) => (
                                <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                                    <Box sx={{ mt: 0.5 }}>
                                        <CheckCircleOutlineIcon sx={{ color: '#22C55E', fontSize: 28 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#111827', mb: 0.5 }}>
                                            {item.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                            {item.desc}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Grid>

                    {/* Right Column - Flowchart Mockup */}
                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={10}
                            sx={{
                                p: { xs: 3, md: 5 },
                                borderRadius: '24px',
                                bgcolor: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative'
                            }}
                        >
                            <Typography sx={{ fontWeight: 800, color: '#1E293B', mb: 4, textAlign: 'center' }}>
                                Alur Data Terintegrasi
                            </Typography>

                            {/* Node 1: Inbox */}
                            <Box sx={{ width: '100%', mb: 2 }}>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', flexShrink: 0 }}>
                                        <ChatBubbleOutlineIcon sx={{ fontSize: 20 }} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>Inbox Omnichannel</Typography>
                                        <Typography variant="caption" sx={{ color: '#64748B' }}>Menerima chat dari pelanggan.</Typography>
                                    </Box>
                                </Paper>
                            </Box>

                            <ArrowDownwardIcon sx={{ color: '#CBD5E1', my: 1 }} />

                            {/* Node 2: Ticket Creation (Highlighted) */}
                            <Box sx={{ width: '100%', mb: 2 }}>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#EEF2FF', borderColor: '#C7D2FE' }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: 'transparent', border: '1px dashed #818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1', flexShrink: 0 }}>
                                        <ConfirmationNumberOutlinedIcon sx={{ fontSize: 20 }} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#4F46E5' }}>Pembuatan Tiket (Integrasi)</Typography>
                                        <Typography variant="caption" sx={{ color: '#6366F1' }}>Mengubah isi pesan menjadi format tugas kerja terstruktur.</Typography>
                                    </Box>
                                </Paper>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 8, my: 1 }}>
                                <ArrowDownwardIcon sx={{ color: '#CBD5E1', transform: 'rotate(45deg)' }} />
                                <ArrowDownwardIcon sx={{ color: '#CBD5E1', transform: 'rotate(-45deg)' }} />
                            </Box>

                            {/* Node 3 & 4: CRM Services & Sales (Split Columns) */}
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', bgcolor: '#FAFAFA', borderColor: '#E2E8F0' }}>
                                        <SupportAgentIcon sx={{ fontSize: 24, color: '#A855F7', mb: 1 }} />
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E293B' }}>CRM Services</Typography>
                                        <Typography variant="caption" sx={{ color: '#64748B' }}>Untuk keluhan teknis / support.</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6}>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', bgcolor: '#FAFAFA', borderColor: '#E2E8F0' }}>
                                        <BusinessCenterOutlinedIcon sx={{ fontSize: 24, color: '#22C55E', mb: 1 }} />
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E293B' }}>CRM Sales</Typography>
                                        <Typography variant="caption" sx={{ color: '#64748B' }}>Untuk prospek penjualan baru.</Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                        </Paper>
                    </Grid>

                </Grid>
            </Container>
        </Box>
    );
}
