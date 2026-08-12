import { BlogArticle } from './types';

const article: BlogArticle = {
    slug: 'cara-migrasi-dari-spreadsheet-ke-crm',
    category: {
        id: 'Panduan Lead Management',
        en: 'Lead Management Guide',
    },
    publishedDate: '2026-08-12',
    title: {
        id: 'Cara Migrasi Data Spreadsheet ke CRM Tanpa Kehilangan Data',
        en: 'How to Migrate Spreadsheet Data to a CRM Without Losing Data',
    },
    description: {
        id: 'Panduan langkah demi langkah migrasi data spreadsheet ke CRM: dari beres-beres data, mapping kolom, uji coba, sampai adopsi tim tanpa kehilangan riwayat leads.',
        en: 'A step-by-step guide to migrating spreadsheet data into a CRM: cleaning your data, mapping columns, testing, and team adoption — without losing lead history.',
    },
    h1: {
        id: 'Migrasi dari Spreadsheet ke CRM: Panduan Praktis Supaya Tidak Ada Data yang Hilang',
        en: 'Moving From Spreadsheet to CRM: A Practical Guide So Nothing Gets Lost',
    },
    intro: {
        id: 'Excel atau Google Sheets biasanya jadi tempat pertama tim sales mencatat leads — sampai jumlahnya membengkak dan mulai ada tab yang ketinggalan update, baris duplikat, atau file yang cuma disimpan di laptop satu orang. Migrasi ke CRM sering ditunda karena takut prosesnya ribet atau data lama malah berantakan di sistem baru. Panduan ini membahas cara memindahkan data spreadsheet ke CRM secara bertahap, termasuk bagian yang paling sering diabaikan: membersihkan data sebelum dipindah, bukan sesudah.',
        en: 'Excel or Google Sheets is usually where a sales team first logs leads — until the row count balloons and tabs go stale, duplicates pile up, or the only copy lives on one person\'s laptop. Migrating to a CRM often gets postponed because the process seems complicated, or because people fear the old data will end up messier in the new system. This guide walks through moving spreadsheet data into a CRM step by step, including the part most teams skip: cleaning the data before the move, not after.',
    },
    body: [
        {
            type: 'h2',
            text: {
                id: 'Kenapa Migrasi dari Spreadsheet Sering Gagal di Tengah Jalan',
                en: 'Why Spreadsheet Migrations Often Stall Halfway',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Kegagalan migrasi jarang disebabkan oleh CRM-nya. Penyebab paling umum adalah tim langsung mengimpor file mentah tanpa membersihkannya dulu — hasilnya kontak duplikat, format nomor telepon yang tidak konsisten (08xx vs +62xx), dan kolom status yang tiap sales isi dengan istilah berbeda-beda. Begitu data kotor ini masuk ke CRM, tim jadi kehilangan kepercayaan pada sistem baru dan diam-diam kembali ke spreadsheet lama.',
                en: 'A failed migration is rarely the CRM\'s fault. The most common cause is importing the raw file straight in without cleaning it first — leading to duplicate contacts, inconsistent phone number formats (08xx vs +62xx), and a status column where every rep used their own terms. Once that messy data lands in the CRM, the team loses trust in the new system and quietly drifts back to the old spreadsheet.',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Ini juga sering menjadi lanjutan dari masalah yang lebih besar: leads dari marketing (WhatsApp, Email, form website) yang sudah dicatat di spreadsheet berbeda-beda oleh setiap staf sejak awal, sehingga saat mau disatukan ke satu sistem, tidak ada satu sumber data yang bisa dipercaya penuh.',
                en: 'This is often a continuation of a bigger problem: marketing leads (WhatsApp, email, website forms) that were already being logged in separate spreadsheets by different staff from the start, so by the time you try to consolidate them into one system, there\'s no single source of data you can fully trust.',
            },
        },
        {
            type: 'h2',
            text: {
                id: 'Langkah 1: Audit dan Bersihkan Data Sebelum Dipindah',
                en: 'Step 1: Audit and Clean the Data Before You Move It',
            },
        },
        {
            type: 'list',
            items: {
                id: [
                    'Gabungkan dulu semua file spreadsheet yang tersebar (per staf, per campaign, per bulan) menjadi satu master file.',
                    'Cari dan hapus baris duplikat — biasanya nomor telepon atau email yang sama muncul lebih dari sekali dengan nama beda ejaan.',
                    'Standarkan format nomor telepon ke satu pola (misalnya selalu 62xxxxxxxxxx tanpa spasi atau tanda hubung).',
                    'Samakan istilah status leads (contoh: "baru", "follow up", "closing", "batal") — hindari variasi bebas seperti "udah dihubungi", "sudah FU", "on progress".',
                    'Tandai kolom mana yang wajib diisi (nama, nomor kontak, sumber leads) dan kolom mana yang boleh dikosongkan.',
                    'Buang baris yang jelas tidak relevan lagi, misalnya leads dari lebih dari setahun lalu yang tidak pernah dibalas dan tidak ada rencana difollow up ulang.',
                ],
                en: [
                    'First consolidate every scattered spreadsheet (per staff member, per campaign, per month) into one master file.',
                    'Find and remove duplicate rows — usually the same phone number or email appears more than once under slightly different spellings.',
                    'Standardize phone number formatting to one pattern (e.g. always 62xxxxxxxxxx with no spaces or dashes).',
                    'Align the wording used for lead status (e.g. "new", "follow up", "closed", "lost") — avoid free-text variations like "already contacted", "in progress", "sudah FU".',
                    'Mark which columns are mandatory (name, contact number, lead source) and which can be left blank.',
                    'Drop rows that are clearly no longer relevant, such as leads from over a year ago that were never replied to and have no realistic follow-up plan.',
                ],
            },
        },
        {
            type: 'callout',
            text: {
                id: 'Aturan praktis: kalau membersihkan satu kolom saja butuh waktu lebih dari satu hari kerja, jangan coba selesaikan semuanya sekaligus. Migrasikan dulu sumber leads yang paling aktif (misalnya WhatsApp bulan berjalan), lalu tambahkan sumber lain secara bertahap setelah tim terbiasa dengan sistem baru.',
                en: 'Rule of thumb: if cleaning even one column takes more than a full working day, don\'t try to finish everything at once. Migrate your most active lead source first (this month\'s WhatsApp leads, for example), then add the other sources gradually once the team is comfortable with the new system.',
            },
        },
        {
            type: 'h2',
            text: {
                id: 'Langkah 2: Petakan Kolom Spreadsheet ke Field CRM',
                en: 'Step 2: Map Your Spreadsheet Columns to CRM Fields',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Sebelum impor, buat tabel mapping sederhana: kolom spreadsheet di kiri, field CRM tujuan di kanan. Ini membantu Anda melihat kolom mana yang tidak punya padanan di CRM (perlu dibuat sebagai custom field) dan kolom mana di spreadsheet yang sebenarnya sudah tidak perlu dibawa. Kolom seperti nama, nomor kontak, email, dan sumber leads biasanya punya field bawaan di CRM. Kolom catatan bebas ("notes: udah nanya harga, minta diskon") biasanya paling pas dipetakan ke kolom catatan atau riwayat aktivitas, bukan field terstruktur.',
                en: 'Before importing, build a simple mapping table: spreadsheet column on the left, target CRM field on the right. This surfaces which columns have no equivalent in the CRM (and need a custom field) and which spreadsheet columns don\'t actually need to come along. Name, contact number, email, and lead source usually map to built-in CRM fields. Free-text notes ("asked about pricing, wants a discount") are usually best mapped to a notes or activity-history field rather than a structured one.',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Perhatikan juga kolom sumber leads (lead source). Ini kolom yang paling sering dilewatkan padahal paling penting — tanpa data sumber yang jelas, tim marketing tidak akan pernah tahu campaign mana yang sebenarnya menghasilkan penjualan, bukan sekadar balasan.',
                en: 'Pay special attention to the lead source column. It\'s the one most often skipped, yet it matters most — without clear source data, marketing will never know which campaigns actually generated sales, versus just replies.',
            },
        },
        {
            type: 'h2',
            text: {
                id: 'Langkah 3: Impor Bertahap, Jangan Sekali Jalan untuk Semua Data',
                en: 'Step 3: Import in Stages, Not All at Once',
            },
        },
        {
            type: 'list',
            items: {
                id: [
                    'Mulai dengan batch kecil (misalnya 20-50 baris) untuk menguji apakah mapping kolom sudah benar.',
                    'Periksa hasil impor: apakah nomor telepon terbaca utuh, apakah tanggal tidak berubah format, apakah status leads masuk ke tahap pipeline yang tepat.',
                    'Setelah batch kecil lolos verifikasi, lanjutkan impor batch berikutnya per sumber leads atau per periode waktu.',
                    'Simpan file spreadsheet asli sebagai arsip minimal selama beberapa bulan setelah migrasi, sebagai jaring pengaman kalau ada data yang perlu dicek ulang.',
                ],
                en: [
                    'Start with a small batch (say, 20-50 rows) to test whether your column mapping is actually correct.',
                    'Check the import result: did phone numbers come through intact, did dates keep their format, did lead status land in the right pipeline stage.',
                    'Once the small batch checks out, continue importing the next batches by lead source or time period.',
                    'Keep the original spreadsheet file archived for at least a few months after migration, as a safety net in case any data needs to be double-checked.',
                ],
            },
        },
        {
            type: 'h2',
            text: {
                id: 'Langkah 4: Jangan Lupakan Adopsi Tim, Bukan Cuma Data',
                en: 'Step 4: Don\'t Forget Team Adoption, Not Just the Data',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Migrasi teknis yang sempurna bisa tetap gagal kalau sales tim diam-diam terus mencatat leads baru di Excel karena lebih terbiasa. Tetapkan satu tanggal cut-off yang jelas: setelah tanggal itu, semua leads baru wajib dicatat langsung di CRM, bukan lagi di spreadsheet. Latih tim dengan skenario nyata mereka sehari-hari — bukan demo generik — dan pastikan ada satu orang yang jadi tempat bertanya kalau ada kebingungan di minggu-minggu pertama.',
                en: 'A technically flawless migration can still fail if the sales team quietly keeps logging new leads in Excel because it\'s what they know. Set one clear cut-off date: after that date, every new lead must be logged directly in the CRM, not in a spreadsheet. Train the team using their real day-to-day scenarios — not a generic demo — and make sure there\'s one point of contact for questions during the first few confusing weeks.',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Riwayat percakapan dan konteks prospek yang sebelumnya tersebar di file dan HP pribadi masing-masing staf juga jadi lebih aman setelah pindah ke CRM, karena datanya tersimpan di sistem perusahaan, bukan perangkat pribadi — jadi tidak ikut hilang kalau ada staf yang resign.',
                en: 'Conversation history and prospect context that used to be scattered across files and personal phones also become safer once they live in the CRM, since the data sits in a company system rather than a personal device — so it doesn\'t disappear when a staff member resigns.',
            },
        },
        {
            type: 'h2',
            text: {
                id: 'Checklist Sebelum Dianggap "Migrasi Selesai"',
                en: 'Checklist Before Calling the Migration "Done"',
            },
        },
        {
            type: 'list',
            items: {
                id: [
                    'Semua leads aktif (bukan hanya leads lama) sudah ada di CRM dengan status terkini.',
                    'Tidak ada lagi duplikat kontak yang terlihat jelas saat dicek sekilas.',
                    'Setiap leads punya sumber (source) yang tercatat, bukan kolom kosong.',
                    'Seluruh tim sales sudah tahu tanggal cut-off dan sudah berhenti mencatat leads baru di spreadsheet lama.',
                    'Ada satu orang penanggung jawab data yang bisa dihubungi kalau ada leads yang "hilang" saat migrasi.',
                ],
                en: [
                    'Every active lead (not just old ones) is in the CRM with an up-to-date status.',
                    'No obvious duplicate contacts remain on a quick spot check.',
                    'Every lead has a recorded source, not a blank field.',
                    'The whole sales team knows the cut-off date and has stopped logging new leads in the old spreadsheet.',
                    'There\'s one designated data owner to contact if any lead appears "missing" during the migration.',
                ],
            },
        },
    ],
    faq: [
        {
            q: {
                id: 'Berapa lama waktu yang dibutuhkan untuk migrasi dari spreadsheet ke CRM?',
                en: 'How long does migrating from a spreadsheet to a CRM take?',
            },
            a: {
                id: 'Tergantung jumlah data dan seberapa berantakan kondisinya. Membersihkan data biasanya memakan waktu lebih lama daripada proses impor itu sendiri. Untuk data yang relatif rapi, migrasi bertahap per sumber leads bisa selesai dalam hitungan hari; data yang sangat berantakan bisa butuh beberapa minggu kalau dikerjakan sambil jalan.',
                en: 'It depends on the volume of data and how messy it is. Cleaning the data usually takes longer than the import itself. For relatively tidy data, a staged migration by lead source can finish within days; heavily messy data can take a few weeks if it\'s done alongside normal work.',
            },
        },
        {
            q: {
                id: 'Apakah harus migrasi semua data sekaligus?',
                en: 'Do I have to migrate all my data at once?',
            },
            a: {
                id: 'Tidak. Cara yang lebih aman justru memulai dari sumber leads yang paling aktif dulu, lalu menambahkan sumber lain secara bertahap setelah tim terbiasa dengan sistem baru dan proses migrasinya sendiri sudah teruji.',
                en: 'No. The safer approach is to start with your most active lead source first, then add other sources gradually once the team is comfortable with the new system and the migration process itself has been tested.',
            },
        },
        {
            q: {
                id: 'Bagaimana kalau ada leads yang datanya tidak lengkap di spreadsheet?',
                en: 'What if some leads have incomplete data in the spreadsheet?',
            },
            a: {
                id: 'Tetap dimigrasikan asal ada minimal nama dan nomor kontak yang valid — jangan menunggu data sempurna karena itu bisa menunda migrasi tanpa batas. Kolom yang kosong bisa dilengkapi belakangan saat sales menghubungi ulang leads tersebut.',
                en: 'Migrate it anyway as long as there\'s at least a valid name and contact number — waiting for perfect data can delay the migration indefinitely. Missing fields can be filled in later when sales reaches out to that lead again.',
            },
        },
        {
            q: {
                id: 'Siapa yang sebaiknya bertanggung jawab atas proses migrasi ini?',
                en: 'Who should own this migration process?',
            },
            a: {
                id: 'Idealnya satu orang (misalnya sales admin atau sales manager) ditunjuk sebagai penanggung jawab data selama proses migrasi, supaya ada satu pihak yang bisa memutuskan cara membersihkan data yang ambigu dan menjadi tempat bertanya tim.',
                en: 'Ideally, one person (a sales admin or sales manager, for example) is designated as the data owner during the migration, so there\'s a single decision-maker for ambiguous cleanup cases and a clear point of contact for the team.',
            },
        },
        {
            q: {
                id: 'Apakah riwayat chat WhatsApp dengan leads lama bisa ikut dipindahkan?',
                en: 'Can old WhatsApp chat history with leads be brought over too?',
            },
            a: {
                id: 'Ini tergantung dari mana riwayat chat itu berasal. Untuk leads baru ke depannya, jika WhatsApp Business API terhubung ke CRM, percakapan tersimpan otomatis. Untuk riwayat chat lama di HP pribadi staf, biasanya perlu dicatat ulang sebagai ringkasan di kolom catatan, karena format chat mentah umumnya tidak bisa diimpor langsung ke field CRM terstruktur.',
                en: 'This depends on where that chat history lives. Going forward, if the WhatsApp Business API is connected to the CRM, conversations are stored automatically. For old chat history sitting on a staff member\'s personal phone, it usually needs to be re-entered as a summary in a notes field, since raw chat exports generally can\'t be imported directly into structured CRM fields.',
            },
        },
    ],
    relatedSlugs: [
        'spreadsheet-vs-crm-sales-marketing',
        'integrasi-whatsapp-business-crm',
        'checklist-audit-kebocoran-leads',
    ],
    primaryCtaHref: '/produk/crm-sales',
    primaryCtaLabel: {
        id: 'Lihat Fitur CRM Sales',
        en: 'See CRM Sales Features',
    },
};

export default article;
