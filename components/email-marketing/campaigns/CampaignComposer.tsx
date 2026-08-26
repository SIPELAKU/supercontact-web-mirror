"use client";

// components/email-marketing/campaigns/CampaignComposer.tsx
//
// Writing an email is a long task, and it used to happen inside a dialog —
// a 674-line AddCampaignModal and a 708-line EditCampaignModal, each with a
// "Focus Mode" that went fullscreen and hid the surrounding fields. That
// toggle was the tell: the work had already outgrown a modal. Closing it lost
// everything, and validation worked by string-matching the error message
// (`error.includes("SMTP")`) to decide which field to paint red.
//
// This is the same form as a page: real per-field errors, a draft that
// survives a refresh, and no fullscreen trick because it is already full size.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowLeft, Save, Send } from "lucide-react";

import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { ApiErrorDisplay } from "@/components/ui/api-error-display";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import PageHeader from "@/components/ui/page-header";
import EmailTabbedEditor, { EmailTabbedEditorRef } from "./EmailTabbedEditor";
import RecipientPicker, { RecipientSource } from "./RecipientPicker";
import { useMailServers } from "@/lib/hooks/useMailServers";
import { notify } from "@/lib/notifications";
import { Campaign } from "@/lib/types/email-marketing";

export interface CampaignDraft {
  subject: string;
  htmlContent: string;
  recipientSource: RecipientSource;
  mailingListIds: string[];
  subscriberIds: string[];
  mailServerId: string;
}

export interface CampaignSubmitPayload extends CampaignDraft {
  action: "draft" | "send";
  editorType: "simple_editor" | "visual_builder";
}

interface CampaignComposerProps {
  mode: "create" | "edit";
  /** Existing campaign when editing; the form seeds itself from it. */
  campaign?: Campaign | null;
  isLoading?: boolean;
  isSaving: boolean;
  /** Field-level errors returned by the API, if any. */
  apiErrors?: any[] | null;
  onSubmit: (payload: CampaignSubmitPayload) => Promise<void>;
}

type FieldErrors = Partial<
  Record<"subject" | "mailServer" | "content" | "recipients", string>
>;

const DRAFT_STORAGE_KEY = "email-marketing:campaign-draft:new";

const EMPTY_DRAFT: CampaignDraft = {
  subject: "",
  htmlContent: "",
  recipientSource: "mailing_list",
  mailingListIds: [],
  subscriberIds: [],
  mailServerId: "",
};

