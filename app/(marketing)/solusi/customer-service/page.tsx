import { Metadata } from 'next';
import CSClient from '@/components/solusi/customer-service/CSClient';
import { ogImageUrl } from '@/lib/utils/og-image';

const PAGE_URL = 'https://www.smartsales.id/solusi/customer-service';

const OG_IMAGE = ogImageUrl({ title: 'Solusi CRM untuk Tim Customer Service', category: 'Solusi Customer Service' });

export const metadata: Metadata = {
  title: 'Solusi CRM untuk Tim Customer Service - SmartSales',
  description: 'Satukan chat WhatsApp, Instagram, dan Email dalam satu inbox, kelola tiket keluhan dengan SLA, dan percepat balasan dengan Quick Replies bersama SmartSales.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'Solusi CRM untuk Tim Customer Service | SmartSales',
    description: 'Satukan chat WhatsApp, Instagram, dan Email dalam satu inbox, kelola tiket keluhan dengan SLA, dan percepat balasan dengan Quick Replies bersama SmartSales.',
    url: PAGE_URL,
    siteName: 'SmartSales',
    locale: 'id_ID',
    type: 'website',
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solusi CRM untuk Tim Customer Service | SmartSales',
    description: 'Satukan chat WhatsApp, Instagram, dan Email dalam satu inbox, kelola tiket keluhan dengan SLA, dan percepat balasan dengan Quick Replies bersama SmartSales.',
    images: [OG_IMAGE],
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Beranda',
      item: 'https://www.smartsales.id',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Solusi untuk Tim Customer Service',
      item: PAGE_URL,
    },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Bagaimana cara kerja sistem tiket di SmartSales untuk keluhan yang perlu eskalasi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Chat pelanggan yang membutuhkan bantuan divisi lain (misalnya Gudang atau Finance) bisa diubah menjadi Tiket Tugas. Tiket ini punya status Open, In Progress, dan Resolved, sehingga progres penyelesaiannya bisa dipantau tanpa harus bolak-balik membuka chat aslinya.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apa itu SLA di SmartSales dan bagaimana cara mengaturnya?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SLA (Service Level Agreement) adalah batas waktu penyelesaian yang Anda tetapkan untuk setiap tiket. Jika sebuah tiket melewati batas waktu tersebut, supervisor otomatis menerima notifikasi agar bisa segera turun tangan sebelum pelanggan menunggu terlalu lama.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apa itu Quick Replies dan bagaimana ini membantu tim CS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Quick Replies adalah templat balasan siap pakai untuk pertanyaan yang sering berulang, seperti ongkir, jam operasional, atau format refund. Agen tinggal memilih templat dengan satu klik, tidak perlu mengetik ulang jawaban yang sama setiap hari.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah pesan dari WhatsApp, Instagram, dan Email pelanggan bisa digabung dalam satu layar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. Semua pesan dari WhatsApp Business API, Instagram DM, dan Email masuk ke satu inbox yang sama, sehingga agen CS tidak perlu berpindah-pindah aplikasi saat jam sibuk.',
      },
    },
    {
      '@type': 'Question',
      name: 'Jika pelanggan ditransfer ke agen lain, apakah riwayat percakapannya hilang?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tidak. Riwayat chat pelanggan tetap tersimpan di sistem. Saat terjadi operan shift atau transfer ke agen lain, agen yang menerima bisa langsung membaca konteks masalah sebelumnya tanpa meminta pelanggan mengulang cerita.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bagaimana pesan masuk dibagikan ke agen CS yang sedang bertugas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sistem Auto-Routing membagikan antrean chat secara merata ke agen yang sedang online, sehingga beban kerja tidak menumpuk hanya pada satu atau dua orang saja.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah SmartSales bisa membalas pesan secara otomatis di luar jam operasional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. Anda dapat mengaktifkan Welcome Message untuk menyapa pelanggan baru, dan Away Message otomatis saat tim CS sedang di luar jam kerja.',
      },
    },
    {
      '@type': 'Question',
      name: 'Berapa biaya berlangganan SmartSales untuk tim Customer Service?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Detail paket dan harga tersedia di halaman Harga kami. Silakan kunjungi /price untuk melihat pilihan paket yang sesuai dengan jumlah agen dan volume chat tim CS Anda.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah data percakapan dan tiket pelanggan kami aman?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Data disimpan pada infrastruktur multi-tenant dengan pemisahan data antar perusahaan, sehingga hanya pengguna yang berwenang di tenant Anda yang dapat mengakses riwayat chat dan tiket pelanggan.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah alur tiket dan eskalasi bisa disesuaikan dengan struktur tim kami?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. Karena SmartSales dibangun dengan pendekatan custom build, alur eskalasi, divisi tujuan tiket, dan isi Quick Replies dapat didiskusikan dan disesuaikan dengan kebutuhan operasional tim CS Anda.',
      },
    },
    {
      '@type': 'Question',
      name: 'Berapa lama waktu implementasi sampai tim CS bisa mulai memakai sistem tiket?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Untuk kebutuhan inbox dan tiket dasar, tim Anda umumnya sudah bisa mulai memakai SmartSales dalam hitungan hari setelah saluran WhatsApp Business, Instagram, dan Email terhubung. Kebutuhan integrasi tambahan akan didiskusikan sesuai kompleksitasnya saat onboarding.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah tersedia uji coba gratis sebelum berlangganan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tersedia. Anda bisa memulai uji coba gratis untuk mencoba langsung fitur inbox, tiket, dan Quick Replies sebelum memutuskan berlangganan.',
      },
    },
  ],
};

export default function CustomerServicePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <CSClient />
    </>
  );
}
