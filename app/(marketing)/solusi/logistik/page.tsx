import { Metadata } from 'next';
import LogisticsClient from '@/components/solution-logistics/LogisticsClient';
import { ogImageUrl } from '@/lib/utils/og-image';

const PAGE_URL = 'https://smartsales.id/solusi/logistik';

const OG_IMAGE = ogImageUrl({ title: 'Solusi Logistik: Pickup, Resi & CS B2B', category: 'Solusi Logistik' });

export const metadata: Metadata = {
    title: 'Solusi Logistik: Pickup, Resi & CS B2B',
    description:
        'Kelola jadwal pickup B2B, notifikasi status paket, dan cek resi otomatis via WhatsApp Business API. Ubah komplain pelanggan jadi tiket kerja dengan SmartSales.',
    alternates: {
        canonical: PAGE_URL,
    },
    openGraph: {
        title: 'Solusi Industri Logistik | SmartSales',
        description:
            'Kelola jadwal pickup B2B, notifikasi status paket, dan cek resi otomatis via WhatsApp Business API. Ubah komplain pelanggan jadi tiket kerja dengan SmartSales.',
        url: PAGE_URL,
        siteName: 'SmartSales',
        locale: 'id_ID',
        type: 'website',
        images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Solusi Industri Logistik | SmartSales',
        description:
            'Kelola jadwal pickup B2B, notifikasi status paket, dan cek resi otomatis via WhatsApp Business API dengan SmartSales.',
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
            item: 'https://smartsales.id',
        },
        {
            '@type': 'ListItem',
            position: 2,
            name: 'Solusi Industri Logistik',
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
            name: 'Apakah SmartSales bisa terhubung dengan nomor WhatsApp Business yang sudah punya centang hijau?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Bisa. SmartSales menggunakan WhatsApp Business API resmi, jadi nomor ekspedisi Anda yang sudah terverifikasi (centang hijau) dapat dihubungkan langsung ke dasbor untuk melayani cek resi, tanya tarif, dan komplain dalam satu layar.',
            },
        },
        {
            '@type': 'Question',
            name: 'Bagaimana cara mengatur jadwal pickup untuk klien korporat?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Jadwal pickup diatur lewat modul CRM Sales. Setiap permintaan penjemputan dari klien B2B dicatat sebagai kartu dengan status visual (Terjadwal, Dalam Proses, Selesai), sehingga admin dan kurir tahu jadwal harian tanpa perlu buku catatan atau spreadsheet terpisah.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah Auto-Reply bisa menjawab pertanyaan tarif ongkir secara otomatis?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Bisa. Auto-Reply dapat dikonfigurasi untuk menjawab pertanyaan umum seperti cek resi atau tarif ongkir 24/7, sehingga tim CS hanya perlu turun tangan untuk kasus yang butuh penanganan manusia, misalnya komplain barang rusak.',
            },
        },
        {
            '@type': 'Question',
            name: 'Bagaimana komplain barang rusak atau salah alamat ditangani agar tidak hilang begitu saja?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Komplain dari chat WhatsApp bisa langsung diubah menjadi tiket lewat modul Ticket Creation, lalu dieskalasi ke tim Operasional Gudang atau Koordinator Kurir dengan status Open, In Progress, atau Resolved yang bisa dipantau sampai selesai.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah pelanggan bisa menerima notifikasi status paket secara otomatis?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ya, notifikasi (blast) seperti "paket sedang dibawa kurir" atau perubahan status pengiriman bisa dikirim otomatis via WhatsApp, jadi pelanggan tidak perlu bertanya berulang kali ke admin.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah data pelanggan dan riwayat pengiriman kami aman?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Setiap perusahaan berjalan di lingkungan multi-tenant yang terpisah, jadi data klien korporat, riwayat pengiriman, dan percakapan WhatsApp perusahaan Anda tidak tercampur dengan perusahaan lain di sistem.',
            },
        },
        {
            '@type': 'Question',
            name: 'Berapa biaya berlangganan SmartSales untuk perusahaan logistik?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Struktur paket dan harga terbaru bisa dilihat di halaman /price. Tim kami juga bisa membantu merekomendasikan paket yang sesuai dengan volume pengiriman dan jumlah tim CS Anda lewat konsultasi langsung.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah alur kerja bisa disesuaikan dengan proses operasional kami yang sudah berjalan?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Bisa. Tahapan pipeline, kolom status pickup/pengiriman, dan modul ticketing dapat dikustomisasi (custom build) mengikuti alur kerja gudang dan tim lapangan yang sudah Anda jalankan, tanpa memaksa Anda mengganti total proses yang ada.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah tim kurir dan operasional gudang juga perlu login ke sistem yang sama dengan CS?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Tergantung kebutuhan. Umumnya tim CS dan sales korporat memakai dasbor utama, sementara eskalasi ke Operasional Gudang atau Koordinator Kurir dikirim sebagai tiket kerja, sehingga masing-masing tim cukup memantau tiket yang relevan dengan tugasnya.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah ada masa uji coba sebelum berlangganan?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ada, Anda bisa mulai dengan uji coba gratis melalui tombol yang tersedia di halaman ini untuk mencoba alur pickup, Auto-Reply, dan ticketing sebelum memutuskan berlangganan.',
            },
        },
    ],
};

export default function LogisticsPage() {
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
            <LogisticsClient />
        </>
    );
}
