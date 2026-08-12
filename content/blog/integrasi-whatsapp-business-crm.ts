import { BlogArticle } from './types';

const article: BlogArticle = {
    slug: 'integrasi-whatsapp-business-crm',
    category: {
        id: 'Panduan Omnichannel',
        en: 'Omnichannel Guide',
    },
    publishedDate: '2026-07-30',
    author: { id: 'Tim SmartSales', en: 'SmartSales Team' },
    title: {
        id: 'Integrasi WhatsApp Business API dengan CRM: Cara Kerjanya',
        en: 'WhatsApp Business API + CRM Integration: How It Works',
    },
    description: {
        id: 'Panduan praktis cara kerja integrasi WhatsApp Business API dengan CRM: apa bedanya dengan WhatsApp Web, data apa yang tersinkron, dan langkah audit sebelum memilih tools.',
        en: 'A practical guide to how WhatsApp Business API integrates with a CRM: how it differs from WhatsApp Web, what data actually syncs, and how to audit your setup before choosing tools.',
    },
    h1: {
        id: 'Kenapa Chat WhatsApp Sales Anda Perlu Masuk ke CRM, Bukan Cuma ke HP',
        en: 'Why Your Sales Team’s WhatsApp Chats Belong in a CRM, Not Just a Phone',
    },
    intro: {
        id: 'Kalau tim sales dan CS Anda masih membalas WhatsApp dari HP pribadi masing-masing, Anda sebenarnya tidak punya data pelanggan — Anda punya data yang tersebar di banyak HP. Artikel ini menjelaskan apa itu integrasi WhatsApp Business API dengan CRM, bagaimana cara kerjanya secara teknis, dan bagaimana mengaudit kebutuhan Anda sebelum memutuskan pakai tools apa.',
        en: 'If your sales and CS team is still replying to WhatsApp from their own personal phones, you don’t really have customer data — you have data scattered across a dozen devices. This article explains what WhatsApp Business API + CRM integration actually is, how it works under the hood, and how to audit your own setup before deciding on any tool.',
    },
    body: [
        {
            type: 'h2',
            text: { id: 'Apa Bedanya WhatsApp Business API dengan WhatsApp Biasa?', en: 'What’s the Difference Between WhatsApp Business API and Regular WhatsApp?' },
        },
        {
            type: 'p',
            text: {
                id: 'WhatsApp biasa (termasuk WhatsApp Business App yang gratis) dirancang untuk satu orang, satu HP, satu aplikasi. Cocok untuk usaha kecil dengan satu admin. Masalahnya muncul begitu ada lebih dari satu orang yang perlu membalas chat yang sama — misalnya sales dan CS bergantian menangani satu nomor WhatsApp perusahaan.',
                en: 'Regular WhatsApp (including the free WhatsApp Business App) is built for one person, one phone, one app. That’s fine for a small business with a single admin. The problem starts the moment more than one person needs to reply from the same number — for example, sales and CS taking turns on one company WhatsApp line.',
            },
        },
        {
            type: 'p',
            text: {
                id: 'WhatsApp Business API adalah jalur resmi dari Meta yang memungkinkan satu nomor WhatsApp diakses lewat sistem, bukan lewat aplikasi HP. Karena aksesnya lewat sistem, chat dari nomor tersebut bisa ditampilkan di banyak layar sekaligus (misalnya di dashboard CRM), dibagi ke beberapa agen, dan disimpan sebagai data — bukan hanya tersimpan di satu HP yang bisa hilang atau ganti pemilik saat staf resign.',
                en: 'WhatsApp Business API is Meta’s official channel that lets a WhatsApp number be accessed through a system rather than a phone app. Because access goes through a system, chats from that number can appear on multiple screens at once (like a CRM dashboard), be split across several agents, and be stored as data — not left sitting on one phone that can go missing or change hands whenever a staff member resigns.',
            },
        },
        {
            type: 'list',
            items: {
                id: [
                    'WhatsApp App biasa: satu nomor hanya bisa login di satu HP (atau HP + WhatsApp Web), riwayat chat tersimpan lokal di perangkat itu.',
                    'WhatsApp Business App: menambahkan fitur katalog dan auto-reply dasar, tapi tetap satu perangkat utama.',
                    'WhatsApp Business API: nomor terhubung ke sistem (misalnya CRM), bisa diakses banyak agen sekaligus, dan riwayat chat tersimpan di server — bukan di HP.',
                ],
                en: [
                    'Regular WhatsApp App: one number logs into one phone (or phone + WhatsApp Web), and chat history stays local to that device.',
                    'WhatsApp Business App: adds a catalog and basic auto-reply, but is still built around one primary device.',
                    'WhatsApp Business API: the number is connected to a system (like a CRM), can be accessed by multiple agents at once, and chat history lives on a server — not on a phone.',
                ],
            },
        },
        {
            type: 'h2',
            text: { id: 'Bagaimana Cara Kerja Integrasinya ke CRM?', en: 'How Does the Integration with a CRM Actually Work?' },
        },
        {
            type: 'p',
            text: {
                id: 'Secara teknis, WhatsApp Business API mengirim setiap pesan masuk ke sistem CRM melalui webhook — semacam pipa data yang otomatis meneruskan pesan begitu diterima. Di sisi CRM, pesan itu dicocokkan dengan nomor telepon yang sudah ada di database kontak. Kalau nomornya baru, sistem otomatis membuat profil lead baru; kalau nomornya sudah dikenal, pesan itu langsung ditambahkan ke riwayat kontak yang sudah ada.',
                en: 'Technically, WhatsApp Business API sends every incoming message to the CRM through a webhook — a data pipe that automatically forwards the message the moment it arrives. On the CRM side, that message is matched against the phone numbers already in the contact database. If the number is new, the system creates a fresh lead profile; if it’s already known, the message is simply appended to that contact’s existing history.',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Ini yang membuat integrasi WhatsApp Business API dengan CRM berbeda dari sekadar "menghubungkan WhatsApp Web ke laptop kantor" — setiap chat otomatis tercatat sebagai bagian dari data pelanggan, lengkap dengan sumbernya (campaign, iklan, atau organik), bukan sekadar bubble chat yang hilang begitu di-scroll.',
                en: 'This is what makes WhatsApp Business API + CRM integration different from simply "connecting WhatsApp Web to an office laptop" — every chat is automatically logged as part of the customer record, complete with its source (a campaign, an ad, or organic), instead of being just a chat bubble that disappears once you scroll past it.',
            },
        },
        {
            type: 'list',
            items: {
                id: [
                    'Pesan masuk dari prospek baru → otomatis dibuat sebagai lead baru dengan sumber tercatat.',
                    'Pesan masuk dari kontak lama → otomatis muncul di profil kontak yang sudah ada, beserta riwayat interaksi sebelumnya.',
                    'Lead baru bisa langsung didistribusikan ke sales/CS yang sedang bertugas (auto-routing), tanpa menunggu ada yang forward manual.',
                    'Percakapan bisa diubah jadi task follow-up atau tiket, sehingga tidak bergantung pada ingatan satu orang.',
                ],
                en: [
                    'A message from a new prospect → automatically becomes a new lead with its source recorded.',
                    'A message from an existing contact → automatically appears on that contact’s existing profile, alongside prior interaction history.',
                    'New leads can be routed straight to whichever sales/CS rep is on duty (auto-routing), without waiting for someone to forward it manually.',
                    'Conversations can be converted into follow-up tasks or tickets, so nothing depends on one person’s memory.',
                ],
            },
        },
        {
            type: 'callout',
            text: {
                id: 'Ini juga cara paling umum leads "bocor" antara tim marketing dan sales: campaign berjalan bagus, banyak yang membalas WhatsApp, tapi karena balasannya masuk ke HP pribadi salah satu staf, tidak ada yang tahu berapa dari balasan itu yang benar-benar di-follow up. Integrasi WhatsApp API ke CRM adalah salah satu cara memutus titik bocor ini di sumbernya.',
                en: 'This is also the single most common way leads leak between marketing and sales: a campaign performs well, plenty of people reply on WhatsApp, but because those replies land on one staff member’s personal phone, nobody can tell how many of them ever got followed up. Wiring WhatsApp API straight into a CRM is one way to close that leak at the source.',
            },
        },
        {
            type: 'h2',
            text: { id: 'Audit: Apakah Bisnis Anda Sudah Siap Butuh Integrasi Ini?', en: 'Audit: Do You Actually Need This Integration Yet?' },
        },
        {
            type: 'p',
            text: {
                id: 'Integrasi WhatsApp API ke CRM bukan kebutuhan setiap bisnis di setiap tahap. Kalau hanya satu admin yang menangani semua chat dan volumenya masih kecil, WhatsApp Business App gratis mungkin sudah cukup. Gunakan checklist berikut untuk mengecek apakah Anda sudah melewati titik itu.',
                en: 'Not every business needs WhatsApp API + CRM integration at every stage. If a single admin handles all the chats and volume is still low, the free WhatsApp Business App may well be enough. Use the checklist below to check whether you’ve already outgrown it.',
            },
        },
        {
            type: 'list',
            items: {
                id: [
                    'Lebih dari satu orang perlu membalas dari nomor WhatsApp yang sama secara bersamaan.',
                    'Anda pernah kehilangan riwayat chat atau kontak penting karena HP hilang, rusak, atau staf resign.',
                    'Anda tidak bisa menjawab dengan pasti "campaign mana yang menghasilkan chat WhatsApp terbanyak minggu ini".',
                    'Ada leads yang dibalas dua kali oleh dua orang berbeda, atau tidak dibalas sama sekali karena dikira sudah ditangani.',
                    'Anda ingin mengubah chat WhatsApp jadi data pipeline penjualan (misalnya status "sedang negosiasi", "menunggu pembayaran"), bukan cuma centang biru.',
                ],
                en: [
                    'More than one person needs to reply from the same WhatsApp number at the same time.',
                    'You’ve lost chat history or important contacts because a phone was lost, broken, or a staff member left.',
                    'You can’t confidently answer "which campaign generated the most WhatsApp replies this week."',
                    'Some leads get replied to twice by two different people, or not at all because everyone assumed someone else handled it.',
                    'You want WhatsApp chats to turn into sales pipeline data (e.g. "negotiating," "awaiting payment" status), not just blue checkmarks.',
                ],
            },
        },
        {
            type: 'p',
            text: {
                id: 'Kalau tiga atau lebih poin di atas terasa familiar, itu tanda kuat bahwa proses manual sudah tidak lagi sepadan dengan volume chat yang Anda tangani, dan integrasi resmi ke CRM sudah layak dipertimbangkan.',
                en: 'If three or more of these sound familiar, that’s a strong sign your manual process has outgrown your actual chat volume, and a proper CRM integration is worth considering.',
            },
        },
        {
            type: 'h2',
            text: { id: 'Yang Perlu Dipastikan Sebelum Memilih Provider', en: 'What to Verify Before Choosing a Provider' },
        },
        {
            type: 'p',
            text: {
                id: 'Tidak semua "integrasi WhatsApp CRM" yang dijual di pasaran menggunakan jalur resmi. Sebagian menggunakan cara tidak resmi yang berisiko nomor perusahaan Anda diblokir Meta sewaktu-waktu, terutama untuk kebutuhan broadcast. Berikut hal yang sebaiknya dipastikan sebelum memilih:',
                en: 'Not every "WhatsApp CRM integration" sold in the market actually goes through official channels. Some rely on unofficial methods that risk your company’s number getting blocked by Meta at any time, especially for broadcast use. Here’s what to check before you choose:',
            },
        },
        {
            type: 'list',
            items: {
                id: [
                    'Apakah menggunakan WhatsApp Business API resmi (bukan modifikasi WhatsApp Web/QR code yang berisiko diblokir)?',
                    'Apakah riwayat chat tersimpan di sistem, bukan hanya di aplikasi HP masing-masing agen?',
                    'Apakah lead baru dari WhatsApp otomatis tercatat sumbernya (campaign/channel), atau harus dicatat manual?',
                    'Apakah data pelanggan dan riwayat chat tetap ada di sistem perusahaan saat staf yang menangani resign?',
                    'Apakah WhatsApp jadi satu-satunya channel, atau bisa digabung dengan Email/channel lain dalam satu inbox yang sama?',
                ],
                en: [
                    'Does it run on the official WhatsApp Business API (not a modified WhatsApp Web/QR-code workaround that risks getting blocked)?',
                    'Is chat history stored in the system, rather than only on each agent’s own phone app?',
                    'Are new WhatsApp leads automatically logged with their source (campaign/channel), or does someone have to record that manually?',
                    'Does customer data and chat history stay in the company’s system when the staff member handling it resigns?',
                    'Is WhatsApp the only channel, or can it sit in the same inbox alongside Email and other channels?',
                ],
            },
        },
    ],
    faq: [
        {
            q: { id: 'Apakah integrasi WhatsApp Business API ke CRM butuh nomor WhatsApp baru?', en: 'Does integrating WhatsApp Business API with a CRM require a new WhatsApp number?' },
            a: {
                id: 'Umumnya ya, nomor yang akan dipakai untuk WhatsApp Business API perlu diverifikasi khusus untuk jalur API dan tidak bisa dipakai bersamaan sebagai WhatsApp App biasa di HP. Kalau Anda sudah punya nomor WhatsApp Business App yang aktif, biasanya nomor itu bisa dimigrasikan ke jalur API, tapi prosesnya perlu direncanakan agar riwayat chat lama tidak hilang.',
                en: 'Generally yes — the number used for WhatsApp Business API needs to go through a separate verification for the API channel and can’t simultaneously run as a regular WhatsApp App on a phone. If you already have an active WhatsApp Business App number, it can usually be migrated to the API channel, but the process needs to be planned so existing chat history isn’t lost.',
            },
        },
        {
            q: { id: 'Berapa lama proses setup integrasi WhatsApp API dengan CRM?', en: 'How long does setting up WhatsApp API + CRM integration take?' },
            a: {
                id: 'Lama prosesnya tergantung dua bagian: verifikasi nomor di sisi WhatsApp/Meta (di luar kendali penyedia CRM), dan konfigurasi di sisi CRM (biasanya lebih cepat karena hanya menghubungkan API key). Waktu total sangat bervariasi tergantung status verifikasi bisnis Anda di Meta, jadi sebaiknya tanyakan estimasi konkret ke penyedia yang Anda pilih.',
                en: 'It depends on two separate pieces: number verification on WhatsApp/Meta’s side (outside the CRM provider’s control), and configuration on the CRM side (usually faster since it’s mainly connecting an API key). Total time varies quite a bit depending on your business verification status with Meta, so it’s worth asking your chosen provider for a concrete estimate.',
            },
        },
        {
            q: { id: 'Apakah chat WhatsApp lama bisa dipindahkan ke CRM?', en: 'Can old WhatsApp chats be moved into a CRM?' },
            a: {
                id: 'Chat yang tersimpan di aplikasi WhatsApp biasa (di HP) umumnya tidak bisa ditarik otomatis ke sistem API karena berbeda arsitektur. Yang biasanya bisa dilakukan adalah memindahkan data kontak (nama, nomor, catatan) secara manual atau lewat import, sementara riwayat chat baru mulai tercatat otomatis sejak nomor tersambung ke CRM.',
                en: 'Chats stored in the regular WhatsApp app (on a phone) generally can’t be pulled automatically into the API-based system, since the two run on different architectures. What’s usually possible is moving contact data (name, number, notes) manually or via import, while new chat history starts getting logged automatically from the moment the number connects to the CRM.',
            },
        },
        {
            q: { id: 'Apakah integrasi ini hanya untuk broadcast promosi?', en: 'Is this integration only useful for broadcast promotions?' },
            a: {
                id: 'Tidak. Broadcast promosi hanya salah satu penggunaan. Fungsi intinya adalah memastikan setiap chat masuk maupun keluar tercatat sebagai data pelanggan yang terhubung ke pipeline sales atau tiket layanan — baik itu chat dari campaign, pertanyaan produk, maupun keluhan pelanggan.',
                en: 'No. Broadcast promotions are just one use case. The core function is making sure every inbound and outbound chat is logged as customer data tied to a sales pipeline or service ticket — whether that chat came from a campaign, a product question, or a complaint.',
            },
        },
    ],
    relatedSlugs: ['lead-routing-adalah', 'cara-migrasi-dari-spreadsheet-ke-crm', 'spreadsheet-vs-crm-sales-marketing'],
    primaryCtaHref: '/produk/omnichannel',
    primaryCtaLabel: {
        id: 'Lihat Fitur Omnichannel',
        en: 'See Omnichannel Features',
    },
};

export default article;
