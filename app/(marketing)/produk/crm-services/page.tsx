import { Metadata } from 'next';
import CrmServicesClient from '@/components/crm-services/CrmServicesClient';
import { ogImageUrl } from '@/lib/utils/og-image';

const PAGE_URL = 'https://www.smartsales.id/produk/crm-services';

const OG_IMAGE = ogImageUrl({ title: 'CRM Services: Ticketing & SLA Pelanggan', category: 'Produk' });

export const metadata: Metadata = {
    title: 'CRM Services: Ticketing & SLA Pelanggan | SmartSales',
    description:
        'Kelola komplain WhatsApp, Instagram, dan Email dalam satu sistem tiket. Atur SLA otomatis dan Quick Replies agar tim CS merespons pelanggan lebih cepat.',
    alternates: {
        canonical: PAGE_URL,
    },
    openGraph: {
        title: 'CRM Services SmartSales - Ticketing, SLA & Quick Replies',
        description:
            'Sistem ticketing terpusat untuk tim Customer Service: satukan WhatsApp, Instagram, dan Email, atur SLA otomatis, dan pakai Quick Replies untuk respons lebih cepat.',
        url: PAGE_URL,
        siteName: 'SmartSales',
        locale: 'id_ID',
        type: 'website',
        images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'CRM Services SmartSales - Ticketing, SLA & Quick Replies',
        description:
            'Kelola komplain WhatsApp, Instagram, dan Email dalam satu sistem tiket. Atur SLA otomatis dan Quick Replies untuk tim CS Anda.',
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
            name: 'CRM Services',
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
            name: 'Apa itu CRM Services dari SmartSales?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'CRM Services adalah modul SmartSales untuk tim Customer Service yang mengubah setiap interaksi pelanggan dari WhatsApp, Instagram, dan Email menjadi tiket terpusat, lengkap dengan status, SLA, dan histori percakapan dalam satu halaman.',
            },
        },
        {
            '@type': 'Question',
            name: 'Bagaimana cara kerja sistem tiket terpusat di SmartSales?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Setiap pesan atau komplain yang masuk dari WhatsApp, Instagram, maupun Email otomatis diubah menjadi tiket. Tim CS dapat melacak status tiket (baru, diproses, selesai) dan membaca histori percakapan tanpa berpindah aplikasi.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apa itu SLA dan bagaimana SmartSales membantu memantaunya?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'SLA adalah batas waktu maksimum untuk merespons tiket. Anda dapat menetapkan batas waktu ini di SmartSales, dan jika sebuah tiket belum dijawab hingga mendekati atau melewati batas tersebut, sistem mengirim peringatan atau meneruskannya secara otomatis ke supervisor.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apa itu Quick Replies dan bagaimana cara memakainya?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Quick Replies adalah kumpulan template balasan yang sudah disiapkan sebelumnya untuk pertanyaan yang sering diulang. Agen tinggal memilih template yang sesuai dan mengirimkannya dalam satu klik, tanpa perlu mengetik jawaban yang sama berulang kali.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah tiket bisa didistribusikan otomatis ke agen tertentu?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Bisa. Fitur Automated Routing meneruskan tiket ke agen yang paling sesuai berdasarkan keahlian, shift kerja yang sedang aktif, atau beban tugas yang sedang ditangani agen tersebut, sehingga distribusi kerja lebih merata.',
            },
        },
        {
            '@type': 'Question',
            name: 'Berapa lama waktu implementasi CRM Services sampai tim CS bisa mulai memakainya?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Untuk kebutuhan ticketing dasar, tim CS umumnya sudah bisa mulai bekerja di SmartSales dalam hitungan hari setelah nomor WhatsApp Business dan channel lain terhubung. Kebutuhan alur SLA atau integrasi khusus akan didiskusikan sesuai kompleksitasnya saat onboarding.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah data komplain dan histori pelanggan kami aman?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Data disimpan pada infrastruktur multi-tenant dengan pemisahan data antar perusahaan, sehingga hanya pengguna yang berwenang di tenant Anda yang dapat mengakses tiket, percakapan, dan riwayat pelanggan.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah pesan WhatsApp yang masuk ke sistem tiket resmi dan aman dari risiko banned?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'SmartSales terintegrasi dengan WhatsApp Business API resmi, bukan modifikasi WhatsApp biasa, sehingga pengiriman dan penerimaan pesan mengikuti aturan resmi Meta.',
            },
        },
        {
            '@type': 'Question',
            name: 'Bisakah alur tiket dan aturan SLA disesuaikan dengan proses internal perusahaan kami?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Bisa. Karena SmartSales dibangun dengan pendekatan custom build, hal-hal seperti status tiket, aturan eskalasi, atau kategori keluhan dapat didiskusikan dan disesuaikan dengan kebutuhan tim CS Anda.',
            },
        },
        {
            '@type': 'Question',
            name: 'Berapa biaya berlangganan CRM Services?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Detail paket dan harga tersedia di halaman Harga kami. Silakan kunjungi /price untuk melihat pilihan paket yang sesuai dengan jumlah agen dan channel yang Anda butuhkan.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah tersedia uji coba gratis sebelum berlangganan?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Tersedia. Anda bisa memulai uji coba gratis untuk mencoba langsung fitur ticketing, SLA, dan Quick Replies sebelum memutuskan berlangganan.',
            },
        },
        {
            '@type': 'Question',
            name: 'Bisakah CRM Services digabung dengan modul CRM Sales atau Omnichannel lain?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Bisa. CRM Services adalah bagian dari platform SmartSales yang sama dengan CRM Sales dan Omnichannel WhatsApp & Email, sehingga data kontak dan riwayat interaksi pelanggan tetap terhubung di satu tempat.',
            },
        },
    ],
};

export default function CrmServicesPage() {
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
            <CrmServicesClient />
        </>
    );
}
