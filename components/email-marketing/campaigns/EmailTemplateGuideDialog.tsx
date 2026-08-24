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
    { ok: true, text: "All layout (rows, columns, card grids) uses <table>/<tr>/<td>", why: "The only layout primitive supported by nearly every email client" },
    { ok: true, text: "Images use external URLs (https://...), not data:image/...;base64,...", why: "Outlook desktop and some mail gateways block/strip base64 images" },
    { ok: true, text: "Every <img> has explicit width, height, and alt", why: "Prevents layout jumps and meaningless empty images when blocked" },
    { ok: true, text: "Solid color as a fallback for every gradient", why: "Outlook desktop does not support CSS gradients at all" },
    { ok: false, text: "Do not use display:flex / display:grid for layout", why: "Not reliably supported by any email client" },
    { ok: false, text: "Do not use backdrop-filter, CSS custom properties, position:fixed", why: "Email rendering engines do not understand these modern CSS features" },
    { ok: false, text: "Do not rely on <style> blocks for anything critical", why: "Many clients strip <style> entirely" },
    { ok: false, text: "Do not paste \"Custom HTML\" sections built with your own flex/grid", why: "These sections are not auto-converted by the builder into an email-safe format" },
];

export default function EmailTemplateGuideDialog({ open, onClose }: EmailTemplateGuideDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <BookOpen size={22} />
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                        Email-Safe Template Guide
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        So your campaign renders cleanly in every mailbox, not just in the preview
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                <Box sx={{ bgcolor: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 2, p: 2, mb: 1 }}>
                    <Typography variant="body2" sx={{ color: "#9A3412" }}>
                        <strong>Golden rule:</strong> An email is not a web page. Gmail, Outlook, and Apple Mail
                        use rendering engines far more limited than a browser — Outlook desktop even
                        renders HTML with Microsoft Word. If a template is written like a modern web page
                        (flexbox, grid, CSS classes in <code>&lt;style&gt;</code>), it can end up as plain text
                        with no styling at all in many mailboxes.
                    </Typography>
                </Box>

                <SectionTitle>Quick Checklist</SectionTitle>
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

                <SectionTitle>Layout: Tables, Not Flexbox/Grid</SectionTitle>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Common example: a header with the logo on the left and a badge on the right.
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Chip label="Wrong" size="small" color="error" variant="outlined" />
                    <Typography variant="caption" color="text.secondary">
                        elements fall onto separate lines in Gmail — display:flex is ignored
                    </Typography>
                </Box>
                <CodeBlock>{`<style>.header{display:flex;justify-content:space-between}</style>
<div class="header">
  <img src="https://.../logo.png" width="130" alt="Logo">
  <div class="header-tag">PROFESSIONAL SOCIAL NETWORK</div>
</div>`}</CodeBlock>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, mt: 2 }}>
                    <Chip label="Correct" size="small" color="success" variant="outlined" />
                    <Typography variant="caption" color="text.secondary">
                        aligned left-right in every client
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

                <SectionTitle>Flex/Grid → Table Conversion Patterns</SectionTitle>
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                                <TableCell sx={{ fontWeight: 700 }}>Flex/Grid Pattern</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Replace With</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>display:flex (items side by side)</TableCell>
                                <TableCell>&lt;table&gt;&lt;tr&gt;&lt;td&gt;1&lt;/td&gt;&lt;td&gt;2&lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>display:flex; flex-direction:column</TableCell>
                                <TableCell>&lt;table&gt;&lt;tr&gt;&lt;td&gt;1&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td&gt;2&lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>display:grid; grid-template-columns:1fr 1fr</TableCell>
                                <TableCell>&lt;td width="50%"&gt; per card, in one &lt;tr&gt;</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>flex:1 (equal widths)</TableCell>
                                <TableCell>width="50%" directly on the &lt;td&gt;</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>gap:12px</TableCell>
                                <TableCell>empty &lt;td&gt; as a spacer, or padding on each &lt;td&gt;</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>justify-content:center / align-items:center</TableCell>
                                <TableCell>align="center" / valign="middle" on the &lt;td&gt;</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                <SectionTitle>Images &amp; Gradients</SectionTitle>
                <Typography variant="body2" color="text.secondary" component="div" sx={{ "& ul": { pl: 2.5, m: 0 }, "& li": { mb: 0.5 } }}>
                    <ul>
                        <li>Host images at a public URL (Vercel Blob, S3, CDN) — never base64. Base64 is also prone to truncation when saved.</li>
                        <li>Set <code>width</code>, <code>height</code>, and <code>alt</code> on every <code>&lt;img&gt;</code>.</li>
                        <li>Do not put important text inside images — many clients block images until the user clicks &quot;show images&quot;.</li>
                        <li>Gradients (<code>linear-gradient</code>) are not supported by Outlook desktop — always write a solid <code>background-color</code> first as a fallback, then <code>background: linear-gradient(...)</code>.</li>
                    </ul>
                </Typography>

                <SectionTitle>Using the Visual Builder?</SectionTitle>
                <Typography variant="body2" color="text.secondary">
                    The &quot;Visual Builder&quot; tab above automatically generates safe, table-based HTML — use
                    its built-in blocks/columns for all layout needs. If you need to add manual HTML,
                    follow the table patterns above; do not paste <code>&lt;div&gt;</code>s with modern flex/grid CSS.
                </Typography>

                <SectionTitle>Before Sending in Bulk</SectionTitle>
                <Typography variant="body2" color="text.secondary" component="div" sx={{ "& ol": { pl: 2.5, m: 0 }, "& li": { mb: 0.5 } }}>
                    <ol>
                        <li>Send a test to a personal Gmail account first — the dashboard preview does not represent real email client rendering.</li>
                        <li>If possible, also check in Outlook and Apple Mail.</li>
                        <li>Open it on a phone too, not just desktop.</li>
                    </ol>
                </Typography>

                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                    The system automatically inlines CSS (colors, backgrounds, spacing) before the email is sent —
                    but this does <strong>not</strong> fix flex/grid layout structure. Correct layout remains
                    the template author&apos;s responsibility.
                </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <AppButton onClick={onClose} variantStyle="primary">
                    Got It
                </AppButton>
            </DialogActions>
        </Dialog>
    );
}
