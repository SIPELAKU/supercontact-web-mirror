import { Metadata } from 'next';
import HRClient from '@/components/solusi/human-resource/HRClient';
import { ogImageUrl } from '@/lib/utils/og-image';

const PAGE_URL = "https://smartsales.id/solusi/human-resource";

const OG_IMAGE = ogImageUrl({ title: 'Solusi Tim Human Resource', category: 'Solusi Human Resource' });

export const metadata: Metadata = {
  title: 'Solusi Tim Human Resource - SmartSales',
  description: 'Kelola feedback karyawan secara profesional. Satukan setiap pertanyaan internal dan proses rekrutmen dalam satu sistem terpusat.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'Solusi Tim Human Resource | SmartSales',
    description: 'Kelola feedback karyawan secara profesional. Satukan setiap pertanyaan internal dan proses rekrutmen dalam satu sistem terpusat.',
    url: PAGE_URL,
    siteName: 'SmartSales',
    locale: 'id_ID',
    type: 'website',
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solusi Tim Human Resource | SmartSales',
    description: 'Kelola feedback karyawan secara profesional. Satukan setiap pertanyaan internal dan proses rekrutmen dalam satu sistem terpusat.',
    images: [OG_IMAGE],
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Beranda",
      "item": "https://smartsales.id",
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Solusi Tim Human Resource",
      "item": PAGE_URL,
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Apa itu HR Helpdesk di SmartSales?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HR Helpdesk adalah sistem tiket internal yang mengubah pertanyaan atau keluhan karyawan (soal payroll, cuti, fasilitas kantor, dll) menjadi tiket terlacak, bukan sekadar chat WhatsApp pribadi yang mudah terlewat.",
      },
    },
    {
      "@type": "Question",
      "name": "Bagaimana karyawan mengirim keluhan atau pertanyaan ke HR?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Karyawan bisa mengirim pesan lewat Email atau nomor WhatsApp khusus HR yang sudah terhubung ke sistem. Setiap pesan yang masuk otomatis menjadi tiket tugas yang bisa ditugaskan ke staf Payroll, General Affair, atau Manajemen.",
      },
    },
    {
      "@type": "Question",
      "name": "Apakah SmartSales bisa membantu proses rekrutmen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bisa. SmartSales menyediakan pipeline rekrutmen berbentuk papan Kanban (mirip ATS sederhana) untuk memindahkan kandidat dari tahap Screening, Interview HR, Interview User, hingga Offering, lengkap dengan penyimpanan CV dan catatan interview.",
      },
    },
    {
      "@type": "Question",
      "name": "Apakah data CV dan catatan interview kandidat aman?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Data kandidat tersimpan di sistem multi-tenant SmartSales dengan akses yang dibatasi hanya untuk pengguna yang diberi izin di perusahaan Anda, bukan dokumen bebas di email atau folder pribadi staf HR.",
      },
    },
    {
      "@type": "Question",
      "name": "Bisakah HR mengirim pengumuman ke seluruh karyawan sekaligus?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ya. Tim HR bisa mengirim broadcast lewat WhatsApp Business API atau Email ke seluruh karyawan atau segmen tertentu, misalnya pengumuman libur, jadwal shift, atau link e-payslip.",
      },
    },
    {
      "@type": "Question",
      "name": "Apakah ada SLA atau batas waktu penyelesaian tiket keluhan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bisa diterapkan. Tim HR dapat mengatur SLA (batas waktu resolusi) untuk tiap kategori tiket, sehingga keluhan karyawan seperti klaim asuransi atau pertanyaan slip gaji tidak menggantung tanpa kepastian.",
      },
    },
    {
      "@type": "Question",
      "name": "Apakah sistem ini menggantikan aplikasi HRIS/payroll yang sudah kami pakai?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Tidak. SmartSales fokus pada komunikasi dan tiket internal (helpdesk karyawan, rekrutmen, broadcast), bukan penggajian atau absensi. Sistem ini melengkapi HRIS yang sudah ada, bukan menggantikannya.",
      },
    },
    {
      "@type": "Question",
      "name": "Berapa biaya berlangganan untuk tim HR?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Biaya tergantung jumlah pengguna dan modul yang dipakai (Helpdesk, Rekrutmen, Broadcast). Detail paket dan harga terbaru bisa dilihat di halaman Harga.",
      },
    },
    {
      "@type": "Question",
      "name": "Apakah kami bisa mencoba sebelum berlangganan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bisa. Anda dapat memulai uji coba gratis untuk melihat langsung bagaimana tiket keluhan karyawan dan pipeline rekrutmen bekerja sebelum memutuskan berlangganan.",
      },
    },
    {
      "@type": "Question",
      "name": "Apakah tampilan dan alur kerja bisa disesuaikan dengan struktur HR kami?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bisa. Kategori tiket, tahapan pipeline rekrutmen, dan tim penerima eskalasi (Payroll, GA, Manajemen) dapat disesuaikan dengan struktur organisasi perusahaan Anda karena SmartSales dibangun sebagai custom build multi-tenant.",
      },
    },
    {
      "@type": "Question",
      "name": "Apakah karyawan perlu menginstal aplikasi khusus?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Tidak. Karyawan cukup mengirim pesan lewat WhatsApp atau Email seperti biasa. Semua pengelolaan tiket, pipeline, dan broadcast dilakukan tim HR dari dashboard SmartSales.",
      },
    },
    {
      "@type": "Question",
      "name": "Berapa lama proses implementasi untuk tim HR?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Waktu implementasi tergantung kompleksitas kategori tiket dan integrasi WhatsApp/Email yang dibutuhkan. Tim kami akan membahas kebutuhan spesifik saat sesi konsultasi awal.",
      },
    },
  ],
};

export default function HRPage() {
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
      <HRClient />
    </>
  );
}
