import { Metadata } from 'next';
import MarketingClient from '@/components/solusi/marketing/MarketingClient';

const PAGE_URL = 'https://www.smartsales.id/solusi/marketing';

export const metadata: Metadata = {
  title: 'Solusi CRM untuk Tim Marketing - SmartSales',
  description: 'Kirim campaign WhatsApp & Email blast, kelola balasan pelanggan dalam satu inbox, dan lacak ROI marketing hingga transaksi tim Sales dengan SmartSales.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'Solusi CRM untuk Tim Marketing | SmartSales',
    description: 'Kirim campaign WhatsApp & Email blast, kelola balasan pelanggan dalam satu inbox, dan lacak ROI marketing hingga transaksi tim Sales dengan SmartSales.',
    url: PAGE_URL,
    siteName: 'SmartSales',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solusi CRM untuk Tim Marketing | SmartSales',
    description: 'Kirim campaign WhatsApp & Email blast, kelola balasan pelanggan dalam satu inbox, dan lacak ROI marketing hingga transaksi tim Sales dengan SmartSales.',
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
      name: 'Solusi untuk Tim Marketing',
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
      name: 'Apakah SmartSales bisa mengirim WhatsApp Blast dan Email Blast sekaligus?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. Anda dapat mengirim broadcast promosi lewat WhatsApp Business API dan Email dari satu platform yang sama, lalu semua balasan pelanggan masuk ke inbox CRM yang sama sehingga tidak tercecer di aplikasi terpisah.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bagaimana cara melacak ROI dari kampanye yang saya kirim?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Setiap lead yang masuk otomatis tercatat sumbernya (WhatsApp, Email, atau Web Form). SmartSales menghubungkan lead tersebut dengan follow-up tim Sales sampai transaksi tercatat, sehingga Anda bisa melihat kampanye mana yang benar-benar menghasilkan penjualan, bukan sekadar jumlah pesan terkirim.',
      },
    },
    {
      '@type': 'Question',
      name: 'Berapa lama waktu implementasi sampai tim marketing bisa mulai broadcast?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Untuk kebutuhan broadcast dan inbox dasar, tim Anda umumnya sudah bisa mulai memakai SmartSales dalam hitungan hari setelah data kontak dan nomor WhatsApp Business disiapkan. Kebutuhan integrasi atau kustomisasi tambahan akan didiskusikan sesuai kompleksitasnya saat onboarding.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah bisa menyegmentasikan kontak sebelum mengirim broadcast?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. Anda dapat memakai Custom Tags di CRM untuk mengelompokkan kontak, misalnya berdasarkan status pelanggan atau minat produk, lalu memilih segmen tersebut sebagai target sebelum mengirim broadcast WhatsApp atau Email.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah pesan WhatsApp yang dikirim melalui SmartSales resmi dan aman dari risiko banned?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SmartSales terintegrasi dengan WhatsApp Business API resmi, bukan modifikasi WhatsApp biasa, sehingga pengiriman pesan mengikuti aturan resmi Meta dan lebih aman dibanding tools tidak resmi.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah lead yang masuk dari campaign otomatis terhubung ke tim Sales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ya. Lead baru yang masuk dari balasan WhatsApp, Email, atau Web Form bisa didistribusikan otomatis ke agen Sales atau Telesales yang bertugas (Auto-Routing), sehingga Marketing dapat memantau apakah lead tersebut ditindaklanjuti.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah saya bisa melihat tingkat keterbacaan (read rate) pesan broadcast?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. SmartSales mencatat status pengiriman dan jumlah pelanggan yang merespons kampanye promosi Anda, sehingga Anda punya data untuk membandingkan performa antar campaign.',
      },
    },
    {
      '@type': 'Question',
      name: 'Berapa biaya berlangganan SmartSales untuk tim Marketing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Detail paket dan harga tersedia di halaman Harga kami. Silakan kunjungi halaman /price untuk melihat pilihan paket yang sesuai dengan kebutuhan volume kontak dan fitur marketing Anda.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah data pelanggan dan histori campaign kami aman?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Data disimpan pada infrastruktur multi-tenant dengan pemisahan data antar perusahaan, dan hanya pengguna yang berwenang di tenant Anda yang dapat mengakses database kontak serta histori campaign.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bisakah SmartSales disesuaikan dengan alur campaign khusus perusahaan kami?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bisa. Karena SmartSales dibangun dengan pendekatan custom build, kebutuhan khusus seperti template pesan, struktur tag segmentasi, atau laporan funnel tertentu dapat didiskusikan dan disesuaikan dengan tim kami.',
      },
    },
    {
      '@type': 'Question',
      name: 'Apakah tersedia uji coba gratis sebelum berlangganan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tersedia. Anda bisa memulai uji coba gratis untuk mencoba langsung fitur inbox, broadcast, dan pelacakan funnel sebelum memutuskan berlangganan.',
      },
    },
  ],
};

const combinedSchema = {
  '@context': 'https://schema.org',
  '@graph': [breadcrumbSchema, faqSchema],
};

export default function MarketingPage() {
  return (
    <>
      <script
        id="solusi-marketing-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />
      <MarketingClient />
    </>
  );
}
