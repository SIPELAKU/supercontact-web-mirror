import { BlogArticle } from './types';

const article: BlogArticle = {
    slug: 'template-laporan-roi-campaign',
    category: {
        id: 'Panduan Marketing & ROI',
        en: 'Marketing & ROI Guide',
    },
    publishedDate: '2026-08-04',
    author: { id: 'Tim SmartSales', en: 'SmartSales Team' },
    title: {
        id: 'Template Laporan ROI Campaign Marketing ke Sales',
        en: 'ROI Campaign Report Template: Marketing to Sales',
    },
    description: {
        id: 'Cara menyusun laporan ROI campaign marketing yang bisa dipertanggungjawabkan ke sales dan manajemen — metrik wajib, struktur kolom, dan contoh perhitungan.',
        en: 'How to build a campaign ROI report marketing can actually defend to sales and management — the must-have metrics, column structure, and a worked example.',
    },
    h1: {
        id: 'Laporan ROI Campaign yang Tidak Dibantah Tim Sales',
        en: 'A Campaign ROI Report Sales Can’t Argue With',
    },
    intro: {
        id: 'Setiap akhir bulan, marketing melaporkan jumlah leads dan reply dari campaign, sedangkan sales melaporkan jumlah closing dan revenue. Masalahnya, dua laporan ini jarang bisa disambungkan: marketing tidak tahu leads mana yang akhirnya closing, dan sales tidak mencatat campaign asal setiap deal. Artikel ini membahas cara menyusun template laporan ROI campaign yang menyambungkan keduanya, lengkap dengan metrik dan contoh perhitungan.',
        en: 'At the end of every month, marketing reports lead counts and reply rates, while sales reports closed deals and revenue. The problem is these two reports rarely connect: marketing doesn’t know which leads eventually closed, and sales doesn’t log which campaign each deal came from. This article covers how to build a campaign ROI report template that ties the two together, with the metrics and a worked example.',
    },
    body: [
        {
            type: 'h2',
            text: {
                id: 'Kenapa Laporan ROI Campaign Sering Ditolak Manajemen',
                en: 'Why Campaign ROI Reports Get Rejected by Management',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Gejalanya biasanya sama: marketing datang dengan slide berisi jumlah impression, klik, dan leads masuk — tapi tidak ada angka revenue. Sales punya angka revenue, tapi tidak tahu campaign mana yang menghasilkannya karena leads sudah bercampur begitu masuk ke WhatsApp pribadi atau spreadsheet follow-up. Manajemen akhirnya melihat dua laporan yang tidak nyambung, dan pertanyaan "jadi campaign ini untung atau tidak?" tidak pernah terjawab dengan pasti.',
                en: 'The symptoms are almost always the same: marketing shows up with slides full of impressions, clicks, and leads captured — but no revenue number. Sales has the revenue number, but doesn’t know which campaign produced it because leads already got mixed together the moment they landed in a personal WhatsApp or a follow-up spreadsheet. Management ends up looking at two reports that don’t connect, and the question "so was this campaign profitable or not?" never gets a firm answer.',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Akar masalahnya bukan di angka, tapi di proses: begitu leads keluar dari campaign dan masuk ke tangan sales, jejak sumbernya hilang. Ini persis masalah yang sama dengan leads yang hilang di antara tim marketing dan sales — kalau follow-up dan sumber leads tidak tercatat konsisten, laporan ROI apa pun yang dibuat di atasnya hanya akan jadi tebakan yang rapi.',
                en: 'The root cause isn’t the math — it’s the process. The moment leads leave the campaign and land with a sales rep, the trail back to their source disappears. This is the same underlying problem as leads getting lost between marketing and sales: if follow-up and lead source aren’t tracked consistently, any ROI report built on top of that data is just a tidy-looking guess.',
            },
        },
        {
            type: 'h2',
            text: {
                id: 'Metrik Wajib dalam Template Laporan ROI Campaign',
                en: 'Must-Have Metrics in a Campaign ROI Report Template',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Sebelum menyusun kolom di spreadsheet atau dashboard, pastikan template Anda mencatat metrik-metrik ini per campaign, bukan hanya total keseluruhan bulan:',
                en: 'Before you lay out columns in a spreadsheet or dashboard, make sure your template captures these metrics per campaign, not just as a total for the whole month:',
            },
        },
        {
            type: 'list',
            items: {
                id: [
                    'Biaya campaign (ad spend, biaya konten, atau biaya tools yang relevan)',
                    'Jumlah leads yang masuk, dan sumbernya (WhatsApp, Email, Web Form, Instagram, dll.)',
                    'Jumlah leads yang benar-benar di-follow up dalam SLA yang disepakati',
                    'Conversion rate dari leads menjadi Marketing Qualified Lead (MQL) lalu Sales Qualified Lead (SQL)',
                    'Jumlah deal yang closing, dan revenue-nya, per campaign',
                    'Cost per lead dan Customer Acquisition Cost (CAC) per campaign',
                    'ROI: (revenue dari campaign − biaya campaign) ÷ biaya campaign',
                ],
                en: [
                    'Campaign cost (ad spend, content cost, or relevant tool cost)',
                    'Number of leads captured, and their source (WhatsApp, Email, Web Form, Instagram, etc.)',
                    'Number of leads actually followed up within the agreed SLA',
                    'Conversion rate from lead to Marketing Qualified Lead (MQL) to Sales Qualified Lead (SQL)',
                    'Number of deals closed, and their revenue, per campaign',
                    'Cost per lead and Customer Acquisition Cost (CAC) per campaign',
                    'ROI: (revenue from the campaign − campaign cost) ÷ campaign cost',
                ],
            },
        },
        {
            type: 'h2',
            text: {
                id: 'Struktur Kolom Template yang Bisa Langsung Dipakai',
                en: 'A Column Structure You Can Use Right Away',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Satu baris untuk satu campaign, dengan kolom berikut: Nama Campaign, Channel/Sumber, Periode, Biaya, Leads Masuk, Leads Di-follow-up (dalam SLA), Leads jadi Opportunity, Deal Closing, Revenue, CAC, dan ROI. Kunci dari template ini bukan rumusnya — rumus ROI sederhana dan sudah umum diketahui — tapi disiplin mengisi kolom "Leads Di-follow-up" dan "Leads jadi Opportunity" secara konsisten. Dua kolom inilah yang paling sering kosong atau diisi kira-kira, dan itulah yang membuat laporan ROI jadi tidak bisa dipercaya.',
                en: 'One row per campaign, with these columns: Campaign Name, Channel/Source, Period, Cost, Leads Captured, Leads Followed Up (within SLA), Leads That Became an Opportunity, Deals Closed, Revenue, CAC, and ROI. The value of this template isn’t the formula — ROI math is simple and well known — it’s the discipline of consistently filling in the "Leads Followed Up" and "Became an Opportunity" columns. Those two columns are the ones most often left blank or filled in with a guess, and that’s exactly what makes an ROI report untrustworthy.',
            },
        },
        {
            type: 'callout',
            text: {
                id: 'Contoh ilustrasi: Campaign WhatsApp Promo menghabiskan biaya Rp5.000.000 dan menghasilkan 150 leads. Dari 150 leads, hanya 90 (60%) yang di-follow up dalam SLA 24 jam. Dari 90 leads itu, 18 menjadi opportunity, dan 6 closing dengan rata-rata nilai transaksi Rp2.500.000 — total revenue Rp15.000.000. ROI campaign ini: (Rp15.000.000 − Rp5.000.000) ÷ Rp5.000.000 = 200%. Tapi perhatikan: 60 leads (40%) tidak sempat di-follow up sama sekali. Kalau angka follow-up itu bisa dinaikkan, ROI campaign yang sama bisa jauh lebih tinggi tanpa menambah biaya iklan sepeser pun. Ganti angka di atas dengan data campaign Anda sendiri.',
                en: 'Illustrative example: a WhatsApp Promo campaign spends Rp5,000,000 and generates 150 leads. Of those 150, only 90 (60%) get followed up within the 24-hour SLA. Of those 90, 18 become an opportunity, and 6 close at an average deal size of Rp2,500,000 — total revenue Rp15,000,000. This campaign’s ROI: (Rp15,000,000 − Rp5,000,000) ÷ Rp5,000,000 = 200%. But notice: 60 leads (40%) never got followed up at all. Raise that follow-up rate and the same campaign’s ROI could climb well higher without spending another rupiah on ads. Replace these figures with your own campaign data.',
            },
        },
        {
            type: 'h2',
            text: {
                id: 'Kenapa Data Ini Sering Meleset Kalau Dikerjakan Manual',
                en: 'Why This Data Tends to Be Wrong When Done Manually',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Mengisi template di atas secara manual bukan mustahil, tapi tiga hal ini biasanya bikin datanya tidak bisa dipercaya: sumber leads tidak dicatat konsisten karena berasal dari banyak channel dan diketik ulang oleh orang berbeda; status follow-up hanya diketahui dari ingatan sales, bukan catatan waktu yang jelas; dan riwayat percakapan hilang begitu staf yang menangani leads tersebut resign atau ganti nomor HP. Akibatnya, laporan ROI yang dibuat manual biasanya baru bisa disusun mingguan atau bulanan — terlalu lambat untuk memperbaiki campaign yang masih berjalan.',
                en: 'Filling in the template above by hand isn’t impossible, but three things usually make the data unreliable: lead source doesn’t get logged consistently because it comes from multiple channels and gets re-typed by different people; follow-up status is only known from a rep’s memory, not a timestamped record; and conversation history disappears the moment the staff member handling those leads resigns or changes phones. As a result, a manually built ROI report usually only comes together weekly or monthly — too slow to fix a campaign that’s still running.',
            },
        },
        {
            type: 'h2',
            text: {
                id: 'Cara Membaca Laporan Ini Bersama Tim Sales',
                en: 'How to Read This Report Together With Sales',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Laporan ROI campaign paling berguna kalau dibahas bersama sales, bukan hanya dipresentasikan sepihak oleh marketing. Kalau ROI sebuah campaign rendah, cek dulu apakah masalahnya di kualitas leads (banyak leads tidak relevan) atau di follow-up (leads bagus tapi tidak sempat dihubungi). Dua penyebab ini butuh solusi yang berbeda: yang pertama perlu perbaikan targeting campaign, yang kedua perlu perbaikan proses routing dan SLA di sisi sales. Menyatukan kedua tim di satu dashboard yang sama membuat diskusi ini berbasis data, bukan saling menyalahkan.',
                en: 'A campaign ROI report is most useful when it’s discussed together with sales, not just presented one-way by marketing. If a campaign’s ROI is low, first check whether the problem is lead quality (a lot of irrelevant leads) or follow-up (good leads that never got contacted in time). Those two causes need different fixes: the first needs better campaign targeting, the second needs a better routing and SLA process on the sales side. Putting both teams in front of the same dashboard turns this discussion into something data-driven instead of a blame game.',
            },
        },
        {
            type: 'callout',
            text: {
                id: 'Laporan ROI campaign hanya seakurat data follow-up di baliknya. Kalau leads dari campaign tidak dicatat sumbernya secara otomatis dan follow-up-nya tidak terpantau real-time, angka ROI apa pun yang keluar dari template ini tetap perkiraan, bukan fakta.',
                en: 'A campaign ROI report is only as accurate as the follow-up data behind it. If leads aren’t automatically tagged with their source and follow-up isn’t tracked in real time, any ROI number this template produces is still a guess dressed up as a fact.',
            },
        },
    ],
    faq: [
        {
            q: {
                id: 'Seberapa sering laporan ROI campaign sebaiknya dibuat?',
                en: 'How often should a campaign ROI report be built?',
            },
            a: {
                id: 'Idealnya dashboard-nya dipantau mingguan agar campaign yang kurang efektif bisa diperbaiki sebelum budget habis, sementara laporan formal untuk manajemen biasanya cukup bulanan.',
                en: 'Ideally the underlying dashboard is checked weekly so an underperforming campaign can be adjusted before the budget runs out, while the formal report for management is usually fine done monthly.',
            },
        },
        {
            q: {
                id: 'Apa bedanya ROI campaign dengan CAC (Customer Acquisition Cost)?',
                en: 'What’s the difference between campaign ROI and CAC (Customer Acquisition Cost)?',
            },
            a: {
                id: 'ROI mengukur seberapa besar keuntungan dibanding biaya campaign, sedangkan CAC mengukur berapa biaya rata-rata untuk mendapatkan satu customer baru. Keduanya saling melengkapi: campaign bisa punya ROI tinggi tapi CAC yang juga tinggi kalau volume closing-nya kecil.',
                en: 'ROI measures how much profit you got relative to campaign cost, while CAC measures the average cost to acquire one new customer. The two complement each other: a campaign can have high ROI but also a high CAC if its closing volume is small.',
            },
        },
        {
            q: {
                id: 'Campaign menghasilkan banyak leads tapi closing rate rendah, apakah campaign itu berarti gagal?',
                en: 'A campaign generates lots of leads but has a low close rate — does that mean it failed?',
            },
            a: {
                id: 'Belum tentu. Cek dulu berapa persen leads dari campaign itu yang benar-benar di-follow up dalam SLA. Kalau follow-up rate-nya rendah, masalahnya ada di proses sales, bukan di campaign-nya sendiri.',
                en: 'Not necessarily. First check what percentage of that campaign’s leads actually got followed up within SLA. If the follow-up rate is low, the problem is in the sales process, not the campaign itself.',
            },
        },
        {
            q: {
                id: 'Apakah laporan ROI campaign perlu memisahkan leads organik dan berbayar?',
                en: 'Should a campaign ROI report separate organic and paid leads?',
            },
            a: {
                id: 'Sebaiknya iya. Menggabungkan keduanya membuat ROI campaign berbayar terlihat lebih baik dari kenyataannya karena "tertolong" oleh leads organik yang biayanya nol.',
                en: 'Yes, ideally. Merging them makes a paid campaign’s ROI look better than it really is, propped up by zero-cost organic leads.',
            },
        },
        {
            q: {
                id: 'Kalau tim masih kecil, metrik mana yang paling penting untuk mulai dilacak?',
                en: 'For a small team just starting out, which metric matters most to track first?',
            },
            a: {
                id: 'Mulai dari dua hal saja: sumber setiap leads (dari campaign mana) dan status follow-up-nya. Dua data ini yang paling sering hilang, dan tanpanya, metrik lain seperti ROI atau CAC tidak bisa dihitung dengan akurat.',
                en: 'Start with just two things: each lead’s source (which campaign) and its follow-up status. Those are the two data points that go missing most often, and without them, other metrics like ROI or CAC can’t be calculated accurately.',
            },
        },
    ],
    relatedSlugs: ['mql-vs-sql', 'cara-menghitung-leads-yang-hilang', 'kesalahan-umum-integrasi-sales-marketing'],
    primaryCtaHref: '/solusi/marketing',
    primaryCtaLabel: {
        id: 'Lihat Solusi untuk Tim Marketing',
        en: 'See the Solution for Marketing Teams',
    },
};

export default article;
