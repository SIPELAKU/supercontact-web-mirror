import { BlogArticle } from './types';

const article: BlogArticle = {
    slug: 'checklist-audit-kebocoran-leads',
    category: {
        id: 'Panduan Audit Leads',
        en: 'Lead Audit Guide',
    },
    publishedDate: '2026-07-02',
    author: { id: 'Tim SmartSales', en: 'SmartSales Team' },
    title: {
        id: 'Checklist Audit Kebocoran Leads untuk Bisnis Anda',
        en: 'Lead Leakage Audit Checklist for Your Business',
    },
    description: {
        id: 'Curiga leads Anda bocor tapi tidak tahu di mana? Gunakan checklist 5 titik kebocoran ini untuk mengaudit proses sales dan marketing Anda sendiri, sebelum bicara soal tools.',
        en: 'Suspect your leads are leaking but can\'t pinpoint where? Use this 5-point checklist to audit your own sales and marketing process, before you even talk about tools.',
    },
    h1: {
        id: 'Leads Bocor Tanpa Anda Sadari? Ini Cara Mengauditnya',
        en: 'Your Leads Are Leaking Without You Knowing — Here\'s How to Audit It',
    },
    intro: {
        id: 'Banyak bisnis merasa follow-up mereka "sudah cukup baik" karena tidak ada yang komplain secara terbuka — padahal leads yang tidak dihubungi jarang mengeluh, mereka hanya diam dan pindah ke kompetitor. Kebocoran leads sering tidak muncul di laporan mana pun karena memang tidak ada yang mencatatnya. Checklist ini membantu Anda mengaudit prosesnya sendiri dalam 15-20 menit, tanpa perlu software apapun dulu.',
        en: 'Plenty of businesses assume their follow-up is "good enough" simply because no one complains loudly — but a lead that never gets contacted rarely complains, it just goes quiet and buys from a competitor instead. Lead leakage usually never shows up in any report, because nothing is tracking it in the first place. This checklist walks you through auditing your own process in 15-20 minutes, no software required to get started.',
    },
    body: [
        {
            type: 'h2',
            text: {
                id: 'Kenapa Kebocoran Leads Sering Tidak Terlihat',
                en: 'Why Lead Leakage Usually Goes Unnoticed',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Masalahnya bukan karena tim sales malas, tapi karena tidak ada satu angka pun yang menunjukkan berapa leads yang hilang. Marketing melihat jumlah leads yang masuk dari campaign, sales melihat jumlah deal yang closing — tapi selisih di antara keduanya jarang dibedah. Leads yang "hilang di tengah jalan" itu tidak pernah masuk laporan siapa pun, karena secara definisi, tidak ada yang bertanggung jawab mencatatnya.',
                en: 'The problem usually isn\'t a lazy sales team — it\'s that no single number ever shows how many leads went missing. Marketing sees how many leads a campaign generated, sales sees how many deals closed, but the gap between those two numbers rarely gets examined. Leads that fall through the middle never show up in anyone\'s report, because by definition, no one owns tracking them.',
            },
        },
        {
            type: 'h2',
            text: {
                id: 'Checklist: 5 Titik Kebocoran Leads yang Paling Umum',
                en: 'Checklist: The 5 Most Common Lead Leakage Points',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Jawab jujur untuk setiap poin di bawah — semakin banyak yang Anda centang "ya", semakin besar kemungkinan bisnis Anda kehilangan revenue dari leads yang sebenarnya sudah datang, hanya karena prosesnya bocor.',
                en: 'Answer each point below honestly — the more you check "yes" to, the more likely your business is losing revenue from leads that already came in the door, purely because the process leaked.',
            },
        },
        {
            type: 'list',
            items: {
                id: [
                    'Sumber leads tidak tercatat — saat sebuah leads masuk, tidak ada yang bisa memastikan itu datang dari campaign, channel, atau iklan yang mana.',
                    'Tidak ada SLA follow-up — tidak ada batas waktu jelas (misalnya "harus dihubungi dalam 1 jam") kapan leads baru wajib dikontak sales.',
                    'Leads duplikat atau terlewat — prospek yang sama dihubungi dua kali oleh dua sales berbeda, atau tidak dihubungi sama sekali karena masing-masing mengira sudah ditangani orang lain.',
                    'Tidak ada feedback loop ke marketing — sales tahu leads mana yang kualitasnya rendah, tapi informasi ini tidak pernah sampai ke tim marketing untuk memperbaiki targeting campaign berikutnya.',
                    'Data tidak real-time — laporan performa follow-up baru tersedia mingguan atau bulanan, jauh terlambat untuk memperbaiki campaign yang saat itu masih berjalan.',
                ],
                en: [
                    'Lead source isn\'t recorded — when a lead comes in, no one can confirm which campaign, channel, or ad it actually came from.',
                    'No follow-up SLA — there\'s no clear deadline (e.g. "must be contacted within 1 hour") for when a new lead has to be reached by sales.',
                    'Duplicate or missed leads — the same prospect gets contacted twice by two different reps, or not at all because each assumed someone else already handled it.',
                    'No feedback loop back to marketing — sales knows which leads are low quality, but that information never reaches marketing to improve the next campaign\'s targeting.',
                    'Data isn\'t real-time — follow-up performance reports only show up weekly or monthly, far too late to fix a campaign that\'s still actively running.',
                ],
            },
        },
        {
            type: 'p',
            text: {
                id: 'Jika Anda mencentang dua atau lebih poin di atas, kemungkinan besar sebagian leads yang sudah susah payah didatangkan marketing tidak pernah benar-benar dikerjakan sales. Ini bukan masalah kecil — ini biaya iklan dan waktu tim yang terbuang percuma.',
                en: 'If you checked two or more of the points above, there\'s a good chance some of the leads marketing worked hard to bring in are never actually worked by sales. That\'s not a minor issue — it\'s ad spend and team time going to waste.',
            },
        },
        {
            type: 'h2',
            text: {
                id: 'Cara Menghitung Potensi Revenue yang Hilang',
                en: 'How to Calculate Your Potential Lost Revenue',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Setelah tahu di mana kebocorannya, langkah berikutnya adalah memberi angka pada masalah ini, supaya tidak sekadar terasa "mengganggu" tapi bisa dibandingkan dengan biaya memperbaikinya. Formulanya sederhana: Jumlah leads per bulan × persentase leads yang tidak di-follow up × rata-rata nilai transaksi × close rate tim sales Anda = estimasi revenue yang hilang per bulan. Anda bisa mengambil angka persentase leads yang tidak di-follow up dari checklist di atas — kalau tidak ada SLA dan tidak ada pencatatan, angka ini biasanya lebih tinggi dari yang diperkirakan pemilik bisnis.',
                en: 'Once you know where the leaks are, the next step is putting a number on the problem, so it\'s not just a vague sense of "this feels wrong" but something you can weigh against the cost of fixing it. The formula is simple: monthly leads × percentage of leads not followed up × average deal size × your sales team\'s close rate = estimated lost revenue per month. You can pull the "not followed up" percentage straight from the checklist above — if there\'s no SLA and no tracking, that number is usually higher than business owners expect.',
            },
        },
        {
            type: 'callout',
            text: {
                id: 'Contoh ilustrasi (ganti dengan angka bisnis Anda sendiri): 150 leads/bulan × 25% tidak di-follow up × Rp3.000.000 rata-rata nilai transaksi × 20% close rate ≈ Rp22.500.000 potensi revenue yang hilang setiap bulan. Ini bukan angka rata-rata industri — hanya contoh cara pakai formulanya.',
                en: 'Illustrative example (swap in your own business numbers): 150 leads/month × 25% not followed up × Rp3,000,000 average deal size × 20% close rate ≈ Rp22,500,000 in potential lost revenue every month. This isn\'t an industry-average figure — it\'s just an example of how to use the formula.',
            },
        },
        {
            type: 'h2',
            text: {
                id: 'Langkah Menutup Kebocoran Setelah Audit',
                en: 'What to Do After the Audit: Closing the Leaks',
            },
        },
        {
            type: 'list',
            items: {
                id: [
                    'Identifikasi: petakan semua sumber leads yang ada saat ini — WhatsApp, Email, Instagram, Web Form — dan siapa yang seharusnya menangani masing-masing.',
                    'Standarisasi: sepakati satu definisi leads dan satu format data yang sama antara tim marketing dan sales, supaya kedua tim bicara dengan angka yang sama.',
                    'Otomatiskan: ganti proses kirim-manual (Excel, japri) dengan routing leads baru langsung ke sales yang sedang bertugas, lengkap notifikasi dan reminder.',
                    'Pantau: gunakan satu dashboard yang dilihat marketing dan sales bersama, bukan dua laporan terpisah yang sering tidak sinkron satu sama lain.',
                    'Optimalkan: tutup loop-nya — beri tahu marketing campaign mana yang benar-benar menghasilkan closing, supaya anggaran berikutnya berdasarkan data.',
                ],
                en: [
                    'Identify: map out every lead source you currently have — WhatsApp, Email, Instagram, Web Form — and who\'s supposed to handle each one.',
                    'Standardize: agree on one shared lead definition and one data format between marketing and sales, so both teams are working from the same numbers.',
                    'Automate: replace manual handoffs (Excel, personal chats) with automatic routing of new leads to whichever rep is currently on duty, complete with notifications and reminders.',
                    'Monitor: use one shared dashboard that both marketing and sales look at, instead of two separate reports that often don\'t agree with each other.',
                    'Optimize: close the loop — tell marketing which campaigns actually produced closings, so next quarter\'s budget is based on data instead of guesswork.',
                ],
            },
        },
        {
            type: 'p',
            text: {
                id: 'Tiga langkah pertama (identifikasi, standarisasi, otomatiskan) bisa dilakukan manual untuk tim kecil dengan volume leads rendah. Tapi begitu volume leads mulai naik, celah antara marketing dan sales inilah yang paling sering jadi titik di mana leads hilang tanpa ada yang sadar — sampai akhirnya terlihat lewat audit seperti ini.',
                en: 'The first three steps (identify, standardize, automate) can be done manually for a small team with low lead volume. But once lead volume starts climbing, the gap between marketing and sales is exactly where leads tend to go missing without anyone noticing — until an audit like this one surfaces it.',
            },
        },
    ],
    faq: [
        {
            q: {
                id: 'Seberapa sering audit kebocoran leads ini perlu dilakukan?',
                en: 'How often should this lead leakage audit be done?',
            },
            a: {
                id: 'Idealnya setiap kuartal, atau setiap kali volume leads naik signifikan (misalnya setelah campaign besar). Proses yang cukup baik untuk 50 leads/bulan bisa mulai bocor saat volume naik ke 200 leads/bulan.',
                en: 'Ideally every quarter, or any time lead volume jumps significantly (like right after a major campaign). A process that works fine at 50 leads/month can start leaking once volume climbs to 200 leads/month.',
            },
        },
        {
            q: {
                id: 'Siapa yang seharusnya melakukan audit ini — marketing atau sales?',
                en: 'Who should run this audit — marketing or sales?',
            },
            a: {
                id: 'Sebaiknya dilakukan bersama. Marketing punya data sumber leads, sales punya data follow-up dan closing. Audit yang dilakukan hanya oleh satu tim biasanya hanya melihat setengah gambar.',
                en: 'It works best done together. Marketing holds the lead-source data, sales holds the follow-up and closing data. An audit run by only one team usually only sees half the picture.',
            },
        },
        {
            q: {
                id: 'Apakah audit ini bisa dilakukan tanpa CRM atau software khusus?',
                en: 'Can this audit be done without a CRM or dedicated software?',
            },
            a: {
                id: 'Bisa, checklist di atas hanya butuh kejujuran dan data yang sudah Anda punya (misalnya riwayat chat WhatsApp dan catatan sales). Software baru dibutuhkan saat Anda ingin menutup kebocoran secara otomatis, bukan untuk mengaudit di tahap awal.',
                en: 'Yes, the checklist above only requires honesty and data you already have (like WhatsApp chat history and sales notes). Software only becomes necessary when you want to close the leaks automatically — not to run the audit itself.',
            },
        },
        {
            q: {
                id: 'Berapa persentase leads tidak di-follow up yang dianggap wajar?',
                en: 'What percentage of un-followed-up leads is considered normal?',
            },
            a: {
                id: 'Tidak ada angka baku, karena tergantung industri dan model bisnis. Yang lebih penting adalah tren: apakah angka ini bisa Anda ukur sama sekali, dan apakah membaik atau memburuk dari waktu ke waktu.',
                en: 'There\'s no fixed benchmark, since it depends heavily on industry and business model. What matters more is the trend: whether you can even measure this number at all, and whether it\'s improving or getting worse over time.',
            },
        },
        {
            q: {
                id: 'Apa bedanya audit kebocoran leads dengan sekadar menghitung leads yang hilang?',
                en: 'What\'s the difference between a lead leakage audit and simply counting lost leads?',
            },
            a: {
                id: 'Menghitung leads yang hilang memberi Anda angka akhir. Audit kebocoran menunjukkan di titik mana dalam prosesnya leads itu hilang — sumber tidak tercatat, SLA tidak ada, atau feedback loop putus — sehingga Anda tahu bagian mana yang harus diperbaiki lebih dulu.',
                en: 'Counting lost leads gives you a final number. A leakage audit shows you exactly which point in the process the lead was lost at — unrecorded source, missing SLA, or a broken feedback loop — so you know which part to fix first.',
            },
        },
    ],
    relatedSlugs: [
        'cara-menghitung-leads-yang-hilang',
        'sla-follow-up-leads',
        'kesalahan-umum-integrasi-sales-marketing',
    ],
    primaryCtaHref: '/solusi/integrasi-sales-marketing',
    primaryCtaLabel: {
        id: 'Lihat Solusi Integrasi Sales & Marketing',
        en: 'See the Sales & Marketing Integration Solution',
    },
};

export default article;
