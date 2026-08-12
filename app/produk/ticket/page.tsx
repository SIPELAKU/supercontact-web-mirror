import { Metadata } from 'next';
import TicketPublicClient from '@/components/ticket-public/TicketPublicClient';

const PAGE_URL = 'https://www.smartsales.id/produk/ticket';

export const metadata: Metadata = {
    title: 'Ticket Creation dari Chat - SmartSales',
    description: 'Ubah chat pelanggan jadi tiket tugas terlacak lengkap dengan status, eskalasi antar tim, dan SLA. Tidak ada lagi keluhan yang tenggelam di kolom chat.',
    alternates: {
        canonical: PAGE_URL,
    },
    openGraph: {
        title: 'Ticket Creation dari Chat | SmartSales',
        description: 'Ubah chat pelanggan jadi tiket tugas terlacak lengkap dengan status, eskalasi antar tim, dan SLA. Tidak ada lagi keluhan yang tenggelam di kolom chat.',
        url: PAGE_URL,
        siteName: 'SmartSales',
        locale: 'id_ID',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Ticket Creation dari Chat | SmartSales',
        description: 'Ubah chat pelanggan jadi tiket tugas terlacak lengkap dengan status, eskalasi antar tim, dan SLA. Tidak ada lagi keluhan yang tenggelam di kolom chat.',
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
            name: 'Ticket Creation',
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
            name: 'Bagaimana cara membuat tiket dari sebuah chat?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Agen CS cukup membuat tiket langsung dari jendela chat yang sedang berlangsung, tanpa membuka tab atau aplikasi baru. Transkrip percakapan otomatis ikut terlampir ke tiket, jadi tim yang menangani tidak perlu meminta ulang riwayat chat ke pelanggan.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apa saja status yang bisa dipantau pada sebuah tiket?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Setiap tiket memiliki status Open, In Progress, atau Resolved. Status ini bisa dipantau oleh agen maupun atasan tim untuk memastikan tidak ada keluhan pelanggan yang terlalu lama menunggu penyelesaian.',
            },
        },
        {
            '@type': 'Question',
            name: 'Bisakah tiket diteruskan ke tim atau departemen lain?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Bisa. Tiket dari tim CS depan (frontline) dapat dieskalasi ke tim teknis, gudang, atau finance sesuai jenis masalahnya, tanpa kehilangan konteks percakapan asli karena transkrip chat tetap melekat pada tiket.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah chat penjualan juga bisa diubah jadi tiket?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Bisa. Chat dari prospek yang menanyakan harga atau produk dapat diubah menjadi tiket Peluang Penjualan (Lead) dan langsung masuk ke Pipeline CRM Sales, sehingga tidak perlu dicatat ulang secara manual.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apa itu SLA pada fitur ini dan bagaimana cara kerjanya?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'SLA adalah batas waktu penyelesaian yang bisa diatur untuk setiap tiket keluhan. Jika sebuah tiket melewati batas waktu yang ditentukan, sistem akan memberi peringatan agar tim terkait segera menindaklanjutinya.',
            },
        },
        {
            '@type': 'Question',
            name: 'Ke mana riwayat tiket pelanggan tersimpan?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Semua tiket yang pernah dibuat untuk seorang pelanggan tersimpan di profil pelanggan tersebut. Agen CS bisa melihat riwayat keluhan sebelumnya sebelum merespons chat yang baru masuk.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah fitur ini terhubung dengan WhatsApp Business API?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ya. Ticket Creation berjalan di atas Inbox Omnichannel yang menerima chat pelanggan termasuk dari WhatsApp Business API, sehingga tiket bisa dibuat langsung dari percakapan yang sedang berlangsung di sana.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah kategori atau alur tiket bisa disesuaikan dengan tim kami?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Tim kami dapat membantu menyesuaikan kategori tiket, tujuan eskalasi antar departemen, dan pengaturan SLA agar mengikuti struktur tim CS, support, sales, dan operasional yang sudah berjalan di perusahaan Anda.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah data tiket dan chat pelanggan kami aman?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Setiap perusahaan memiliki ruang data tersendiri (multi-tenant) yang terpisah dari perusahaan lain. Akses ke tiket dan riwayat chat diatur berdasarkan peran pengguna, sehingga agen bisa dibatasi hanya melihat tiket timnya sendiri jika diperlukan.',
            },
        },
        {
            '@type': 'Question',
            name: 'Berapa biaya untuk menggunakan fitur Ticket Creation ini?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Detail paket dan harga dapat dilihat di halaman /price. Tim kami juga bisa membantu merekomendasikan paket yang sesuai dengan volume tiket dan jumlah agen di tim Anda.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah ada uji coba sebelum berlangganan?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Silakan hubungi tim kami melalui WhatsApp untuk menanyakan opsi uji coba yang tersedia saat ini, karena ketentuannya bisa berbeda tergantung kebutuhan dan jumlah pengguna.',
            },
        },
        {
            '@type': 'Question',
            name: 'Bagaimana cara memulai jika kami tertarik?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Klik tombol WhatsApp di halaman ini untuk terhubung langsung dengan tim kami. Kami akan bantu memahami alur eskalasi dan SLA tim CS Anda saat ini, lalu menjelaskan langkah-langkah selanjutnya.',
            },
        },
    ],
};

export default function PublicTicketPage() {
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
            <TicketPublicClient />
        </>
    );
}
