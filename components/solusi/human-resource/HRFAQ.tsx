"use client";

import { Box, Container, Typography, Stack, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLanguage } from "@/lib/context/LanguageContext";

const COPY = {
    id: {
        badge: "PERTANYAAN UMUM",
        title: "Pertanyaan Seputar SmartSales untuk Tim HR",
        subtitle: "Hal-hal yang biasa ditanyakan tim HRD sebelum mulai menggunakan sistem tiket internal dan rekrutmen SmartSales.",
        faqs: [
            {
                q: "Apa itu HR Helpdesk di SmartSales?",
                a: "HR Helpdesk adalah sistem tiket internal yang mengubah pertanyaan atau keluhan karyawan (soal payroll, cuti, fasilitas kantor, dll) menjadi tiket terlacak, bukan sekadar chat WhatsApp pribadi yang mudah terlewat."
            },
            {
                q: "Bagaimana karyawan mengirim keluhan atau pertanyaan ke HR?",
                a: "Karyawan bisa mengirim pesan lewat Email atau nomor WhatsApp khusus HR yang sudah terhubung ke sistem. Setiap pesan yang masuk otomatis menjadi tiket tugas yang bisa ditugaskan ke staf Payroll, General Affair, atau Manajemen."
            },
            {
                q: "Apakah SmartSales bisa membantu proses rekrutmen?",
                a: "Bisa. SmartSales menyediakan pipeline rekrutmen berbentuk papan Kanban (mirip ATS sederhana) untuk memindahkan kandidat dari tahap Screening, Interview HR, Interview User, hingga Offering, lengkap dengan penyimpanan CV dan catatan interview."
            },
            {
                q: "Apakah data CV dan catatan interview kandidat aman?",
                a: "Data kandidat tersimpan di sistem multi-tenant SmartSales dengan akses yang dibatasi hanya untuk pengguna yang diberi izin di perusahaan Anda, bukan dokumen bebas di email atau folder pribadi staf HR."
            },
            {
                q: "Bisakah HR mengirim pengumuman ke seluruh karyawan sekaligus?",
                a: "Ya. Tim HR bisa mengirim broadcast lewat WhatsApp Business API atau Email ke seluruh karyawan atau segmen tertentu, misalnya pengumuman libur, jadwal shift, atau link e-payslip."
            },
            {
                q: "Apakah ada SLA atau batas waktu penyelesaian tiket keluhan?",
                a: "Bisa diterapkan. Tim HR dapat mengatur SLA (batas waktu resolusi) untuk tiap kategori tiket, sehingga keluhan karyawan seperti klaim asuransi atau pertanyaan slip gaji tidak menggantung tanpa kepastian."
            },
            {
                q: "Apakah sistem ini menggantikan aplikasi HRIS/payroll yang sudah kami pakai?",
                a: "Tidak. SmartSales fokus pada komunikasi dan tiket internal (helpdesk karyawan, rekrutmen, broadcast), bukan penggajian atau absensi. Sistem ini melengkapi HRIS yang sudah ada, bukan menggantikannya."
            },
            {
                q: "Berapa biaya berlangganan untuk tim HR?",
                a: "Biaya tergantung jumlah pengguna dan modul yang dipakai (Helpdesk, Rekrutmen, Broadcast). Detail paket dan harga terbaru bisa dilihat di halaman Harga."
            },
            {
                q: "Apakah kami bisa mencoba sebelum berlangganan?",
                a: "Bisa. Anda dapat memulai uji coba gratis untuk melihat langsung bagaimana tiket keluhan karyawan dan pipeline rekrutmen bekerja sebelum memutuskan berlangganan."
            },
            {
                q: "Apakah tampilan dan alur kerja bisa disesuaikan dengan struktur HR kami?",
                a: "Bisa. Kategori tiket, tahapan pipeline rekrutmen, dan tim penerima eskalasi (Payroll, GA, Manajemen) dapat disesuaikan dengan struktur organisasi perusahaan Anda karena SmartSales dibangun sebagai custom build multi-tenant."
            },
            {
                q: "Apakah karyawan perlu menginstal aplikasi khusus?",
                a: "Tidak. Karyawan cukup mengirim pesan lewat WhatsApp atau Email seperti biasa. Semua pengelolaan tiket, pipeline, dan broadcast dilakukan tim HR dari dashboard SmartSales."
            },
            {
                q: "Berapa lama proses implementasi untuk tim HR?",
                a: "Waktu implementasi tergantung kompleksitas kategori tiket dan integrasi WhatsApp/Email yang dibutuhkan. Tim kami akan membahas kebutuhan spesifik saat sesi konsultasi awal."
            }
        ]
    },
    en: {
        badge: "FREQUENTLY ASKED QUESTIONS",
        title: "Questions About SmartSales for HR Teams",
        subtitle: "Common questions HR teams ask before adopting SmartSales' internal ticketing and recruitment system.",
        faqs: [
            {
                q: "What is the HR Helpdesk in SmartSales?",
                a: "HR Helpdesk is an internal ticketing system that turns employee questions or complaints (payroll, leave, office facilities, etc.) into trackable tickets instead of personal WhatsApp chats that are easy to lose."
            },
            {
                q: "How do employees send complaints or questions to HR?",
                a: "Employees can send a message via Email or a dedicated HR WhatsApp number connected to the system. Every incoming message automatically becomes a task ticket that can be assigned to Payroll, General Affairs, or Management."
            },
            {
                q: "Can SmartSales help with the recruitment process?",
                a: "Yes. SmartSales provides a Kanban-style recruitment pipeline (a simple ATS) to move candidates through Screening, HR Interview, User Interview, and Offering stages, with CV storage and interview notes attached to each profile."
            },
            {
                q: "Is candidate CV and interview data safe?",
                a: "Candidate data is stored in SmartSales' multi-tenant system with access restricted to authorized users in your company, instead of loose documents in personal email or folders."
            },
            {
                q: "Can HR send announcements to all employees at once?",
                a: "Yes. HR can send broadcasts via WhatsApp Business API or Email to all employees or a specific segment, such as holiday announcements, shift schedules, or e-payslip links."
            },
            {
                q: "Is there an SLA or deadline for resolving complaint tickets?",
                a: "It can be configured. HR can set an SLA (resolution time limit) per ticket category, so employee complaints like insurance claims or payslip questions don't stay unresolved."
            },
            {
                q: "Does this replace our existing HRIS/payroll application?",
                a: "No. SmartSales focuses on internal communication and ticketing (employee helpdesk, recruitment, broadcasts), not payroll or attendance. It complements your existing HRIS rather than replacing it."
            },
            {
                q: "How much does it cost for an HR team?",
                a: "Pricing depends on the number of users and modules used (Helpdesk, Recruitment, Broadcast). See the Pricing page for current package details."
            },
            {
                q: "Can we try it before subscribing?",
                a: "Yes. You can start a free trial to see how employee complaint ticketing and the recruitment pipeline work before committing to a subscription."
            },
            {
                q: "Can the workflow be customized to our HR structure?",
                a: "Yes. Ticket categories, recruitment pipeline stages, and escalation teams (Payroll, GA, Management) can be tailored to your organization since SmartSales is built as a multi-tenant custom build."
            },
            {
                q: "Do employees need to install a special app?",
                a: "No. Employees simply send a message via WhatsApp or Email as usual. All ticket, pipeline, and broadcast management is handled by the HR team from the SmartSales dashboard."
            },
            {
                q: "How long does implementation take for an HR team?",
                a: "Implementation time depends on the complexity of ticket categories and the WhatsApp/Email integrations needed. Our team will discuss your specific needs during the initial consultation."
            }
        ]
    }
};

