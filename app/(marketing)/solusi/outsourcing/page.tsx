import { Metadata } from 'next';
import OutsourcingClient from '@/components/solution-outsourcing/OutsourcingClient';
import { ogImageUrl } from '@/lib/utils/og-image';

const PAGE_URL = 'https://smartsales.id/solusi/outsourcing';

const OG_IMAGE = ogImageUrl({ title: 'Solusi CRM untuk Perusahaan Outsourcing', category: 'Solusi Outsourcing' });

export const metadata: Metadata = {
  title: 'Solusi CRM untuk Perusahaan Outsourcing',
  description: 'Kelola ribuan kandidat, pekerja, dan klien B2B dalam satu platform. Otomatiskan rekrutmen, broadcast WhatsApp, dan komplain klien dengan SmartSales.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'Solusi CRM untuk Perusahaan Outsourcing | SmartSales',
    description: 'Kelola ribuan kandidat, pekerja, dan klien B2B dalam satu platform. Otomatiskan rekrutmen, broadcast WhatsApp, dan komplain klien dengan SmartSales.',
    url: PAGE_URL,
    siteName: 'SmartSales',
    locale: 'id_ID',
    type: 'website',
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solusi CRM untuk Perusahaan Outsourcing | SmartSales',
    description: 'Kelola ribuan kandidat, pekerja, dan klien B2B dalam satu platform. Otomatiskan rekrutmen, broadcast WhatsApp, dan komplain klien dengan SmartSales.',
    images: [OG_IMAGE],
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Beranda',
      item: 'https://smartsales.id',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Solusi Industri Outsourcing',
      item: PAGE_URL,
    },
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Bagaimana SmartSales membantu mengelola ribuan data kandidat sekaligus?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Semua data pelamar tersimpan dalam satu database CRM, bukan lagi tersebar di chat WhatsApp pribadi HR. Anda bisa mengategorikan kandidat berdasarkan skill, lokasi, dan status ketersediaan (Standby, Sedang Ditempatkan), sehingga pencarian saat ada permintaan mendadak dari klien jadi jauh lebih cepat.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah SmartSales bisa mengelola pipeline akuisisi klien B2B, bukan hanya kandidat?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. CRM Sales digunakan untuk dua hal sekaligus: melacak Sales Pipeline calon klien perusahaan (B2B) agar tidak ada leads yang terlewat follow up, dan mengelola status ribuan pelamar atau pekerja aktif dalam database yang sama.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bagaimana cara mengirim pengumuman ke ratusan pekerja lapangan sekaligus?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Gunakan fitur Broadcast melalui WhatsApp Business API resmi untuk mengirim info lowongan baru, perubahan jadwal shift, atau pengumuman payroll ke ratusan nomor sekaligus, tanpa risiko nomor WhatsApp diblokir seperti pada WhatsApp Group biasa.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah pertanyaan umum dari pelamar bisa dijawab otomatis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. Anda dapat mengatur Auto-Reply untuk menjawab pertanyaan yang sering diajukan pelamar, misalnya syarat dokumen lamaran atau alamat kantor untuk walk-in interview, sehingga tim HR tidak perlu membalas satu per satu secara manual.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bagaimana proses penanganan komplain klien soal kinerja pekerja outsourcing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Komplain yang masuk lewat WhatsApp, misalnya laporan pekerja absen atau kinerja buruk, langsung diubah menjadi tiket lewat fitur Ticket Creation dan dieskalasi ke Koordinator Lapangan atau Area Manager terkait, lengkap dengan target waktu penyelesaian yang bisa dipantau.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah keluhan internal dari pekerja, misalnya soal BPJS atau payroll, juga bisa ditangani di sistem yang sama?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. Modul ticketing yang sama juga dipakai untuk menangani keluhan internal pekerja seperti masalah BPJS atau kesalahan perhitungan payroll, sehingga penanganannya terstruktur dan tidak hilang di chat pribadi.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah kami akan mendapat pengingat otomatis untuk kontrak klien atau masa percobaan pekerja yang akan habis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ya. SmartSales bisa mengirim pengingat otomatis ke WhatsApp tim operasional saat kontrak kerja sama dengan klien mendekati tanggal habis, atau saat masa percobaan (probation) seorang pekerja akan berakhir.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah alur kerja SmartSales bisa disesuaikan dengan proses rekrutmen kami saat ini?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. SmartSales bersifat multi-tenant dengan pengaturan yang dapat disesuaikan, mulai dari tahapan pipeline rekrutmen (misalnya kandidat baru, interview, penempatan), kolom data pekerja, hingga alur eskalasi tiket komplain, mengikuti proses yang sudah berjalan di perusahaan Anda.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah data kandidat dan klien kami aman jika disimpan di SmartSales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Data disimpan dalam database milik akun perusahaan Anda sendiri (multi-tenant), terpisah dari perusahaan lain yang juga menggunakan SmartSales, dan hanya bisa diakses oleh anggota tim yang Anda beri izin sesuai peran masing-masing.',
      },
    },
    {
      '@type': 'Question',
      name: 'Berapa biaya berlangganan SmartSales untuk perusahaan outsourcing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Struktur paket SmartSales sama untuk semua industri, mencakup modul CRM Sales, CRM Services (ticketing), dan Omnichannel WhatsApp. Rincian paket dan harga terbaru bisa dilihat langsung di halaman harga kami.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah ada uji coba gratis sebelum berlangganan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ada. Anda bisa memulai uji coba gratis atau konsultasi langsung dengan tim kami untuk melihat apakah alur pengelolaan kandidat, klien, dan komplain di SmartSales sesuai dengan kebutuhan perusahaan outsourcing Anda.',
      },
    },
    {
      '@type': 'Question',
      name: 'Berapa lama waktu yang dibutuhkan untuk mulai menggunakan SmartSales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Setelah akun aktif, tim Anda bisa mulai memasukkan data kandidat dan klien, serta menghubungkan nomor WhatsApp Business API, dalam waktu singkat. Untuk kebutuhan penyesuaian alur kerja yang lebih spesifik, tim kami akan membantu proses konfigurasinya.',
      },
    },
  ],
};

export default function OutsourcingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <OutsourcingClient />
    </>
  );
}
