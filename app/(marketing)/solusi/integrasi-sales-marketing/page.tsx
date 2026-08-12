import { Metadata } from 'next';
import IntClient from '@/components/solusi/integrasi-sales-marketing/IntClient';
import { ogImageUrl } from '@/lib/utils/og-image';

const PAGE_URL = 'https://www.smartsales.id/solusi/integrasi-sales-marketing';

const OG_IMAGE = ogImageUrl({
    title: 'Integrasi Sales & Marketing: Solusi Agar Leads Tidak Hilang',
    category: 'Solusi Integrasi',
});

export const metadata: Metadata = {
    title: 'Integrasi Sales & Marketing: Solusi Agar Leads Tidak Hilang',
    description:
        'Leads dari marketing sering tidak di-follow up sales? Pelajari kerangka integrasi sales-marketing dan lihat cara SmartSales menyatukan keduanya dalam satu CRM.',
    alternates: {
        canonical: PAGE_URL,
    },
    openGraph: {
        title: 'Integrasi Sales & Marketing: Solusi Agar Leads Tidak Hilang | SmartSales',
        description:
            'Leads dari marketing sering tidak di-follow up sales? Pelajari kerangka integrasi sales-marketing dan lihat cara SmartSales menyatukan keduanya dalam satu CRM.',
        url: PAGE_URL,
        siteName: 'SmartSales',
        locale: 'id_ID',
        type: 'website',
        images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Integrasi Sales & Marketing: Solusi Agar Leads Tidak Hilang | SmartSales',
        description:
            'Leads dari marketing sering tidak di-follow up sales? Pelajari kerangka integrasi sales-marketing dan lihat cara SmartSales menyatukan keduanya dalam satu CRM.',
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
            item: 'https://www.smartsales.id/',
        },
        {
            '@type': 'ListItem',
            position: 2,
            name: 'Integrasi Sales & Marketing',
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
            name: 'Apa itu integrasi sales dan marketing?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Integrasi sales dan marketing adalah proses menyatukan data dan alur kerja kedua tim — mulai dari leads masuk, di-follow up, hingga closing — dalam satu sistem yang sama, sehingga tidak ada informasi yang hilang di antara keduanya.',
            },
        },
        {
            '@type': 'Question',
            name: 'Kenapa leads dari marketing sering tidak di-follow up sales?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Biasanya karena tidak ada SLA yang jelas, leads dikirim secara manual (Excel/chat pribadi), atau tidak ada notifikasi yang memberi tahu sales bahwa ada leads baru yang harus segera dihubungi.',
            },
        },
        {
            '@type': 'Question',
            name: 'Bagaimana cara mengintegrasikan data sales dan marketing tanpa software khusus?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Anda bisa mulai dengan menyepakati satu definisi leads dan satu spreadsheet bersama dengan SLA follow-up yang jelas. Ini bisa berjalan untuk volume kecil, namun akan sulit di-scale saat jumlah leads meningkat.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah SmartSales bisa mengirim leads WhatsApp otomatis ke sales?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ya. Balasan WhatsApp yang masuk lewat integrasi WhatsApp Business API otomatis dibuatkan profil leads dan di-routing ke sales atau telesales yang sedang bertugas.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah SmartSales bisa disesuaikan dengan proses bisnis kami?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ya, SmartSales dibangun dengan arsitektur multi-tenant dan mendukung custom build untuk alur kerja spesifik bisnis Anda.',
            },
        },
        {
            '@type': 'Question',
            name: 'Berapa lama waktu implementasi integrasi sales dan marketing di SmartSales?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Waktu implementasi bergantung pada kompleksitas proses bisnis dan jumlah channel yang perlu diintegrasikan. Tim kami akan membahas kebutuhan spesifik Anda saat konsultasi.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah data leads dan riwayat chat aman jika ada staf yang resign?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ya. Seluruh riwayat percakapan dan data leads tersimpan di CRM perusahaan, bukan di perangkat pribadi staf, sehingga tetap tersedia untuk tim meskipun ada pergantian personel.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah bisa melihat ROI campaign marketing sampai ke closing sales?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ya. SmartSales melacak siklus penuh mulai dari pesan promosi pertama hingga transaksi tercatat, sehingga tim marketing bisa melihat campaign mana yang benar-benar menghasilkan closing.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah kami harus migrasi seluruh data dari spreadsheet sekaligus?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Tidak harus sekaligus. Anda bisa memulai dengan sumber leads yang paling aktif terlebih dahulu, lalu menambahkan channel lain secara bertahap.',
            },
        },
        {
            '@type': 'Question',
            name: 'Berapa biaya untuk fitur integrasi sales dan marketing ini?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Fitur ini termasuk dalam paket CRM Sales dan Omnichannel SmartSales. Detail paket dan harga bisa dilihat di halaman harga kami.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah tersedia trial gratis?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ya, Anda bisa mencoba SmartSales secara gratis. Hubungi tim kami melalui WhatsApp untuk memulai.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apa bedanya dengan sekadar menggunakan WhatsApp Business biasa?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'WhatsApp Business biasa hanya menangani percakapan satu per satu tanpa terhubung ke data sales. SmartSales menyatukan percakapan WhatsApp, Email, dan pipeline sales dalam satu CRM, sehingga leads yang masuk otomatis tercatat dan bisa di-routing ke tim yang tepat.',
            },
        },
    ],
};

export default function IntegrasiSalesMarketingPage() {
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
            <IntClient />
        </>
    );
}