export default function HRFAQ() {
    const { language } = useLanguage();
    const t = COPY[language];

    return (
        <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: 'var(--surface-alt)' }}>
            <Container maxWidth="md">
                <Stack spacing={2} sx={{ mb: 8, textAlign: 'center' }}>
                    <Typography
                        variant="overline"
                        sx={{ color: '#6366F1', fontWeight: 800, letterSpacing: 2, display: 'block' }}
                    >
                        {t.badge}
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            color: '#0F172A',
                            lineHeight: 1.2
                        }}
                    >
                        {t.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748B', fontSize: '1.05rem', maxWidth: '640px', mx: 'auto' }}>
                        {t.subtitle}
                    </Typography>
                </Stack>

                <Stack spacing={2}>
                    {t.faqs.map((item, index) => (
                        <Accordion
                            key={index}
                            elevation={0}
                            disableGutters
                            sx={{
                                border: '1px solid #E2E8F0',
                                borderRadius: '16px !important',
                                overflow: 'hidden',
                                '&:before': { display: 'none' },
                                '&.Mui-expanded': { borderColor: '#597CFF' }
                            }}
                        >
                            <AccordionSummary
                                id={`faq-summary-${index}`}
                                aria-controls={`faq-panel-${index}`}
                                expandIcon={<ExpandMoreIcon sx={{ color: 'var(--brand-deep)' }} />}
                                sx={{ px: 3, py: 1 }}
                            >
                                <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: '1rem' }}>
                                    {item.q}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails id={`faq-panel-${index}`} aria-labelledby={`faq-summary-${index}`} sx={{ px: 3, pb: 3 }}>
                                <Typography sx={{ color: '#64748B', lineHeight: 1.7, fontSize: '0.95rem' }}>
                                    {item.a}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Stack>
            </Container>
        </Box>
    );
}
