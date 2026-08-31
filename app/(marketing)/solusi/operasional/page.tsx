import { Metadata } from "next";
import OpClient from "@/components/solusi/operasional/OpClient";
import { ogImageUrl } from '@/lib/utils/og-image';

const PAGE_URL = "https://smartsales.id/solusi/operasional";

const OG_IMAGE = ogImageUrl({ title: 'Solusi CRM Operasional Lapangan', category: 'Solusi Operasional' });

export const metadata: Metadata = {
    title: "Solusi CRM Operasional Lapangan",
    description: "Otomatiskan penugasan tim lapangan, pantau lokasi & progres kerja secara real-time, dan tangani insiden lebih cepat via notifikasi WhatsApp otomatis.",
    alternates: {
        canonical: PAGE_URL,
    },
    openGraph: {
        title: "Solusi CRM Operasional Lapangan | SmartSales",
        description: "Otomatiskan penugasan tim lapangan, pantau lokasi & progres kerja secara real-time, dan tangani insiden lebih cepat via notifikasi WhatsApp otomatis.",
        url: PAGE_URL,
        siteName: "SmartSales",
        locale: "id_ID",
        type: "website",
        images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Solusi CRM Operasional Lapangan | SmartSales",
        description: "Otomatiskan penugasan tim lapangan, pantau lokasi & progres kerja secara real-time, dan tangani insiden lebih cepat via notifikasi WhatsApp otomatis.",
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
            name: "Solusi untuk Tim Operasional",
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
            name: "Bagaimana SmartSales melacak keberadaan tim lapangan secara real-time?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Staf lapangan melakukan Check-in dan Check-out berbasis GPS (Geotagging) saat mulai dan menyelesaikan tugas. Status ini langsung terlihat di dashboard Control Tower Operasional, sehingga tim pusat tahu di mana staf berada dan sejauh mana progres tugas hari itu.",
            },
        },
        {
            "@type": "Question",
            name: "Apakah staf lapangan bisa melaporkan bukti pekerjaan tanpa mengetik laporan panjang?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Bisa. Saat menyelesaikan instalasi, pengiriman, atau perbaikan, staf lapangan cukup mengunggah Photo Proof dan tanda tangan digital dari aplikasi, langsung terhubung ke tugas yang bersangkutan tanpa perlu mengirim laporan terpisah lewat chat.",
            },
        },
        {
            "@type": "Question",
            name: "Bagaimana cara notifikasi penugasan (dispatch/SPK) dikirim ke staf lapangan?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Notifikasi penugasan dikirim otomatis ke nomor WhatsApp staf menggunakan WhatsApp Business API, sehingga tim tidak perlu mengetik ulang surat perintah kerja satu per satu di grup WhatsApp.",
            },
        },
        {
            "@type": "Question",
            name: "Bagaimana proses pelaporan insiden atau kerusakan alat di lapangan ditangani?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Laporan kerusakan yang dikirim staf lapangan lewat WhatsApp langsung diubah menjadi Tiket Perbaikan melalui fitur Ticket Creation, lalu ditugaskan ke tim Maintenance atau Engineering dengan Service Level Agreement (SLA) yang bisa dipantau.",
            },
        },
        {
            "@type": "Question",
            name: "Apa yang terjadi jika ada perubahan jadwal tugas secara mendadak dari kantor pusat?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Jadwal dan alokasi tugas dapat diatur ulang secara dinamis dari sistem. Perubahan tersebut langsung terlihat oleh staf lapangan yang terdampak tanpa harus menghubungi satu per satu.",
            },
        },
        {
            "@type": "Question",
            name: "Bisakah SmartSales dipakai untuk mengingatkan jadwal perawatan rutin armada atau kontrak vendor?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Bisa. Anda dapat mengatur notifikasi otomatis untuk jadwal perawatan rutin armada (fleet maintenance) atau tanggal perpanjangan kontrak vendor, sehingga tidak ada jadwal yang terlewat.",
            },
        },
        {
            "@type": "Question",
            name: "Apakah data lokasi dan aktivitas tim lapangan kami aman dari perusahaan lain?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Data disimpan pada infrastruktur multi-tenant dengan pemisahan data antar perusahaan, sehingga data lokasi, tugas, dan tiket insiden tim Anda hanya bisa diakses oleh pengguna berwenang di tenant Anda sendiri.",
            },
        },
        {
            "@type": "Question",
            name: "Bisakah alur kerja operasional disesuaikan dengan proses yang sudah berjalan di perusahaan kami?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Bisa. Karena SmartSales dibangun dengan pendekatan custom build, struktur tugas lapangan, kategori tiket insiden, hingga template pesan dispatch dapat disesuaikan dengan proses operasional yang sudah ada di perusahaan Anda.",
            },
        },
        {
            "@type": "Question",
            name: "Berapa biaya berlangganan SmartSales untuk kebutuhan tim operasional?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Detail paket dan harga tersedia di halaman Harga kami. Silakan kunjungi halaman /price untuk melihat pilihan paket yang sesuai dengan jumlah staf lapangan dan kebutuhan modul Anda.",
            },
        },
        {
            "@type": "Question",
            name: "Apakah tersedia uji coba gratis sebelum berlangganan?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Tersedia. Anda bisa memulai uji coba gratis atau konsultasi langsung dengan tim kami terlebih dahulu untuk melihat apakah alur penugasan lapangan, notifikasi WhatsApp, dan ticketing di SmartSales sesuai dengan kebutuhan operasional Anda.",
            },
        },
    ],
};

export default function OperationsPage() {
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
            <OpClient />
        </>
    );
}
