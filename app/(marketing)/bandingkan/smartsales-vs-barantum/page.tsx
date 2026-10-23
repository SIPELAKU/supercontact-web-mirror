import { Metadata } from "next";
import ComparisonClient, { CompareData } from "@/components/bandingkan/ComparisonClient";
import { ogImageUrl } from "@/lib/utils/og-image";

const PAGE_URL = "https://smartsales.id/bandingkan/smartsales-vs-barantum";
const OG_IMAGE = ogImageUrl({ title: "SmartSales vs Barantum", category: "Perbandingan" });
const TITLE = "SmartSales vs Barantum: Mana yang Tepat untuk Bisnis Anda?";
const DESC = "Perbandingan jujur SmartSales dan Barantum — dua CRM Indonesia dengan WhatsApp & dukungan lokal. Bandingkan fokus dan kecocokan agar Anda memilih yang paling pas.";

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
    competitor: "Barantum",
    heroTitle: "SmartSales vs Barantum",
    heroSubtitle: "Perbandingan jujur dua CRM Indonesia dengan integrasi WhatsApp dan dukungan lokal — agar Anda memilih sesuai prioritas.",
    intro: "SmartSales dan Barantum sama-sama CRM buatan Indonesia dengan integrasi WhatsApp dan dukungan lokal. Keduanya baik; pilihan terbaik bergantung pada prioritas operasi Anda. Berikut perbandingan positioning-nya.",
    rows: [
        { dim: "Fokus utama", smartsales: "Integrasi sales & marketing dan pipeline sales.", competitor: "CRM dengan WhatsApp dan call center." },
        { dim: "Paling cocok untuk", smartsales: "Tim yang ingin menyatukan sales & marketing dan menutup kebocoran leads.", competitor: "Tim yang operasinya bergantung pada call center selain chat." },
        { dim: "Pendekatan", smartsales: "Ringkas dan mudah diadopsi tim.", competitor: "Kuat pada fitur telephony / call center." },
        { dim: "WhatsApp & omnichannel", smartsales: "Terintegrasi langsung ke pipeline sales.", competitor: "Terintegrasi, dilengkapi kemampuan call center." },
        { dim: "Dukungan lokal", smartsales: "Ya, tim Indonesia.", competitor: "Ya, tim Indonesia." },
    ],
    chooseSmartSales: [
        "Prioritas Anda menyatukan sales & marketing dalam satu pipeline.",
        "Anda ingin CRM yang cepat dipakai tanpa training panjang.",
        "Anda butuh WhatsApp + pipeline sales dalam satu tempat yang ringkas.",
    ],
    chooseCompetitor: [
        "Operasi Anda sangat bergantung pada panggilan telepon / call center selain chat.",
        "Fitur telephony menjadi inti alur kerja tim Anda.",
    ],
};

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: "https://smartsales.id" },
        { "@type": "ListItem", position: 2, name: "Bandingkan", item: "https://smartsales.id/bandingkan/smartsales-vs-barantum" },
        { "@type": "ListItem", position: 3, name: "SmartSales vs Barantum", item: PAGE_URL },
    ],
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        { "@type": "Question", name: "Apa perbedaan utama SmartSales dan Barantum?", acceptedAnswer: { "@type": "Answer", text: "Keduanya CRM Indonesia dengan WhatsApp dan dukungan lokal. SmartSales fokus pada integrasi sales & marketing dan pipeline sales yang ringkas, sementara Barantum menonjol pada kemampuan call center / telephony." } },
        { "@type": "Question", name: "Mana yang cocok jika tim saya banyak menelepon?", acceptedAnswer: { "@type": "Answer", text: "Bila operasi Anda sangat bergantung pada panggilan telepon, Barantum dengan fitur call center-nya bisa lebih pas. Bila fokus Anda menyatukan sales & marketing serta menutup kebocoran leads, SmartSales lebih tepat." } },
    ],
};

export default function SmartSalesVsBarantumPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <ComparisonClient data={data} />
        </>
    );
}
