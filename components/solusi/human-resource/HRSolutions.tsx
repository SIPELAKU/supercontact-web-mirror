"use client";

import { Box, Container, Typography, Grid, Stack, Paper, Chip } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CampaignIcon from '@mui/icons-material/Campaign';
import { Groups } from "@mui/icons-material";

export default function HRSolutions() {
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
                    <Typography variant="overline" sx={{ color: '#6366F1', fontWeight: 800, letterSpacing: 2 }}>
                        {strings.sol_hr_sol_badge}
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#0F172A' }}>
                        {strings.sol_hr_sol_title}
                    </Typography>
                </Stack>

                {/* Section 1: Helpdesk */}
                <SolutionItem
                    icon={<ContactSupportIcon sx={{ color: '#6366F1' }} />}
                    title={strings.sol_hr_sol1_title}
                    desc={strings.sol_hr_sol1_desc}
                    bullets={[strings.sol_hr_sol1_li1, strings.sol_hr_sol1_li2, strings.sol_hr_sol1_li3]}
                    mockup={
                        <Paper elevation={16} sx={{ p: 0, borderRadius: '20px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                            <Box sx={{ p: 2, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.875rem' }}>{strings.sol_hr_mock_ticket_title}</Typography>
                                <Chip label={strings.sol_hr_mock_ticket_status} size="small" sx={{ height: 20, fontSize: '0.625rem', fontWeight: 900, bgcolor: '#FFF1F2', color: '#E11D48' }} />
                            </Box>
                            <Box sx={{ p: 3 }}>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, p: 2, bgcolor: '#F8FAFC', borderRadius: '12px' }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#64748B' }}>JD</Box>
                                    <Box>
                                        <Typography sx={{ fontWeight: 800, fontSize: '0.875rem' }}>{strings.sol_hr_mock_ticket_user}</Typography>
                                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>{strings.sol_hr_mock_ticket_sub}</Typography>
                                    </Box>
                                </Stack>
                                <Box sx={{ p: 2.5, bgcolor: 'white', border: '1px solid #F1F5F9', borderRadius: '12px', mb: 3 }}>
                                    <Typography variant="body2" sx={{ color: '#475569', fontStyle: 'italic', lineHeight: 1.6 }}>
                                        {strings.sol_hr_mock_ticket_msg}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, p: 1, border: '1px solid #E2E8F0', borderRadius: '6px' }}>
                                        <AssessmentIcon sx={{ fontSize: 14 }} /> {strings.sol_hr_mock_ticket_assign}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    }
                />

                {/* Section 2: Recruitment */}
                <SolutionItem
                    reverse
                    icon={<Groups sx={{ color: '#6366F1' }} />}
                    title={strings.sol_hr_sol2_title}
                    desc={strings.sol_hr_sol2_desc}
                    bullets={[strings.sol_hr_sol2_li1, strings.sol_hr_sol2_li2, strings.sol_hr_sol2_li3]}
                    mockup={
                        <Paper elevation={16} sx={{ p: 3, borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.875rem' }}>{strings.sol_hr_mock_rec_title}</Typography>
                                <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: 700 }}>{strings.sol_hr_mock_rec_active}</Typography>
                            </Box>
                            <Grid container spacing={2}>
                                {['col1', 'col2'].map((col, idx) => (
                                    <Grid item xs={6} key={idx}>
                                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, mb: 1.5, display: 'block', fontSize: '0.65rem' }}>
                                            {idx === 0 ? strings.sol_hr_mock_rec_col1 : strings.sol_hr_mock_rec_col2}
                                        </Typography>
                                        <Stack spacing={1.5}>
                                            <Box sx={{ p: 1.5, border: '1px solid #F1F5F9', borderRadius: '8px', bgcolor: 'white' }}>
                                                <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', mb: 0.5 }}>{idx === 0 ? "Sarah Wijaya" : "Anita Kusuma"}</Typography>
                                                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.65rem', display: 'block' }}>
                                                    {idx === 0 ? "💼 Besok, 10:00" : "Kirim Draft PKWT"}
                                                </Typography>
                                                {idx === 1 && <Box sx={{ mt: 1, height: 4, width: '100%', bgcolor: '#DCFCE7', borderRadius: 2 }} />}
                                            </Box>
                                            {idx === 0 && (
                                                <Box sx={{ p: 1.5, border: '1px solid #F1F5F9', borderRadius: '8px', bgcolor: 'white', opacity: 0.6 }}>
                                                    <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', mb: 0.5 }}>Kevin Lukman</Typography>
                                                    <Typography variant="caption" sx={{ color: '#22C55E', fontSize: '0.65rem' }}>✓ Selesai</Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    }
                />

                {/* Section 3: Broadcast */}
                <SolutionItem
                    icon={<CampaignIcon sx={{ color: '#6366F1' }} />}
                    title={strings.sol_hr_sol3_title}
                    desc={strings.sol_hr_sol3_desc}
                    bullets={[strings.sol_hr_sol3_li1, strings.sol_hr_sol3_li2]}
                    mockup={
                        <Paper elevation={16} sx={{ p: 0, borderRadius: '20px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                            <Box sx={{ p: 2, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.875rem' }}>{strings.sol_hr_mock_broadcast_title}</Typography>
                                <Chip label="Kirim Internal" size="small" sx={{ height: 20, fontSize: '0.625rem', fontWeight: 700, bgcolor: '#EEF2FF', color: '#6366F1' }} />
                            </Box>
                            <Box sx={{ p: 3 }}>
                                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, display: 'block', mb: 1, fontSize: '0.65rem' }}>TARGET SEGMEN:</Typography>
                                <Box sx={{ p: 1, border: '1px solid #E2E8F0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>{strings.sol_hr_mock_broadcast_target}</Typography>
                                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid #6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#6366F1' }} /></Box>
                                </Box>
                                <Box sx={{ p: 2.5, bgcolor: '#F0FDF4', border: '1px dashed #22C55E', borderRadius: '12px' }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#166534', mb: 1 }}>{strings.sol_hr_mock_broadcast_subject}</Typography>
                                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#14532D', lineHeight: 1.6 }}>
                                        {strings.sol_hr_mock_broadcast_msg}
                                    </Typography>
                                    <Typography variant="caption" sx={{ mt: 1.5, display: 'block', color: '#166534' }}>Terima kasih.</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    }
                />
            </Container>
        </Box>
    );
}
