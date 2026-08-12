import { BlogArticle } from './types';

const article: BlogArticle = {
    slug: 'cara-menghitung-leads-yang-hilang',
    category: {
        id: 'Panduan Lead Management',
        en: 'Lead Management Guide',
    },
    publishedDate: '2026-06-18',
    author: { id: 'Tim SmartSales', en: 'SmartSales Team' },
    title: {
        id: 'Cara Menghitung Revenue yang Hilang Akibat Leads Tidak Di-follow Up',
        en: 'How to Calculate Revenue Lost to Unfollowed Leads',
    },
    description: {
        id: 'Berapa banyak revenue yang hilang karena leads tidak sempat di-follow up sales? Ikuti formula sederhana ini untuk menghitung angkanya di bisnis Anda sendiri.',
        en: 'How much revenue are you losing to leads that never get followed up? Use this simple formula to calculate the real number for your own business.',
    },
    h1: {
        id: 'Berapa Sebenarnya Kerugian Anda dari Leads yang Tidak Di-follow Up?',
        en: 'How Much Are Unfollowed Leads Really Costing You?',
    },
    intro: {
        id: 'Kebanyakan bisnis tahu ada leads yang "hilang" — nomor yang masuk lalu tidak pernah dihubungi, chat yang dibalas dua hari kemudian setelah calon pembeli sudah beli di tempat lain. Masalahnya, kerugian ini jarang dihitung dengan angka, jadi tidak pernah dianggap cukup serius untuk diperbaiki. Artikel ini memberi Anda formula sederhana untuk mengubah dugaan itu menjadi angka rupiah yang bisa dibawa ke rapat.',
        en: 'Most businesses sense that some leads slip away — a number that comes in and never gets called, a chat answered two days too late after the prospect already bought elsewhere. The problem is that this loss almost never gets turned into a number, so it never feels urgent enough to fix. This article gives you a simple formula to turn that hunch into a rupiah figure you can actually bring to a meeting.',
    },
    body: [
        {
            type: 'h2',
            text: { id: 'Kenapa "Leads Hilang" Susah Disadari', en: 'Why Lost Leads Are Easy to Miss' },
        },
        {
            type: 'p',
            text: {
                id: 'Leads yang hilang jarang terasa seperti masalah besar dalam keseharian. Satu chat WhatsApp yang tidak terbalas terasa sepele. Satu nomor dari form website yang lupa di-follow up terasa seperti kelalaian kecil. Tapi karena tidak ada satu sistem yang mencatat semua leads masuk dan status follow up-nya, kejadian "sepele" ini terjadi berkali-kali setiap hari, dan akumulasinya baru terasa saat target penjualan bulanan meleset.',
                en: 'Lost leads rarely feel like a big deal day to day. One unanswered WhatsApp chat feels trivial. One website form left uncalled feels like a minor slip. But because there is no single system tracking every incoming lead and its follow-up status, these "trivial" moments happen many times a day, and the accumulated cost only shows up when the monthly sales target is missed.',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Ini persis pola yang sering muncul ketika data marketing dan data sales tidak terhubung: marketing tahu berapa banyak orang merespons campaign, tapi tidak tahu berapa yang benar-benar dihubungi sales, apalagi berapa yang closing. Tanpa data ini disatukan, leads hilang di celah antar tim tanpa pernah tercatat sebagai kerugian.',
                en: 'This is exactly the pattern that shows up when marketing data and sales data are not connected: marketing knows how many people responded to a campaign, but not how many were actually contacted by sales, let alone how many closed. Without that data unified, leads disappear in the gap between teams without ever being recorded as a loss.',
            },
        },
        {
            type: 'h2',
            text: { id: 'Formula Menghitung Revenue yang Hilang', en: 'The Formula for Calculating Lost Revenue' },
        },
        {
            type: 'p',
            text: {
                id: 'Anda tidak butuh software atau data science untuk mulai menghitung. Empat angka ini cukup, dan sebagian besar bisnis sudah punya (atau bisa memperkirakan) semuanya:',
                en: 'You do not need software or a data team to start calculating this. Four numbers are enough, and most businesses already have — or can reasonably estimate — all of them:',
            },
        },
        {
            type: 'list',
            items: {
                id: [
                    'Jumlah leads per bulan — total kontak baru dari semua sumber (WhatsApp, form website, Instagram, referral, dll).',
                    'Persentase leads yang tidak di-follow up — dari total leads, berapa persen yang tidak sempat dihubungi sama sekali atau dihubungi terlalu lambat.',
                    'Rata-rata nilai transaksi — nilai deal rata-rata jika satu leads berhasil closing.',
                    'Close rate tim sales — dari leads yang benar-benar di-follow up, berapa persen yang biasanya closing.',
                ],
                en: [
                    'Monthly lead volume — total new contacts from every source (WhatsApp, website forms, Instagram, referrals, and so on).',
                    'Percentage of unfollowed leads — of your total leads, how many are never contacted at all, or contacted too late to matter.',
                    'Average deal size — the typical transaction value when a lead does close.',
                    'Your sales team\'s close rate — of the leads that are actually followed up, what percentage typically close.',
                ],
            },
        },
        {
            type: 'callout',
            text: {
                id: 'Formula: Leads per bulan × % leads tidak di-follow up × rata-rata nilai transaksi × close rate tim sales = estimasi revenue yang hilang per bulan.\n\nContoh ilustrasi: 200 leads/bulan × 30% tidak di-follow up × Rp2.000.000 rata-rata nilai transaksi × 15% close rate ≈ Rp18.000.000 potensi revenue hilang setiap bulan. Angka ini hanya contoh — ganti dengan data bisnis Anda sendiri.',
                en: 'Formula: Monthly leads × % of leads not followed up × average deal size × your sales team\'s close rate = estimated lost revenue per month.\n\nIllustrative example: 200 leads/month × 30% not followed up × Rp2,000,000 average deal size × 15% close rate ≈ Rp18,000,000 in potential lost revenue every month. This is only an example — replace it with your own business data.',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Bagian tersulit biasanya bukan mengalikan angka, melainkan mendapatkan angka "% leads tidak di-follow up" yang akurat — karena kalau leads dicatat manual di spreadsheet atau tersebar di HP masing-masing sales, tidak ada yang benar-benar tahu berapa yang terlewat. Bagian selanjutnya membahas cara memperkirakan angka ini walau data Anda belum rapi.',
                en: 'The hardest part is usually not the multiplication — it is getting an accurate "% not followed up" figure in the first place. When leads are logged manually in a spreadsheet or scattered across each rep\'s phone, nobody actually knows how many slipped through. The next section covers how to estimate this figure even if your data is not yet clean.',
            },
        },
        {
            type: 'h2',
            text: { id: 'Cara Memperkirakan Angka Ini Kalau Data Belum Rapi', en: 'Estimating the Numbers When Your Data Isn\'t Clean Yet' },
        },
        {
            type: 'p',
            text: {
                id: 'Jika Anda belum punya sistem yang mencatat status follow up setiap leads, jangan tunggu sampai datanya sempurna untuk mulai menghitung. Gunakan langkah berikut sebagai titik awal:',
                en: 'If you don\'t yet have a system that logs every lead\'s follow-up status, don\'t wait for perfect data before you start calculating. Use these steps as a starting point:',
            },
        },
        {
            type: 'list',
            items: {
                id: [
                    'Ambil sampel satu minggu — kumpulkan semua chat WhatsApp masuk, submission form, dan DM Instagram dalam satu minggu terakhir dari semua akun/HP yang dipakai tim.',
                    'Tandai status masing-masing — dihubungi dalam 1 hari, dihubungi tapi terlambat (lebih dari 1-2 hari), atau tidak pernah dihubungi sama sekali.',
                    'Hitung persentase kasar — bagi jumlah leads yang "tidak dihubungi" atau "terlambat" dengan total leads minggu itu, lalu bulatkan sebagai perkiraan bulanan.',
                    'Tanyakan ke tim sales — mereka biasanya sudah punya feeling soal seberapa sering ini terjadi, gunakan sebagai pembanding sampel Anda.',
                ],
                en: [
                    'Sample one week — pull together every incoming WhatsApp chat, form submission, and Instagram DM from the past week across every account/phone your team uses.',
                    'Tag the status of each one — contacted within a day, contacted but late (more than 1-2 days), or never contacted at all.',
                    'Calculate a rough percentage — divide the "never contacted" plus "late" leads by that week\'s total, then treat it as a monthly estimate.',
                    'Ask your sales team — they usually already have a gut sense of how often this happens; use it to sanity-check your sample.',
                ],
            },
        },
        {
            type: 'p',
            text: {
                id: 'Audit manual seperti ini sengaja dibuat sederhana supaya bisa dijalankan hari ini juga, tanpa menunggu tool apapun. Kalau Anda ingin daftar titik kebocoran yang lebih lengkap untuk diperiksa, ini yang dibahas lebih dalam pada panduan audit kebocoran leads.',
                en: 'This kind of manual audit is deliberately simple so you can run it today, without waiting on any tool. If you want a fuller list of leak points to check, that is covered in more depth in our lead-leakage audit checklist.',
            },
        },
        {
            type: 'h2',
            text: { id: 'Setelah Angkanya Keluar, Lakukan Ini', en: 'What to Do Once You Have the Number' },
        },
        {
            type: 'p',
            text: {
                id: 'Angka hasil perhitungan di atas paling berguna sebagai alasan untuk membenahi proses, bukan sekadar statistik yang disimpan di laporan. Tiga langkah yang biasanya paling langsung berdampak: pastikan setiap leads dari semua channel (WhatsApp, email, web form) tercatat di satu tempat — bukan tersebar di HP masing-masing sales; tetapkan SLA follow up yang jelas, misalnya leads baru harus dihubungi dalam waktu tertentu; dan buat rute otomatis supaya leads baru langsung sampai ke sales yang sedang bertugas tanpa menunggu proses manual.',
                en: 'The number from this calculation is most useful as a reason to fix the process, not just a statistic filed away in a report. Three fixes usually move the needle fastest: make sure every lead from every channel (WhatsApp, email, web form) lands in one place instead of scattered across each rep\'s phone; set a clear follow-up SLA, such as a fixed time window for contacting a new lead; and route new leads automatically to whichever rep is on duty instead of waiting on a manual handoff.',
            },
        },
        {
            type: 'p',
            text: {
                id: 'Untuk SLA follow up yang realistis, kami membahas cara menentukan target waktunya secara lebih rinci di panduan SLA follow up leads. Ini juga persis masalah inti yang coba dijawab dengan integrasi sales dan marketing: menyatukan data leads dari campaign marketing dengan proses follow up sales dalam satu sistem, sehingga tidak ada lagi leads yang hilang di antara dua tim dan kerugian seperti perhitungan di atas bisa ditekan dari bulan ke bulan.',
                en: 'For a realistic follow-up SLA, we go into more detail on setting the right time target in our lead follow-up SLA guide. This is also exactly the core problem that sales and marketing integration is meant to solve: unifying lead data from marketing campaigns with the sales follow-up process in one system, so leads stop disappearing between the two teams and losses like the ones above shrink month over month.',
            },
        },
    ],
    faq: [
        {
            q: {
                id: 'Apakah formula ini akurat untuk semua jenis bisnis?',
                en: 'Is this formula accurate for every kind of business?',
            },
            a: {
                id: 'Formula ini adalah kerangka perhitungan, bukan angka baku industri. Akurasinya tergantung seberapa realistis input Anda — terutama persentase leads yang tidak di-follow up. Semakin rapi data leads Anda, semakin akurat hasilnya.',
                en: 'This formula is a calculation framework, not a fixed industry benchmark. Its accuracy depends on how realistic your inputs are — especially the percentage of unfollowed leads. The cleaner your lead data, the more accurate the result.',
            },
        },
        {
            q: {
                id: 'Bagaimana kalau saya tidak tahu close rate tim sales?',
                en: 'What if I don\'t know my sales team\'s close rate?',
            },
            a: {
                id: 'Hitung dari data yang sudah ada: ambil jumlah deal yang closing dalam satu bulan, lalu bagi dengan jumlah leads yang benar-benar di-follow up (bukan total leads). Kalau belum ada catatan sama sekali, gunakan perkiraan kasar dari tim sales sebagai titik awal, lalu perbaiki angkanya setelah data lebih rapi.',
                en: 'Calculate it from what you already have: take the number of deals closed in a month and divide by the number of leads that were actually followed up (not your total lead count). If there is no record at all yet, use a rough estimate from your sales team as a starting point, then refine it once your data is cleaner.',
            },
        },
        {
            q: {
                id: 'Berapa persen leads tidak di-follow up yang dianggap "normal"?',
                en: 'What percentage of unfollowed leads is considered "normal"?',
            },
            a: {
                id: 'Tidak ada angka baku, karena sangat tergantung volume leads dan kapasitas tim sales. Yang lebih penting dari sekadar angka adalah tren-nya: kalau persentase ini terus naik atau tidak pernah diukur sama sekali, itu tanda proses follow up perlu dibenahi.',
                en: 'There is no fixed benchmark, since it depends heavily on lead volume and sales team capacity. What matters more than the number itself is the trend: if this percentage keeps climbing, or is never measured at all, that is a sign your follow-up process needs fixing.',
            },
        },
        {
            q: {
                id: 'Apakah saya perlu software untuk mulai menghitung ini?',
                en: 'Do I need software to start calculating this?',
            },
            a: {
                id: 'Tidak untuk perhitungan awal. Audit manual satu minggu seperti dijelaskan di atas sudah cukup untuk mendapatkan perkiraan pertama. Software baru menjadi relevan ketika Anda perlu menghitung angka ini secara rutin tanpa audit manual berulang, karena data leads dan follow up sudah tercatat otomatis.',
                en: 'Not for the initial calculation. A one-week manual audit, as described above, is enough to get a first estimate. Software becomes relevant once you need this number tracked on an ongoing basis without repeating a manual audit every time, because lead and follow-up data is already logged automatically.',
            },
        },
        {
            q: {
                id: 'Apakah leads yang "di-follow up terlambat" dihitung sama dengan yang "tidak di-follow up sama sekali"?',
                en: 'Should a "late follow-up" be counted the same as "never followed up"?',
            },
            a: {
                id: 'Sebaiknya dipisah dulu saat audit, karena penyebab dan solusinya berbeda. Leads yang tidak pernah dihubungi biasanya masalah proses (tidak ada yang bertanggung jawab), sementara leads yang terlambat biasanya masalah kapasitas atau prioritas. Untuk perhitungan revenue hilang, keduanya bisa digabung sebagai "tidak di-follow up efektif" karena sama-sama menurunkan peluang closing.',
                en: 'It is best to separate them during the audit, since the causes and fixes differ. Leads that are never contacted are usually a process problem (no one is accountable), while late follow-ups are usually a capacity or prioritization problem. For the lost-revenue calculation, you can combine both as "not effectively followed up," since both reduce your chance of closing.',
            },
        },
    ],
    relatedSlugs: [
        'checklist-audit-kebocoran-leads',
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
