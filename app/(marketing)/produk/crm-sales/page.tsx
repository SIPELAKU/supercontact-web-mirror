// app/produk/crm-sales/page.tsx

import { Metadata } from "next";
import CrmSalesClient from "@/components/crm-sales/CrmSalesClient";
import { ogImageUrl } from '@/lib/utils/og-image';

const PAGE_URL = "https://www.smartsales.id/produk/crm-sales";

const OG_IMAGE = ogImageUrl({ title: 'CRM Sales - Pipeline, Follow-Up & Analitik Sales', category: 'Produk' });

export const metadata: Metadata = {
    title: "CRM Sales - Pipeline, Follow-Up & Analitik Sales",
    description:
        "Kelola pipeline penjualan, otomatisasi follow-up, dan pantau performa tim sales dalam satu platform CRM terintegrasi WhatsApp Business API. Coba gratis.",
    alternates: {
        canonical: PAGE_URL,
    },
    openGraph: {
        title: "CRM Sales | SmartSales",
        description:
            "Kelola pipeline penjualan, otomatisasi follow-up, dan pantau performa tim sales dalam satu platform CRM terintegrasi WhatsApp Business API.",
        url: PAGE_URL,
        siteName: "SmartSales",
        locale: "id_ID",
        type: "website",
        images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
        card: "summary_large_image",
        title: "CRM Sales | SmartSales",
        description:
            "Kelola pipeline penjualan, otomatisasi follow-up, dan pantau performa tim sales dalam satu platform CRM terintegrasi WhatsApp Business API.",
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
            item: "https://www.smartsales.id",
        },
        {
            "@type": "ListItem",
            position: 2,
            name: "CRM Sales",
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
            name: "Apa itu CRM Sales dari SmartSales?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "CRM Sales adalah aplikasi untuk mengelola prospek, pipeline penjualan, dan tugas tim sales dalam satu dashboard. Anda bisa memantau setiap prospek dari status baru hingga closing tanpa berpindah-pindah spreadsheet atau aplikasi chat.",
            },
        },
        {
            "@type": "Question",
            name: "Bagaimana cara kerja pipeline penjualan di CRM Sales?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Setiap prospek ditampilkan dalam tampilan Kanban yang bisa digeser antar tahap, misalnya prospek baru, negosiasi, hingga closing. Tim sales dan manajer bisa melihat posisi setiap deal secara real-time tanpa perlu membuat laporan manual.",
            },
        },
        {
            "@type": "Question",
            name: "Apakah tugas dan follow-up bisa diatur otomatis?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Ya. Anda bisa menjadwalkan tugas follow-up untuk setiap prospek dan sistem akan mengirim pengingat otomatis, sehingga peluang penjualan tidak terlewat karena lupa menghubungi calon pelanggan.",
            },
        },
        {
            "@type": "Question",
            name: "Laporan apa saja yang tersedia di fitur analitik?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Dashboard analitik menampilkan total pendapatan, jumlah prospek yang berhasil dikonversi, dan rasio win/loss tim sales, sehingga manajer bisa memantau performa tanpa merekap data secara manual.",
            },
        },
        {
            "@type": "Question",
            name: "Apakah CRM Sales terintegrasi dengan WhatsApp?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Ya, CRM Sales terhubung dengan WhatsApp Business API sehingga komunikasi dengan prospek dapat tercatat dalam riwayat kontak yang sama dengan data pipeline penjualan.",
            },
        },
        {
            "@type": "Question",
            name: "Berapa lama waktu implementasi untuk mulai menggunakan CRM Sales?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Setup awal seperti membuat akun, mengatur tahapan pipeline, dan menambahkan anggota tim umumnya bisa diselesaikan dalam hitungan hari. Tim kami membantu proses onboarding sesuai kebutuhan bisnis Anda.",
            },
        },
        {
            "@type": "Question",
            name: "Apakah data pelanggan dan sales aman di CRM Sales?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Data disimpan pada infrastruktur multi-tenant dengan pemisahan akses per perusahaan, sehingga data prospek dan histori komunikasi hanya bisa diakses oleh tim internal Anda sendiri.",
            },
        },
        {
            "@type": "Question",
            name: "Apakah CRM Sales bisa disesuaikan dengan alur kerja tim saya?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Bisa. Anda dapat menyesuaikan tahapan pipeline, custom tags untuk prospek, dan pengaturan tugas sesuai proses penjualan yang sudah berjalan di tim Anda. Untuk kebutuhan yang lebih spesifik, tim kami juga menyediakan custom build.",
            },
        },
        {
            "@type": "Question",
            name: "Berapa biaya berlangganan CRM Sales?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Biaya berlangganan bervariasi tergantung jumlah pengguna dan kebutuhan fitur. Detail paket dan harga dapat dilihat di halaman harga SmartSales.",
            },
        },
        {
            "@type": "Question",
            name: "Apakah tersedia uji coba gratis?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Ya, Anda bisa mencoba CRM Sales secara gratis untuk melihat langsung bagaimana pipeline, tugas, dan analitik bekerja sebelum memutuskan untuk berlangganan.",
            },
        },
    ],
};

export default function CrmSalesPage() {
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
            <CrmSalesClient />
        </>
    );
}
