"use client";

import React from "react";
import Image from "next/image";
import { Box, Container, Typography } from "@mui/material";
import { strings } from "@/lib/utils/strings"; 

const LogoCard = ({ logo, index }: { logo: string; index: number }) => (
  <div
    key={`logo-${index}`}
    className="shrink-0 h-16 w-32 md:h-24 md:w-48 relative bg-brand-primary-subtle rounded-xl flex items-center justify-center backdrop-blur-sm hover:opacity-60 hover:shadow-md transition-all duration-300 group"
  >
    <Image
      src={logo}
      alt={decodeURIComponent(logo.split('/').pop()?.replace('.png', '') || 'Client Logo')}
      fill
      sizes="(max-width: 768px) 33vw, 15vw"
      className="object-contain p-2 opacity-80 hover:opacity-100 transition-opacity"
    />
  </div>
);

export const ClientLogos = () => {
  // Shared logo lists
  const logosRow1 = [
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/Danone%20Indonesia.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/Dana%20Pensiun%20OJK.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/Coca-Cola%20Europacific%20Partners.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/Astra%20International.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/Victoria%20Care.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/Trakindo%20Utama.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/Telkom%20Sigma.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/Sido%20Muncul.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/Samudera%20Indonesia.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Wijaya%20Karya%20%28WIKA%29.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Waskita%20Karya.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Virtus%20Venturama.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Vale%20Indonesia%20Tbk.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20TPPI.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Tamaris%20Hydro.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Sucofindo.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Staromni%20Industri.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20SMART%20Tbk.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Pupuk%20Indonesia%20%28Persero%29.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Pulo%20Mas%20Jaya.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Pos%20Indonesia%20%28POS%20IND%29.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Polytama%20Propindo.png",
  ];
  // Duplicate for infinite scroll effect (CSS requires seamless duplication)
  const row1 = [...logosRow1, ...logosRow1];

  const logosRow2 = [
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Petrokimia%20Gresik.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Pertamedika%20IHC.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Penjaminan%20Infrastruktur%20Indonesia%20%28PII%29.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Pengadaan%20Indonesia.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Nusantara%20Medika%20Utama.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Novell%20Pharmaceutical.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Nindya%20Karya.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Metta%20Sinar%20Sejahtera.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Latinusa%20Tbk.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Lamong%20Energi%20Indonesia.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Krakatau%20Steel%20Tbk.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Kimia%20Farma%20Tbk.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20KBN%20%28Kawasan%20Berikat%20Nusantara%29.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Kansai%20Paint%20Indonesia.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Kalbe%20Farma%20Tbk.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Jasa%20Marga.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Jasa%20Marga%20Tollroad%20Maintenance.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20JakLingko%20Indonesia.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Jakarta%20Propertindo%20%28JakPro%29.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20INKA%20%28Industri%20Kereta%20Api%29.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Indonesia%20Chemical%20Alumina.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Indexim%20Coalindo.png",
  ];
  const row2 = [...logosRow2, ...logosRow2];

  const logosRow3 = [
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Hutama%20Karya.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Gagas%20Energi%20Indonesia.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Elnusa%20Petrofin.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Depoguna%20Bangunan%20Online.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Bukit%20Asam%20Tbk.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Brantas%20Abipraya.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Antam%20Tbk.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Angkasa%20Pura%20Supports.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Angkasa%20Pura%20Properti%20%28IAS%20Properties%29.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PT%20Alba%20Pack%20Global.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/Perumda%20Tirta%20Alam%20Tarakan.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/Perum%20Jasa%20Tirta%20I.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/Pelindo%20%28Pelabuhan%20Indonesia%29.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/PAM%20JAYA.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/Nestl%C3%A9%20Indonesia.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/MRT%20Jakarta.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/Medco%20Energi.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/LRT%20Jakarta.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/Kalla%20Group.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/Indomaret.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/Garuda%20Indonesia.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/Food%20Station%20Tjipinang%20Jaya.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/Alfamart.png",
    "https://gqxmce8d8pkarsyu.public.blob.vercel-storage.com/Solvera/Solvera_Website/Client_Logo/Aerofood%20ACS.png",
  ];
  const row3 = [...logosRow3, ...logosRow3];

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
      </Container>

      {/* Masking Gradient agar logo terlihat memudar di kiri kanan */}
      <div className="relative w-full flex flex-col gap-4 md:gap-8 mask-gradient">

        {/* Row 1 - Gerak ke Kiri */}
        <div className="flex w-full overflow-hidden">
          <div className="flex gap-4 md:gap-8 pr-4 md:pr-8 animate-scroll-left pause-on-hover">
            {row1.map((logo, index) => (
              <LogoCard key={`row1-${index}`} logo={logo} index={index} />
            ))}
          </div>
        </div>

        {/* Row 2 - Gerak ke Kanan */}
        <div className="flex w-full overflow-hidden">
          <div className="flex gap-4 md:gap-8 pr-4 md:pr-8 animate-scroll-right pause-on-hover">
            {row2.map((logo, index) => (
              <LogoCard key={`row2-${index}`} logo={logo} index={index} />
            ))}
          </div>
        </div>

        {/* Row 3 - Gerak ke Kiri */}
        <div className="flex w-full overflow-hidden">
          <div className="flex gap-4 md:gap-8 pr-4 md:pr-8 animate-scroll-left pause-on-hover">
            {row3.map((logo, index) => (
              <LogoCard key={`row3-${index}`} logo={logo} index={index} />
            ))}
          </div>
        </div>

      </div>
    </Box>
  );
};