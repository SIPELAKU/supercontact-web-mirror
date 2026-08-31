"use client";

import { Box, Container, Typography, Grid, Stack, Paper, Divider, Button } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import SendIcon from '@mui/icons-material/Send';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SmartButtonIcon from '@mui/icons-material/SmartButton';

export default function MarketingSolutions() {
    useLanguage();

    return (
        <Box sx={{ py: { xs: 8, md: 15 }, bgcolor: 'var(--surface-alt)' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 10 }}>
                    <Typography variant="overline" sx={{ color: 'var(--brand-deep)', fontWeight: 700, letterSpacing: 1.5, mb: 2, display: 'block' }}>
                        {strings.sol_mkt_sol_badge}
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#0F172A' }}>
                        {strings.sol_mkt_sol_title}
                    </Typography>
                </Box>

                <Stack spacing={15}>
                    {/* Solution 1 */}
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Box sx={{ width: 48, height: 48, bgcolor: '#DBEAFE', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                <MoveToInboxIcon sx={{ color: '#2563EB' }} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                                {strings.sol_mkt_sol1_title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748B', mb: 4, lineHeight: 1.7 }}>
                                {strings.sol_mkt_sol1_desc}
                            </Typography>
                            <Stack spacing={2}>
                                {[strings.sol_mkt_sol1_li1, strings.sol_mkt_sol1_li2, strings.sol_mkt_sol1_li3].map((item, i) => (
                                    <Stack direction="row" spacing={2} key={i}>
                                        <CheckCircleIcon sx={{ color: '#22C55E', fontSize: 20, mt: 0.3 }} />
                                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                                            {item}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
                                <Typography sx={{ fontWeight: 800, fontSize: '1rem', mb: 3 }}>{strings.sol_mkt_mock_new_lead}</Typography>
                                <Box sx={{ p: 2, bgcolor: 'var(--surface-alt)', borderRadius: '16px', border: '1px solid #F1F5F9', mb: 3 }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534' }}>
                                            <WhatsAppIcon fontSize="small" />
                                        </Box>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem' }}>Rina Anggraini</Typography>
                                            <Stack direction="row" spacing={1}>
                                                <Box sx={{ px: 1, bgcolor: '#E0F2FE', color: '#0369A1', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>{strings.sol_mkt_mock_source_wa}</Box>
                                                <Box sx={{ px: 1, bgcolor: '#F1F5F9', color: '#64748B', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>{strings.sol_mkt_mock_campaign_name}</Box>
                                            </Stack>
                                        </Box>
                                    </Stack>
                                </Box>

                                <Box sx={{ p: 2, bgcolor: '#F0FDF4', borderRadius: '12px', border: '1px solid #DCFCE7', display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <SmartButtonIcon sx={{ color: '#22C55E' }} />
                                    <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, lineHeight: 1.4 }}>
                                        <Box component="span" sx={{ fontWeight: 800 }}>{strings.sol_mkt_mock_auto_label}</Box> {strings.sol_mkt_mock_auto_desc}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Solution 2 */}
                    <Grid container spacing={6} alignItems="center" direction={{ xs: 'column-reverse', md: 'row' }}>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
                                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{strings.sol_mkt_mock_broadcast_title}</Typography>
                                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>{strings.sol_mkt_mock_audience} <Box component="span" sx={{ color: '#2563EB', fontWeight: 700 }}>{strings.sol_mkt_mock_audience_val}</Box></Typography>
                                </Box>
                                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, mb: 0.5, display: 'block' }}>{strings.sol_mkt_mock_target_label}</Typography>
                                <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                                    <Box sx={{ px: 1, py: 0.5, bgcolor: '#FEF9C3', color: '#854D0E', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, border: '1px solid #FEF08A' }}>{strings.sol_mkt_mock_tag1} ✕</Box>
                                    <Box sx={{ px: 1, py: 0.5, bgcolor: '#DBEAFE', color: '#1E40AF', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, border: '1px solid #BFDBFE' }}>{strings.sol_mkt_mock_tag2} ✕</Box>
                                </Stack>

                                <Box sx={{ p: 2, bgcolor: 'var(--surface-alt)', borderRadius: '12px', mb: 3, border: '1px dashed #E2E8F0' }}>
                                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, mb: 1, display: 'block' }}>{strings.sol_mkt_mock_preview_label}</Typography>
                                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: '8px', border: '1px solid #E2E8F0', position: 'relative' }}>
                                        <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.8rem' }}>
                                            {strings.sol_mkt_mock_msg_hi} <br /><br />
                                            {strings.sol_mkt_mock_msg_body}<br /><br />
                                            {strings.sol_mkt_mock_msg_footer}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Button fullWidth variant="contained" startIcon={<SendIcon />} sx={{ bgcolor: '#22C55E', color: 'white', fontWeight: 800, py: 1.5, borderRadius: '12px', textTransform: 'none', '&:hover': { bgcolor: '#16A34A' } }}>
                                    {strings.sol_mkt_mock_broadcast_btn}
                                </Button>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ width: 48, height: 48, bgcolor: '#DCFCE7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                <SendIcon sx={{ color: '#166534' }} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                                {strings.sol_mkt_sol2_title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748B', mb: 4, lineHeight: 1.7 }}>
                                {strings.sol_mkt_sol2_desc}
                            </Typography>
                            <Stack spacing={2}>
                                {[strings.sol_mkt_sol2_li1, strings.sol_mkt_sol2_li2, strings.sol_mkt_sol2_li3].map((item, i) => (
                                    <Stack direction="row" spacing={2} key={i}>
                                        <CheckCircleIcon sx={{ color: '#22C55E', fontSize: 20, mt: 0.3 }} />
                                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                                            {item}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Grid>
                    </Grid>

                    {/* Solution 3 */}
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Box sx={{ width: 48, height: 48, bgcolor: '#F3E8FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                <AssessmentIcon sx={{ color: '#9333EA' }} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                                {strings.sol_mkt_sol3_title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748B', mb: 4, lineHeight: 1.7 }}>
                                {strings.sol_mkt_sol3_desc}
                            </Typography>
                            <Stack spacing={2}>
                                {[strings.sol_mkt_sol3_li1, strings.sol_mkt_sol3_li2].map((item, i) => (
                                    <Stack direction="row" spacing={2} key={i}>
                                        <CheckCircleIcon sx={{ color: '#22C55E', fontSize: 20, mt: 0.3 }} />
                                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                                            {item}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
                                <Typography sx={{ fontWeight: 800, fontSize: '1rem', mb: 3 }}>{strings.sol_mkt_mock_funnel_title}</Typography>
                                <Stack spacing={1.5}>
                                    <Box sx={{ p: 2, bgcolor: '#EFF6FF', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="caption" sx={{ color: '#1E40AF', fontWeight: 800 }}>{strings.sol_mkt_mock_mql}</Typography>
                                        <Typography sx={{ color: '#1E40AF', fontWeight: 800 }}>1,200</Typography>
                                    </Box>
                                    <Box sx={{ px: 4 }}>
                                        <Box sx={{ p: 2, bgcolor: 'var(--surface-alt)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '3px solid #64748B' }}>
                                            <Typography variant="caption" sx={{ color: '#334155', fontWeight: 800 }}>{strings.sol_mkt_mock_sql}</Typography>
                                            <Typography sx={{ color: '#334155', fontWeight: 800 }}>850</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ px: 8, pt: 2 }}>
                                        <Box sx={{ p: 2.5, bgcolor: '#22C55E', color: 'white', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="caption" sx={{ fontWeight: 800 }}>{strings.sol_mkt_mock_closed}</Typography>
                                            <Typography sx={{ fontWeight: 800, fontSize: '1.25rem' }}>115</Typography>
                                        </Box>
                                    </Box>
                                </Stack>
                                <Divider sx={{ my: 4 }} />
                                <Grid container spacing={2}>
                                    <Grid item xs={8}>
                                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, display: 'block' }}>{strings.sol_mkt_mock_revenue_label}</Typography>
                                        <Typography sx={{ fontWeight: 800, fontSize: { xs: '1rem', md: '1.25rem' }, color: '#0F172A' }}>Rp 485.500.000</Typography>
                                    </Grid>
                                    <Grid item xs={4} sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, display: 'block' }}>{strings.sol_mkt_mock_cr}</Typography>
                                        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#22C55E' }}>9.5%</Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                </Stack>
            </Container>
        </Box>
    );
}
