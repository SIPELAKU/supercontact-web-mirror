"use client";

import React from 'react';
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { strings } from '@/lib/utils/strings';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function IntFAQ() {
    useLanguage();
    const [expanded, setExpanded] = React.useState<string | false>('panel0');

    const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    const faqs = [
        { q: strings.sol_int_faq_q1, a: strings.sol_int_faq_a1 },
        { q: strings.sol_int_faq_q2, a: strings.sol_int_faq_a2 },
        { q: strings.sol_int_faq_q3, a: strings.sol_int_faq_a3 },
        { q: strings.sol_int_faq_q4, a: strings.sol_int_faq_a4 },
        { q: strings.sol_int_faq_q5, a: strings.sol_int_faq_a5 },
        { q: strings.sol_int_faq_q6, a: strings.sol_int_faq_a6 },
        { q: strings.sol_int_faq_q7, a: strings.sol_int_faq_a7 },
        { q: strings.sol_int_faq_q8, a: strings.sol_int_faq_a8 },
        { q: strings.sol_int_faq_q9, a: strings.sol_int_faq_a9 },
        { q: strings.sol_int_faq_q10, a: strings.sol_int_faq_a10 },
        { q: strings.sol_int_faq_q11, a: strings.sol_int_faq_a11 },
        { q: strings.sol_int_faq_q12, a: strings.sol_int_faq_a12 },
    ];

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F8FAFC' }}>
            <Container maxWidth="md">
                <Typography variant="h2" component="h2" sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#0F172A', textAlign: 'center', mb: 6 }}>
                    {strings.sol_int_faq_title}
                </Typography>

                {faqs.map((faq, index) => (
                    <Accordion
                        key={index}
                        expanded={expanded === `panel${index}`}
                        onChange={handleChange(`panel${index}`)}
                        elevation={0}
                        sx={{
                            mb: 1.5,
                            borderRadius: '16px !important',
                            border: '1px solid #E2E8F0',
                            '&:before': { display: 'none' },
                            bgcolor: 'white',
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            id={`faq-summary-${index}`}
                            aria-controls={`faq-panel-${index}`}
                        >
                            <Typography sx={{ fontWeight: 700, color: '#0F172A' }}>{faq.q}</Typography>
                        </AccordionSummary>
                        <AccordionDetails
                            id={`faq-panel-${index}`}
                            aria-labelledby={`faq-summary-${index}`}
                        >
                            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7 }}>
                                {faq.a}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Container>
        </Box>
    );
}
