import { Metadata } from 'next';
import RetailClient from '@/components/solution-retail/RetailClient';
import { ogImageUrl } from '@/lib/utils/og-image';

const PAGE_URL = 'https://smartsales.id/solusi/ritel';

const OG_IMAGE = ogImageUrl({ title: 'Solusi CRM untuk Toko Ritel', category: 'Solusi Ritel' });

export const metadata: Metadata = {
  title: 'Solusi CRM untuk Toko Ritel - SmartSales',
  description: 'Kelola database member, broadcast promo via WhatsApp, dan klaim garansi toko ritel Anda dalam satu sistem. Coba gratis, tanpa komitmen di awal.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'Solusi CRM untuk Toko Ritel | SmartSales',
    description: 'Kelola database member, broadcast promo via WhatsApp, dan klaim garansi toko ritel Anda dalam satu sistem. Coba gratis, tanpa komitmen di awal.',
    url: PAGE_URL,
    siteName: 'SmartSales',
    locale: 'id_ID',
    type: 'website',
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solusi CRM untuk Toko Ritel | SmartSales',
    description: 'Kelola database member, broadcast promo via WhatsApp, dan klaim garansi toko ritel Anda dalam satu sistem. Coba gratis, tanpa komitmen di awal.',
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
      name: 'Solusi Industri Ritel',
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
      name: 'Bagaimana cara SmartSales membantu mengelola database member toko saya?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SmartSales menjadikan CRM Sales sebagai pusat data pelanggan toko Anda. Setiap member bisa dikategorikan berdasarkan tingkat loyalitas (Silver, Gold, VIP), lengkap dengan riwayat interaksi dan pembelian yang tercatat otomatis, bukan lagi di buku catatan atau spreadsheet terpisah.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah broadcast promo lewat WhatsApp bisa ditargetkan ke member tertentu saja, misalnya hanya member VIP?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. Karena data pelanggan sudah dikategorikan di CRM Sales, Anda dapat memilih segmen tertentu (misalnya VIP atau Gold) sebelum mengirim broadcast promo, sehingga pesan tidak dikirim secara acak ke seluruh kontak.',
      },
    },
    {
      '@type': 'Question',
      name: 'Broadcast promo ke pelanggan itu pakai WhatsApp pribadi admin atau nomor resmi toko?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Menggunakan WhatsApp Business API resmi (centang hijau) atas nama toko Anda, bukan nomor pribadi staf. Nomor ini bisa dipegang dan dibalas oleh beberapa admin sekaligus dari satu sistem yang sama.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bagaimana proses klaim garansi dicatat supaya tidak hilang atau terlewat?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Keluhan kerusakan barang yang masuk lewat admin CS diubah menjadi tiket lewat modul Ticket Creation, lalu diteruskan ke teknisi atau service center tanpa data yang hilang di tengah jalan.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah pelanggan bisa memantau status klaim garansi mereka tanpa harus bertanya berulang kali?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. Setiap tiket klaim garansi memiliki status yang diperbarui secara berkala, sehingga pelanggan mendapat informasi progres perbaikan tanpa harus menghubungi toko berulang kali untuk sekadar bertanya status.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah admin toko bisa menjawab pertanyaan jam buka atau lokasi toko secara otomatis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa, menggunakan fitur Auto-Reply. Pertanyaan umum seperti jam operasional atau lokasi toko dapat dijawab otomatis, sementara admin fokus menangani pertanyaan yang butuh respons personal.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah data pelanggan dan riwayat pembelian toko saya aman?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SmartSales dibangun dengan arsitektur multi-tenant, artinya data setiap perusahaan terpisah secara logis dari perusahaan lain yang menggunakan sistem yang sama.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bisakah alur kerja SmartSales disesuaikan dengan proses toko kami yang sudah berjalan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. SmartSales bersifat custom build dan multi-tenant, mulai dari kategori loyalitas member, template promo, hingga alur eskalasi tiket klaim garansi dapat disesuaikan dengan proses yang sudah berjalan di toko Anda.',
      },
    },
    {
      '@type': 'Question',
      name: 'Berapa biaya berlangganan SmartSales untuk toko ritel?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Struktur paket SmartSales berlaku sama untuk semua industri, mencakup modul CRM Sales, CRM Services (ticketing), dan Omnichannel WhatsApp. Rincian paket dan harga terbaru bisa dilihat langsung di halaman harga kami.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah ada uji coba gratis sebelum berlangganan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ada. Anda bisa memulai uji coba gratis atau berkonsultasi lebih dulu dengan tim kami untuk melihat apakah alur pengelolaan member, broadcast promo, dan klaim garansi di SmartSales sesuai dengan kebutuhan toko Anda.',
      },
    },
  ],
};

export default function RetailPage() {
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
      <RetailClient />
    </>
  );
}
