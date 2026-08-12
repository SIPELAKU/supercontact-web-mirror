"use client";

import { Box, Container, Typography, Button } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { usePathname } from "next/navigation";
import { getWhatsAppLink } from "@/lib/utils/wa-link";
import { trackCtaClick } from '@/lib/analytics/events';

export default function CrmSalesCta() {
    useLanguage();
    const pathname = usePathname();

    return (
        <Box
            sx={{
                bgcolor: '#597CFF', // Matching the blue theme
                py: { xs: 8, md: 10 },
                color: 'white',
                textAlign: 'center'
            }}
        >
            <Container maxWidth="md">
                <Typography
                    variant="h3"
                    component="h2"
                    sx={{
                        fontWeight: 700,
                        mb: 3,
                        fontSize: { xs: '2rem', md: '2.5rem' },
                        lineHeight: 1.3
                    }}
                >
                    {strings.crm_sales_cta_title}
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        fontSize: { xs: '1rem', md: '1.125rem' },
                        mb: 5,
                        opacity: 0.9,
                        maxWidth: '800px',
                        mx: 'auto',
                        lineHeight: 1.6
                    }}
                >
                    {strings.crm_sales_cta_desc}
                </Typography>

                <Button
                    variant="contained"
                    size="large"
                    onClick={() => { trackCtaClick('produk/crm-sales', 'impact_cta'); window.open(getWhatsAppLink(pathname), '_blank'); }}
                    sx={{
                        bgcolor: 'white',
                        color: '#597CFF',
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontSize: '1rem',
                        '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                        }
                    }}
                >
                    {strings.crm_sales_cta_btn}
                </Button>
            </Container>
        </Box>
    );
}
