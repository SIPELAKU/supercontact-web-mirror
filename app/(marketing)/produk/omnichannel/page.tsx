import { Metadata } from 'next';
import OmniPublicClient from '@/components/public-omnichannel/OmniPublicClient';
import { ogImageUrl } from '@/lib/utils/og-image';

const PAGE_URL = 'https://smartsales.id/produk/omnichannel';
const PAGE_TITLE = 'Omnichannel WhatsApp, Instagram & Email | SmartSales';
const PAGE_DESC =
    'Kelola pesan WhatsApp Business API, Instagram DM, dan Email dalam satu inbox. Routing otomatis ke agen, ubah chat jadi tiket atau pipeline sales sekali klik.';

const OG_IMAGE = ogImageUrl({ title: 'Omnichannel WhatsApp, Instagram & Email', category: 'Produk' });

export const metadata: Metadata = {
    title: PAGE_TITLE,
    description: PAGE_DESC,
    alternates: {
        canonical: PAGE_URL,
    },
    openGraph: {
        title: PAGE_TITLE,
        description: PAGE_DESC,
        url: PAGE_URL,
        siteName: 'SmartSales',
        locale: 'id_ID',
        type: 'website',
        images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: PAGE_TITLE,
        description: PAGE_DESC,
        images: [OG_IMAGE],
    },
};

const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SmartSales Omnichannel',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: PAGE_URL,
    description:
        'Modul Omnichannel SmartSales: satu inbox untuk WhatsApp Business API, Instagram DM, dan Email dengan routing otomatis ke agen dan konversi chat menjadi tiket atau pipeline sales.',
    inLanguage: 'id-ID',
    publisher: {
        '@type': 'Organization',
        name: 'SmartSales',
        url: 'https://smartsales.id',
    },
    offers: {
        '@type': 'Offer',
        url: 'https://smartsales.id/price',
        priceCurrency: 'IDR',
        price: '0',
        description: 'Uji coba gratis; paket berbayar tersedia di halaman harga.',
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
            item: 'https://smartsales.id',
        },
        {
            '@type': 'ListItem',
            position: 2,
            name: 'Omnichannel',
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
            name: 'Apa itu Omnichannel dalam SmartSales?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Omnichannel SmartSales adalah kotak masuk terpadu yang menggabungkan pesan dari WhatsApp Business API, Instagram DM, dan Email ke dalam satu dashboard, sehingga tim tidak perlu berpindah aplikasi untuk membalas pelanggan.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah WhatsApp yang terhubung adalah WhatsApp Business API resmi?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ya. Integrasi WhatsApp menggunakan WhatsApp Business API resmi, bukan versi modifikasi atau tidak resmi, sehingga nomor bisnis Anda lebih aman dari risiko pemblokiran.',
            },
        },
        {
            '@type': 'Question',
            name: 'Bagaimana cara mengubah chat menjadi tiket atau pipeline sales?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Dari panel chat, agen bisa langsung membuat tiket dukungan atau pipeline sales dengan satu klik, tanpa perlu menyalin data secara manual ke sistem lain.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah pesan bisa didistribusikan otomatis ke agen tertentu?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Bisa. Pesan masuk dapat dialokasikan secara otomatis (routing) berdasarkan aturan yang ditentukan, atau dibagikan secara manual oleh supervisor ke agen CS maupun Sales yang tepat.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah riwayat percakapan pelanggan tersimpan meskipun agen berganti?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ya. Seluruh riwayat percakapan tersimpan di sistem SmartSales, bukan di perangkat pribadi agen, sehingga tetap bisa diakses tim lain saat terjadi pergantian staf.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah ada balasan otomatis di luar jam kerja?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ya, tersedia fitur auto-reply dengan template untuk menyapa pelanggan atau menjawab pertanyaan umum secara instan, termasuk di luar jam operasional.',
            },
        },
        {
            '@type': 'Question',
            name: 'Berapa biaya untuk fitur Omnichannel ini?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Fitur Omnichannel termasuk dalam paket SmartSales. Detail paket dan harga lengkap bisa dilihat di halaman harga kami.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah SmartSales bisa disesuaikan dengan alur kerja tim kami?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ya, SmartSales dibangun dengan arsitektur multi-tenant dan mendukung custom build untuk kebutuhan alur kerja spesifik bisnis Anda.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah data percakapan pelanggan kami aman?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Data percakapan disimpan di infrastruktur SmartSales dengan akses berbasis peran (role-based), sehingga hanya anggota tim yang berwenang yang bisa melihat percakapan tertentu.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah tersedia trial gratis untuk mencoba Omnichannel?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ya, Anda bisa mencoba SmartSales secara gratis. Hubungi tim kami melalui WhatsApp untuk memulai.',
            },
        },
        {
            '@type': 'Question',
            name: 'Selain WhatsApp dan Instagram, saluran apa lagi yang bisa masuk ke satu inbox ini?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Selain WhatsApp Business API dan Instagram DM, Email dan live chat website juga bisa masuk ke inbox yang sama.',
            },
        },
        {
            '@type': 'Question',
            name: 'Apakah bisa melihat siapa yang sedang membalas pelanggan tertentu?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ya, tim bisa melihat percakapan mana yang sedang ditangani agen tertentu, sehingga menghindari dua orang membalas pelanggan yang sama secara bersamaan.',
            },
        },
    ],
};

export default function OmnichannelAppPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <OmniPublicClient />
        </>
    );
}
