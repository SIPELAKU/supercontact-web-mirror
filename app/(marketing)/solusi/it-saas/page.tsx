import { Metadata } from 'next';
import ITSaaSClient from '@/components/solution-it-saas/ITSaaSClient';
import { ogImageUrl } from '@/lib/utils/og-image';

const PAGE_URL = 'https://www.smartsales.id/solusi/it-saas';

const OG_IMAGE = ogImageUrl({ title: 'Solusi CRM & Helpdesk untuk Perusahaan IT', category: 'Solusi IT & SaaS' });

export const metadata: Metadata = {
  title: 'Solusi CRM & Helpdesk untuk Perusahaan IT - SmartSales',
  description: 'Kelola pipeline sales B2B, helpdesk WhatsApp, dan penugasan bug dalam satu sistem untuk perusahaan IT & SaaS. Coba gratis, tanpa komitmen di awal.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'Solusi CRM & Helpdesk IT/SaaS | SmartSales',
    description: 'Kelola pipeline sales B2B, helpdesk WhatsApp, dan penugasan bug dalam satu sistem untuk perusahaan IT & SaaS. Coba gratis, tanpa komitmen di awal.',
    url: PAGE_URL,
    siteName: 'SmartSales',
    locale: 'id_ID',
    type: 'website',
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solusi CRM & Helpdesk IT/SaaS | SmartSales',
    description: 'Kelola pipeline sales B2B, helpdesk WhatsApp, dan penugasan bug dalam satu sistem untuk perusahaan IT & SaaS. Coba gratis, tanpa komitmen di awal.',
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
      name: 'Solusi Industri IT & SaaS',
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
      name: 'Apakah SmartSales bisa terhubung dengan nomor WhatsApp Business kami yang sudah punya centang hijau?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. SmartSales menggunakan WhatsApp Business API resmi, sehingga nomor WhatsApp perusahaan Anda yang sudah terverifikasi (centang hijau) bisa dijadikan Helpdesk Center dan dipakai bersama oleh seluruh tim support (L1/L2) dari satu dashboard.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bagaimana SmartSales membantu tim sales B2B kami memantau proyek yang sedang dinegosiasikan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tim sales bisa memakai Pipeline Kanban di modul CRM Sales untuk memantau setiap tahap, mulai dari Lead/Discovery, Demo & Proposal, hingga Closed Won, lengkap dengan pengingat follow-up untuk jadwal Proof of Concept (PoC) atau pengiriman draft kontrak.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bagaimana laporan bug atau server down dari klien diubah menjadi tiket kerja untuk tim Engineering?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Keluhan yang masuk lewat WhatsApp bisa langsung diubah menjadi tiket lewat fitur Ticket Creation, lalu dieskalasi dari agen Level 1 (CS) ke tim Engineering/Developer (Level 2/3) dengan status Open, In Progress, atau Resolved yang bisa dipantau sampai selesai.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah dokumen legal proyek seperti MOU, NDA, atau SPK bisa disimpan di SmartSales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. Dokumen-dokumen tersebut dapat disimpan langsung di database klien pada modul CRM Sales, jadi tidak tersebar di email atau folder pribadi masing-masing sales.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah tim Engineering kami tetap perlu login ke sistem yang sama dengan tim CS/support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tidak harus. Biasanya tim CS dan sales B2B memakai dashboard utama SmartSales, sementara eskalasi ke tim Engineering dikirim sebagai tiket kerja dengan konteks lengkap dari percakapan klien, sehingga tim teknis cukup memantau tiket yang relevan dengan tugasnya.',
      },
    },
    {
      '@type': 'Question',
      name: 'Jika tim kami masih memakai Jira atau Trello untuk tracking internal, apakah tiket dari SmartSales bisa otomatis masuk ke sana?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Fitur Ticket Creation di SmartSales fokus mengubah keluhan WhatsApp menjadi tiket internal yang bisa dipantau tim Anda. Jika Anda masih menggunakan Jira/Trello secara terpisah untuk tracking teknis, silakan diskusikan kebutuhan tersebut dengan tim kami untuk melihat opsi yang paling sesuai.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah Auto-Reply bisa dipakai untuk memberi tahu jadwal maintenance rutin ke klien?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. Auto-Reply dapat dikonfigurasi untuk mengirimkan info jadwal maintenance rutin atau dokumentasi API secara otomatis saat klien menghubungi nomor WhatsApp Helpdesk Anda, sehingga tim support tidak perlu membalas satu per satu.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah data klien dan riwayat komunikasi kami aman di SmartSales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Setiap perusahaan berjalan di lingkungan multi-tenant yang terpisah, jadi data klien B2B, dokumen proyek, dan riwayat percakapan WhatsApp perusahaan Anda tidak tercampur dengan perusahaan lain di sistem.',
      },
    },
    {
      '@type': 'Question',
      name: 'Berapa biaya berlangganan SmartSales untuk perusahaan IT atau SaaS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Struktur paket dan harga terbaru bisa dilihat di halaman /price. Tim kami juga bisa membantu merekomendasikan paket yang sesuai dengan jumlah tim sales dan support Anda lewat konsultasi langsung.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah alur pipeline sales dan tahapan tiket bisa disesuaikan dengan proses kami yang sudah berjalan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. Tahapan pipeline proyek, kolom status tiket, dan alur eskalasi ke tim Engineering dapat dikustomisasi (custom build) mengikuti proses bisnis IT atau SaaS yang sudah Anda jalankan.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah ada uji coba sebelum berlangganan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ada. Anda bisa mulai dengan uji coba gratis lewat tombol yang tersedia di halaman ini untuk mencoba alur pipeline sales, Helpdesk WhatsApp, dan Ticket Creation sebelum memutuskan berlangganan.',
      },
    },
  ],
};

export default function ITSaaSPage() {
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
      <ITSaaSClient />
    </>
  );
}
