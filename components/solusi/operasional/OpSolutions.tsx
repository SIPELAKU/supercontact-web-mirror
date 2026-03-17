"use client";

import { Box, Container, Typography, Grid, Stack, Paper, Chip, Avatar } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import MapIcon from '@mui/icons-material/Map';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import PersonIcon from '@mui/icons-material/Person';

export default function OpSolutions() {
    useLanguage();

    const SolutionItem = ({ badge, title, desc, bullets, icon, mockup, reverse = false }: any) => (
        <Grid container spacing={{ xs: 6, md: 10 }} alignItems="center" direction={reverse ? 'row-reverse' : 'row'} sx={{ mb: { xs: 10, md: 15 } }}>
            <Grid item xs={12} md={6}>
                <Stack spacing={3}>
                    <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '16px', bgcolor: '#EEF2FF', width: 'fit-content' }}>
                        {icon}
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', md: '2.25rem' }, color: '#0F172A' }}>
                        {title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748B', fontSize: '1.1rem', lineHeight: 1.6 }}>
                        {desc}
                    </Typography>
                    <Stack spacing={2}>
                        {bullets.map((txt: string, i: number) => (
                            <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                                <CheckCircleOutlineIcon sx={{ color: '#22C55E', mt: 0.3 }} />
                                <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500, lineHeight: 1.5 }}
                                    dangerouslySetInnerHTML={{ __html: txt.replace(/\*(.*?)\*/g, '<strong>$1</strong>') }}
                                />
                            </Stack>
                        ))}
                    </Stack>
                </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
                {mockup}
            </Grid>
        </Grid>
    );

    return (
        <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: '#F8FAFC' }}>
            <Container maxWidth="lg">
                <Stack spacing={2} sx={{ mb: { xs: 8, md: 12 }, textAlign: 'center' }}>
                    <Typography variant="overline" sx={{ color: '#597CFF', fontWeight: 800, letterSpacing: 2 }}>
                        {strings.sol_op_sol_badge}
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#0F172A' }}>
                        {strings.sol_op_sol_title}
                    </Typography>
                </Stack>

                {/* Section 1: Tasks */}
                <SolutionItem
                    icon={<MapIcon sx={{ color: '#597CFF' }} />}
                    title={strings.sol_op_sol1_title}
                    desc={strings.sol_op_sol1_desc}
                    bullets={[strings.sol_op_sol1_li1, strings.sol_op_sol1_li2, strings.sol_op_sol1_li3]}
                    mockup={
                        <Paper elevation={16} sx={{ p: 4, borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                            <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', mb: 3 }}>{strings.sol_op_mock_task_title}</Typography>
                            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '16px', border: '1px solid #F1F5F9', mb: 3 }}>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                    <Avatar sx={{ bgcolor: '#DBEAFE', color: '#3B82F6' }}><PersonIcon /></Avatar>
                                    <Box>
                                        <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{strings.sol_op_mock_task_user}</Typography>
                                        <Typography variant="caption" sx={{ color: '#3B82F6', fontWeight: 700 }}>📍 {strings.sol_op_mock_task_loc}</Typography>
                                    </Box>
                                </Stack>
                                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, mb: 1, display: 'block' }}>STATUS PEKERJAAN HARI INI:</Typography>
                                <Stack spacing={1.5}>
                                    <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #F1F5F9' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>{strings.sol_op_mock_task1}</Typography>
                                        <Chip label={strings.sol_op_mock_task_status1} size="small" sx={{ height: 20, bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '0.625rem' }} />
                                    </Box>
                                    <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #F1F5F9' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>{strings.sol_op_mock_task2}</Typography>
                                        <Chip label={strings.sol_op_mock_task_status2} size="small" sx={{ height: 20, bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 800, fontSize: '0.625rem' }} />
                                    </Box>
                                </Stack>
                            </Box>
                        </Paper>
                    }
                />

                {/* Section 2: WhatsApp Alerts */}
                <SolutionItem
                    reverse
                    icon={<ChatBubbleOutlineIcon sx={{ color: '#597CFF' }} />}
                    title={strings.sol_op_sol2_title}
                    desc={strings.sol_op_sol2_desc}
                    bullets={[strings.sol_op_sol2_li1, strings.sol_op_sol2_li2]}
                    mockup={
                        <Paper elevation={16} sx={{ p: 0, borderRadius: '24px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                            <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <ChatBubbleOutlineIcon sx={{ color: '#22C55E' }} />
                                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{strings.sol_op_mock_wa_title}</Typography>
                            </Box>
                            <Box sx={{ p: 4 }}>
                                <Box sx={{ p: 3, bgcolor: '#F0FDF4', border: '1px dashed #22C55E', borderRadius: '16px', mb: 3 }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#166534', mb: 1 }}>{strings.sol_op_mock_wa_msg1}</Typography>
                                    <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#14532D', mb: 1.5, lineHeight: 1.6 }}>
                                        {strings.sol_op_mock_wa_msg2}<br />
                                        **{strings.sol_op_mock_wa_msg3}**<br />
                                        {strings.sol_op_mock_wa_msg4}<br />
                                        {strings.sol_op_mock_wa_msg5}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Box sx={{ p: 2, border: '1px solid #F1F5F9', borderRadius: '12px', bgcolor: '#F8FAFC', maxWidth: '80%' }}>
                                        <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#475569' }}>{strings.sol_op_mock_wa_reply}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    }
                />

                {/* Section 3: Ticketing */}
                <SolutionItem
                    icon={<ReportProblemIcon sx={{ color: '#597CFF' }} />}
                    title={strings.sol_op_sol3_title}
                    desc={strings.sol_op_sol3_desc}
                    bullets={[strings.sol_op_sol3_li1, strings.sol_op_sol3_li2]}
                    mockup={
                        <Paper elevation={16} sx={{ p: 0, borderRadius: '24px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                            <Box sx={{ p: 2.5, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#FEF2F2', color: '#EF4444' }}><ReportProblemIcon fontSize="small" /></Box>
                                    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{strings.sol_op_mock_ticket_id}</Typography>
                                </Stack>
                                <Chip label={strings.sol_op_mock_ticket_urgent} size="small" sx={{ bgcolor: '#FEF2F2', color: '#B91C1C', fontWeight: 900, fontSize: '0.625rem' }} />
                            </Box>
                            <Box sx={{ p: 4 }}>
                                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, mb: 1, display: 'block' }}>{strings.sol_op_mock_ticket_report}</Typography>
                                <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9', mb: 3 }}>
                                    <Typography variant="body2" sx={{ color: '#475569', fontStyle: 'italic', lineHeight: 1.6 }}>
                                        {strings.sol_op_mock_ticket_msg}
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 2.5, bgcolor: '#F5F3FF', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#5B21B6' }}>{strings.sol_op_mock_ticket_assign}</Typography>
                                        <Typography variant="caption" sx={{ color: '#7C3AED', fontWeight: 700 }}>{strings.sol_op_mock_ticket_sla}</Typography>
                                    </Box>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#DDD6FE', fontSize: '0.75rem', fontWeight: 800, color: '#5B21B6' }}>MNT</Avatar>
                                </Box>
                            </Box>
                        </Paper>
                    }
                />
            </Container>
        </Box>
    );
}
