import { BlogArticle } from './types';

const article: BlogArticle = {
    slug: 'sla-follow-up-leads',
    category: {
        id: 'Panduan Lead Management',
        en: 'Lead Management Guide',
    },
    publishedDate: '2026-07-09',
    author: { id: 'Tim SmartSales', en: 'SmartSales Team' },
    title: {
        id: 'Cara Menentukan SLA Follow Up Leads untuk Tim Sales',
        en: 'How to Set a Lead Follow-Up SLA for Your Sales Team',
    },
    description: {
        id: 'Panduan praktis menentukan SLA follow up leads: berapa lama idealnya, cara menghitungnya, dan cara memastikan SLA benar-benar dijalankan tim sales.',
        en: 'A practical guide to setting a lead follow-up SLA: how fast is fast enough, how to calculate it, and how to make sure your sales team actually follows it.',
    },
    h1: {
        id: 'Berapa Lama Idealnya Leads Di-Follow Up? Begini Cara Menentukan SLA-nya',
        en: 'How Fast Should You Follow Up a Lead? Here’s How to Set the SLA',
    },
    intro: {
        id: 'Banyak tim sales tidak punya batas waktu yang jelas untuk menghubungi leads baru — hasilnya, sebagian leads ditelepon dalam 10 menit, sebagian lagi baru dihubungi tiga hari kemudian, atau tidak sama sekali. Artikel ini membahas cara menentukan SLA follow up leads yang realistis untuk tim Anda, lengkap dengan cara menghitung dan memastikan SLA itu benar-benar dijalankan, bukan sekadar aturan di atas kertas.',
        en: 'Most sales teams have no clear deadline for contacting a new lead — some get called within 10 minutes, others three days later, and some never get called at all. This article covers how to set a realistic lead follow-up SLA for your team, including how to calculate it and how to make sure it actually gets followed instead of staying a rule on paper.',
    },
    body: [
        {
            type: 'h2',
            text: { id: 'Apa Itu SLA Follow Up Leads?', en: 'What Is a Lead Follow-Up SLA?' },
        },
        {
            type: 'p',
            text: {
                id: 'SLA (Service Level Agreement) follow up leads adalah batas waktu maksimal yang disepakati tim sales untuk menghubungi leads baru sejak leads tersebut masuk — misalnya "setiap leads baru harus dihubungi dalam 15 menit pada jam kerja". SLA ini bukan target yang bagus untuk dicapai sesekali, tapi standar minimum yang harus dipenuhi setiap saat.',
                en: 'A lead follow-up SLA (Service Level Agreement) is the agreed maximum time a sales team has to contact a new lead after it comes in — for example, "every new lead must be contacted within 15 minutes during working hours." It is not an aspirational target hit occasionally, but a minimum standard that should hold every time.',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Tanpa SLA yang jelas, follow up bergantung pada inisiatif masing-masing sales. Sebagian rep responsif, sebagian lain menunda karena sibuk atau lupa. Leads yang masuk lewat WhatsApp, email, atau form website akhirnya menumpuk di HP pribadi atau spreadsheet tanpa ada yang benar-benar tahu siapa yang sudah — dan belum — dihubungi.',
                en: 'Without a clear SLA, follow-up depends entirely on each rep\'s own initiative. Some are responsive, others delay because they\'re busy or simply forget. Leads coming in through WhatsApp, email, or a website form end up piling up on a personal phone or in a spreadsheet, with no one really sure who has — and hasn\'t — been contacted.',
            },
        },
        {
            type: 'h2',
            text: { id: 'Kenapa Kecepatan Follow Up Itu Penting', en: 'Why Follow-Up Speed Matters' },
        },
        {
            type: 'p',
            text: {
                id: 'Prospek yang baru saja mengisi form atau membalas iklan sedang berada di puncak minatnya. Semakin lama dibiarkan, semakin besar kemungkinan mereka sudah menghubungi kompetitor, kehilangan minat, atau lupa kenapa mereka tadi tertarik. Kecepatan follow up bukan sekadar soal sopan santun — ini langsung memengaruhi berapa banyak leads yang benar-benar berubah jadi pelanggan.',
                en: 'A prospect who just filled out a form or replied to an ad is at their peak interest. The longer they\'re left waiting, the more likely they\'ve already contacted a competitor, lost interest, or forgotten why they reached out in the first place. Follow-up speed isn\'t just a matter of courtesy — it directly affects how many leads actually convert into customers.',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Masalah ini sering muncul justru di titik pertemuan antara tim marketing dan sales: marketing berhasil menghasilkan leads lewat campaign, tapi begitu leads itu diserahkan ke sales secara manual — lewat Excel atau chat pribadi — tidak ada SLA, tidak ada notifikasi, dan tidak ada cara memastikan leads itu benar-benar sampai ke tangan yang tepat tepat waktu.',
                en: 'This problem often shows up right at the handoff between marketing and sales: marketing successfully generates leads through a campaign, but once those leads are passed to sales manually — via Excel or a personal chat — there\'s no SLA, no notification, and no way to confirm the lead actually reached the right person on time.',
            },
        },
        {
            type: 'h2',
            text: { id: 'Berapa Lama SLA yang Ideal?', en: 'How Fast Should Your SLA Be?' },
        },
        {
            type: 'p',
            text: {
                id: 'Tidak ada satu angka SLA yang cocok untuk semua bisnis — idealnya disesuaikan dengan channel, jam kerja tim, dan seberapa "panas" leads tersebut. Sebagai titik awal, berikut kerangka umum yang bisa disesuaikan:',
                en: 'There\'s no single SLA number that fits every business — it should be adjusted to the channel, your team\'s working hours, and how "hot" the lead is. As a starting point, here\'s a general framework you can adapt:',
            },
        },
        {
            type: 'list',
            items: {
                id: [
                    'Leads dari chat WhatsApp aktif (prospek sedang online): idealnya dibalas dalam hitungan menit — semakin cepat, semakin tinggi peluang konversi.',
                    'Leads dari form website atau iklan (inbound, minat tinggi): target realistis 15–30 menit pada jam kerja.',
                    'Leads dari daftar kontak lama atau re-engagement (dingin, minat belum jelas): 1x24 jam biasanya masih wajar.',
                    'Leads di luar jam kerja: tentukan aturan terpisah, misalnya wajib dihubungi dalam 30 menit pertama sejak jam kerja berikutnya dimulai.',
                ],
                en: [
                    'Active WhatsApp chat leads (prospect currently online): ideally answered within minutes — the faster, the higher the conversion chance.',
                    'Website form or ad leads (inbound, high intent): a realistic target is 15–30 minutes during working hours.',
                    'Old contact list or re-engagement leads (cold, unclear intent): within 24 hours is usually still reasonable.',
                    'Leads arriving outside working hours: set a separate rule, e.g. must be contacted within the first 30 minutes of the next working period.',
                ],
            },
        },
        {
            type: 'p',
            text: {
                id: 'Yang penting bukan meniru angka SLA bisnis lain, tapi menetapkan angka yang realistis untuk kapasitas tim Anda saat ini, lalu dipersempit bertahap seiring proses semakin rapi.',
                en: 'What matters isn\'t copying another business\'s SLA number, but setting a figure that\'s realistic for your team\'s current capacity, then tightening it gradually as your process gets cleaner.',
            },
        },
        {
            type: 'h2',
            text: { id: 'Cara Menentukan SLA untuk Tim Anda', en: 'How to Set the SLA for Your Team' },
        },
        {
            type: 'list',
            items: {
                id: [
                    'Petakan semua sumber leads yang masuk saat ini — WhatsApp, email, Instagram, form website — dan siapa yang bertanggung jawab menangani masing-masing.',
                    'Ukur kecepatan follow up Anda sekarang sebagai baseline, sebelum menentukan target baru yang realistis.',
                    'Sepakati satu angka SLA per channel bersama tim sales, bukan ditetapkan sepihak dari atas — supaya SLA benar-benar bisa dijalankan, bukan hanya aturan di dokumen.',
                    'Tentukan siapa yang bertanggung jawab jika SLA terlewat, dan apa langkah eskalasinya (misalnya diteruskan ke rep lain yang sedang aktif).',
                    'Pantau kepatuhan SLA secara berkala — bukan cuma ditetapkan sekali lalu dilupakan.',
                ],
                en: [
                    'Map every lead source you currently receive — WhatsApp, email, Instagram, website forms — and who is responsible for handling each one.',
                    'Measure your current follow-up speed as a baseline before setting a new, realistic target.',
                    'Agree on one SLA number per channel together with the sales team, not dictated from the top — so the SLA is actually workable, not just a rule in a document.',
                    'Decide who is accountable when the SLA is missed, and what the escalation step looks like (e.g. reassigned to whichever rep is currently active).',
                    'Review SLA compliance regularly — don\'t just set it once and forget about it.',
                ],
            },
        },
        {
            type: 'callout',
            text: {
                id: 'Contoh ilustrasi: jika tim Anda menerima 250 leads/bulan dan 35% di antaranya tidak pernah di-follow up sesuai SLA, dengan rata-rata nilai deal Rp2.500.000 dan close rate 18%, potensi pendapatan yang hilang bisa mencapai sekitar Rp39.375.000 per bulan (250 × 35% × Rp2.500.000 × 18%). Angka ini hanya ilustrasi — ganti dengan data bisnis Anda sendiri untuk melihat dampak nyatanya.',
                en: 'Illustrative example: if your team receives 250 leads/month and 35% of them never get followed up within SLA, with an average deal size of Rp2,500,000 and an 18% close rate, the potential lost revenue could reach roughly Rp39,375,000 per month (250 × 35% × Rp2,500,000 × 18%). This figure is only an illustration — replace it with your own business data to see the real impact.',
            },
        },
        {
            type: 'h2',
            text: { id: 'Kenapa SLA Sering Gagal Dijalankan (dan Cara Mengatasinya)', en: 'Why SLAs Often Fail in Practice (and How to Fix It)' },
        },
        {
            type: 'p',
            text: {
                id: 'SLA yang ditulis di SOP tapi tidak didukung sistem biasanya tidak bertahan lama. Masalah paling umum: leads baru tidak langsung terlihat oleh sales yang sedang bertugas, tidak ada notifikasi otomatis saat SLA hampir terlewat, dan tidak ada catatan siapa yang seharusnya menghubungi leads mana. Akibatnya, kepatuhan terhadap SLA bergantung penuh pada kedisiplinan manual — yang sulit konsisten begitu volume leads mulai naik.',
                en: 'An SLA that only lives in an SOP document, without system support, usually doesn\'t last. The most common issues: new leads aren\'t immediately visible to whichever rep is on duty, there\'s no automatic notification when an SLA is about to be missed, and there\'s no record of who was supposed to contact which lead. As a result, SLA compliance depends entirely on manual discipline — which gets hard to sustain once lead volume grows.',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Di sinilah routing otomatis dan pengingat follow up berperan: begitu leads baru masuk dari channel manapun, sistem langsung mendistribusikannya ke sales yang sedang bertugas dan memicu pengingat jika belum dihubungi dalam waktu yang ditentukan — tanpa menunggu proses serah terima manual dari marketing ke sales.',
                en: 'This is where automatic routing and follow-up reminders come in: as soon as a new lead arrives from any channel, the system immediately distributes it to whichever rep is on duty and triggers a reminder if it hasn\'t been contacted within the set window — without waiting for a manual handoff from marketing to sales.',
            },
        },
    ],
    faq: [
        {
            q: { id: 'Apa bedanya SLA follow up leads dengan target penjualan biasa?', en: 'What\'s the difference between a lead follow-up SLA and a regular sales target?' },
            a: {
                id: 'Target penjualan mengukur hasil akhir (misalnya jumlah closing per bulan), sedangkan SLA follow up mengukur kecepatan proses — seberapa cepat leads pertama kali dihubungi. Keduanya saling berhubungan: follow up yang lambat biasanya menurunkan angka closing di akhir.',
                en: 'A sales target measures the end result (e.g. closings per month), while a follow-up SLA measures process speed — how fast a lead is first contacted. The two are connected: slow follow-up usually drags down the closing numbers at the end.',
            },
        },
        {
            q: { id: 'Apakah SLA harus sama untuk semua channel leads?', en: 'Should the SLA be the same across all lead channels?' },
            a: {
                id: 'Tidak harus. Leads dari WhatsApp yang sedang aktif chat biasanya butuh respon jauh lebih cepat dibanding leads dari daftar kontak lama. Menetapkan SLA per channel lebih realistis daripada satu angka yang sama untuk semua sumber.',
                en: 'No, it doesn\'t have to be. A lead from an active WhatsApp chat usually needs a much faster response than a lead from an old contact list. Setting SLAs per channel is more realistic than using one number for every source.',
            },
        },
        {
            q: { id: 'Bagaimana cara tahu SLA kami sering dilanggar atau tidak?', en: 'How do we know if our SLA is often being missed?' },
            a: {
                id: 'Cara paling sederhana adalah mencatat waktu leads masuk dan waktu leads pertama kali dihubungi, lalu membandingkan selisihnya dengan SLA yang disepakati. Jika prosesnya masih manual, ini sering baru ketahuan setelah leads sudah dingin — sistem yang mencatat waktu secara otomatis membantu mendeteksinya lebih awal.',
                en: 'The simplest way is to log the time a lead comes in and the time it\'s first contacted, then compare the gap against your agreed SLA. If the process is still manual, this often only becomes visible after the lead has already gone cold — a system that timestamps this automatically helps catch it earlier.',
            },
        },
        {
            q: { id: 'Apakah SLA yang terlalu ketat bisa jadi masalah?', en: 'Can an SLA that\'s too strict backfire?' },
            a: {
                id: 'Bisa. SLA yang tidak realistis terhadap kapasitas tim akan sering dilanggar, membuat SLA itu sendiri kehilangan kredibilitas. Lebih baik mulai dari angka yang bisa dicapai secara konsisten, lalu dipersempit bertahap sambil memperbaiki proses.',
                en: 'Yes. An SLA that\'s unrealistic for your team\'s capacity will be missed often, which erodes the SLA\'s own credibility. It\'s better to start with a number your team can hit consistently, then tighten it gradually as the process improves.',
            },
        },
        {
            q: { id: 'Perlukah SLA follow up dituliskan secara resmi?', en: 'Does the follow-up SLA need to be written down formally?' },
            a: {
                id: 'Sangat disarankan. SLA yang hanya disepakati lisan mudah ditafsirkan berbeda-beda oleh masing-masing sales. Menuliskannya secara jelas — beserta siapa yang bertanggung jawab dan langkah eskalasinya — membuat SLA lebih mudah dijaga konsistensinya.',
                en: 'It\'s strongly recommended. An SLA that\'s only agreed verbally tends to get interpreted differently by each rep. Writing it down clearly — along with who\'s accountable and what the escalation step is — makes it much easier to keep consistent.',
            },
        },
    ],
    relatedSlugs: ['lead-routing-adalah', 'checklist-audit-kebocoran-leads', 'mql-vs-sql'],
    primaryCtaHref: '/produk/crm-sales',
    primaryCtaLabel: {
        id: 'Lihat Fitur CRM Sales',
        en: 'See CRM Sales Features',
    },
};

export default article;
