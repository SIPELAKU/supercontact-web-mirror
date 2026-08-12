import { BlogArticle } from './types';

const article: BlogArticle = {
    slug: 'mql-vs-sql',
    category: {
        id: 'Panduan Lead Management',
        en: 'Lead Management Guide',
    },
    publishedDate: '2026-07-16',
    author: { id: 'Tim SmartSales', en: 'SmartSales Team' },
    title: {
        id: 'MQL vs SQL: Cara Membedakan dan Kenapa Sering Jadi Konflik',
        en: 'MQL vs SQL: How to Tell Them Apart (and Why They Clash)',
    },
    description: {
        id: 'MQL vs SQL sering jadi sumber debat marketing dan sales. Pahami perbedaannya, cara menentukan kriteria bersama, dan kenapa leads sering hilang di antara keduanya.',
        en: 'MQL vs SQL is a common source of marketing-sales friction. Learn the real difference, how to set shared criteria, and why leads slip through the gap between them.',
    },
    h1: {
        id: 'MQL vs SQL: Kenapa Marketing dan Sales Sering Berdebat Soal Ini',
        en: 'MQL vs SQL: Why Marketing and Sales Keep Arguing About This',
    },
    intro: {
        id: 'Marketing bilang sudah kirim ratusan leads berkualitas. Sales bilang sebagian besar tidak layak dihubungi. Perdebatan ini hampir selalu berakar dari satu masalah: kedua tim tidak pernah sepakat soal definisi MQL dan SQL. Artikel ini membahas perbedaan keduanya secara praktis, dan cara menyusun kriteria yang bisa dipakai bersama — bukan sekadar teori.',
        en: 'Marketing says they sent over hundreds of quality leads. Sales says most of them weren\'t worth calling. This argument almost always comes down to one root problem: the two teams never agreed on what MQL and SQL actually mean. This article covers the practical difference between them, and how to build criteria both teams can actually use — not just theory.',
    },
    body: [
        {
            type: 'h2',
            text: { id: 'Apa Itu MQL dan SQL?', en: 'What Are MQL and SQL, Exactly?' },
        },
        {
            type: 'p',
            text: {
                id: 'MQL (Marketing Qualified Lead) adalah kontak yang menunjukkan minat berdasarkan aktivitas — mengisi form, membalas broadcast WhatsApp, mengunduh brosur, atau mengikuti webinar. Minat ini nyata, tapi belum tentu siap dibeli. SQL (Sales Qualified Lead) adalah kontak yang sudah divalidasi punya kebutuhan, budget, dan wewenang untuk membeli — biasanya setelah sales melakukan kualifikasi lewat percakapan langsung.',
                en: 'An MQL (Marketing Qualified Lead) is a contact who has shown interest through some action — filling out a form, replying to a WhatsApp broadcast, downloading a brochure, or joining a webinar. That interest is real, but not necessarily ready to buy. An SQL (Sales Qualified Lead) is a contact who has been validated as having a real need, budget, and authority to buy — usually after sales qualifies them through a direct conversation.',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Perbedaan intinya sederhana: MQL diukur dari perilaku ("orang ini tertarik"), SQL diukur dari kesiapan transaksi ("orang ini layak dikejar sekarang"). Masalahnya, garis batas antara keduanya sering tidak jelas — dan di situlah konflik dimulai.',
                en: 'The core difference is simple: an MQL is measured by behavior ("this person is interested"), while an SQL is measured by transaction-readiness ("this person is worth pursuing right now"). The problem is that the line between the two is often blurry — and that\'s exactly where the conflict starts.',
            },
        },
        {
            type: 'h2',
            text: { id: 'Kenapa MQL vs SQL Selalu Jadi Sumber Konflik', en: 'Why MQL vs SQL Always Ends Up a Fight' },
        },
        {
            type: 'list',
            items: {
                id: [
                    'Tidak ada definisi tertulis — marketing menganggap "sudah mengisi form" cukup untuk disebut qualified, sales menganggap itu baru sekadar tertarik.',
                    'Tidak ada skor atau kriteria terukur — kualifikasi dilakukan berdasarkan feeling masing-masing tim, bukan aturan yang disepakati.',
                    'Tidak ada feedback loop — sales tahu leads mana yang buruk kualitasnya, tapi marketing tidak pernah diberi tahu sehingga pola yang sama terus berulang.',
                    'Serah terima manual lewat Excel atau chat pribadi — informasi konteks (kenapa leads ini dianggap qualified) hilang di tengah jalan.',
                    'Tidak ada SLA follow-up — leads yang sudah capek ditunggu sales akhirnya dingin sebelum sempat dihubungi.',
                ],
                en: [
                    'No written definition — marketing considers "filled out a form" enough to call qualified, while sales sees that as barely interested.',
                    'No measurable score or criteria — qualification runs on each team\'s gut feeling instead of an agreed rule.',
                    'No feedback loop — sales knows which leads were low quality, but marketing is never told, so the same pattern keeps repeating.',
                    'Manual handoff via Excel or personal chat — the context of why a lead was marked qualified gets lost along the way.',
                    'No follow-up SLA — leads that sit waiting for a sales rep go cold before anyone reaches out.',
                ],
            },
        },
        {
            type: 'p',
            text: {
                id: 'Pola ini persis dengan apa yang biasanya terjadi ketika data sales dan marketing tidak terintegrasi: leads hilang di antara dua tim, bukan karena produk buruk, tapi karena tidak ada sistem yang menjembatani serah terima keduanya.',
                en: 'This pattern mirrors what usually happens when sales and marketing data aren\'t integrated: leads get lost between the two teams, not because the product is bad, but because there\'s no system bridging the handoff between them.',
            },
        },
        {
            type: 'h2',
            text: { id: 'Cara Menyusun Kriteria MQL yang Jelas', en: 'How to Build Clear MQL Criteria' },
        },
        {
            type: 'p',
            text: {
                id: 'MQL yang baik bukan sekadar "orang yang membalas chat". Tentukan kombinasi sinyal yang benar-benar relevan dengan bisnis Anda, misalnya:',
                en: 'A good MQL isn\'t just "someone who replied to a chat." Define a combination of signals that actually matter for your business, for example:',
            },
        },
        {
            type: 'list',
            items: {
                id: [
                    'Sumber kontak — leads dari iklan berbayar biasanya punya niat berbeda dari leads organik.',
                    'Jenis interaksi — mengisi form harga jauh lebih kuat sinyalnya dibanding sekadar like konten.',
                    'Kecocokan profil — apakah industri, lokasi, atau ukuran bisnisnya memang sesuai target pasar Anda.',
                    'Kecepatan respons — leads yang membalas dalam hitungan menit biasanya lebih hangat dibanding yang membalas seminggu kemudian.',
                ],
                en: [
                    'Contact source — leads from paid ads usually carry different intent than organic leads.',
                    'Interaction type — filling out a pricing form is a much stronger signal than simply liking a post.',
                    'Profile fit — whether the industry, location, or business size actually matches your target market.',
                    'Response speed — leads who reply within minutes are usually warmer than ones who reply a week later.',
                ],
            },
        },
        {
            type: 'h2',
            text: { id: 'Kapan MQL Boleh Naik Jadi SQL', en: 'When an MQL Is Ready to Become an SQL' },
        },
        {
            type: 'p',
            text: {
                id: 'MQL naik menjadi SQL bukan otomatis karena waktu berjalan, tapi karena sales sudah memvalidasi tiga hal: ada kebutuhan nyata, ada anggaran atau kemampuan bayar, dan ada wewenang untuk memutuskan (atau setidaknya akses ke pengambil keputusan). Kerangka klasik seperti BANT (Budget, Authority, Need, Timeline) masih relevan sebagai checklist, asal disesuaikan dengan siklus penjualan Anda sendiri — jangan dipakai kaku sebagai skrip.',
                en: 'An MQL doesn\'t become an SQL just because time has passed — it happens once sales has validated three things: there\'s a real need, there\'s budget or ability to pay, and there\'s authority to decide (or at least access to the decision-maker). Classic frameworks like BANT (Budget, Authority, Need, Timeline) are still useful as a checklist, as long as you adapt them to your own sales cycle instead of following them like a rigid script.',
            },
        },
        {
            type: 'callout',
            text: {
                id: 'Contoh ilustrasi sederhana: dari 200 leads bulanan, katakanlah 40% memenuhi kriteria MQL (80 leads). Dari 80 MQL itu, sales memvalidasi 25% layak dikejar sebagai SQL (20 leads). Kalau tidak ada SLA follow-up dan 30% dari SQL ini tidak sempat dihubungi karena tercecer di chat pribadi, itu berarti 6 leads yang sebenarnya sudah siap beli hilang begitu saja setiap bulan. Ganti angka ini dengan data bisnis Anda sendiri untuk melihat skala masalahnya.',
                en: 'A simple illustrative example: out of 200 monthly leads, say 40% meet the MQL criteria (80 leads). Of those 80 MQLs, sales validates 25% as worth pursuing as SQLs (20 leads). If there\'s no follow-up SLA and 30% of those SQLs never get contacted because they\'re buried in a personal chat, that\'s 6 leads who were genuinely ready to buy, lost every single month. Replace these numbers with your own business data to see the real scale of the problem.',
            },
        },
        {
            type: 'h2',
            text: { id: 'Cara Menghindari Konflik MQL vs SQL', en: 'How to Avoid the MQL vs SQL Fight Altogether' },
        },
        {
            type: 'p',
            text: {
                id: 'Sebagian besar konflik MQL vs SQL selesai bukan dengan aturan baru, tapi dengan sistem yang membuat kriteria dan status leads terlihat oleh kedua tim secara real-time. Langkah praktisnya:',
                en: 'Most MQL vs SQL conflicts get resolved not with a new rule, but with a system that makes lead criteria and status visible to both teams in real time. In practice, that means:',
            },
        },
        {
            type: 'list',
            items: {
                id: [
                    'Tulis definisi MQL dan SQL dalam satu dokumen yang disepakati kedua tim — bukan asumsi masing-masing.',
                    'Catat sumber dan aktivitas setiap leads secara otomatis, supaya kualifikasi tidak bergantung pada ingatan atau catatan manual.',
                    'Gunakan satu pipeline visual yang bisa dilihat marketing dan sales bersama, dari leads masuk sampai closing.',
                    'Tetapkan SLA follow-up yang jelas, lengkap dengan reminder otomatis kalau leads belum dihubungi dalam waktu tertentu.',
                    'Tutup feedback loop-nya: laporkan kembali ke marketing leads mana yang benar-benar closing, supaya kriteria MQL terus disempurnakan berdasarkan data, bukan tebakan.',
                ],
                en: [
                    'Write the MQL and SQL definitions into one document both teams agree on — not each side\'s own assumption.',
                    'Log every lead\'s source and activity automatically, so qualification doesn\'t rely on memory or manual notes.',
                    'Use one shared visual pipeline that both marketing and sales can see, from lead intake through closing.',
                    'Set a clear follow-up SLA, with automatic reminders when a lead hasn\'t been contacted within a set window.',
                    'Close the feedback loop: report back to marketing which leads actually closed, so MQL criteria keeps improving based on data instead of guesswork.',
                ],
            },
        },
        {
            type: 'p',
            text: {
                id: 'Ini persis alasan kenapa integrasi data sales dan marketing penting: bukan sekadar menyatukan tools, tapi memastikan definisi leads, status follow-up, dan hasil closing terlihat oleh kedua tim di satu tempat yang sama.',
                en: 'This is exactly why integrating sales and marketing data matters: it\'s not just about merging tools, but making sure lead definitions, follow-up status, and closing outcomes are visible to both teams in one shared place.',
            },
        },
    ],
    faq: [
        {
            q: { id: 'Apa perbedaan utama MQL dan SQL?', en: 'What is the main difference between an MQL and an SQL?' },
            a: {
                id: 'MQL adalah leads yang menunjukkan minat lewat aktivitas (mengisi form, membalas chat, mengunduh materi), sementara SQL adalah leads yang sudah divalidasi sales punya kebutuhan, budget, dan wewenang untuk membeli. MQL soal minat, SQL soal kesiapan transaksi.',
                en: 'An MQL is a lead who has shown interest through activity (filling a form, replying to a chat, downloading content), while an SQL is a lead sales has validated as having need, budget, and authority to buy. MQL is about interest; SQL is about transaction-readiness.',
            },
        },
        {
            q: { id: 'Siapa yang seharusnya menentukan kriteria MQL — marketing atau sales?', en: 'Who should define MQL criteria — marketing or sales?' },
            a: {
                id: 'Idealnya dua-duanya, disepakati bersama dan ditulis dalam satu dokumen. Kalau hanya marketing yang menentukan, sales sering merasa kriterianya terlalu longgar; kalau hanya sales, marketing kehilangan gambaran soal minat awal calon pelanggan.',
                en: 'Ideally both, agreed together and written into a shared document. If only marketing defines it, sales often feels the bar is too low; if only sales defines it, marketing loses visibility into early-stage buyer interest.',
            },
        },
        {
            q: { id: 'Apakah semua MQL akan jadi SQL?', en: 'Does every MQL eventually become an SQL?' },
            a: {
                id: 'Tidak. Wajar kalau sebagian besar MQL tidak lolos jadi SQL — itu bagian normal dari proses kualifikasi. Yang perlu diwaspadai adalah kalau tidak ada data yang menjelaskan kenapa mereka tidak lolos, karena informasi itu penting untuk memperbaiki kriteria MQL ke depan.',
                en: 'No. It\'s normal for most MQLs not to advance into SQLs — that\'s a healthy part of qualification. What matters is having data on why they didn\'t qualify, because that information is what improves your MQL criteria over time.',
            },
        },
        {
            q: { id: 'Berapa lama waktu yang wajar untuk follow-up MQL sebelum jadi dingin?', en: 'How long can an MQL wait before it goes cold?' },
            a: {
                id: 'Tidak ada angka baku karena tergantung industri dan siklus penjualan, tapi prinsipnya: semakin cepat semakin baik, dan yang terpenting adalah punya SLA tertulis yang konsisten dijalankan, bukan dibiarkan tergantung inisiatif masing-masing sales.',
                en: 'There\'s no universal number since it depends on your industry and sales cycle, but the principle holds: sooner is always better, and what matters most is having a written SLA that\'s consistently enforced, rather than leaving it to each rep\'s own initiative.',
            },
        },
        {
            q: { id: 'Apakah tools seperti spreadsheet cukup untuk mengelola MQL dan SQL?', en: 'Is a spreadsheet enough to manage MQL and SQL?' },
            a: {
                id: 'Bisa berjalan untuk volume leads yang masih kecil, dengan satu definisi leads dan SLA follow-up yang disepakati. Tapi saat volume leads bertambah, spreadsheet cenderung sulit dipantau real-time dan rawan duplikasi atau leads yang tercecer.',
                en: 'It can work at low lead volume, as long as you agree on one lead definition and a follow-up SLA. But as volume grows, spreadsheets tend to become hard to track in real time and prone to duplicate or lost leads.',
            },
        },
    ],
    relatedSlugs: ['lead-routing-adalah', 'sla-follow-up-leads', 'template-laporan-roi-campaign'],
    primaryCtaHref: '/solusi/integrasi-sales-marketing',
    primaryCtaLabel: {
        id: 'Lihat Solusi Integrasi Sales & Marketing',
        en: 'See the Sales & Marketing Integration Solution',
    },
};

export default article;
