// src/components/apps/campaigns/modal/AddCampaignModal.tsx

import { useState, useEffect, useRef } from 'react'; // Import useRef
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid,
  TextField, CircularProgress, Alert, Autocomplete, Checkbox, FormControl,
  InputLabel, Select, MenuItem, Box, Typography, ToggleButtonGroup, ToggleButton,
  FormHelperText,
  InputAdornment,
  Divider // <-- Tambahkan Divider
} from '@mui/material';
import axios from 'src/api/axios';
import toast from 'react-hot-toast';

// ✅ KITA IMPOR KEMBALI RICH TEXT EDITOR
import RichTextEditor from 'src/components/forms/RichTextEditor';

// ✅ PERBAIKAN IMPORT:
// Impor 'default' sebagai 'EmailEditor' (ini adalah KOMPONEN/VALUE)
// Impor 'named export' 'EditorRef' (sebagai TIPE untuk ref)
import EmailEditor, { EditorRef } from 'react-email-editor';

// --- TAMBAHAN: Impor template JSON Anda ---
import { welcomeTemplate, productPromoTemplate, newsletterTemplate } from 'src/templates/email-templates';

import { Contact } from 'src/types/apps/contacts';
import { MailingList } from 'src/types/apps/campaigns';
import {
  IconUser, IconUsers, IconCircleCheck, IconAlertCircle, IconHelpCircle,
  IconArticle, IconLayout, IconDownload,
  IconSparkles // <-- Ikon AI
} from '@tabler/icons-react'; // Tambah ikon
import { MailServer } from 'src/types/apps/mailServer';

type MailServerOption = Pick<MailServer, 'id' | 'name' | 'x_studio_last_test_status'>;

interface AddCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// --- Tipe Kustom untuk Template ---
type UnlayerTemplate = {
  counters: object;
  body: object;
  schemaVersion?: number;
};

