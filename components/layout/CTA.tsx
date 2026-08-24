'use client';

import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    TextField,
    Button,
    Avatar,
} from '@mui/material';
import { strings } from '@/lib/utils/strings';
import { useLanguage } from '@/lib/context/LanguageContext';
import SendIcon from '@mui/icons-material/Send';
import { EMAIL } from '@/lib/constants/constants';

const CTA = () => {
    useLanguage();
    const [formData, setFormData] = React.useState({
        fullName: '',
        email: '',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        const { fullName, email, message } = formData;
        const subject = encodeURIComponent(`Inquiry from ${fullName}`);
        const body = encodeURIComponent(
            `Name: ${fullName}\n` +
            `Email: ${email}\n\n` +
            `Message:\n${message}`
        );

        // Destination email is empty for now as requested
        window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    };

    return (
        <Box sx={{ py: { xs: 0, md: 10 }, pb: { xs: 10 }, backgroundColor: '#F7F7F9' }}>
            <Container>
                <Box sx={{ textAlign: 'center', mb: 6, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: { xs: '100%', md: '70%' } }}>
                    {/* Vector Element */}
                    <Box
                        component="img"
                        src="/assets/vector.png"
                        alt=""
                        aria-hidden="true"
                        sx={{
                            width: 30, // Adjusted size
                            height: 'auto',
                            opacity: 0.8,
                            mr: 2, // Spacing between vector and text
                            transform: 'translateY(-50%)', // Fine tune alignment
                            mt: 1,
                            display: { xs: 'none', md: 'block' }
                        }}
                    />
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {strings.work_together_title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {strings.work_together_subtitle}
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={5} alignItems="stretch">
                    {/* Left Side - Info */}
                    <Grid item xs={12} md={5}>
                        <Box sx={{
                            height: '100%',
                            backgroundColor: '#5479EE',
                            color: 'white',
                            p: { xs: 4, md: 5 },
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            borderRadius: '24px',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        }}>


                            <Box sx={{ position: 'relative', zIndex: 1, mt: 4 }}>
                                <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1 }}>
                                    {strings.contact_card_title}
                                </Typography>
                                <Typography variant="h4" component="h3" sx={{ fontWeight: 700, mt: 2, mb: 4, lineHeight: 1.3 }}>
                                    {strings.contact_card_desc}
                                </Typography>
                            </Box>

                            <Box sx={{ position: 'relative', height: 120, mb: 2 }}>
                                {/* Scattered Avatars */}
                                <Avatar
                                    alt="User 1"
                                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0"
                                    sx={{
                                        position: 'absolute',
                                        top: '20%',
                                        left: '0%',
                                        width: 56,
                                        height: 56,
                                        border: '3px solid rgba(255,255,255,0.2)'
                                    }}
                                />
                                <Avatar
                                    alt="User 2"
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0"
                                    sx={{
                                        position: 'absolute',
                                        bottom: '0%',
                                        left: '35%',
                                        width: 64,
                                        height: 64,
                                        border: '3px solid rgba(255,255,255,0.2)'
                                    }}
                                />
                                <Avatar
                                    alt="User 3"
                                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0"
                                    sx={{
                                        position: 'absolute',
                                        top: '30%',
                                        right: '0%',
                                        width: 50,
                                        height: 50,
                                        border: '3px solid rgba(255,255,255,0.2)'
                                    }}
                                />
                            </Box>

                            <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
                                {strings.contact_card_footer}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Right Side - Form */}
                    <Grid item xs={12} md={7}>
                        <Box sx={{
                            backgroundColor: 'white',
                            p: { xs: 4, md: 6 },
                            borderRadius: '24px',
                            border: '1px solid #eee',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                            height: '100%'
                        }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: '#333' }}>
                                {strings.share_ideas_title}
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="fullName"
                                        label={strings.input_full_name}
                                        variant="outlined"
                                        size="medium"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        InputProps={{ sx: { borderRadius: '12px', bgcolor: '#F9FAFB' } }}
                                        sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#eee' } } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="email"
                                        label={strings.input_email_address}
                                        variant="outlined"
                                        size="medium"
                                        value={formData.email}
                                        onChange={handleChange}
                                        InputProps={{ sx: { borderRadius: '12px', bgcolor: '#F9FAFB' } }}
                                        sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#eee' } } }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="message"
                                        label={strings.input_message}
                                        variant="outlined"
                                        multiline
                                        rows={6}
                                        value={formData.message}
                                        onChange={handleChange}
                                        InputProps={{ sx: { borderRadius: '12px', bgcolor: '#F9FAFB' } }}
                                        sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#eee' } } }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        disabled={!formData.fullName || !formData.email || !formData.message}
                                        size="large"
                                        endIcon={<SendIcon />}
                                        onClick={handleSubmit}
                                        sx={{
                                            px: 5,
                                            py: 1.5,
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            fontSize: '1rem'
                                        }}
                                    >
                                        {strings.send_inquiry}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>


            </Container>
        </Box>
    );
};

export default CTA;
