import { Metadata } from 'next';
import FinanceClient from '@/components/solution-finance/FinanceClient';

const PAGE_URL = 'https://www.smartsales.id/solusi/keuangan';

export const metadata: Metadata = {
    title: 'Solusi CRM untuk Bank, Koperasi & Multifinance - SmartSales',
    description: 'Kelola prospek kredit bank, koperasi, dan multifinance dalam satu sistem CRM. Follow-up otomatis via WhatsApp API, tanpa spreadsheet. Coba gratis 14 hari.',
    alternates: {
        canonical: PAGE_URL,
    },
    openGraph: {
        title: 'Solusi CRM untuk Bank, Koperasi & Multifinance | SmartSales',
        description: 'Kelola prospek kredit bank, koperasi, dan multifinance dalam satu sistem CRM. Follow-up otomatis via WhatsApp API, tanpa spreadsheet. Coba gratis 14 hari.',
        url: PAGE_URL,
        siteName: 'SmartSales',
        locale: 'id_ID',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Solusi CRM untuk Bank, Koperasi & Multifinance | SmartSales',
        description: 'Kelola prospek kredit bank, koperasi, dan multifinance dalam satu sistem CRM. Follow-up otomatis via WhatsApp API, tanpa spreadsheet. Coba gratis 14 hari.',
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
            name: 'Solusi Industri Keuangan',
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
            name: 'Apakah SmartSales cocok untuk bank, koperasi, maupun perusahaan multifinance?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Cocok. Modul CRM Sales, Omnichannel WhatsApp, dan CRM Services (ticketing) dirancang generik untuk mengelola prospek kredit dan komunikasi nasabah, sehingga bisa dipakai bank, koperasi simpan pinjam, maupun perusahaan multifinance atau pembiayaan.',
            },
        },
        {
            '@type': 'Question',
            name: 'Bagaimana proses pengajuan kredit dikelola di SmartSales?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Setiap calon debitur masuk sebagai kartu di CRM Sales dengan pipeline visual, mulai dari prospek baru, proses verifikasi (BI Checking), hingga disetujui dan siap cair. Tim Anda bisa langsung melihat di tahap mana setiap pengajuan berada.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah WhatsApp yang dipakai adalah nomor resmi perusahaan, bukan HP pribadi sales?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Benar. SmartSales terintegrasi dengan WhatsApp Business API resmi, sehingga satu nomor WhatsApp perusahaan bisa dipegang bersama oleh seluruh tim, lengkap dengan riwayat chat yang tercatat di sistem, bukan hanya tersimpan di HP pribadi.',
            },
        },
        {
            '@type': 'Question',
            name: 'Bagaimana keamanan data nasabah dan dokumen seperti KTP atau NPWP?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Data nasabah dan dokumen pendukung dikelola secara terpusat di sistem, bukan tersebar di spreadsheet atau chat pribadi. Setiap perusahaan memakai ruang data (tenant) yang terpisah dari perusahaan lain di platform SmartSales.',
            },
        },
        {
            '@type': 'Question',
            name: 'Bagaimana keluhan nasabah, misalnya kartu ATM tertelan atau transfer gagal, ditangani?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Keluhan yang masuk lewat WhatsApp bisa langsung diubah menjadi tiket lewat modul CRM Services & Ticket Creation, lalu dieskalasi ke divisi terkait (misalnya IT atau Verifikator) dengan status dan batas waktu penyelesaian yang jelas.',
            },
        },
        {
            '@type': 'Question',
            name: 'Bisakah tahapan pipeline disesuaikan dengan proses internal kami, misalnya survei dan BI Checking?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Bisa. SmartSales bersifat multi-tenant dengan pengaturan yang dapat disesuaikan, mulai dari nama tahapan pipeline, kolom data calon debitur, hingga template pesan otomatis, mengikuti alur kerja yang sudah berjalan di institusi Anda.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah SmartSales bisa diintegrasikan dengan sistem inti (core banking) atau sistem internal kami?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Kebutuhan integrasi dengan sistem internal seperti core banking dibahas sebagai custom build sesuai kompleksitas sistem Anda. Silakan konsultasikan kebutuhan spesifik ini dengan tim kami melalui WhatsApp.',
            },
        },
        {
            '@type': 'Question',
            name: 'Bagaimana proses onboarding tim kami ke SmartSales?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Setelah mendaftar, tim kami membantu proses setup awal seperti pengaturan pipeline, penyambungan nomor WhatsApp Business API, dan pengenalan fitur ke tim sales maupun customer service Anda.',
            },
        },
        {
            '@type': 'Question',
            name: 'Berapa biaya berlangganan SmartSales untuk lembaga keuangan?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Struktur paket SmartSales sama untuk semua industri, mencakup modul CRM Sales, CRM Services, dan Omnichannel WhatsApp. Rincian paket dan harga terbaru bisa dilihat di halaman harga kami.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah ada uji coba gratis sebelum berlangganan?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ada. Anda bisa memulai uji coba gratis 14 hari atau konsultasi langsung dengan tim kami untuk melihat apakah alur pipeline kredit, Omnichannel WhatsApp, dan ticketing di SmartSales sesuai kebutuhan institusi Anda.',
            },
        },
    ],
};

export default function SolusiKeuanganPage() {
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
            <FinanceClient />
        </>
    );
}