const AddCampaignModal = ({ open, onClose, onSuccess }: AddCampaignModalProps) => {
  const [subject, setSubject] = useState('');
  const [mailServerId, setMailServerId] = useState<number | string>('');
  const [recipientType, setRecipientType] = useState<'contacts' | 'lists'>('contacts');
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [selectedLists, setSelectedLists] = useState<MailingList[]>([]);
  const [contactOptions, setContactOptions] = useState<Contact[]>([]);
  const [listOptions, setListOptions] = useState<MailingList[]>([]);
  const [mailServerOptions, setMailServerOptions] = useState<MailServerOption[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<'send' | 'draft'>('send');
  const [error, setError] = useState('');

  // --- State Editor ---
  const [editorMode, setEditorMode] = useState<'simple' | 'visual'>('simple');
  const [simpleHtml, setSimpleHtml] = useState(''); // Untuk RichTextEditor
  const emailEditorRef = useRef<EditorRef>(null);

  // --- State AI (Disederhanakan) ---
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  // ------------------------------------

  const resetState = () => {
    setSubject(''); setMailServerId(''); setRecipientType('contacts');
    setSelectedContacts([]); setSelectedLists([]); setContactOptions([]); setListOptions([]);
    setMailServerOptions([]); setError(''); setIsSubmitting(false); setIsLoadingData(true);

    // Reset state editor
    setEditorMode('simple');
    setSimpleHtml('');

    // Reset state AI
    setAiPrompt('');
    setIsGenerating(false);
  };

  useEffect(() => {
    if (open) {
      resetState(); // Panggil reset state di sini
      const fetchData = async () => {
        setIsLoadingData(true); // Set loading true
        try {
          const [contactsRes, listsRes, serversRes] = await Promise.all([
            axios.get('/contacts/for-selection'),
            axios.get('/marketing/mailing-lists'),
            axios.get('/mail-servers/for-selection'),
          ]);

          const contactData: Contact[] = Array.isArray(contactsRes.data)
            ? contactsRes.data
            : (contactsRes.data?.contacts || []);

          const listData: MailingList[] = Array.isArray(listsRes.data?.lists)
            ? listsRes.data.lists
            : [];

          const serverData: MailServerOption[] = Array.isArray(serversRes.data)
            ? serversRes.data
            : (serversRes.data?.servers || []);

          setContactOptions(contactData);
          setListOptions(listData);
          setMailServerOptions(serverData);

          const defaultServer = serverData.find(s => s.name.toLowerCase().includes('superjob'));
          const firstSuccessfulServer = serverData.find(s => s.x_studio_last_test_status === 'success');

          if (defaultServer) {
            setMailServerId(defaultServer.id);
          } else if (firstSuccessfulServer) {
            setMailServerId(firstSuccessfulServer.id);
          } else if (serverData.length > 0) {
            setMailServerId(serverData[0].id);
          }

        } catch (err: any) {
          console.error("Error fetching initial data:", err);
          toast.error("Gagal memuat data awal untuk form kampanye.");
          onClose(); // Tutup modal jika data gagal dimuat
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchData();
    }
  }, [open, onClose]);

  // --- PERBAIKAN UX: Kunci modal saat AI bekerja ---
  const handleClose = () => {
    if (!isGenerating && !isSubmitting) {
      onClose();
    }
  };

  // --- FUNGSI AI: Disederhanakan ---
  const handleAiGenerate = async () => {
    const promptText = aiPrompt.trim();
    const subjectText = subject.trim();

    if (!promptText && !subjectText) {
      toast.error('Harap isi Subjek atau ide desain AI Anda.');
      return;
    }

    setIsGenerating(true);
    setError('');

    // Membuat "Super-Prompt" yang lebih baik
    const finalPrompt = `
      Buat draf email marketing yang profesional dan persuasif.
      Subjek Email (gunakan sebagai inspirasi utama): "${subjectText || 'Belum ada subjek'}"
      Instruksi Tambahan / Poin Utama: "${promptText}"

      Tolong buatkan draf yang menarik, sertakan salam pembuka (contoh: Halo {{ contact.first_name }},)
      dan akhiri dengan satu Call to Action (Tombol) yang jelas.
    `;

    try {
      const response = await axios.post('/ai/generate-design', {
        prompt: finalPrompt
      });

      const generatedJson = response.data; // Ini adalah JSON

      // AI *harus* memaksa editor ke mode visual
      setEditorMode('visual');

      setTimeout(() => {
        if (emailEditorRef.current?.editor) {
          emailEditorRef.current.editor.loadDesign(generatedJson as any);
          toast.success('Desain berhasil dibuat oleh AI!');
        } else {
          // Coba lagi jika editor belum siap
          setTimeout(() => {
            if (emailEditorRef.current?.editor) {
              emailEditorRef.current.editor.loadDesign(generatedJson as any);
              toast.success('Desain berhasil dibuat oleh AI!');
            } else {
              toast.error('Gagal memuat desain ke editor visual.');
            }
          }, 500); // Penundaan tambahan
        }
      }, 100);

    } catch (err: any) {
      console.error("AI Generation error:", err);
      const errorMessage = err.response?.data?.detail || 'Gagal membuat desain AI.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadTemplate = (templateJson: UnlayerTemplate) => {
    // Memuat template juga harus memaksa mode visual
    setEditorMode('visual');
    setTimeout(() => {
      if (emailEditorRef.current?.editor) {
        emailEditorRef.current.editor.loadDesign(templateJson as any);
        // Otomatis set subjek jika memuat template
        if (templateJson === welcomeTemplate) setSubject('Selamat Datang di Layanan Kami!');
        if (templateJson === productPromoTemplate) setSubject('Promo Spesial Akhir Pekan!');
        if (templateJson === newsletterTemplate) setSubject('Newsletter Mingguan: [Judul Artikel]');
      } else {
        toast.error('Editor belum siap. Coba lagi sesaat.');
      }
    }, 100);
  };

  const handleSubmit = async (saveAsDraft: boolean) => {
    // Fungsi untuk mengambil HTML dari Visual Editor
    const getVisualEditorHtml = (): Promise<string> => {
      return new Promise((resolve, reject) => {
        if (emailEditorRef.current && emailEditorRef.current.editor) {
          emailEditorRef.current.editor.exportHtml((data: { design: object, html: string }) => {
            const { html } = data;
            resolve(html);
          });
        } else {
          reject("Editor reference not found or not loaded");
        }
      });
    };

    let finalHtml = '';

    if (editorMode === 'visual') {
      try {
        finalHtml = await getVisualEditorHtml();
        if (!finalHtml || finalHtml.trim() === "") {
          setError("Isi email wajib diisi."); return;
        }
      } catch (err: any) {
        console.error("Editor export error:", err);
        setError("Gagal memproses desain email. Pastikan editor sudah dimuat."); return;
      }
    } else {
      finalHtml = simpleHtml;
    }

    const hasContent = Boolean(finalHtml.trim());
    const hasRecipients = recipientType === 'contacts' ? selectedContacts.length > 0 : selectedLists.length > 0;
    const selectedServer = mailServerOptions.find(s => s.id === mailServerId);

    setError('');

    if (!saveAsDraft) {
      if (!subject.trim()) { setError("Subjek wajib diisi."); return; }
      if (!hasContent) { setError("Isi email wajib diisi."); return; }
      if (!hasRecipients) { setError("Penerima wajib dipilih (Kontak atau Mailing List)."); return; }
      if (!mailServerId) { setError("Server Email wajib dipilih."); return; }

      if (selectedServer && selectedServer.x_studio_last_test_status !== 'success') {
        setError("Server email yang dipilih belum lolos tes koneksi (bukan centang hijau). Anda hanya bisa 'Simpan Draft'.");
        return;
      }

    } else {
      if (!subject.trim() && !hasContent && !hasRecipients) {
        setError("Isi minimal subjek, isi/template, atau penerima untuk menyimpan draft."); return;
      }
    }

    setIsSubmitting(true);
    setSubmitAction(saveAsDraft ? 'draft' : 'send');

    try {
      const payload: any = {
        subject: subject || '(Tanpa Subjek)',
        mail_server_id: mailServerId ? Number(mailServerId) : null,
        save_as_draft: saveAsDraft,
        body_html: finalHtml,
        email_template_id: null,
        mailing_model_name: "res.partner"
      };

      if (recipientType === 'contacts' && selectedContacts.length > 0) {
        payload.contact_ids = selectedContacts.map(c => c.id);
      } else if (recipientType === 'lists' && selectedLists.length > 0) {
        payload.mailing_list_ids = selectedLists.map(l => l.id);
      } else if (!saveAsDraft) {
        setError("Penerima wajib dipilih.");
        setIsSubmitting(false);
        return;
      }

      const response = await axios.post(`/marketing/send`, payload);
      toast.success(response.data.msg);
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error("Submit campaign error:", err);
      const errorMessage = err.response?.data?.detail || 'Gagal membuat atau mengirim kampanye.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasRecipients = recipientType === 'contacts' ? selectedContacts.length > 0 : selectedLists.length > 0;
  const hasContent = editorMode === 'simple' ? Boolean(simpleHtml.trim()) : true;
  const isDraftButtonDisabled = !subject.trim() && !hasContent && !hasRecipients;
  const selectedServer = mailServerOptions.find(s => s.id === mailServerId);
  const isSendButtonDisabled =
    !subject.trim() ||
    !hasRecipients ||
    !mailServerId ||
    (selectedServer && selectedServer.x_studio_last_test_status !== 'success');

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogTitle>Buat Kampanye Email Baru</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {isLoadingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Subjek Email"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                fullWidth
                required
                disabled={isGenerating} // <-- Kunci saat AI bekerja
                error={Boolean(error && !subject.trim())}
                helperText={error && !subject.trim() ? "Subjek wajib diisi" : ""}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Penerima</Typography>
              <ToggleButtonGroup
                color="primary"
                value={recipientType}
                exclusive
                onChange={(_, newType) => { if (newType) setRecipientType(newType); }}
                fullWidth
                disabled={isGenerating} // <-- Kunci saat AI bekerja
              >
                <ToggleButton value="contacts"><IconUser style={{ marginRight: 8 }} /> Kontak Individual</ToggleButton>
                <ToggleButton value="lists"><IconUsers style={{ marginRight: 8 }} /> Mailing List</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={12}>
              {recipientType === 'contacts' ? (
                <Autocomplete
                  multiple
                  options={contactOptions}
                  disableCloseOnSelect
                  disabled={isGenerating} // <-- Kunci saat AI bekerja
                  getOptionLabel={(option) => `${option.name || 'No Name'} (${option.email || 'No Email'})`}
                  value={selectedContacts}
                  onChange={(_, newValue) => setSelectedContacts(newValue)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox checked={selected} />
                      {`${option.name || 'No Name'} (${option.email || 'No Email'})`}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Pilih Kontak"
                      placeholder="Cari kontak..."
                      error={Boolean(error && recipientType === 'contacts' && !hasRecipients)}
                      helperText={error && recipientType === 'contacts' && !hasRecipients ? "Pilih minimal satu kontak" : ""}
                    />
                  )}
                />
              ) : (
                <Autocomplete
                  multiple
                  options={listOptions}
                  disableCloseOnSelect
                  disabled={isGenerating} // <-- Kunci saat AI bekerja
                  getOptionLabel={(option) => `${option.name} (${option.contact_count})`}
                  value={selectedLists}
                  onChange={(_, newValue) => setSelectedLists(newValue)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox checked={selected} />
                      {`${option.name} (${option.contact_count} kontak)`}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Pilih Mailing List"
                      placeholder="Cari mailing list..."
                      error={Boolean(error && recipientType === 'lists' && !hasRecipients)}
                      helperText={error && recipientType === 'lists' && !hasRecipients ? "Pilih minimal satu mailing list" : ""}
                    />
                  )}
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required error={Boolean(error && !mailServerId)}>
                <InputLabel id="mail-server-select-label">Server Email</InputLabel>
                <Select
                  labelId="mail-server-select-label"
                  value={mailServerId}
                  label="Server Email *"
                  disabled={isGenerating} // <-- Kunci saat AI bekerja
                  onChange={(e) => setMailServerId(e.target.value)}
                  renderValue={(selected) => {
                    const server = mailServerOptions.find(s => s.id === selected);
                    if (!server) return <em>Pilih server...</em>;
                    const isDefault = server.name.toLowerCase().includes('superjob');
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {server.x_studio_last_test_status === 'success' && <IconCircleCheck size="1rem" color="green" />}
                        {server.x_studio_last_test_status === 'failed' && <IconAlertCircle size="1rem" color="red" />}
                        {(server.x_studio_last_test_status === 'none' || !server.x_studio_last_test_status) && <IconHelpCircle size="1rem" color="gray" />}
                        {server.name}
                        {isDefault && <Typography variant="caption" color="text.secondary">(Default)</Typography>}
                      </Box>
                    );
                  }}
                >
                  {mailServerOptions.length === 0 && <MenuItem value=""><em>Tidak ada server tersedia</em></MenuItem>}
                  {mailServerOptions.map((server) => {
                    const isDefault = server.name.toLowerCase().includes('superjob');
                    return (
                      <MenuItem key={server.id} value={server.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {server.x_studio_last_test_status === 'success' && <IconCircleCheck size="1rem" color="green" />}
                            {server.x_studio_last_test_status === 'failed' && <IconAlertCircle size="1rem" color="red" />}
                            {(server.x_studio_last_test_status === 'none' || !server.x_studio_last_test_status) && <IconHelpCircle size="1rem" color="gray" />}
                            {server.name}
                          </Box>
                          {isDefault && <Typography variant="caption" color="text.secondary">(Default)</Typography>}
                        </Box>
                      </MenuItem>
                    )
                  })}
                </Select>
                {error && !mailServerId ? (
                  <FormHelperText error>{error}</FormHelperText>
                ) : (
                  <FormHelperText component="div" sx={{ display: 'flex', alignItems: 'center', gap: 2, mx: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconCircleCheck size="1rem" color="green" />
                      <Typography variant="caption">Siap Kirim</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconAlertCircle size="1rem" color="red" />
                      <Typography variant="caption">Gagal Tes (Hanya Draft)</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconHelpCircle size="1rem" color="gray" />
                      <Typography variant="caption">Belum Dites (Hanya Draft)</Typography>
                    </Box>
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* --- PERBAIKAN TATA LETAK: KONTEN --- */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Konten Email</Typography>
              <ToggleButtonGroup
                color="primary"
                value={editorMode}
                exclusive
                onChange={(_, newMode) => { if (newMode) setEditorMode(newMode); }}
                fullWidth
                disabled={isGenerating} // <-- Kunci saat AI bekerja
              >
                <ToggleButton value="simple"><IconArticle style={{ marginRight: 8 }} /> Editor Sederhana</ToggleButton>
                <ToggleButton value="visual"><IconLayout style={{ marginRight: 8 }} /> Visual Builder (dengan AI)</ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            {editorMode === 'simple' ? (
              // --- TAMPILAN EDITOR SEDERHANA ---
              <Grid item xs={12}>
                <RichTextEditor
                  content={simpleHtml}
                  onUpdate={setSimpleHtml}
                  label="Isi Email"
                  hasError={Boolean(error && editorMode === 'simple' && !simpleHtml.trim())}
                />
                {error && editorMode === 'simple' && !simpleHtml.trim() && <Typography component="div" color="error" variant="caption" sx={{ ml: 2, mt: 1 }}>Isi email wajib diisi</Typography>}
              </Grid>
            ) : (
              // --- TAMPILAN VISUAL BUILDER (DENGAN AI) ---
              <Grid item xs={12} container spacing={2}>

                {/* 1. Baris Judul AI */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 0 }}>Buat Desain dengan AI</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Gunakan Subjek di atas dan tambahkan poin utama di bawah, lalu klik "Generate".
                  </Typography>
                </Grid>

                {/* 2. Baris Prompt AI */}
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Ide / Poin Utama (Opsional)"
                    placeholder="Contoh: diskon 50% untuk akhir pekan, kode: SALE50..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    disabled={isGenerating}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconSparkles size="1.2rem" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    fullWidth
                    onClick={handleAiGenerate}
                    disabled={isGenerating || (!subject.trim() && !aiPrompt.trim())}
                    sx={{ height: '100%', minHeight: '56px' }}
                    startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <IconSparkles size="1.1rem" />}
                  >
                    Generate
                  </Button>
                </Grid>

                {/* 3. Baris Pemisah "ATAU" */}
                <Grid item xs={12}>
                  <Divider sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="caption">ATAU</Typography>
                  </Divider>
                </Grid>

                {/* 4. Baris Load Template */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1.5 }}>Mulai dari Template</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<IconDownload size="1rem" />}
                      onClick={() => handleLoadTemplate(welcomeTemplate as UnlayerTemplate)}
                      disabled={isGenerating} // <-- Kunci saat AI bekerja
                    >
                      Welcome
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<IconDownload size="1rem" />}
                      onClick={() => handleLoadTemplate(productPromoTemplate as UnlayerTemplate)}
                      disabled={isGenerating} // <-- Kunci saat AI bekerja
                    >
                      Promo
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<IconDownload size="1rem" />}
                      onClick={() => handleLoadTemplate(newsletterTemplate as UnlayerTemplate)}
                      disabled={isGenerating} // <-- Kunci saat AI bekerja
                    >
                      Newsletter
                    </Button>
                  </Box>
                </Grid>

                {/* 5. Baris Editor Visual */}
                <Grid item xs={12} sx={{
                  height: '70vh', minHeight: '500px', display: 'flex', flexDirection: 'column', mt: 3
                }}>
                  <Box sx={{ flex: 1, border: '1px solid #ccc', overflow: 'hidden' }}>
                    <EmailEditor
                      ref={emailEditorRef}
                      minHeight="100%"
                    />
                  </Box>
                  {error && editorMode === 'visual' && <Typography component="div" color="error" variant="caption" sx={{ ml: 2, mt: 1 }}>Gagal memuat editor atau mengekspor HTML</Typography>}
                </Grid>
              </Grid>
            )}
            {/* ------------------------- */}
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px', justifyContent: 'space-between' }}>
        <Button onClick={handleClose} color="secondary" disabled={isSubmitting || isGenerating}>Batal</Button>
        <Box>
          <Button onClick={() => handleSubmit(true)} variant="outlined" disabled={isLoadingData || isSubmitting || isGenerating || isDraftButtonDisabled}>
            {isSubmitting && submitAction === 'draft' ? <CircularProgress size={24} color="inherit" /> : 'Simpan Draft'}
          </Button>
          <Button onClick={() => handleSubmit(false)} variant="contained" disabled={isLoadingData || isSubmitting || isGenerating || isSendButtonDisabled} sx={{ ml: 1 }}>
            {isSubmitting && submitAction === 'send' ? <CircularProgress size={24} color="inherit" /> : 'Buat & Kirim'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AddCampaignModal;