"use client";

import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Divider,
} from "@mui/material";
import { BookOpen, CheckCircle2, XCircle } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";

interface EmailTemplateGuideDialogProps {
    open: boolean;
    onClose: () => void;
}

const CodeBlock = ({ children }: { children: string }) => (
    <Box
        component="pre"
        sx={{
            bgcolor: "#0F172A",
            color: "#E2E8F0",
            p: 2,
            borderRadius: 2,
            overflowX: "auto",
            fontSize: "12.5px",
            fontFamily: "monospace",
            lineHeight: 1.6,
            my: 1.5,
        }}
    >
        {children}
    </Box>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>
        {children}
    </Typography>
);

const checklistItems: { ok: boolean; text: string; why: string }[] = [
    { ok: true, text: "Semua layout (baris, kolom, grid kartu) pakai <table>/<tr>/<td>", why: "Satu-satunya primitif layout yang didukung hampir semua email client" },
    { ok: true, text: "Gambar pakai URL eksternal (https://...), bukan data:image/...;base64,...", why: "Outlook desktop dan sebagian mail gateway memblokir/strip gambar base64" },
    { ok: true, text: "Tiap <img> punya width, height, dan alt eksplisit", why: "Mencegah layout \"loncat\" dan gambar kosong tanpa makna saat diblokir" },
    { ok: true, text: "Warna solid sebagai fallback untuk tiap gradient", why: "Outlook desktop tidak mendukung CSS gradient sama sekali" },
    { ok: false, text: "Jangan pakai display:flex / display:grid untuk layout", why: "Tidak didukung reliable oleh client email manapun" },
    { ok: false, text: "Jangan pakai backdrop-filter, CSS custom properties, position:fixed", why: "Fitur CSS modern ini tidak dikenal rendering engine email" },
    { ok: false, text: "Jangan andalkan <style> block untuk sesuatu yang kritikal", why: "Banyak client membuang <style> sepenuhnya" },
    { ok: false, text: "Jangan tempel section \"Custom HTML\" berisi flex/grid buatan sendiri", why: "Bagian ini tidak ikut ter-konversi otomatis oleh builder ke format email-safe" },
];