export function CampaignComposer({
  mode,
  campaign,
  isLoading,
  isSaving,
  apiErrors,
  onSubmit,
}: CampaignComposerProps) {
  const router = useRouter();
  const editorRef = useRef<EmailTabbedEditorRef>(null);

  const [draft, setDraft] = useState<CampaignDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [seeded, setSeeded] = useState(mode === "create");
  const [dirty, setDirty] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [restoredDraft, setRestoredDraft] = useState(false);

  const { data: mailServersData, isLoading: isLoadingMailServers } = useMailServers(1, 100);
  const mailServers = mailServersData?.data?.mail_servers || [];

  const set = useCallback(<K extends keyof CampaignDraft>(key: K, value: CampaignDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

  // ── Seed from the campaign being edited ──────────────────────────────────
  useEffect(() => {
    if (mode !== "edit" || !campaign || seeded) return;
    setDraft({
      subject: campaign.subject || "",
      htmlContent: campaign.html_content || "",
      recipientSource: (campaign.recipient_source as RecipientSource) || "mailing_list",
      mailingListIds: campaign.mailing_list_ids || [],
      subscriberIds: campaign.contact_ids || [],
      mailServerId: campaign.mail_server_id || "",
    });
    setSeeded(true);
  }, [mode, campaign, seeded]);

  // ── Draft autosave (create only) ─────────────────────────────────────────
  // Editing an existing campaign already has server-side persistence via
  // "Save as Draft"; caching that locally would risk resurrecting stale copy
  // over someone else's edit.
  useEffect(() => {
    if (mode !== "create") return;
    try {
      const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as CampaignDraft;
      if (saved.subject || saved.htmlContent) {
        setDraft({ ...EMPTY_DRAFT, ...saved });
        setRestoredDraft(true);
      }
    } catch {
      // A malformed draft is not worth surfacing — start clean.
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== "create" || !dirty) return;
    const handle = window.setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } catch {
        // Private mode / quota — autosave is a convenience, never a blocker.
      }
    }, 800);
    return () => window.clearTimeout(handle);
  }, [mode, draft, dirty]);

  const clearStoredDraft = useCallback(() => {
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  // ── Validation, per field ────────────────────────────────────────────────
  const validate = (action: "draft" | "send", html: string): FieldErrors => {
    const next: FieldErrors = {};
    if (!draft.subject.trim()) next.subject = "Subject is required";

    if (action === "send") {
      if (!html.trim()) next.content = "Write the email content before sending";
      if (draft.recipientSource === "mailing_list" && draft.mailingListIds.length === 0) {
        next.recipients = "Select at least one mailing list";
      }
      if (draft.recipientSource === "subscriber" && draft.subscriberIds.length === 0) {
        next.recipients = "Select at least one subscriber";
      }
    }
    return next;
  };

  const handleSubmit = async (action: "draft" | "send") => {
    let html = draft.htmlContent;
    if (editorRef.current) {
      const result = await editorRef.current.exportContent();
      if (result && result.html) html = result.html;
    }
    const editorType = editorRef.current?.getEditorType() || "simple_editor";

    const fieldErrors = validate(action, html);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      notify.error("Please fix the highlighted fields", {
        description: Object.values(fieldErrors)[0],
      });
      return;
    }

    await onSubmit({ ...draft, htmlContent: html, action, editorType });
    if (mode === "create") clearStoredDraft();
    setDirty(false);
  };

  const backHref = "/email-marketing/campaigns";
  const leave = () => router.push(backHref);
  const handleBack = () => (dirty ? setConfirmLeave(true) : leave());

  const platformSender = mailServersData?.data?.platform_sender;

  // An empty value means "whatever this company sends through", which the
  // backend resolves at send time - so it follows the tenant's choice instead
  // of pinning the campaign to a row that may stop being the default.
  const mailServerOptions = useMemo(() => {
    const options = mailServers.map((server: any) => ({
      value: server.id,
      label: `${server.name} (${server.from_email})`,
    }));
    // Gated on `selected`, not `available`: the backend only routes through the
    // platform sender for companies that actually chose it, so offering it to
    // everyone would be an option that silently does nothing.
    if (platformSender?.selected) {
      options.unshift({
        value: "",
        label: `Pengirim default perusahaan (${platformSender.from_email})`,
      });
    }
    return options;
  }, [mailServers, platformSender]);

  const recipientCount =
    draft.recipientSource === "mailing_list"
      ? draft.mailingListIds.length
      : draft.subscriberIds.length;

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-24 space-y-6">
      <PageHeader
        title={mode === "create" ? "New Campaign" : "Edit Campaign"}
        description={
          mode === "create"
            ? "Write your email, choose who receives it, then save it as a draft or send it."
            : "Draft and failed campaigns can be edited and re-sent."
        }
        breadcrumbs={[
          { label: "Email Marketing", href: "/email-marketing" },
          { label: "Campaigns", href: backHref },
          { label: mode === "create" ? "New" : "Edit" },
        ]}
        actions={
          <AppButton
            variantStyle="outline"
            color="gray"
            startIcon={<ArrowLeft size={16} />}
            onClick={handleBack}
          >
            Back
          </AppButton>
        }
      />

      {restoredDraft && (
        <Alert
          severity="info"
          action={
            <AppButton
              variantStyle="text"
              onClick={() => {
                clearStoredDraft();
                setDraft(EMPTY_DRAFT);
                setRestoredDraft(false);
                setDirty(false);
              }}
            >
              Start fresh
            </AppButton>
          }
        >
          We restored an unsent draft from this browser.
        </Alert>
      )}

      {apiErrors && apiErrors.length > 0 && (
        <Alert severity="error">
          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
            The server rejected this campaign:
          </Typography>
          <ApiErrorDisplay errors={apiErrors} maxHeight="150px" />
        </Alert>
      )}

      {isLoading ? (
        <Paper variant="outlined" sx={{ p: 6, borderRadius: 3, textAlign: "center" }}>
          <Typography color="text.secondary">Loading campaign…</Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 380px" },
            gap: 3,
            alignItems: "start",
          }}
        >
          {/* ── Left: the email itself ── */}
          <Stack spacing={3} sx={{ minWidth: 0 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <AppInput
                label="Email subject"
                required
                id="email-subject"
                placeholder="What will land in the inbox?"
                value={draft.subject}
                onChange={(e) => {
                  set("subject", e.target.value);
                  if (errors.subject) setErrors((p) => ({ ...p, subject: undefined }));
                }}
                fullWidth
                isBgWhite
                error={Boolean(errors.subject)}
                helperText={errors.subject}
              />
            </Paper>

            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Email content
              </Typography>
              <EmailTabbedEditor
                ref={editorRef}
                value={draft.htmlContent}
                onChange={(html) => set("htmlContent", html)}
                isLoading={isSaving}
                height="620px"
              />
              {errors.content && (
                <Typography variant="body2" sx={{ color: "error.main", mt: 1 }}>
                  {errors.content}
                </Typography>
              )}
            </Paper>
          </Stack>

          {/* ── Right: who it goes to, and from where ── */}
          <Stack spacing={3} sx={{ minWidth: 0, position: { lg: "sticky" }, top: { lg: 24 } }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Send from
              </Typography>
              <AppSelect
                placeholder={isLoadingMailServers ? "Loading mail servers…" : "Pengirim default perusahaan"}
                value={draft.mailServerId}
                onChange={(e) => {
                  set("mailServerId", e.target.value as string);
                  if (errors.mailServer) setErrors((p) => ({ ...p, mailServer: undefined }));
                }}
                options={mailServerOptions}
                isBgWhite
                error={Boolean(errors.mailServer)}
                helperText={errors.mailServer}
              />
              <Alert severity="info" sx={{ mt: 1.5, "& .MuiAlert-message": { fontSize: "0.8rem" } }}>
                {draft.mailServerId
                  ? "Delivery, open and click tracking depend on the SMTP server you pick — some servers report none of it."
                  : platformSender?.available
                    ? `Dikirim lewat pengirim default perusahaan — saat ini ${platformSender.from_email}. Penerima melihat alamat itu, dan campaign ikut berubah kalau default perusahaan diganti.`
                    : "Belum ada pengirim. Tambahkan mail server di Settings › Email › Servers, atau pakai pengirim platform."}
              </Alert>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Recipients
                </Typography>
                {recipientCount > 0 && (
                  <Chip size="small" color="primary" label={`${recipientCount} selected`} />
                )}
              </Box>
              <RecipientPicker
                source={draft.recipientSource}
                onSourceChange={(source) => {
                  set("recipientSource", source);
                  setErrors((p) => ({ ...p, recipients: undefined }));
                }}
                selectedMailingLists={draft.mailingListIds}
                onMailingListsChange={(ids) => {
                  set("mailingListIds", ids);
                  if (errors.recipients) setErrors((p) => ({ ...p, recipients: undefined }));
                }}
                selectedSubscribers={draft.subscriberIds}
                onSubscribersChange={(ids) => {
                  set("subscriberIds", ids);
                  if (errors.recipients) setErrors((p) => ({ ...p, recipients: undefined }));
                }}
                error={errors.recipients}
              />
            </Paper>
          </Stack>
        </Box>
      )}

      {/* Sticky action bar — the two decisions are always reachable, however
          long the email gets. */}
      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          zIndex: 5,
          mt: 3,
          px: 2,
          py: 1.5,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {dirty ? "Unsaved changes" : mode === "create" ? "Nothing written yet" : "No changes"}
        </Typography>
        <Stack direction="row" spacing={1}>
          <AppButton variantStyle="outline" color="gray" onClick={handleBack} disabled={isSaving}>
            Cancel
          </AppButton>
          <AppButton
            variantStyle="outline"
            startIcon={<Save size={16} />}
            onClick={() => handleSubmit("draft")}
            isLoading={isSaving}
          >
            Save as Draft
          </AppButton>
          <AppButton
            variantStyle="primary"
            startIcon={<Send size={16} />}
            onClick={() => handleSubmit("send")}
            isLoading={isSaving}
          >
            {mode === "create" ? "Create & Send" : "Save & Send"}
          </AppButton>
        </Stack>
      </Box>

      <ConfirmationPopup
        isOpen={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        onConfirm={() => {
          setConfirmLeave(false);
          leave();
        }}
        title="Leave without saving?"
        description="Your changes to this campaign have not been saved yet."
        confirmText="Leave"
        cancelText="Keep editing"
        variant="discard"
      />
    </div>
  );
}

export default CampaignComposer;
