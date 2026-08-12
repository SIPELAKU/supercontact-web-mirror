import { BlogArticle } from './types';

const article: BlogArticle = {
    slug: 'lead-routing-adalah',
    category: {
        id: 'Panduan Lead Management',
        en: 'Lead Management Guide',
    },
    publishedDate: '2026-08-12',
    title: {
        id: 'Apa itu Lead Routing dan Kenapa Bisnis Anda Membutuhkannya',
        en: 'What Is Lead Routing and Why Your Business Needs It',
    },
    description: {
        id: 'Lead routing adalah proses mendistribusikan leads baru ke sales yang tepat secara otomatis. Pelajari cara kerja, manfaat, dan cara menerapkannya di bisnis Anda.',
        en: 'Lead routing is the process of automatically distributing new leads to the right sales rep. Learn how it works, why it matters, and how to set it up for your business.',
    },
    h1: {
        id: 'Lead Routing: Cara Leads Baru Sampai ke Sales yang Tepat, Tanpa Menunggu',
        en: 'Lead Routing: How New Leads Reach the Right Sales Rep Without the Wait',
    },
    intro: {
        id: 'Leads baru masuk lewat WhatsApp, Email, atau form website — lalu apa yang terjadi selanjutnya? Kalau jawabannya "dikirim manual ke grup, lalu siapa cepat dia dapat", Anda sedang mengalami masalah yang disebut lead routing yang buruk. Artikel ini membahas apa itu lead routing, kenapa proses ini sering jadi titik lemah bisnis, dan bagaimana menerapkannya dengan benar.',
        en: 'A new lead comes in through WhatsApp, Email, or a website form — so what happens next? If the answer is "someone posts it in a group chat and whoever grabs it first gets it," you have a lead routing problem. This article covers what lead routing actually is, why it quietly breaks down in most businesses, and how to set it up properly.',
    },
    body: [
        {
            type: 'h2',
            text: { id: 'Apa itu Lead Routing?', en: 'What Is Lead Routing?' },
        },
        {
            type: 'p',
            text: {
                id: 'Lead routing adalah proses menentukan dan mendistribusikan leads baru ke sales atau telesales yang tepat, berdasarkan aturan tertentu — bukan berdasarkan siapa yang paling dulu melihat pesan masuk. Aturan ini bisa berbasis sumber leads (misalnya leads dari Instagram ditangani tim A, leads dari Google Ads ditangani tim B), giliran kerja (siapa yang sedang bertugas), beban kerja (siapa yang leads-nya paling sedikit), atau kombinasi ketiganya.',
                en: 'Lead routing is the process of deciding which sales or telesales rep a new lead should go to, based on a defined set of rules — not based on who happens to see the incoming message first. Rules can be based on lead source (Instagram leads go to Team A, Google Ads leads go to Team B), duty shift (whoever is currently on duty), workload (whoever has the fewest open leads right now), or a mix of all three.',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Tanpa lead routing, distribusi leads biasanya terjadi secara manual: admin atau manager membaca satu per satu chat masuk, lalu meneruskannya ke sales lewat WhatsApp pribadi atau grup kerja. Proses ini lambat, tidak konsisten, dan rawan human error — apalagi saat volume leads mulai naik.',
                en: 'Without lead routing, distribution usually happens manually: an admin or manager reads each incoming message and forwards it to a sales rep over personal WhatsApp or a team group chat. That process is slow, inconsistent, and prone to human error — especially once lead volume starts climbing.',
            },
        },
        {
            type: 'h2',
            text: { id: 'Kenapa Lead Routing yang Buruk Membuat Anda Rugi', en: 'Why Bad Lead Routing Costs You Money' },
        },
        {
            type: 'p',
            text: {
                id: 'Ini adalah salah satu titik paling umum di mana leads hilang di antara tim marketing dan sales: marketing berhasil menghasilkan leads, tapi leads itu tidak pernah sampai ke tangan sales yang tepat pada waktu yang tepat. Tanpa aturan routing yang jelas, tiga hal ini biasanya terjadi.',
                en: 'This is one of the most common points where leads slip through the cracks between marketing and sales: marketing successfully generates the lead, but it never reaches the right sales rep at the right time. Without clear routing rules, three things typically happen.',
            },
        },
        {
            type: 'list',
            items: {
                id: [
                    'Leads dihubungi dua kali oleh dua sales berbeda karena tidak jelas siapa yang bertanggung jawab — prospek merasa tidak profesional dan bisa langsung kabur.',
                    'Leads tidak dihubungi sama sekali karena setiap orang mengira sudah ada yang menangani ("kirain kamu yang follow up").',
                    'Leads bagus (misalnya dari campaign mahal) diperlakukan sama seperti leads asal-asalan, karena tidak ada prioritas berdasarkan sumber atau kualitas.',
                    'Waktu respons jadi lambat karena leads menunggu ada orang yang membaca dan meneruskannya secara manual, bukan langsung sampai ke sales yang aktif.',
                ],
                en: [
                    'A lead gets contacted twice by two different reps because nobody is clearly accountable — the prospect notices, and it looks unprofessional.',
                    'A lead never gets contacted at all because everyone assumed someone else already handled it.',
                    'High-value leads (from an expensive campaign, say) get treated the same as low-quality ones, because there is no prioritization by source or quality.',
                    'Response time drags because a lead sits until someone manually reads and forwards it, instead of landing directly with an available rep.',
                ],
            },
        },
        {
            type: 'callout',
            text: {
                id: 'Contoh ilustrasi: bisnis yang menerima 150 leads per bulan, dengan 25% di antaranya terlambat direspons lebih dari 24 jam karena menunggu proses forward manual. Jika separuh dari leads yang terlambat itu akhirnya tidak jadi closing (karena prospek sudah beralih ke kompetitor yang merespons lebih cepat), dan rata-rata nilai transaksi Rp1.500.000 dengan close rate 20%, potensi revenue yang hilang sekitar Rp2.812.500 per bulan. Ganti angka ini dengan data bisnis Anda sendiri untuk mendapat estimasi yang relevan.',
                en: 'Illustrative example: a business receiving 150 leads a month, where 25% get a response more than 24 hours late because they are waiting on a manual forward. If half of those late leads end up lost (the prospect moved on to a faster-responding competitor), with an average deal size of Rp1,500,000 and a 20% close rate, the potential lost revenue is roughly Rp2,812,500 a month. Swap in your own numbers to get an estimate relevant to your business.',
            },
        },
        {
            type: 'h2',
            text: { id: 'Metode Lead Routing yang Umum Dipakai', en: 'Common Lead Routing Methods' },
        },
        {
            type: 'p',
            text: {
                id: 'Tidak ada satu metode routing yang cocok untuk semua bisnis. Berikut beberapa pendekatan yang paling sering dipakai, dan bisa dikombinasikan sesuai kebutuhan tim Anda.',
                en: 'There is no single routing method that fits every business. Here are the approaches used most often — and they can be combined to fit how your team actually works.',
            },
        },
        {
            type: 'list',
            items: {
                id: [
                    'Berdasarkan sumber leads (source-based) — leads dari WhatsApp, Email, atau form tertentu otomatis masuk ke tim atau kanal yang sudah ditentukan.',
                    'Berdasarkan giliran kerja (shift-based) — leads yang masuk di luar jam kerja tim A otomatis dialihkan ke tim B yang sedang bertugas.',
                    'Bergiliran merata (round robin) — leads baru dibagi rata satu per satu ke setiap sales, supaya beban kerja seimbang.',
                    'Berdasarkan ketersediaan (availability-based) — leads diarahkan ke sales yang statusnya sedang online/aktif, bukan yang sedang cuti atau offline.',
                    'Berdasarkan wilayah atau segmen (territory/segment-based) — leads dari kota atau jenis produk tertentu otomatis ditangani sales yang memang menguasai area itu.',
                ],
                en: [
                    'Source-based — leads from a specific WhatsApp number, email address, or form automatically go to a predetermined team or channel.',
                    'Shift-based — leads arriving outside Team A\'s working hours automatically route to Team B, whoever is currently on duty.',
                    'Round robin — new leads are distributed evenly one by one across the sales team so workload stays balanced.',
                    'Availability-based — leads go to a rep whose status is currently online/active, not someone on leave or offline.',
                    'Territory or segment-based — leads from a particular city or product line automatically go to the rep who owns that area or specialty.',
                ],
            },
        },
        {
            type: 'h2',
            text: { id: 'Cara Menerapkan Lead Routing di Bisnis Anda', en: 'How to Set Up Lead Routing for Your Business' },
        },
        {
            type: 'p',
            text: {
                id: 'Anda tidak perlu langsung memakai sistem otomatis untuk mulai memperbaiki proses ini. Mulailah dengan memperjelas aturannya terlebih dahulu, baru pikirkan alatnya.',
                en: 'You do not need automation software to start fixing this. Get the rules clear first, then think about tooling.',
            },
        },
        {
            type: 'list',
            items: {
                id: [
                    'Petakan semua sumber leads yang Anda punya (WhatsApp, Email, Instagram, form website) dan siapa yang saat ini menangani masing-masing.',
                    'Tentukan satu aturan routing yang jelas — misalnya round robin per sales, atau berdasarkan giliran kerja — dan tuliskan aturan itu supaya semua orang paham.',
                    'Tetapkan SLA follow-up, misalnya leads baru harus dihubungi dalam 15 menit sampai 1 jam, tergantung channel-nya.',
                    'Pastikan ada notifikasi otomatis (bukan sekadar chat grup) saat leads baru masuk dan ditugaskan ke seseorang.',
                    'Review rutin: leads mana yang terlambat direspons, dan apakah aturan routing perlu disesuaikan seiring tim atau volume leads bertambah.',
                ],
                en: [
                    'Map every lead source you have (WhatsApp, Email, Instagram, website forms) and who currently handles each one.',
                    'Pick one clear routing rule — round robin, shift-based, whatever fits — and write it down so everyone actually knows it.',
                    'Set a follow-up SLA, e.g. new leads must be contacted within 15 minutes to 1 hour, depending on the channel.',
                    'Make sure there is an automatic notification (not just a group chat) when a new lead comes in and gets assigned.',
                    'Review regularly: which leads got a late response, and does the routing rule need adjusting as your team or lead volume grows.',
                ],
            },
        },
        {
            type: 'p',
            text: {
                id: 'Aturan di atas bisa dijalankan manual untuk volume leads yang masih kecil. Tapi begitu leads masuk dari banyak channel sekaligus dengan volume yang naik, proses manual jadi sulit dipertahankan konsisten — di sinilah routing otomatis mulai jadi kebutuhan, bukan sekadar kenyamanan.',
                en: 'These rules can be run manually while lead volume is still small. But once leads start arriving from multiple channels at higher volume, staying consistent manually gets hard — that is the point where automatic routing stops being a nice-to-have and becomes a necessity.',
            },
        },
        {
            type: 'h2',
            text: { id: 'Lead Routing Otomatis di SmartSales', en: 'Automatic Lead Routing in SmartSales' },
        },
        {
            type: 'p',
            text: {
                id: 'Di SmartSales, leads yang masuk lewat WhatsApp Business API, Email, atau Web Form otomatis dibuatkan profil leads dan didistribusikan (Auto-Routing) ke sales atau telesales yang sedang bertugas — tanpa menunggu proses kirim manual dari marketing. Tim juga menerima alert otomatis jika sebuah leads belum dihubungi dalam waktu tertentu, sehingga tidak ada lagi leads yang diam terlalu lama karena "kirain sudah ada yang follow up". Semua ini berjalan di atas satu CRM yang sama dengan pipeline visual, jadi marketing dan sales melihat status leads yang persis sama.',
                en: 'In SmartSales, leads coming in through the WhatsApp Business API, Email, or a Web Form automatically get a lead profile and are distributed (Auto-Routing) to whichever sales or telesales rep is currently on duty — without waiting for marketing to forward anything manually. The team also gets an automatic alert if a lead has gone uncontacted past a set time window, so nothing sits idle just because everyone assumed someone else had it. All of this runs on one CRM with a shared visual pipeline, so marketing and sales are always looking at the exact same lead status.',
            },
        },
    ],
    faq: [
        {
            q: { id: 'Apa bedanya lead routing dan lead scoring?', en: 'What is the difference between lead routing and lead scoring?' },
            a: {
                id: 'Lead scoring menilai seberapa berkualitas sebuah leads (misalnya berdasarkan aktivitas atau data profil), sedangkan lead routing menentukan leads itu harus dikirim ke siapa. Keduanya saling melengkapi — leads dengan skor tinggi bisa diarahkan ke sales senior lewat aturan routing yang sesuai.',
                en: 'Lead scoring rates how qualified a lead is (based on activity or profile data), while lead routing decides who that lead should go to. The two work together — a high-scoring lead can be routed to a senior rep through the right routing rule.',
            },
        },
        {
            q: { id: 'Bisnis kecil dengan sedikit leads, perlu lead routing otomatis?', en: 'Does a small business with few leads need automatic lead routing?' },
            a: {
                id: 'Belum tentu. Jika leads Anda masih sedikit dan bisa ditangani satu atau dua orang tanpa masalah, aturan manual yang jelas biasanya sudah cukup. Otomasi baru terasa perlu saat volume leads atau jumlah channel mulai membuat proses manual sulit konsisten.',
                en: 'Not necessarily. If your lead volume is small enough for one or two people to handle without issues, a clear manual rule is usually enough. Automation starts to matter once volume or the number of channels makes manual handling hard to keep consistent.',
            },
        },
        {
            q: { id: 'Apa risiko kalau lead routing tidak diterapkan?', en: 'What is the risk of not having lead routing in place?' },
            a: {
                id: 'Risiko utamanya adalah leads yang telat direspons atau tidak direspons sama sekali, leads yang dihubungi ganda oleh dua sales berbeda, dan tidak adanya data yang jelas soal siapa bertanggung jawab atas leads mana — yang semuanya berujung pada prospek hilang dan revenue yang tidak tercapai.',
                en: 'The main risks are leads that get a late response or none at all, leads contacted twice by two different reps, and no clear record of who owns which lead — all of which lead to lost prospects and revenue left on the table.',
            },
        },
        {
            q: { id: 'Apakah lead routing hanya untuk leads dari iklan berbayar?', en: 'Is lead routing only for leads from paid ads?' },
            a: {
                id: 'Tidak. Lead routing berlaku untuk semua sumber leads — WhatsApp organik, Instagram, referral, walk-in yang dicatat lewat form, sampai leads dari campaign berbayar. Semua leads butuh aturan yang jelas soal siapa yang menanganinya.',
                en: 'No. Lead routing applies to every lead source — organic WhatsApp, Instagram, referrals, walk-ins logged through a form, all the way to paid campaign leads. Every lead needs a clear rule for who owns it.',
            },
        },
        {
            q: { id: 'Bagaimana cara tahu aturan routing yang saya pakai sudah efektif?', en: 'How do I know if my routing rule is actually working?' },
            a: {
                id: 'Ukur dua hal: rata-rata waktu respons pertama ke leads baru, dan berapa persen leads yang terlewat (tidak dihubungi dalam SLA). Jika kedua angka ini membaik dari waktu ke waktu, aturan routing Anda berjalan efektif.',
                en: 'Track two numbers: average first-response time to new leads, and the percentage of leads that miss your SLA. If both improve over time, your routing rule is working.',
            },
        },
    ],
    relatedSlugs: ['sla-follow-up-leads', 'mql-vs-sql', 'kesalahan-umum-integrasi-sales-marketing'],
    primaryCtaHref: '/solusi/integrasi-sales-marketing',
    primaryCtaLabel: {
        id: 'Lihat Solusi Integrasi Sales & Marketing',
        en: 'See the Sales & Marketing Integration Solution',
    },
};

export default article;