export default function EmailTemplateGuideDialog({ open, onClose }: EmailTemplateGuideDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <BookOpen size={22} />
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                        Panduan Template Email Aman
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Supaya campaign kamu tampil rapi di semua mailbox, bukan cuma di preview
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                <Box sx={{ bgcolor: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 2, p: 2, mb: 1 }}>
                    <Typography variant="body2" sx={{ color: "#9A3412" }}>
                        <strong>Aturan emas:</strong> Email bukan halaman web. Gmail, Outlook, dan Apple Mail
                        pakai rendering engine yang jauh lebih terbatas dari browser — Outlook desktop bahkan
                        merender HTML pakai Microsoft Word. Kalau template ditulis seperti halaman web modern
                        (flexbox, grid, CSS class di <code>&lt;style&gt;</code>), hasilnya bisa jadi teks polos
                        tanpa styling sama sekali di banyak mailbox.
                    </Typography>
                </Box>

                <SectionTitle>Checklist Cepat</SectionTitle>
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableBody>
                            {checklistItems.map((item, idx) => (
                                <TableRow key={idx}>
                                    <TableCell sx={{ width: 32, pr: 0 }}>
                                        {item.ok ? (
                                            <CheckCircle2 size={18} color="#16A34A" />
                                        ) : (
                                            <XCircle size={18} color="#DC2626" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {item.text}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {item.why}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <SectionTitle>Layout: Table, Bukan Flexbox/Grid</SectionTitle>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Contoh umum: header dengan logo di kiri dan badge di kanan.
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Chip label="Salah" size="small" color="error" variant="outlined" />
                    <Typography variant="caption" color="text.secondary">
                        elemen jatuh ke baris terpisah di Gmail — display:flex diabaikan
                    </Typography>
                </Box>
                <CodeBlock>{`<style>.header{display:flex;justify-content:space-between}</style>
<div class="header">
  <img src="https://.../logo.png" width="130" alt="Logo">
  <div class="header-tag">PROFESSIONAL SOCIAL NETWORK</div>
</div>`}</CodeBlock>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, mt: 2 }}>
                    <Chip label="Benar" size="small" color="success" variant="outlined" />
                    <Typography variant="caption" color="text.secondary">
                        sejajar kiri-kanan di semua client
                    </Typography>
                </Box>
                <CodeBlock>{`<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="left" valign="middle">
      <img src="https://.../logo.png" width="130" height="40" alt="Logo" style="display:block">
    </td>
    <td align="right" valign="middle">
      <div style="background:#E4FBF6;color:#0F9B8E;padding:6px 14px;border-radius:100px;display:inline-block">
        PROFESSIONAL SOCIAL NETWORK
      </div>
    </td>
  </tr>
</table>`}</CodeBlock>

                <SectionTitle>Pola Konversi Flex/Grid → Table</SectionTitle>
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                                <TableCell sx={{ fontWeight: 700 }}>Pola Flex/Grid</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Ganti Dengan</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>display:flex (beberapa item sejajar)</TableCell>
                                <TableCell>&lt;table&gt;&lt;tr&gt;&lt;td&gt;1&lt;/td&gt;&lt;td&gt;2&lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>display:flex; flex-direction:column</TableCell>
                                <TableCell>&lt;table&gt;&lt;tr&gt;&lt;td&gt;1&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td&gt;2&lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>display:grid; grid-template-columns:1fr 1fr</TableCell>
                                <TableCell>&lt;td width="50%"&gt; per kartu, satu &lt;tr&gt;</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>flex:1 (lebar sama rata)</TableCell>
                                <TableCell>width="50%" langsung di &lt;td&gt;</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>gap:12px</TableCell>
                                <TableCell>&lt;td&gt; kosong sebagai spacer, atau padding di tiap &lt;td&gt;</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>justify-content:center / align-items:center</TableCell>
                                <TableCell>align="center" / valign="middle" di &lt;td&gt;</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                <SectionTitle>Gambar &amp; Gradient</SectionTitle>
                <Typography variant="body2" color="text.secondary" component="div" sx={{ "& ul": { pl: 2.5, m: 0 }, "& li": { mb: 0.5 } }}>
                    <ul>
                        <li>Host gambar di URL publik (Vercel Blob, S3, CDN) — jangan base64. Base64 juga rawan terpotong saat disimpan.</li>
                        <li>Isi <code>width</code>, <code>height</code>, dan <code>alt</code> di setiap <code>&lt;img&gt;</code>.</li>
                        <li>Jangan taruh teks penting di dalam gambar — banyak client memblokir gambar sampai user klik &quot;tampilkan gambar&quot;.</li>
                        <li>Gradient (<code>linear-gradient</code>) tidak didukung Outlook desktop — selalu tulis <code>background-color</code> solid dulu sebagai fallback, baru <code>background: linear-gradient(...)</code>.</li>
                    </ul>
                </Typography>

                <SectionTitle>Pakai Visual Builder?</SectionTitle>
                <Typography variant="body2" color="text.secondary">
                    Tab &quot;Visual Builder&quot; di atas otomatis menghasilkan HTML table-based yang aman — pakai
                    block/kolom bawaannya untuk semua kebutuhan layout. Kalau perlu menambahkan HTML manual,
                    ikuti pola table di atas, jangan tempel <code>&lt;div&gt;</code> dengan CSS flex/grid modern.
                </Typography>

                <SectionTitle>Sebelum Kirim Massal</SectionTitle>
                <Typography variant="body2" color="text.secondary" component="div" sx={{ "& ol": { pl: 2.5, m: 0 }, "& li": { mb: 0.5 } }}>
                    <ol>
                        <li>Kirim test ke akun Gmail pribadi dulu — preview di dashboard tidak merepresentasikan rendering email client asli.</li>
                        <li>Kalau bisa, cek juga di Outlook dan Apple Mail.</li>
                        <li>Buka juga di HP, bukan cuma desktop.</li>
                    </ol>
                </Typography>

                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                    Sistem sudah otomatis meng-inline CSS (warna, background, spacing) sebelum email dikirim —
                    tapi ini <strong>tidak</strong> memperbaiki susunan layout flex/grid. Layout yang benar tetap
                    tanggung jawab pembuat template.
                </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <AppButton onClick={onClose} variantStyle="primary">
                    Mengerti
                </AppButton>
            </DialogActions>
        </Dialog>
    );
}
