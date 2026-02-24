import React from 'react';
import { Box, Typography, Button, Paper, Grid, Chip, List, ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { strings } from '@/lib/utils/strings';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { NO_WA } from '@/lib/constants/constants';

const PlanCard = ({
    title,
    desc,
    price,
    date,
    features,
    isPopular = false,
    buttonText = strings.whatsapp_sales_button,
    tag
}: {
    title: string,
    desc: string,
    price: string,
    date?: string,
    features: string[],
    isPopular?: boolean,
    buttonText?: string,
    tag?: string
}) => {
    const theme = useTheme();

    return (
        <Paper
            elevation={0} // Clean look from image
            sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '24px',
                position: 'relative',
                border: '1px solid #E5E7EB',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                    borderColor: '#5570F1', // Subtle blue border on hover
                    boxShadow: '0px 20px 40px rgba(0,0,0,0.06)'
                }
            }}
        >
            {isPopular && tag && (
                <Chip
                    label={tag}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        fontWeight: 600,
                        backgroundColor: '#E0E7FF',
                        color: '#5570F1',
                        fontSize: '0.75rem'
                    }}
                />
            )}

            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#334155', mb: 1 }}>
                    {title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6, px: 2 }}>
                    {desc}
                </Typography>
            </Box>

            <Box sx={{ mb: 4, textAlign: 'center' }}>
                {price === strings.plan_3_price ? (
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#5570F1' }}>
                        {price}
                    </Typography>
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748B', mt: 1, mr: 0.5 }}>
                            Rp.
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#5570F1' }}>
                            {price.replace("Rp ", "").replace("Rp. ", "").replace("k", "")}
                            {/* <Typography component="span" variant="h3" sx={{ fontWeight: 700, textTransform: 'none' }}>
                                {price.toLowerCase().includes('k') ? 'k' : ''}
                            </Typography> */}
                        </Typography>
                        {date && (
                            <Typography variant="body2" sx={{ alignSelf: 'flex-end', mb: 1, ml: 0.5, color: '#64748B' }}>
                                {date}
                            </Typography>
                        )}
                    </Box>
                )}
            </Box>

            <List sx={{ mb: 4, flexGrow: 1, px: 2 }}>
                {features.map((feature, index) => (
                    <ListItem key={index} disableGutters sx={{ py: 0.75, alignItems: 'flex-start' }}>
                        <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                            <RadioButtonUncheckedIcon sx={{ fontSize: '1rem', color: '#94A3B8' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary={feature}
                            primaryTypographyProps={{
                                variant: 'body2',
                                sx: { color: '#475569', fontWeight: 500, lineHeight: 1.4 }
                            }}
                        />
                    </ListItem>
                ))}
            </List>

            <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => {
                    const message = encodeURIComponent(`Halo, saya tertarik dengan product ${title}`);
                    window.open(`https://wa.me/${NO_WA}?text=${message}`, '_blank');
                }}
                startIcon={<WhatsAppIcon />}
                sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1.5,
                    boxShadow: 'none',
                    bgcolor: '#5570F1',
                    '&:hover': {
                        bgcolor: '#445ed9',
                        boxShadow: 'none'
                    }
                }}
            >
                {buttonText}
            </Button>
        </Paper>
    );
};

const PricingCards = () => {
    return (
        <Box sx={{ mb: 8 }}>
            <Grid container spacing={4} justifyContent="center" alignItems="stretch">
                {/* Plan 1 */}
                <Grid item xs={12} md={4}>
                    <PlanCard
                        title={strings.plan_1_title}
                        desc={strings.plan_1_desc}
                        price={strings.plan_1_price}
                        date={strings.plan_month}
                        features={[
                            strings.plan_1_feat_1,
                            strings.plan_1_feat_2,
                            strings.plan_1_feat_3,
                            strings.plan_1_feat_4,
                            strings.plan_1_feat_5,
                        ]}
                    />
                </Grid>

                {/* Plan 2 */}
                <Grid item xs={12} md={4}>
                    <PlanCard
                        title={strings.plan_2_title}
                        desc={strings.plan_2_desc}
                        price={strings.plan_2_price}
                        date={strings.plan_month}
                        isPopular={true}
                        tag={strings.plan_2_tag}
                        features={[
                            strings.plan_2_feat_1,
                            strings.plan_2_feat_2,
                            strings.plan_2_feat_3,
                            strings.plan_2_feat_4,
                            strings.plan_2_feat_5,
                        ]}
                    />
                </Grid>

                {/* Plan 3 */}
                <Grid item xs={12} md={4}>
                    <PlanCard
                        title={strings.plan_3_title}
                        desc={strings.plan_3_desc}
                        price={strings.plan_3_price}
                        features={[
                            strings.plan_3_feat_1,
                            strings.plan_3_feat_2,
                            strings.plan_3_feat_3,
                            strings.plan_3_feat_4,
                            strings.plan_3_feat_5,
                        ]}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default PricingCards;
