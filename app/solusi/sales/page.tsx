import { Metadata } from 'next';
import SalesClient from '@/components/solusi/sales/SalesClient';

const PAGE_URL = 'https://www.smartsales.id/solusi/sales';

export const metadata: Metadata = {
  title: 'Solusi CRM Tim Sales - SmartSales',
  description: 'Pantau pipeline penjualan dan otomatiskan follow-up dalam satu sistem. SmartSales membantu tim sales berhenti kehilangan prospek karena catatan tercecer.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'Solusi CRM Tim Sales | SmartSales',
    description: 'Pantau pipeline penjualan dan otomatiskan follow-up dalam satu sistem. SmartSales membantu tim sales berhenti kehilangan prospek karena catatan tercecer.',
    url: PAGE_URL,
    siteName: 'SmartSales',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solusi CRM Tim Sales | SmartSales',
    description: 'Pantau pipeline penjualan dan otomatiskan follow-up dalam satu sistem. SmartSales membantu tim sales berhenti kehilangan prospek karena catatan tercecer.',
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
      item: 'https://www.smartsales.id',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Solusi Tim Sales',
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
      name: 'Berapa lama proses implementasi sampai tim sales bisa mulai pakai?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Untuk kebutuhan standar seperti pipeline, kartu prospek, dan pengingat follow-up, tim kami biasanya bisa menyiapkan akun dan struktur pipeline Anda dalam beberapa hari kerja. Jika ada kebutuhan integrasi khusus atau alur kerja custom, waktunya menyesuaikan kompleksitas kebutuhan tersebut.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah data pipeline dan kontak pelanggan kami aman?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Setiap perusahaan memiliki ruang data tersendiri (multi-tenant) yang terpisah dari perusahaan lain. Akses ke data pipeline, kontak, dan riwayat chat diatur berdasarkan peran pengguna, jadi sales bisa dibatasi hanya melihat data timnya sendiri jika diperlukan.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah SmartSales terhubung dengan WhatsApp Business API?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ya. SmartSales terintegrasi dengan WhatsApp Business API sehingga percakapan dengan prospek dan pelanggan tercatat langsung di kartu prospek yang sama, tanpa harus berpindah aplikasi untuk mengecek riwayat chat.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bagaimana cara kerja pengingat follow-up otomatis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Setiap prospek atau deal yang butuh tindak lanjut bisa diberi jadwal follow-up. Sistem akan menampilkan pengingat pada waktu yang ditentukan sehingga sales tidak perlu mengandalkan catatan manual atau memori untuk mengingat siapa yang harus dihubungi.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bisakah tahapan pipeline disesuaikan dengan proses penjualan kami?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. Tahapan pipeline (misalnya dari prospek masuk sampai closing) dapat dikonfigurasi mengikuti alur penjualan perusahaan Anda, bukan alur baku yang dipaksakan.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah sales manager bisa memantau kinerja tim tanpa harus tanya satu per satu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. Sales manager dapat melihat posisi setiap deal di pipeline, siapa yang menangani, dan status follow-up-nya langsung dari dashboard, tanpa harus meminta laporan manual dari masing-masing sales.',
      },
    },
    {
      '@type': 'Question',
      name: 'Berapa biaya berlangganan SmartSales untuk tim sales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Detail paket dan harga dapat dilihat di halaman /price. Tim kami juga bisa membantu merekomendasikan paket yang sesuai dengan jumlah pengguna dan kebutuhan tim Anda.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah ada masa uji coba sebelum berlangganan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Silakan hubungi tim kami melalui WhatsApp untuk menanyakan opsi uji coba yang tersedia saat ini, karena ketentuannya bisa berbeda tergantung kebutuhan dan jumlah pengguna.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah SmartSales bisa dipakai di HP, tidak hanya di komputer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. Sales lapangan dapat mengecek pipeline, membuka kartu prospek, dan membalas chat pelanggan langsung dari perangkat mobile, tanpa harus menunggu kembali ke kantor.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah data lama dari spreadsheet atau sistem sebelumnya bisa dipindahkan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. Tim kami dapat membantu proses migrasi data pipeline dan kontak yang sudah ada agar tim sales tidak perlu memasukkan ulang data dari nol.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah SmartSales hanya untuk perusahaan besar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tidak. SmartSales dibangun sebagai sistem multi-tenant yang bisa disesuaikan untuk tim sales kecil maupun perusahaan dengan banyak sales dan cabang, tergantung paket dan kebutuhan yang dipilih.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bagaimana cara memulai jika kami tertarik?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Klik tombol WhatsApp di halaman ini untuk terhubung langsung dengan tim kami. Kami akan bantu memahami kebutuhan tim sales Anda dan menjelaskan langkah-langkah selanjutnya.',
      },
    },
  ],
};

export default function SalesPage() {
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
      <SalesClient />
    </>
  );
}
