import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ogImageUrl } from "@/lib/utils/og-image";

const PAGE_URL = "https://smartsales.id/privacy-policy";
const OG_IMAGE = ogImageUrl({ title: "Kebijakan Privasi" });

export const metadata: Metadata = {
    title: "Kebijakan Privasi",
    description:
        "Kebijakan privasi SmartSales: data apa yang kami kumpulkan, bagaimana kami menggunakannya (termasuk Google Analytics dan Google Ads), serta hak Anda sesuai UU PDP.",
    alternates: {
        canonical: PAGE_URL,
    },
    openGraph: {
        title: "Kebijakan Privasi | SmartSales",
        description:
            "Data apa yang kami kumpulkan, bagaimana kami menggunakannya, dan hak Anda sebagai pengguna SmartSales.",
        url: PAGE_URL,
        siteName: "SmartSales",
        locale: "id_ID",
        type: "website",
        images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
        images: [OG_IMAGE],
    },
};

const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: "https://smartsales.id" },
        { "@type": "ListItem", position: 2, name: "Kebijakan Privasi", item: PAGE_URL },
    ],
};

// Legal copy is deliberately Indonesian-only (the audience of record for the
// operating entity) and server-rendered so the disclosure is always in the
// page source Google Ads policy reviewers and crawlers see.
export default function PrivacyPolicyPage() {
    return (
        <div className="bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <Navbar />
            <main><article className="max-w-3xl mx-auto px-6 pt-32 pb-16 text-gray-700 leading-relaxed">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Kebijakan Privasi</h1>
                <p className="mt-2 text-sm text-gray-500">Terakhir diperbarui: 31 Agustus 2026</p>

                <p className="mt-8">
                    SmartSales (<Link href="/" className="text-brand hover:underline">smartsales.id</Link>) adalah
                    platform CRM, sales, marketing, dan customer support terintegrasi yang dioperasikan oleh{" "}
                    <strong>Solvera Indonesia</strong> (&ldquo;kami&rdquo;). Kebijakan ini menjelaskan data pribadi apa
                    yang kami kumpulkan, bagaimana kami menggunakannya, dengan siapa kami membagikannya, dan hak Anda
                    atas data tersebut, sejalan dengan Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi
                    (UU PDP).
                </p>

                <h2 className="mt-10 text-xl font-semibold text-gray-900">1. Data yang kami kumpulkan</h2>
                <ul className="mt-3 list-disc pl-6 space-y-2">
                    <li>
                        <strong>Data pendaftaran.</strong> Saat Anda membuat akun, kami mengumpulkan nama lengkap, email
                        kerja, nomor telepon, nama perusahaan, jabatan, dan kata sandi (tersimpan terenkripsi).
                    </li>
                    <li>
                        <strong>Data penggunaan.</strong> Halaman yang Anda kunjungi, interaksi dengan tombol/CTA, serta
                        informasi teknis standar (jenis perangkat, browser, alamat IP) melalui cookies dan teknologi
                        serupa.
                    </li>
                    <li>
                        <strong>Data komunikasi.</strong> Pesan yang Anda kirim kepada kami melalui formulir, live chat
                        (widget SmartSales), email, atau WhatsApp.
                    </li>
                    <li>
                        <strong>Data pelanggan Anda di dalam platform.</strong> Untuk data kontak/prospek yang Anda
                        kelola di dalam SmartSales sebagai tenant, Anda adalah pengendali datanya dan kami memprosesnya
                        semata-mata untuk menyediakan layanan.
                    </li>
                </ul>

                <h2 className="mt-10 text-xl font-semibold text-gray-900">2. Analitik dan periklanan</h2>
                <p className="mt-3">Kami menggunakan layanan Google berikut pada situs publik kami:</p>
                <ul className="mt-3 list-disc pl-6 space-y-2">
                    <li>
                        <strong>Google Analytics 4</strong> — untuk memahami bagaimana pengunjung menggunakan situs
                        (halaman yang dilihat, klik CTA, klik tombol WhatsApp, pendaftaran). Data dikumpulkan melalui
                        cookies dalam bentuk agregat/pseudonim.
                    </li>
                    <li>
                        <strong>Google Ads (conversion tracking &amp; remarketing)</strong> — untuk mengukur efektivitas
                        iklan kami dan menampilkan iklan yang relevan kepada pengunjung situs. Cookies periklanan Google
                        dapat mencatat bahwa Anda mengunjungi situs kami setelah mengeklik iklan.
                    </li>
                    <li>
                        <strong>Enhanced conversions.</strong> Saat Anda mendaftar, email dan nomor telepon yang Anda
                        masukkan dapat dikirim ke Google dalam bentuk <em>hash</em> (tidak terbaca) untuk pengukuran
                        konversi iklan yang lebih akurat. Google tidak menerima data mentah Anda dari proses ini.
                    </li>
                </ul>
                <p className="mt-3">
                    Anda dapat menolak cookies melalui pengaturan browser, dan mengatur personalisasi iklan Google di{" "}
                    <a
                        href="https://adssettings.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand hover:underline"
                    >
                        adssettings.google.com
                    </a>
                    .
                </p>

                <h2 className="mt-10 text-xl font-semibold text-gray-900">3. Bagaimana kami menggunakan data</h2>
                <ul className="mt-3 list-disc pl-6 space-y-2">
                    <li>Menyediakan, mengamankan, dan meningkatkan layanan SmartSales;</li>
                    <li>Memverifikasi akun Anda (termasuk email verifikasi saat pendaftaran);</li>
                    <li>Menanggapi pertanyaan dan permintaan dukungan, termasuk melalui WhatsApp;</li>
                    <li>Mengukur performa situs dan kampanye pemasaran kami;</li>
                    <li>Mengirim informasi produk yang relevan — Anda dapat berhenti berlangganan kapan saja.</li>
                </ul>

                <h2 className="mt-10 text-xl font-semibold text-gray-900">4. Berbagi data</h2>
                <p className="mt-3">
                    Kami tidak menjual data pribadi Anda. Data dapat diproses oleh penyedia layanan yang kami gunakan
                    untuk mengoperasikan platform — antara lain penyedia infrastruktur cloud/hosting, layanan pengiriman
                    email transaksional, dan layanan analitik/periklanan Google sebagaimana dijelaskan di atas — dengan
                    kewajiban kerahasiaan dan hanya sebatas keperluan layanan.
                </p>

                <h2 className="mt-10 text-xl font-semibold text-gray-900">5. Penyimpanan dan keamanan</h2>
                <p className="mt-3">
                    Data disimpan selama akun Anda aktif atau selama diperlukan untuk tujuan di atas, lalu dihapus atau
                    dianonimkan. Kami menerapkan langkah keamanan teknis dan organisasi yang wajar — enkripsi kata
                    sandi, kontrol akses, pencatatan audit — untuk melindungi data dari akses yang tidak sah.
                </p>

                <h2 className="mt-10 text-xl font-semibold text-gray-900">6. Hak Anda</h2>
                <p className="mt-3">
                    Sesuai UU PDP, Anda berhak mengakses, memperbaiki, memperbarui, membatasi pemrosesan, dan meminta
                    penghapusan data pribadi Anda, serta menarik persetujuan yang pernah diberikan. Ajukan permintaan
                    melalui kontak di bawah; kami akan menanggapi sesuai ketentuan yang berlaku.
                </p>

                <h2 className="mt-10 text-xl font-semibold text-gray-900">7. Perubahan kebijakan</h2>
                <p className="mt-3">
                    Kami dapat memperbarui kebijakan ini dari waktu ke waktu. Versi terbaru selalu tersedia di halaman
                    ini beserta tanggal pembaruannya. Perubahan material akan kami informasikan melalui situs atau
                    email.
                </p>

                <h2 className="mt-10 text-xl font-semibold text-gray-900">8. Kontak</h2>
                <p className="mt-3">
                    Pertanyaan tentang kebijakan ini atau data pribadi Anda: email{" "}
                    <a href="mailto:info@smartsales.id" className="text-brand hover:underline">
                        info@smartsales.id
                    </a>
                    . Lihat juga{" "}
                    <Link href="/terms-conditions" className="text-brand hover:underline">
                        Syarat &amp; Ketentuan
                    </Link>{" "}
                    kami.
                </p>
            </article></main>
            <Footer />
        </div>
    );
}
