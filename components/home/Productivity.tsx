'use client';

import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
} from '@mui/material';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest'; // Replacement for icons
import CampaignIcon from '@mui/icons-material/Campaign';
import TimelineIcon from '@mui/icons-material/Timeline';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { useLanguage } from '@/lib/context/LanguageContext';
import { strings } from '@/lib/utils/strings';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        p: 2,
    }}>
        <Box sx={{
            mb: 2,
            p: 1.5,
            borderRadius: '50%',
            backgroundColor: 'rgba(84, 121, 238, 0.1)', // Light blue bg
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            {icon}
        </Box>
        <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1, fontSize: '1.1rem' }}>
            {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {description}
        </Typography>
    </Box>
);

const Productivity = () => {
    useLanguage();

    const features = [
        {
            icon: <SettingsSuggestIcon fontSize="large" />,
            title: strings.prod_omnichannel,
            description: strings.prod_omnichannel_desc,
        },
        {
            icon: <CampaignIcon fontSize="large" />,
            title: strings.prod_campaign,
            description: strings.prod_campaign_desc,
        },
        {
            icon: <TimelineIcon fontSize="large" />,
            title: strings.prod_pipeline,
            description: strings.prod_pipeline_desc,
        },
        {
            icon: <HandshakeIcon fontSize="large" />,
            title: strings.prod_deal,
            description: strings.prod_deal_desc,
        },
        {
            icon: <ConfirmationNumberIcon fontSize="large" />,
            title: strings.prod_ticketing,
            description: strings.prod_ticketing_desc,
        },
        {
            icon: <SupportAgentIcon fontSize="large" />,
            title: strings.prod_cs,
            description: strings.prod_cs_desc,
        },
    ];

    return (
        <Box sx={{ py: 10, backgroundColor: 'background.default' }}>
            <Container>
                <Box sx={{ textAlign: 'center', mb: 8, maxWidth: '800px', mx: 'auto' }}>
                    <Typography
                        variant="h4"
                        component="h2"
                        sx={{
                            fontWeight: 700,
                            mb: 2,
                            fontSize: { xs: '2rem', md: '24px' },
                            color: 'rgba(38, 43, 67, 0.9)'
                        }}
                    >
                        {strings.productivity_title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '1rem', md: '15px' } }}>
                        {strings.productivity_subtitle}
                    </Typography>
                </Box>
                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <FeatureCard {...feature} />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default Productivity;
