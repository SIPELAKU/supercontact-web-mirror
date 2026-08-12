'use client';

import React from 'react';
import {
    Box,
    Container,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { strings } from '@/lib/utils/strings';
import { useLanguage } from '@/lib/context/LanguageContext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const FAQ = () => {
    useLanguage();

    const [expanded, setExpanded] = React.useState<string | false>('panel0');

    const handleChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
    };

    // Mock data for FAQs
    const faqs = [
        {
            id: 1,
            question: strings.faq_q1_text,
            answer: strings.faq_a1_text,
        },
        {
            id: 2,
            question: strings.faq_q2_text,
            answer: strings.faq_a2_text,
        },
        {
            id: 3,
            question: strings.faq_q3_text,
            answer: strings.faq_a3_text,
        },
        {
            id: 4,
            question: strings.faq_q4_text,
            answer: strings.faq_a4_text,
        },
    ];

    return (
        <Box sx={{ py: { xs: 0, md: 10 }, pb: { xs: 10 }, bgcolor: '#F7F7F9', overflow: 'hidden', position: 'relative' }}>
            {/* Polygon Background */}
            <Box
                component="img"
                src="/assets/polygon-faqs.png"
                alt="Polygon Background"
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: 'auto',
                    maxHeight: '800px', // Adjust based on design
                    zIndex: 0,
                    display: { xs: 'none', md: 'block' }
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                {/* Title Section with Star Element */}
                <Box sx={{ textAlign: 'center', mb: 8, position: 'relative' }}>
                    <Box sx={{ display: 'inline-block', position: 'relative' }}>
                        <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 2, color: 'rgba(38, 43, 67, 0.9)', fontSize: { xs: '1.75rem', md: '24px' } }}>
                            {strings.faq_section_title}
                        </Typography>
                        {/* Star Element */}
                        <Box
                            component="img"
                            src="/assets/element.png"
                            alt="Star Element"
                            sx={{
                                position: 'absolute',
                                top: -20,
                                right: -300,
                                width: 40,
                                height: 40,
                                animation: 'spin 10s linear infinite', // Optional subtle animation
                                '@keyframes spin': {
                                    '0%': { transform: 'rotate(0deg)' },
                                    '100%': { transform: 'rotate(360deg)' },
                                }
                            }}
                        />
                    </Box>
                    <Typography variant="body1" color="rgba(38, 43, 67, 0.9)" sx={{ fontSize: { xs: '1rem', md: '16px' } }}>
                        {strings.faq_section_subtitle}
                    </Typography>
                </Box>

                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={5}>
                        {/* Illustration */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                            {/* Dashed circle background effect could be purely CSS or part of image. Assuming image has main illustration. */}
                            <Box
                                component="img"
                                src="/assets/faqs-illustration.png"
                                alt="FAQ Illustration"
                                sx={{
                                    maxWidth: '100%',
                                    height: 'auto',
                                    zIndex: 1,
                                    filter: 'drop-shadow(0px 10px 30px rgba(0,0,0,0.1))'
                                }}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={7}>
                        <Box>
                            {faqs.map((faq, index) => (
                                <Accordion
                                    key={faq.id}
                                    expanded={expanded === `panel${index}`}
                                    onChange={handleChange(`panel${index}`)}
                                    sx={{
                                        mb: 2,
                                        borderRadius: '8px !important',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                        '&:before': { display: 'none' }, // Remove default divider
                                        border: 'none',
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        id={`faq-summary-${index}`}
                                        aria-controls={`faq-panel-${index}`}
                                    >
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>{faq.question}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails
                                        id={`faq-panel-${index}`}
                                        aria-labelledby={`faq-summary-${index}`}
                                    >
                                        <Typography variant="body1" sx={{ color: '#666' }}>{faq.answer}</Typography>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box >
    );
};

export default FAQ;
