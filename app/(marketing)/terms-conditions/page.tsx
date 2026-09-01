import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ogImageUrl } from "@/lib/utils/og-image";

const PAGE_URL = "https://smartsales.id/terms-conditions";
const OG_IMAGE = ogImageUrl({ title: "Syarat & Ketentuan" });

export const metadata: Metadata = {
    title: "Syarat & Ketentuan",
    description:
        "Syarat dan ketentuan penggunaan platform SmartSales: akun, masa uji coba, paket berlangganan, kewajiban pengguna, dan batasan tanggung jawab.",
    alternates: {
        canonical: PAGE_URL,
    },
    openGraph: {
        title: "Syarat & Ketentuan | SmartSales",
        description:
            "Ketentuan penggunaan platform CRM SmartSales: akun, uji coba, berlangganan, dan kewajiban para pihak.",
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
        { "@type": "ListItem", position: 2, name: "Syarat & Ketentuan", item: PAGE_URL },
    ],
};

export default function TermsConditionsPage() {
    return (
        <div className="bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <Navbar />
            <main><article className="max-w-3xl mx-auto px-6 pt-32 pb-16 text-gray-700 leading-relaxed">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Syarat &amp; Ketentuan</h1>
                <p className="mt-2 text-sm text-gray-500">Terakhir diperbarui: 31 Agustus 2026</p>

                <p className="mt-8">
                    Syarat &amp; Ketentuan ini mengatur penggunaan platform SmartSales (
                    <Link href="/" className="text-brand hover:underline">smartsales.id</Link>) yang dioperasikan oleh{" "}
                    <strong>Solvera Indonesia</strong> (&ldquo;kami&rdquo;). Dengan membuat akun atau menggunakan
                    layanan, Anda menyetujui ketentuan berikut.
                </p>

                <h2 className="mt-10 text-xl font-semibold text-gray-900">1. Layanan</h2>
                <p className="mt-3">
                    SmartSales adalah platform perangkat lunak sebagai layanan (SaaS) untuk CRM, sales, marketing, dan
                    customer support — mencakup antara lain manajemen prospek, inbox omnichannel (WhatsApp, email,
                    Instagram, web widget), tiket layanan pelanggan, dan email marketing. Fitur dapat berbeda antar
                    paket berlangganan.
                </p>

                <h2 className="mt-10 text-xl font-semibold text-gray-900">2. Akun dan pendaftaran</h2>
                <ul className="mt-3 list-disc pl-6 space-y-2">
                    <li>Anda wajib memberikan data pendaftaran yang benar, lengkap, dan terkini.</li>
                    <li>
                        Akun diverifikasi melalui email. Anda bertanggung jawab menjaga kerahasiaan kredensial dan atas
                        seluruh aktivitas yang terjadi melalui akun Anda.
                    </li>
                    <li>
                        Akun didaftarkan atas nama badan usaha (tenant); pengguna yang mendaftarkan menyatakan berwenang
                        mewakili badan usaha tersebut.
                    </li>
                </ul>

                <h2 className="mt-10 text-xl font-semibold text-gray-900">3. Uji coba dan berlangganan</h2>
                <ul className="mt-3 list-disc pl-6 space-y-2">
                    <li>
                        Paket <strong>Free Trial</strong> diberikan tanpa biaya untuk masa dan batasan yang kami
                        tetapkan, dan dapat kami ubah atau akhiri sewaktu-waktu.
                    </li>
                    <li>
                        Paket berbayar (termasuk paket <strong>Exclusive</strong>) berlaku sesuai penawaran atau kontrak
                        yang disepakati, termasuk harga, lingkup fitur, dan periode berlangganan.
                    </li>
                    <li>Kegagalan pembayaran dapat menyebabkan pembatasan atau penangguhan layanan.</li>
                </ul>

                <h2 className="mt-10 text-xl font-semibold text-gray-900">4. Kewajiban pengguna</h2>
                <p className="mt-3">Anda setuju untuk tidak:</p>
                <ul className="mt-3 list-disc pl-6 space-y-2">
                    <li>Menggunakan layanan untuk aktivitas yang melanggar hukum, termasuk spam atau penipuan;</li>
                    <li>
                        Mengunggah atau memproses data pihak ketiga tanpa dasar hukum yang sah (termasuk persetujuan
                        yang dipersyaratkan UU PDP);
                    </li>
                    <li>Mengganggu keamanan, integritas, atau ketersediaan platform;</li>
                    <li>Menyalahgunakan saluran resmi pihak ketiga (mis. kebijakan WhatsApp Business) melalui platform.</li>
                </ul>

                <h2 className="mt-10 text-xl font-semibold text-gray-900">5. Data Anda</h2>
                <p className="mt-3">
                    Data pelanggan yang Anda kelola di dalam platform tetap milik Anda sebagai tenant. Kami
                    memprosesnya hanya untuk menyediakan layanan, sesuai{" "}
                    <Link href="/privacy-policy" className="text-brand hover:underline">
                        Kebijakan Privasi
                    </Link>
                    . Anda dapat meminta ekspor atau penghapusan data saat berhenti berlangganan.
                </p>

                <h2 className="mt-10 text-xl font-semibold text-gray-900">6. Ketersediaan dan perubahan layanan</h2>
                <p className="mt-3">
                    Kami berupaya menjaga layanan tersedia dan andal, namun layanan diberikan &ldquo;sebagaimana
                    adanya&rdquo;. Pemeliharaan terjadwal, pembaruan fitur, atau gangguan penyedia pihak ketiga dapat
                    memengaruhi ketersediaan sementara.
                </p>

                <h2 className="mt-10 text-xl font-semibold text-gray-900">7. Batasan tanggung jawab</h2>
                <p className="mt-3">
                    Sepanjang diizinkan hukum, tanggung jawab kami atas kerugian yang timbul dari penggunaan layanan
                    terbatas pada jumlah yang telah Anda bayarkan untuk layanan dalam 12 bulan terakhir. Kami tidak
                    bertanggung jawab atas kerugian tidak langsung, kehilangan keuntungan, atau kehilangan data yang
                    disebabkan oleh faktor di luar kendali wajar kami.
                </p>

                <h2 className="mt-10 text-xl font-semibold text-gray-900">8. Penghentian</h2>
                <p className="mt-3">
                    Anda dapat berhenti menggunakan layanan kapan saja. Kami dapat menangguhkan atau mengakhiri akun
                    yang melanggar ketentuan ini setelah pemberitahuan yang wajar, kecuali pelanggaran berat yang
                    mengharuskan tindakan segera.
                </p>

                <h2 className="mt-10 text-xl font-semibold text-gray-900">9. Hukum yang berlaku</h2>
                <p className="mt-3">
                    Ketentuan ini tunduk pada hukum Republik Indonesia. Sengketa akan diupayakan diselesaikan secara
                    musyawarah terlebih dahulu.
                </p>

                <h2 className="mt-10 text-xl font-semibold text-gray-900">10. Kontak</h2>
                <p className="mt-3">
                    Pertanyaan tentang ketentuan ini: email{" "}
                    <a href="mailto:info@smartsales.id" className="text-brand hover:underline">
                        info@smartsales.id
                    </a>
                    .
                </p>
            </article></main>
            <Footer />
        </div>
    );
}
