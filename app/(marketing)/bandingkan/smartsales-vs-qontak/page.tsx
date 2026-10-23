import { Metadata } from "next";
import ComparisonClient, { CompareData } from "@/components/bandingkan/ComparisonClient";
import { ogImageUrl } from "@/lib/utils/og-image";

const PAGE_URL = "https://smartsales.id/bandingkan/smartsales-vs-qontak";
const OG_IMAGE = ogImageUrl({ title: "SmartSales vs Mekari Qontak", category: "Perbandingan" });
const TITLE = "SmartSales vs Mekari Qontak: Mana yang Tepat untuk Bisnis Anda?";
const DESC = "Perbandingan jujur SmartSales dan Mekari Qontak — dua CRM omnichannel Indonesia. Bandingkan fokus, kecocokan, dan pendekatan agar Anda memilih yang paling pas.";

export const metadata: Metadata = {
    title: TITLE,
    description: DESC,
    alternates: { canonical: PAGE_URL },
    openGraph: {
        title: `${TITLE} | SmartSales`,
        description: DESC,
        url: PAGE_URL,
        siteName: "SmartSales",
        locale: "id_ID",
        type: "article",
        images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: `${TITLE} | SmartSales`, description: DESC, images: [OG_IMAGE] },
};

const data: CompareData = {
    competitor: "Mekari Qontak",
    heroTitle: "SmartSales vs Mekari Qontak",
    heroSubtitle: "Perbandingan jujur dua CRM omnichannel Indonesia — untuk membantu Anda memilih sesuai kebutuhan, bukan sekadar fitur terbanyak.",
    intro: "Baik SmartSales maupun Mekari Qontak adalah CRM omnichannel buatan Indonesia dengan integrasi WhatsApp. Keduanya solid; yang membedakan adalah fokus dan konteks pemakaian. Berikut perbandingan positioning-nya agar Anda bisa memilih yang paling pas.",
    rows: [
        { dim: "Fokus utama", smartsales: "Integrasi sales & marketing dan pipeline sales dalam satu CRM.", competitor: "CRM omnichannel di dalam ekosistem bisnis Mekari." },
        { dim: "Paling cocok untuk", smartsales: "UKM & tim sales yang ingin cepat pakai tanpa training panjang.", competitor: "Bisnis yang ingin CRM terhubung ke suite bisnis yang lebih luas." },
        { dim: "Ekosistem", smartsales: "Fokus pada CRM sales & omnichannel.", competitor: "Bagian dari ekosistem Mekari (akuntansi, HR, payroll, dll)." },
        { dim: "Pendekatan", smartsales: "Ringkas dan mudah diadopsi tim.", competitor: "Cakupan fitur luas untuk kebutuhan yang lebih kompleks." },
        { dim: "WhatsApp & omnichannel", smartsales: "Terintegrasi langsung ke pipeline sales.", competitor: "Omnichannel lengkap dengan WhatsApp." },
    ],
    chooseSmartSales: [
        "Anda ingin CRM yang cepat dipakai tim tanpa training panjang.",
        "Prioritas Anda menyatukan sales & marketing dan menutup kebocoran leads.",
        "Anda UKM atau tim sales yang butuh pipeline + WhatsApp dalam satu tempat.",
    ],
    chooseCompetitor: [
        "Anda sudah atau berencana memakai ekosistem Mekari (akuntansi, HR, payroll) dan ingin semuanya terhubung.",
        "Anda membutuhkan cakupan fitur yang sangat luas untuk operasi yang kompleks.",
    ],
};

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: "https://smartsales.id" },
        { "@type": "ListItem", position: 2, name: "Bandingkan", item: "https://smartsales.id/bandingkan/smartsales-vs-qontak" },
        { "@type": "ListItem", position: 3, name: "SmartSales vs Mekari Qontak", item: PAGE_URL },
    ],
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        { "@type": "Question", name: "Apakah SmartSales dan Qontak sama-sama mendukung WhatsApp?", acceptedAnswer: { "@type": "Answer", text: "Ya, keduanya mendukung integrasi WhatsApp. Perbedaannya lebih pada fokus produk dan ekosistem: SmartSales fokus pada integrasi sales & marketing, sementara Qontak berada di dalam ekosistem bisnis Mekari." } },
        { "@type": "Question", name: "Mana yang lebih cocok untuk UKM?", acceptedAnswer: { "@type": "Answer", text: "SmartSales dirancang agar cepat dipakai tim tanpa training panjang, sehingga cocok untuk UKM. Qontak menjadi pilihan kuat bila Anda membutuhkan ekosistem Mekari yang lebih luas." } },
    ],
};

export default function SmartSalesVsQontakPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <ComparisonClient data={data} />
        </>
    );
}
