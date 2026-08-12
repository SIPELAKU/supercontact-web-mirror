"use client";

import { Box, Container, Typography, Grid, Paper, Stack, Chip } from "@mui/material";
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import CheckIcon from '@mui/icons-material/Check';
import InboxIcon from '@mui/icons-material/Inbox';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

export default function IntSolution() {
    useLanguage();

    const features = [
        {
            title: strings.sol_int_sol1_title,
            desc: strings.sol_int_sol1_desc,
            li: [strings.sol_int_sol1_li1, strings.sol_int_sol1_li2],
            icon: <InboxIcon sx={{ fontSize: 28 }} />,
            link: { href: '/produk/omnichannel', label: strings.sol_int_sol_link_omni },
        },
        {
            title: strings.sol_int_sol2_title,
            desc: strings.sol_int_sol2_desc,
            li: [strings.sol_int_sol2_li1, strings.sol_int_sol2_li2],
            icon: <AltRouteIcon sx={{ fontSize: 28 }} />,
            link: { href: '/produk/crm-sales', label: strings.sol_int_sol_link_crm },
        },
        {
            title: strings.sol_int_sol3_title,
            desc: strings.sol_int_sol3_desc,
            li: [strings.sol_int_sol3_li1, strings.sol_int_sol3_li2],
            icon: <ViewKanbanIcon sx={{ fontSize: 28 }} />,
            link: { href: '/produk/crm-sales', label: strings.sol_int_sol_link_crm },
        },
        {
            title: strings.sol_int_sol4_title,
            desc: strings.sol_int_sol4_desc,
            li: [strings.sol_int_sol4_li1, strings.sol_int_sol4_li2],
            icon: <QueryStatsIcon sx={{ fontSize: 28 }} />,
            link: { href: '/solusi/marketing', label: strings.sol_role_marketing },
        },
    ];

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F8FAFC' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography variant="overline" sx={{ color: '#597CFF', fontWeight: 700, letterSpacing: 1.5, mb: 2, display: 'block' }}>
                        {strings.sol_int_sol_badge}
                    </Typography>
                    <Typography variant="h2" component="h2" sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#0F172A', maxWidth: '800px', mx: 'auto', mb: 3 }}>
                        {strings.sol_int_sol_title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#475569', maxWidth: '700px', mx: 'auto', lineHeight: 1.7 }}>
                        {strings.sol_int_sol_intro}
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} md={6} key={index}>
                            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, height: '100%', borderRadius: '24px', bgcolor: 'white', border: '1px solid #E2E8F0' }}>
                                <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2.5 }}>
                                    <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: '#EEF2FF', color: '#597CFF', display: 'flex' }}>
                                        {feature.icon}
                                    </Box>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6" component="h3" sx={{ fontWeight: 800, color: '#0F172A' }}>
                                            {feature.title}
                                        </Typography>
                                    </Box>
                                </Stack>
                                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7, mb: 2.5 }}>
                                    {feature.desc}
                                </Typography>
                                <Stack spacing={1.2} sx={{ mb: 2.5 }}>
                                    {feature.li.map((item, i) => (
                                        <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                                            <CheckIcon sx={{ fontSize: 18, color: '#597CFF', mt: 0.2, flexShrink: 0 }} />
                                            <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
                                                {item}
                                            </Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                                <Chip
                                    component={Link}
                                    href={feature.link.href}
                                    clickable
                                    label={feature.link.label}
                                    size="small"
                                    sx={{ bgcolor: '#EEF2FF', color: '#597CFF', fontWeight: 700 }}
                                />
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
