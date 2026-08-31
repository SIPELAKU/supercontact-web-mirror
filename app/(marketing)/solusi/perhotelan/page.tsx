import HotelClient from "@/components/solution-hotel/HotelClient";
import { Metadata } from "next";
import { ogImageUrl } from '@/lib/utils/og-image';

const PAGE_URL = "https://smartsales.id/solusi/perhotelan";

const OG_IMAGE = ogImageUrl({ title: 'Solusi CRM Reservasi & Layanan Tamu Hotel', category: 'Solusi Perhotelan' });

export const metadata: Metadata = {
  title: "Solusi CRM Reservasi & Layanan Tamu Hotel - SmartSales",
  description:
    "Kelola reservasi kamar, chat tamu via WhatsApp, dan komplain layanan hotel dalam satu sistem. Tingkatkan okupansi dan kepuasan tamu. Coba gratis.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Solusi CRM Reservasi & Layanan Tamu Hotel | SmartSales",
    description:
      "Kelola reservasi kamar, chat tamu via WhatsApp, dan komplain layanan hotel dalam satu sistem. Tingkatkan okupansi dan kepuasan tamu. Coba gratis.",
    url: PAGE_URL,
    siteName: "SmartSales",
    locale: "id_ID",
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solusi CRM Reservasi & Layanan Tamu Hotel | SmartSales",
    description:
      "Kelola reservasi kamar, chat tamu via WhatsApp, dan komplain layanan hotel dalam satu sistem. Tingkatkan okupansi dan kepuasan tamu. Coba gratis.",
    images: [OG_IMAGE],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Beranda",
      item: "https://smartsales.id",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Solusi Industri Perhotelan",
      item: PAGE_URL,
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Apa itu SmartSales untuk industri perhotelan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SmartSales adalah platform yang membantu hotel dan vila mengelola reservasi kamar, komunikasi tamu via WhatsApp, dan penanganan komplain layanan dalam satu sistem terpusat, menggantikan pencatatan manual di buku atau spreadsheet.",
      },
    },
    {
      "@type": "Question",
      name: "Bagaimana cara kerja manajemen reservasi kamar di SmartSales?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Setiap pertanyaan tamu soal ketersediaan kamar tercatat sebagai sales pipeline, mulai dari tahap tanya harga, hold/DP, hingga check-in. Tim sales dapat melihat status setiap calon tamu tanpa perlu membuka buku catatan manual.",
      },
    },
    {
      "@type": "Question",
      name: "Apakah SmartSales menggunakan WhatsApp resmi (WhatsApp Business API)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ya. SmartSales menggunakan WhatsApp Business API resmi sehingga nomor hotel Anda tidak berisiko diblokir, dan beberapa staf (resepsionis, sales, admin) bisa membalas chat dari satu nomor yang sama secara bersamaan.",
      },
    },
    {
      "@type": "Question",
      name: "Bagaimana SmartSales membantu menangani komplain tamu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Komplain atau permintaan layanan yang masuk lewat WhatsApp, misalnya AC bermasalah atau butuh handuk tambahan, bisa langsung diubah menjadi tiket kerja dan diteruskan ke tim Housekeeping atau Engineering, sehingga status pengerjaannya bisa dipantau.",
      },
    },
    {
      "@type": "Question",
      name: "Apakah SmartSales bisa dipakai untuk beberapa properti atau cabang sekaligus?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bisa. SmartSales dibangun dengan arsitektur multi-tenant, sehingga cocok digunakan oleh grup hotel dengan beberapa properti yang masing-masing memerlukan data dan tim terpisah.",
      },
    },
    {
      "@type": "Question",
      name: "Apakah alur kerja bisa disesuaikan dengan kebutuhan hotel kami?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bisa. Selain paket standar, SmartSales menyediakan opsi custom build untuk menyesuaikan kategori kamar, tahapan reservasi, atau jenis tiket layanan sesuai operasional hotel Anda.",
      },
    },
    {
      "@type": "Question",
      name: "Berapa biaya berlangganan SmartSales untuk hotel?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Biaya tergantung jumlah pengguna dan fitur yang dibutuhkan. Detail paket dan harga terbaru bisa dilihat di halaman Harga, atau hubungi tim kami untuk rekomendasi paket yang sesuai dengan skala hotel Anda.",
      },
    },
    {
      "@type": "Question",
      name: "Apakah data tamu dan reservasi di SmartSales aman?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Data disimpan pada sistem yang terpisah per klien (multi-tenant) dan hanya bisa diakses oleh tim internal hotel yang diberi hak akses, sehingga histori chat dan data tamu tidak tercampur dengan hotel lain.",
      },
    },
    {
      "@type": "Question",
      name: "Apakah ada masa uji coba sebelum berlangganan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ada. Tersedia uji coba gratis agar tim hotel Anda bisa mencoba langsung alur reservasi dan penanganan tiket layanan sebelum memutuskan berlangganan.",
      },
    },
    {
      "@type": "Question",
      name: "Apakah histori chat tamu tetap tersimpan jika staf resepsionis berganti?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ya. Karena percakapan tersimpan di sistem terpusat, bukan di HP pribadi staf, pergantian resepsionis atau shift tidak akan menghilangkan histori komunikasi dengan tamu.",
      },
    },
    {
      "@type": "Question",
      name: "Berapa lama proses implementasi SmartSales di hotel kami?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Untuk paket standar, hotel bisa mulai menggunakan SmartSales dalam hitungan hari setelah data kamar dan tim dikonfigurasi. Untuk kebutuhan custom build, waktu implementasi disesuaikan dengan kompleksitas alur kerja yang diminta.",
      },
    },
  ],
};

export default function HotelSolutionPage() {
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
      <HotelClient />
    </>
  );
}
