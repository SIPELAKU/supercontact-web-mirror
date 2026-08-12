import TravelClient from '../../../components/solution-travel/TravelClient';
import { Metadata } from 'next';

const PAGE_URL = 'https://www.smartsales.id/solusi/tour-travel';

export const metadata: Metadata = {
    title: 'Solusi CRM Tour & Travel - SmartSales',
    description: 'Kelola pemesanan paket wisata, dokumen visa, DP pelanggan, dan reschedule tiket dalam satu sistem CRM WhatsApp untuk agen tour & travel. Coba gratis sekarang.',
    alternates: {
        canonical: PAGE_URL,
    },
    openGraph: {
        title: 'Solusi CRM Tour & Travel | SmartSales',
        description: 'Kelola pemesanan paket wisata, dokumen visa, DP pelanggan, dan reschedule tiket dalam satu sistem CRM WhatsApp untuk agen tour & travel. Coba gratis sekarang.',
        url: PAGE_URL,
        siteName: 'SmartSales',
        locale: 'id_ID',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Solusi CRM Tour & Travel | SmartSales',
        description: 'Kelola pemesanan paket wisata, dokumen visa, DP pelanggan, dan reschedule tiket dalam satu sistem CRM WhatsApp untuk agen tour & travel. Coba gratis sekarang.',
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
            name: 'Solusi Tour & Travel',
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
            name: 'Apakah SmartSales bisa mengelola pemesanan paket wisata dari WhatsApp, Instagram, dan Facebook sekaligus?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Bisa. SmartSales menyatukan WhatsApp Business API, Instagram DM, dan Facebook ke dalam satu Unified Inbox, sehingga tim admin bisa membalas pertanyaan paket dan harga dari satu layar tanpa harus berpindah aplikasi.',
            },
        },
        {
            '@type': 'Question',
            name: 'Bagaimana SmartSales membantu melacak status pemesanan mulai dari tanya paket sampai berangkat?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Setiap calon pelanggan dicatat dalam alur kerja visual (pipeline) mulai dari Tanya Paket, Proses DP/Visa, hingga Lunas/Berangkat. Anda bisa melihat di tahap mana setiap pelanggan berada tanpa perlu membuka catatan manual atau Excel.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah dokumen pelanggan seperti paspor dan visa bisa dipantau kelengkapannya di SmartSales?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Bisa. Profil pemesanan tiap pelanggan mencatat status kelengkapan dokumen dan aktivitas terakhir, seperti verifikasi pembayaran DP, sehingga tim tidak perlu menanyakan ulang dokumen yang sudah masuk.',
            },
        },
        {
            '@type': 'Question',
            name: 'Bagaimana cara menangani permintaan reschedule atau pembatalan tiket pelanggan?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Permintaan reschedule, pembatalan, atau keluhan penginapan diubah menjadi tiket penanganan melalui modul CRM Services, lalu dieskalasi ke divisi Ticketing, Maskapai, atau Keuangan sesuai kebutuhan, lengkap dengan batas waktu penanganan (SLA) sampai statusnya selesai.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah balasan seperti itinerary dan syarat pembatalan bisa dikirim otomatis?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Bisa. Anda dapat menyiapkan Quick Replies untuk mengirim PDF itinerary, harga paket promo, dan syarat pembatalan dalam satu klik, sehingga admin tidak perlu mengetik ulang jawaban yang sama setiap hari.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah SmartSales bisa memisahkan minat pelanggan, misalnya paket domestik, internasional, atau Umrah/Haji?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Bisa. Anda dapat menggunakan Custom Tags untuk mengelompokkan klien berdasarkan minat paket, sehingga follow-up dan promosi berikutnya bisa lebih tepat sasaran sesuai kategori perjalanan yang diminati.',
            },
        },
        {
            '@type': 'Question',
            name: 'Bagaimana jika beberapa staf ingin membalas chat dari nomor WhatsApp yang sama?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Karena menggunakan WhatsApp Business API resmi, satu nomor WhatsApp bisa diakses bersama oleh beberapa staf sekaligus tanpa berebut ponsel atau bertabrakan sesi login, dan setiap percakapan tetap tercatat di sistem.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah data pelanggan dan riwayat pemesanan tetap aman jika ada pergantian agen?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Aman. Data pelanggan, riwayat chat, dan riwayat pemesanan tersimpan di sistem CRM, bukan di HP pribadi agen, sehingga tetap tersedia meski ada pergantian personel.',
            },
        },
        {
            '@type': 'Question',
            name: 'Berapa biaya berlangganan SmartSales untuk agen tour & travel?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Struktur paket SmartSales sama untuk semua industri, mencakup modul CRM Sales, CRM Services (ticketing), dan Omnichannel WhatsApp. Rincian paket dan harga terbaru bisa dilihat di halaman harga kami.',
            },
        },
        {
            '@type': 'Question',
            name: 'Bisakah alur kerja SmartSales disesuaikan dengan proses bisnis travel kami saat ini?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Bisa. SmartSales bersifat multi-tenant dan dibangun dengan pendekatan custom build, sehingga tahapan pipeline, tag segmentasi paket, hingga alur eskalasi tiket reschedule bisa disesuaikan dengan proses yang sudah berjalan di bisnis Anda.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah tersedia uji coba gratis sebelum berlangganan?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Tersedia. Anda bisa memulai uji coba gratis atau konsultasi langsung dengan tim kami untuk melihat apakah alur pemesanan paket dan penanganan reschedule di SmartSales sesuai dengan kebutuhan bisnis travel Anda.',
            },
        },
    ],
};

export default function TravelSolutionPage() {
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
            <TravelClient />
        </>
    );
}
