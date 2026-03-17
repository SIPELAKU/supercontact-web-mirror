"use client";

import { Box, Container, Typography, Grid, Paper, keyframes } from "@mui/material";
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import CallIcon from '@mui/icons-material/Call';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";


// Define bouncing keyframes
const bounceAnimation1 = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const bounceAnimation2 = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

const bounceAnimation3 = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

export default function OmniCollaboration() {
    useLanguage();

    const listItems = [
        {
            title: strings.omni_collab_list1_title,
            desc: strings.omni_collab_list1_desc,
            icon: <PeopleOutlinedIcon sx={{ fontSize: 18 }} />
        },
        {
            title: strings.omni_collab_list2_title,
            desc: strings.omni_collab_list2_desc,
            icon: <HistoryOutlinedIcon sx={{ fontSize: 18 }} />
        },
        {
            title: strings.omni_collab_list3_title,
            desc: strings.omni_collab_list3_desc,
            icon: <SmartToyOutlinedIcon sx={{ fontSize: 18 }} />
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
                            {strings.omni_collab_title}
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
                            {strings.omni_collab_subtitle}
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {listItems.map((item, index) => (
                                <Box key={index} sx={{ display: 'flex', gap: 2.5 }}>
                                    <Box sx={{ mt: 0.5 }}>
                                        {/* Light blue icon circle */}
                                        <Box sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            bgcolor: '#EEF2FF',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#597CFF'
                                        }}>
                                            {item.icon}
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827', mb: 0.5 }}>
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

                    {/* Right Column - Mockup with Bouncing Cards */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ position: 'relative', width: '100%', minHeight: { xs: 300, md: 400 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                            {/* Main Central Card (Inbox) */}
                            <Paper
                                elevation={10}
                                sx={{
                                    width: '75%',
                                    height: '60%',
                                    borderRadius: '16px',
                                    bgcolor: 'white',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    zIndex: 1,
                                    p: 4
                                }}
                            >
                                <Box sx={{
                                    width: 64, height: 64, borderRadius: '50%', bgcolor: '#EFF6FF',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2
                                }}>
                                    <InboxOutlinedIcon sx={{ fontSize: 32, color: '#3B82F6' }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
                                    SmartSales Inbox
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B' }}>
                                    Semua chat terkumpul disini
                                </Typography>
                            </Paper>

                            {/* Floating Card 1: WhatsApp (Top Right - Bouncing) */}
                            <Paper
                                elevation={12}
                                sx={{
                                    position: 'absolute',
                                    top: { xs: '5%', md: '10%' },
                                    right: { xs: '5%', md: '0%' },
                                    zIndex: 2,
                                    borderRadius: '12px',
                                    p: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    bgcolor: 'white',
                                    minWidth: 160,
                                    animation: `${bounceAnimation1} 4s ease-in-out infinite`,
                                }}
                            >
                                <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                                    <CallIcon sx={{ fontSize: 18 }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#1E293B', lineHeight: 1.2 }}>WhatsApp API</Typography>
                                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.65rem' }}>Official Partner</Typography>
                                </Box>
                            </Paper>


                            {/* Floating Card 3: Email & Web Chat (Bottom Right - Bouncing) */}
                            <Paper
                                elevation={12}
                                sx={{
                                    position: 'absolute',
                                    bottom: { xs: '15%', md: '10%' },
                                    right: { xs: '10%', md: '5%' },
                                    zIndex: 2,
                                    borderRadius: '12px',
                                    p: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    bgcolor: 'white',
                                    minWidth: 180,
                                    animation: `${bounceAnimation3} 4.5s ease-in-out infinite`,
                                    animationDelay: '0.5s'
                                }}
                            >
                                <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#FFEDD5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C' }}>
                                    <EmailOutlinedIcon sx={{ fontSize: 18 }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#1E293B', lineHeight: 1.2 }}>Email & Web Chat</Typography>
                                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.65rem' }}>Live Support</Typography>
                                </Box>
                            </Paper>

                        </Box>
                    </Grid>

                </Grid>
            </Container>
        </Box>
    );
}
