import { Metadata } from 'next';
import FmcgClient from '@/components/solution-fmcg/FmcgClient';
import { ogImageUrl } from '@/lib/utils/og-image';

const PAGE_URL = 'https://www.smartsales.id/solusi/fmcg';

const OG_IMAGE = ogImageUrl({ title: 'Solusi CRM Distribusi FMCG', category: 'Solusi FMCG' });

export const metadata: Metadata = {
  title: 'Solusi CRM Distribusi FMCG - SmartSales',
  description: 'Kelola order via WhatsApp, canvassing sales lapangan, dan retur barang FMCG dalam satu sistem. Coba gratis, tanpa komitmen di awal.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'Solusi CRM Distribusi FMCG | SmartSales',
    description: 'Kelola order via WhatsApp, canvassing sales lapangan, dan retur barang FMCG dalam satu sistem. Coba gratis, tanpa komitmen di awal.',
    url: PAGE_URL,
    siteName: 'SmartSales',
    locale: 'id_ID',
    type: 'website',
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solusi CRM Distribusi FMCG | SmartSales',
    description: 'Kelola order via WhatsApp, canvassing sales lapangan, dan retur barang FMCG dalam satu sistem. Coba gratis, tanpa komitmen di awal.',
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
      item: 'https://www.smartsales.id/',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Solusi Industri FMCG',
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
      name: 'Apakah SmartSales bisa dipakai untuk terima order dari toko/agen lewat WhatsApp?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. SmartSales menggunakan WhatsApp Business API resmi sehingga satu nomor WhatsApp bisa dipegang bersama oleh seluruh tim admin (Order Taking), lengkap dengan riwayat chat, katalog, dan status order yang tercatat di sistem, bukan hanya di HP pribadi sales.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bagaimana cara memastikan sales canvasser benar-benar mengunjungi toko sesuai jadwal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tim lapangan melakukan Check-in GPS (geo-tagging) melalui aplikasi mobile saat tiba di lokasi toko. Anda juga bisa mengatur jadwal rute kunjungan harian (Journey Plan) per sales, sehingga kunjungan yang benar-benar terjadi bisa dipantau dari dashboard.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bagaimana proses retur barang rusak atau kadaluarsa ditangani di SmartSales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Laporan barang rusak atau bad stock dari toko diubah menjadi tiket lewat modul Ticket Creation, lalu dieskalasi dari admin CS ke tim gudang untuk pengecekan dan persetujuan. Toko bisa memantau status retur tersebut sampai barang pengganti siap dikirim.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah data order dan pesanan bisa hilang jika sales mengganti HP atau resign?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tidak. Karena order masuk lewat nomor WhatsApp Business API resmi perusahaan (bukan nomor pribadi sales) dan tercatat di CRM, data pelanggan, riwayat chat, dan riwayat pesanan tetap tersimpan di sistem meski ada pergantian personel.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah order dari WhatsApp otomatis masuk ke status di gudang?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Status order bisa diubah secara manual oleh tim admin atau gudang mengikuti tahapan dari Purchase Order (PO), proses gudang, hingga siap dikirim oleh armada logistik, sehingga seluruh tim melihat status yang sama secara real-time.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah SmartSales cocok untuk distributor dengan ratusan toko/retailer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cocok. Fitur CRM Sales & Canvassing dirancang untuk mengelola data ratusan toko retail sekaligus, memantau pesanan yang masuk secara visual, dan melacak produktivitas tim lapangan per sales.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah harga SmartSales berbeda untuk kebutuhan distribusi FMCG?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Struktur paket SmartSales sama untuk semua industri, mencakup modul CRM Sales, CRM Services (ticketing), dan Omnichannel WhatsApp. Rincian paket dan harga terbaru bisa dilihat langsung di halaman harga kami.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bisakah alur kerja SmartSales disesuaikan dengan proses distribusi kami saat ini?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. SmartSales bersifat multi-tenant dengan pengaturan yang bisa disesuaikan, mulai dari kolom data toko, tahapan status order, template balasan otomatis, hingga alur eskalasi tiket retur, mengikuti proses distribusi yang sudah berjalan di bisnis Anda.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah ada uji coba gratis sebelum berlangganan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ada. Anda bisa memulai uji coba gratis atau konsultasi langsung dengan tim kami terlebih dahulu untuk melihat apakah alur order WhatsApp, canvassing, dan retur di SmartSales sesuai dengan kebutuhan distribusi Anda.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah balasan otomatis (auto-reply) bisa dipakai untuk kirim katalog dan daftar harga?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. Auto-Reply dapat dikonfigurasi untuk mengirim katalog produk, daftar harga (price list), atau info ketersediaan stok secara instan saat toko atau agen menghubungi nomor WhatsApp resmi distributor.',
      },
    },
  ],
};

export default function FmcgPage() {
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
      <FmcgClient />
    </>
  );
}
