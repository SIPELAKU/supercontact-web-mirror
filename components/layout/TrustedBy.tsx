import React from 'react';
import Slider from 'react-slick';
import { Box, Container, Typography, Card, Rating, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

// Import CSS slick-carousel
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { strings } from '@/lib/utils/strings';

const CustomSliderWrapper = styled(Box)(({ theme }) => ({
    padding: "80px 0", // Increased padding to prevent clipping of scaled cards
    "& .slick-list": {
        overflow: "visible",
        "@media (max-width: 768px)": {
            overflow: "hidden",
        }
    },
    // Efek kartu pudar (opacity rendah) dan ukuran lebih kecil saat tidak fokus
    "& .slick-slide": {
        transition: "all 0.5s ease-in-out",
        opacity: 0.2, // Sangat pudar sesuai desain
        transform: "scale(0.85)",
        "@media (max-width: 768px)": {
            transform: "scale(1)",
            opacity: 1,
        }
    },
    // Efek kartu fokus di tengah (terang dan besar)
    "& .slick-center": {
        opacity: 1,
        transform: "scale(1.1)", // Lebih besar dari kartu lainnya
        "@media (max-width: 768px)": {
            transform: "scale(1)",
            opacity: 1,
        }
    },
    // Indicator Lonjong (Custom Dots)
    "& .slick-dots": {
        bottom: "-80px", // Increased distance from cards
        "& li": {
            margin: "0 4px",
            transition: "all 0.3s ease",
            "& button": {
                width: "12px",
                height: "12px",
                background: "#E5E7EB",
                borderRadius: "50%",
                "&:before": { display: "none" }
            },
            "&.slick-active": {
                width: "45px", // Lebar saat aktif (lonjong)
                "& button": {
                    width: "45px",
                    borderRadius: "10px",
                    background: "#9CA3AF",
                }
            }
        }
    }
}));

const data = [
    {
        id: 1,
        company: "PT Sigap Prima Astrea (Security Services)",
        logo: "/assets/logos/sigap-logo-dark.png",
        name: "A. Riki Adhi",
        role: "Commercial & Sales Division Head",
        text: "Mengelola ribuan kontrak jasa keamanan kini jauh lebih terkontrol dan otomatis."
    },
    {
        id: 2,
        company: "PT Kansai Paint (Consumer & Industrial Paint)",
        logo: "/assets/logos/kansai-logo-real.png",
        name: "Indra Laban",
        role: "Marketing Director",
        text: "SmartSales memberikan visibilitas penuh untuk memantau performa sales di ribuan toko retail."
    },
    {
        id: 3,
        company: "PT Sunson Textile Manufacturer Tbk (Textile)",
        logo: "/assets/logos/sunson-logo-real.png",
        name: "Muchtar Mansyur",
        role: "President Director",
        text: "SmartSales membantu mengelola pipeline pesanan internasional dan lokal dalam satu dasbor."
    },
    {
        id: 4,
        company: "PT Woori Consulting (Business & Investment Consulting)",
        logo: "/assets/logos/woori-logo-real-final.png",
        name: "Lee Han Geun",
        role: "CEO & President Director",
        text: "SmartSales memungkinkan kami mencatat histori interaksi klien secara mendetail dan profesional."
    },
    {
        id: 5,
        company: "PT Megacon Bangun Persada (Concrete/Precast)",
        logo: "/assets/logos/megacon-logo-real.png",
        name: "Hendi Setia Bakti",
        role: "Direktur Utama / Operational Head",
        text: "Proyek konstruksi memiliki siklus penjualan yang teknis dan panjang."
    },
];

const TrustedBy = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
    const isTablet = useMediaQuery(theme.breakpoints.down('md')); // < 900px

    // Menentukan slidesToShow secara dinamis berdasarkan ukuran layar
    const dynamicSlidesToShow = isMobile ? 1 : isTablet ? 2 : 3;
    const dynamicCenterMode = isMobile ? false : true;

    const settings = {
        dots: true,
        infinite: true,
        centerMode: dynamicCenterMode,
        centerPadding: isMobile ? "0px" : isTablet ? "30px" : "0px",
        slidesToShow: dynamicSlidesToShow,
        speed: 600,
        autoplay: true,
        slidesToScroll: 1,
        // Dihapus pengaturan responsive dari react-slick untuk menghindari bug hydration di mobile device
    };

    return (
        <Box sx={{ bgcolor: "#F7F7F9", py: { xs: 6, md: 10 } }} overflow="hidden">
            <Container maxWidth="lg">

                {/* Header Section */}
                <Box sx={{ textAlign: 'center', mb: { xs: 2, md: 4 } }}>
                    <Typography variant="h4" sx={{
                        fontWeight: 800,
                        color: "rgba(38, 43, 67, 0.9)",
                        mb: 2,
                        fontSize: { xs: '1.75rem', md: '24px' }
                    }}>
                        {strings.trusted_by_title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "rgba(38, 43, 67, 0.9)", maxWidth: "700px", mx: "auto", px: 2, fontSize: { xs: '1rem', md: '16px' } }}>
                        {strings.trusted_by_subtitle}
                    </Typography>
                </Box>

                {/* Carousel Section */}
                <CustomSliderWrapper>
                    <Slider {...settings}>
                        {data.map((item) => (
                            <Box key={item.id} sx={{ px: { xs: 0, sm: 2, md: 3 } }}>
                                <Card sx={{
                                    p: { xs: 2.5, md: 4 }, // Reduced padding to fit 294px height
                                    borderRadius: 5,
                                    textAlign: 'center',
                                    width: { xs: '100%', md: '360px' },
                                    height: { xs: 'auto', md: '294px' },
                                    minHeight: { xs: 300, md: 'unset' },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid #F1F5F9',
                                    boxShadow: 'none',
                                    mx: 'auto'
                                }}>
                                    <Box
                                        component="img"
                                        src={item.logo}
                                        sx={{
                                            height: (item.id === 4 || item.id === 5) ? { xs: 45, md: 55 } : { xs: 30, md: 38 }, // Slightly smaller logo
                                            mb: 2, // Reduced margin
                                            objectFit: 'contain'
                                        }}
                                    />
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: "#475569",
                                            fontWeight: 400,
                                            mb: 2, // Reduced margin
                                            lineHeight: 1.5, // Tighter line height
                                            fontSize: { xs: '0.95rem', md: '15px' }, // Slightly smaller font
                                            px: { xs: 1, md: 1 }
                                        }}
                                    >
                                        "{item.text}"
                                    </Typography>
                                    <Rating value={5} readOnly size="small" sx={{ mb: 2, color: "#FBBF24" }} />
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                            color: "#334155",
                                            fontSize: '15px', // Slightly smaller name
                                            mb: 0.2
                                        }}
                                    >
                                        {item.name}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "#94A3B8",
                                            fontSize: '13px' // Slightly smaller role
                                        }}
                                    >
                                        {item.role}
                                    </Typography>
                                </Card>
                            </Box>
                        ))}
                    </Slider>
                </CustomSliderWrapper>

                {/* Brand Logos Footer */}
                {/* <Box
                    sx={{
                        mt: 10,
                        display: { xs: 'grid', sm: 'flex' },
                        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'none' },
                        gap: { xs: 4, sm: 6 },
                        justifyContent: 'center',
                        alignItems: 'center',
                        justifyItems: 'center', // Agar di dalam Grid xs itemnya ke tengah
                        flexWrap: 'wrap'
                    }}
                >
                    {data.map((brand, index) => {
                        const isLastOddItem = data.length % 2 !== 0 && index === data.length - 1;

                        return (
                            <Box
                                key={brand.id}
                                component="img"
                                src={brand.logo}
                                sx={{
                                    height: brand.id === 4 ? 60 : brand.id === 5 ? 45 : 25,
                                    filter: 'grayscale(1)',
                                    opacity: 0.6,
                                    transition: '0.3s',
                                    '&:hover': { opacity: 1, filter: 'grayscale(0)' },
                                    gridColumn: { xs: isLastOddItem ? 'span 2' : 'auto', sm: 'auto' }, // Membawa ke tengah kalau ganjil
                                    justifySelf: { xs: isLastOddItem ? 'center' : 'auto', sm: 'auto' }
                                }}
                            />
                        );
                    })}
                </Box> */}

            </Container>
        </Box>
    );
};

export default TrustedBy;