import { BlogArticle } from './types';

const article: BlogArticle = {
    slug: 'kesalahan-umum-integrasi-sales-marketing',
    category: {
        id: 'Panduan Lead Management',
        en: 'Lead Management Guide',
    },
    publishedDate: '2026-08-12',
    title: {
        id: '7 Kesalahan Integrasi Sales Marketing yang Bikin Leads Hilang',
        en: '7 Sales-Marketing Integration Mistakes That Lose You Leads',
    },
    description: {
        id: 'Kesalahan integrasi sales marketing yang paling sering terjadi — dari lead source tidak tercatat sampai tidak ada SLA follow-up — dan cara memperbaikinya satu per satu.',
        en: 'The most common sales-marketing integration mistakes — from untracked lead sources to missing follow-up SLAs — and how to fix each one, step by step.',
    },
    h1: {
        id: 'Kenapa Leads Marketing Sering Tidak Pernah Di-follow Up Sales? Ini 7 Penyebabnya',
        en: 'Why Do Marketing Leads Never Get Followed Up by Sales? Here Are 7 Reasons',
    },
    intro: {
        id: 'Tim marketing sudah kerja keras menghasilkan leads, tapi angka closing tidak pernah sebanding. Masalahnya sering bukan di kualitas campaign, melainkan di titik serah terima antara marketing dan sales — tempat leads paling sering hilang tanpa ada yang sadar. Artikel ini membahas 7 kesalahan integrasi sales marketing yang paling umum ditemukan, plus cara memperbaikinya satu per satu.',
        en: 'Marketing works hard to generate leads, but closing numbers never seem to match. The real problem is often not campaign quality — it is the handoff point between marketing and sales, where leads go missing without anyone noticing. This article covers the 7 most common sales-marketing integration mistakes, and how to fix each one.',
    },
    body: [
        {
            type: 'h2',
            text: {
                id: 'Akar Masalahnya: Titik Serah Terima, Bukan Campaign-nya',
                en: 'The Root Cause: The Handoff Point, Not the Campaign',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Saat closing rate rendah, reaksi paling umum adalah menyalahkan campaign — target audiens salah, copy kurang menarik, budget kurang besar. Padahal di banyak bisnis, masalah sebenarnya ada di titik serah terima antara marketing dan sales: leads yang sudah didapat marketing dengan susah payah, hilang begitu saja sebelum sempat di-follow up sales. Ini persis masalah yang dibahas di solusi integrasi sales & marketing — leads yang tercecer di WhatsApp pribadi, spreadsheet, atau grup chat, dan tidak pernah sampai ke tangan orang yang tepat pada waktu yang tepat.',
                en: "When closing rates are low, the usual reaction is to blame the campaign — wrong audience, weak copy, not enough budget. But in a lot of businesses, the real problem sits at the handoff point between marketing and sales: leads marketing worked hard to generate simply disappear before sales ever gets to follow up. This is exactly the problem covered in our sales & marketing integration solution — leads scattered across personal WhatsApp, spreadsheets, or chat groups, never reaching the right person at the right time.",
            },
        },
        {
            type: 'h2',
            text: {
                id: '7 Kesalahan yang Paling Sering Ditemukan',
                en: '7 Mistakes We See Most Often',
            },
        },
        {
            type: 'list',
            items: {
                id: [
                    'Lead source tidak dicatat — begitu leads masuk, tidak ada catatan campaign atau channel mana yang menghasilkannya, jadi mustahil tahu campaign mana yang benar-benar berhasil.',
                    'Tidak ada SLA follow-up — tidak ada batas waktu yang jelas kapan lead baru harus dihubungi, sehingga follow-up tergantung mood atau kesibukan masing-masing sales.',
                    'Leads duplikat atau tidak ada yang pegang — prospek yang sama dihubungi dua sales berbeda, atau justru tidak dihubungi sama sekali karena masing-masing mengira sudah ditangani orang lain.',
                    'Tidak ada feedback loop ke marketing — sales tahu leads mana yang kualitasnya rendah, tapi informasi itu tidak pernah sampai ke marketing untuk memperbaiki targeting campaign berikutnya.',
                    'Serah terima masih manual — leads dipindahkan lewat file Excel yang di-export lalu dikirim via chat, rawan salah kirim, telat, atau memakai versi file yang sudah usang.',
                    'Data tidak real-time — laporan performa baru muncul mingguan atau bulanan, terlalu lambat untuk memperbaiki campaign yang masih berjalan.',
                    'ROI campaign tidak ditelusuri sampai closing — marketing hanya tahu jumlah leads atau reply, bukan berapa yang akhirnya menjadi pelanggan, sehingga alokasi budget berikutnya berdasarkan tebakan.',
                ],
                en: [
                    "Lead source isn't recorded — once a lead comes in, there's no record of which campaign or channel it came from, making it impossible to know which campaigns actually work.",
                    "No follow-up SLA — there's no clear deadline for contacting a new lead, so follow-up depends on whichever rep happens to have free time.",
                    'Duplicate or unowned leads — the same prospect gets contacted by two different reps, or by no one at all because everyone assumes someone else already has it.',
                    "No feedback loop to marketing — sales knows which leads are low quality, but that information never reaches marketing to improve the next campaign's targeting.",
                    'Handoffs are still manual — leads move through exported Excel files sent over chat, prone to mistakes, delays, or outdated file versions being used.',
                    "Data isn't real-time — performance reports only show up weekly or monthly, far too slow to fix a campaign that's still running.",
                    "Campaign ROI is never tracked to closing — marketing only knows lead or reply counts, not how many eventually became customers, so next quarter's budget is a guess.",
                ],
            },
        },
        {
            type: 'p',
            text: {
                id: 'Dari ketujuh hal di atas, tidak adanya SLA follow-up dan leads duplikat biasanya paling terasa dampaknya sehari-hari. Tanpa SLA, sebuah lead panas bisa menunggu berhari-hari sebelum dihubungi — cukup lama bagi prospek untuk beralih ke kompetitor yang responsnya lebih cepat. Sementara leads duplikat menciptakan pengalaman buruk: prospek dihubungi dua sales berbeda dengan penawaran yang tidak konsisten, atau justru merasa diabaikan karena tidak ada satu pun yang menghubungi.',
                en: "Of the seven, missing SLAs and duplicate leads are usually the ones felt most immediately. Without an SLA, a hot lead can sit for days before anyone calls — long enough for the prospect to move on to a faster-responding competitor. Duplicate leads create a different kind of damage: a prospect gets contacted twice with inconsistent offers, or feels ignored because no one reached out at all.",
            },
        },
        {
            type: 'callout',
            text: {
                id: 'Contoh ilustrasi: 200 leads/bulan × 30% tidak pernah di-follow up × rata-rata nilai closing Rp2.000.000 × close rate tim sales 15% ≈ Rp18.000.000 potensi pendapatan hilang per bulan. Angka ini hanya ilustrasi — ganti dengan data bisnis Anda sendiri untuk melihat dampak sebenarnya.',
                en: 'Illustrative example: 200 leads/month × 30% never followed up × average deal size Rp2,000,000 × 15% sales close rate ≈ Rp18,000,000 in potential lost revenue every month. This is only an example — replace the numbers with your own business data to see the real impact.',
            },
        },
        {
            type: 'h2',
            text: {
                id: 'Cara Mulai Memperbaikinya',
                en: 'How to Start Fixing It',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Langkah-langkah di atas bisa dijalankan secara manual dulu, terutama jika volume leads Anda masih kecil. Tapi begitu leads datang dari banyak channel sekaligus dan volumenya naik, proses manual mulai kewalahan — celah di antara marketing dan sales justru makin lebar, bukan makin sempit. Berikut langkah dasarnya, terlepas dari apakah Anda memakai software atau tidak:',
                en: "The steps above can be run manually at first, especially if your lead volume is still small. But once leads start arriving from multiple channels at once and volume grows, the manual process gets overwhelmed — the gap between marketing and sales widens instead of closing. Here are the basic steps, whether or not you're using software:",
            },
        },
        {
            type: 'list',
            items: {
                id: [
                    'Petakan semua sumber leads yang ada saat ini — WhatsApp, Email, Instagram, Web Form — dan siapa yang bertanggung jawab menangani masing-masing.',
                    'Sepakati satu definisi leads antara marketing dan sales, misalnya kapan sebuah kontak dianggap siap diteruskan ke sales.',
                    'Tetapkan SLA follow-up yang jelas, misalnya leads baru harus dihubungi dalam 1 jam kerja.',
                    'Bangun satu sumber data yang bisa dilihat bersama oleh marketing dan sales, bukan dua laporan terpisah yang sering tidak nyambung.',
                    'Tutup loop-nya — pastikan sales bisa memberi tahu marketing leads mana yang berkualitas, supaya campaign berikutnya lebih tepat sasaran.',
                ],
                en: [
                    'Map every lead source you currently have — WhatsApp, Email, Instagram, Web Forms — and who is responsible for handling each one.',
                    'Agree on one shared definition of a lead between marketing and sales, e.g. when a contact counts as ready to hand off to sales.',
                    'Set a clear follow-up SLA, such as contacting new leads within 1 working hour.',
                    'Build one shared data source both marketing and sales can see, instead of two separate reports that never quite match.',
                    'Close the loop — make sure sales can tell marketing which leads were high quality, so the next campaign targets better.',
                ],
            },
        },
        {
            type: 'callout',
            text: {
                id: 'Integrasi sales dan marketing bukan soal punya tools canggih atau tidak — intinya adalah punya satu sumber data yang sama-sama bisa dipercaya oleh kedua tim. Begitu itu ada, memperbaiki SLA, routing leads, dan pelacakan ROI jadi jauh lebih mudah.',
                en: "Sales and marketing integration isn't really about having fancy tools — it comes down to having one data source both teams can trust. Once that exists, fixing SLAs, lead routing, and ROI tracking gets much easier.",
            },
        },
    ],
    faq: [
        {
            q: {
                id: 'Apa kesalahan paling umum saat integrasi sales dan marketing?',
                en: 'What is the most common mistake in sales-marketing integration?',
            },
            a: {
                id: 'Kesalahan paling sering adalah tidak adanya SLA follow-up dan lead source yang tidak tercatat, sehingga leads dari marketing tidak pernah sampai ke sales tepat waktu, atau sampai tapi tanpa konteks campaign asalnya.',
                en: 'The most common mistakes are missing follow-up SLAs and unrecorded lead sources, so leads from marketing either never reach sales in time, or reach sales without any record of which campaign they came from.',
            },
        },
        {
            q: {
                id: 'Apakah kesalahan ini hanya terjadi di bisnis besar?',
                en: 'Do these mistakes only happen at large businesses?',
            },
            a: {
                id: 'Tidak. Bisnis kecil dengan volume leads rendah biasanya masih bisa menangani secara manual, tapi begitu leads datang dari banyak channel sekaligus, celah di antara marketing dan sales biasanya mulai terasa — terlepas dari ukuran bisnisnya.',
                en: 'No. Small businesses with low lead volume can often still manage manually, but once leads start coming from multiple channels at once, the gap between marketing and sales tends to show up regardless of company size.',
            },
        },
        {
            q: {
                id: "Bagaimana cara tahu leads perusahaan saya sedang 'bocor'?",
                en: "How do I know if my company's leads are 'leaking'?",
            },
            a: {
                id: "Tanda paling jelas adalah tidak ada yang bisa menjawab dengan pasti berapa leads yang belum di-follow up minggu ini, atau campaign mana yang menghasilkan closing bulan lalu. Kalau jawabannya 'tidak tahu', itu indikasi ada kebocoran di titik serah terima.",
                en: "The clearest sign is that no one can answer with confidence how many leads are still unfollowed this week, or which campaign generated last month's closings. If the answer is 'we don't know,' that's a sign of leakage at the handoff point.",
            },
        },
        {
            q: {
                id: 'Apakah spreadsheet sudah cukup untuk integrasi sales dan marketing?',
                en: 'Is a spreadsheet enough for sales-marketing integration?',
            },
            a: {
                id: 'Bisa, untuk volume leads yang masih kecil dan dengan SLA follow-up yang disepakati bersama. Tapi seiring volume naik, spreadsheet sulit menangani notifikasi real-time, deteksi duplikasi, dan pelacakan ROI sampai closing.',
                en: 'It can be, for low lead volume and with a follow-up SLA both teams agree to. But as volume grows, spreadsheets struggle with real-time notifications, duplicate detection, and tracking ROI all the way to closing.',
            },
        },
        {
            q: {
                id: 'Apa langkah pertama yang paling penting untuk diperbaiki?',
                en: 'What is the most important first step to fix?',
            },
            a: {
                id: 'Mulai dari mencatat lead source setiap kontak yang masuk. Tanpa data ini, semua perbaikan lain — SLA, routing, pelacakan ROI — tidak punya dasar untuk diukur.',
                en: 'Start by recording the lead source for every incoming contact. Without that data, every other fix — SLA, routing, ROI tracking — has nothing to measure against.',
            },
        },
    ],
    relatedSlugs: [
        'cara-menghitung-leads-yang-hilang',
        'checklist-audit-kebocoran-leads',
        'sla-follow-up-leads',
    ],
    primaryCtaHref: '/solusi/integrasi-sales-marketing',
    primaryCtaLabel: {
        id: 'Lihat Solusi Integrasi Sales & Marketing',
        en: 'See the Sales & Marketing Integration Solution',
    },
};

export default article;
