"use client";

// Bot Playground - Fase A tester + Fase B tuning loop + Fase C go-live gate.
//
// The whole activation workflow lives on this one panel so nothing needs a
// manual setup trip elsewhere: test a question, and from the SAME exchange
// save it as a regression case, pin it onto the KB article that should have
// answered it, or apply the knobs you just tried to the stored config. The
// Go-Live tab then only unlocks once the readiness gate passes.

import React, { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Play,
  RotateCcw,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { AppDialog } from "@/components/ui/app-dialog";
import { AppTabs } from "@/components/ui/app-tabs";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import {
  useActivateBot,
  useAttachQuestionToArticle,
  useBotPlaygroundAsk,
  useBotReadiness,
  useBotShadow,
  useBotTestCases,
  useCreateBotTestCase,
  useDeleteBotTestCase,
  useReviewBotShadow,
  useRunBotTestSet,
} from "@/lib/hooks/useBotPlayground";
import {
  useUpdateWebWidgetConfig,
  useWebWidgetConfig,
} from "@/lib/hooks/useOmnichannel";
import { useKbArticles } from "@/lib/hooks/useKnowledge";
import type {
  BotPlaygroundAskResponse,
  BotPlaygroundOverrides,
  BotTestExpectation,
  ReadinessItem,
} from "@/lib/types/botPlayground";
import type { UpdateWebWidgetConfigRequest } from "@/lib/types/omnichannel";

interface BotPlaygroundPanelProps {
  accountId: string;
}

interface Exchange {
  id: number;
  question: string;
  result?: BotPlaygroundAskResponse;
  error?: string;
}

type TriState = "config" | "on" | "off";
type TabValue = "tester" | "testset" | "shadow" | "golive";

const SOURCE_LABEL: Record<string, { label: string; className: string }> = {
  llm: { label: "AI answer", className: "bg-emerald-100 text-emerald-700" },
  articles: { label: "Article list", className: "bg-blue-100 text-blue-700" },
  no_answer_text: { label: "No-answer text", className: "bg-amber-100 text-amber-700" },
  silence: { label: "Silence", className: "bg-red-100 text-red-700" },
  greeting: { label: "Greeting", className: "bg-violet-100 text-violet-700" },
};

function triToBool(v: TriState): boolean | undefined {
  return v === "config" ? undefined : v === "on";
}

function TriSelect({
  label,
  value,
  onChange,
  onLabel = "On",
  offLabel = "Off",
}: {
  label: string;
  value: TriState;
  onChange: (v: TriState) => void;
  onLabel?: string;
  offLabel?: string;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TriState)}
        className="h-8 rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-700"
      >
        <option value="config">Follow config</option>
        <option value="on">{onLabel}</option>
        <option value="off">{offLabel}</option>
      </select>
    </label>
  );
}

function ResultDetails({ result }: { result: BotPlaygroundAskResponse }) {
  const sales = result.sales;
  return (
    <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 flex flex-col gap-3">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <span>
          Confidence <strong>{result.confidence.toFixed(2)}</strong> (threshold{" "}
          {result.effective_config.min_confidence.toFixed(2)})
        </span>
        <span>
          Ranking <strong>{result.ranking_mode}</strong>
        </span>
        <span>
          LLM {result.used_llm ? "used" : result.llm_configured ? "not used" : "not configured"}
        </span>
        <span>{result.elapsed_ms} ms</span>
        {result.would_deflect && (
          <span className="text-emerald-700 font-medium">would deflect (no ticket until feedback)</span>
        )}
      </div>

      {result.articles.length > 0 && (
        <div>
          <p className="font-medium text-gray-800 mb-1">Matched articles</p>
          <ul className="flex flex-col gap-1.5">
            {result.articles.map((a) => (
              <li key={a.article_id}>
                <div className="flex items-center gap-2">
                  <span className="truncate">{a.title}</span>
                  <span className="text-gray-500 shrink-0">{a.rank.toFixed(2)}</span>
                  <span className="h-1.5 w-24 rounded bg-gray-200 overflow-hidden shrink-0">
                    <span
                      className="block h-full bg-blue-500"
                      style={{ width: `${Math.min(100, Math.round(a.rank * 100))}%` }}
                    />
                  </span>
                </div>
                {a.guardrails.length > 0 && (
                  <p className="text-gray-500">Guardrails: {a.guardrails.join("; ")}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="font-medium text-gray-800 mb-1">Sales layer</p>
        {!sales.effective ? (
          <p className="text-gray-500">
            Not running ({sales.platform_enabled ? "tenant has not opted in" : "platform switch off"}).
          </p>
        ) : !sales.applied ? (
          <p className="text-gray-500">Enabled but not applied to this answer.</p>
        ) : (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>
              State <strong>{sales.state}</strong>
            </span>
            <span>
              Stage <strong>{sales.stage}</strong>
            </span>
            <span>
              Score <strong>{sales.score?.toFixed(1) ?? "-"}</strong>
            </span>
            {sales.veto && <span className="text-red-600 font-medium">veto: {sales.veto}</span>}
            {sales.needs_human && <span className="text-amber-700 font-medium">needs human</span>}
            <span>selling {sales.selling_allowed ? "allowed" : "closed"}</span>
            {sales.signals.length > 0 && (
              <span className="w-full text-gray-500">
                Signals: {sales.signals.map((s) => `${s.id} ${s.name} (${s.weight > 0 ? "+" : ""}${s.weight})`).join(", ")}
              </span>
            )}
            {sales.forbidden_matches.length > 0 && (
              <span className="w-full text-red-600">
                Forbidden technique in reply: {sales.forbidden_matches.map((f) => `${f.technique} ("${f.matched}")`).join(", ")}
              </span>
            )}
          </div>
        )}
      </div>

      {result.warnings.length > 0 && (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-2">
          <ul className="flex flex-col gap-1 text-amber-800">
            {result.warnings.map((w, i) => (
              <li key={i} className="flex gap-1.5">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ExchangeRow({
  exchange,
  onSaveCase,
  onAttach,
}: {
  exchange: Exchange;
  onSaveCase: (e: Exchange) => void;
  onAttach: (e: Exchange) => void;
}) {
  const [open, setOpen] = useState(false);
  const result = exchange.result;
  const source = result ? SOURCE_LABEL[result.reply_source] : undefined;
  return (
    <div className="flex flex-col gap-2">
      <div className="self-end max-w-[85%] rounded-2xl rounded-br-sm bg-blue-600 text-white px-3.5 py-2 text-sm whitespace-pre-wrap">
        {exchange.question}
      </div>
      <div className="self-start max-w-[85%] w-fit">
        {exchange.error ? (
          <div className="rounded-2xl rounded-bl-sm bg-red-50 border border-red-200 text-red-700 px-3.5 py-2 text-sm">
            {exchange.error}
          </div>
        ) : result ? (
          <>
            <div className="rounded-2xl rounded-bl-sm bg-gray-100 text-gray-900 px-3.5 py-2 text-sm whitespace-pre-wrap">
              {result.reply_text || (
                <em className="text-gray-500">
                  (silence — the visitor would get no reply at all)
                </em>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2.5 flex-wrap">
              {source && (
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${source.className}`}>
                  {source.label}
                </span>
              )}
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-0.5 text-[11px] text-gray-500 hover:text-gray-700"
              >
                {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                Why this answer
              </button>
              <button
                type="button"
                onClick={() => onSaveCase(exchange)}
                className="text-[11px] text-blue-600 hover:text-blue-800"
              >
                Save as test case
              </button>
              <button
                type="button"
                onClick={() => onAttach(exchange)}
                className="text-[11px] text-blue-600 hover:text-blue-800"
              >
                Attach to article
              </button>
            </div>
            {open && <ResultDetails result={result} />}
          </>
        ) : (
          <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-3.5 py-2">
            <Loader2 className="animate-spin text-gray-400" size={16} />
          </div>
        )}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Dialog: save an exchange as a regression case
// --------------------------------------------------------------------------
function SaveCaseDialog({
  accountId,
  exchange,
  onClose,
}: {
  accountId: string;
  exchange: Exchange | null;
  onClose: () => void;
}) {
  const createMutation = useCreateBotTestCase(accountId);
  const [expectation, setExpectation] = useState<BotTestExpectation>("answered");
  const [articleId, setArticleId] = useState<string>("");
  const articles = exchange?.result?.articles ?? [];

  React.useEffect(() => {
    if (!exchange) return;
    // Sensible default: a silent exchange is usually saved as "must answer".
    setExpectation(articles.length > 0 ? "article" : "answered");
    setArticleId(articles[0]?.article_id ?? "");
  }, [exchange]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    if (!exchange) return;
    try {
      await createMutation.mutateAsync({
        account_id: accountId,
        question: exchange.question,
        expectation,
        expected_article_id: expectation === "article" ? articleId : undefined,
      });
      notify.success("Saved to test set", {
        description: "Run the test set anytime to re-check this question.",
      });
      onClose();
    } catch (error: unknown) {
      notify.error("Error", { description: handleError(error, "Save Test Case") });
    }
  };

  return (
    <AppDialog
      open={!!exchange}
      onClose={onClose}
      title="Save as test case"
      description="The question joins this widget's regression set; every run re-checks it against the live pipeline."
      maxWidth="sm"
      fullWidth
      actions={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={createMutation.isPending || (expectation === "article" && !articleId)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending && <Loader2 className="animate-spin" size={14} />}
            Save case
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4 py-1">
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-800">
          {exchange?.question}
        </div>
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          <span className="font-medium">Expected result</span>
          <select
            value={expectation}
            onChange={(e) => setExpectation(e.target.value as BotTestExpectation)}
            className="h-10 rounded-md border border-gray-200 bg-white px-2 text-sm"
          >
            <option value="answered">Bot must answer (any article)</option>
            <option value="article" disabled={articles.length === 0}>
              Bot must surface a specific article
            </option>
            <option value="no_answer">Bot must stay silent (out of scope)</option>
          </select>
        </label>
        {expectation === "article" && (
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            <span className="font-medium">Expected article</span>
            <select
              value={articleId}
              onChange={(e) => setArticleId(e.target.value)}
              className="h-10 rounded-md border border-gray-200 bg-white px-2 text-sm"
            >
              {articles.map((a) => (
                <option key={a.article_id} value={a.article_id}>
                  {a.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </AppDialog>
  );
}

// --------------------------------------------------------------------------
// Dialog: pin the question onto the article that should answer it
// --------------------------------------------------------------------------
function AttachDialog({
  accountId,
  exchange,
  onClose,
}: {
  accountId: string;
  exchange: Exchange | null;
  onClose: () => void;
}) {
  const attachMutation = useAttachQuestionToArticle(accountId);
  const { data: allArticles } = useKbArticles({ status: "published", limit: 200 });
  const matched = exchange?.result?.articles ?? [];
  const [articleId, setArticleId] = useState<string>("");
  const [keywords, setKeywords] = useState<string>("");

  React.useEffect(() => {
    if (exchange) setArticleId(matched[0]?.article_id ?? "");
    setKeywords("");
  }, [exchange]); // eslint-disable-line react-hooks/exhaustive-deps

  const options = useMemo(() => {
    const seen = new Set<string>();
    const out: { id: string; title: string; group: string }[] = [];
    for (const a of matched) {
      seen.add(a.article_id);
      out.push({ id: a.article_id, title: a.title, group: "Matched by this search" });
    }
    for (const a of allArticles ?? []) {
      if (!seen.has(a.id)) out.push({ id: a.id, title: a.title, group: "All published articles" });
    }
    return out;
  }, [matched, allArticles]);

  const attach = async () => {
    if (!exchange || !articleId) return;
    try {
      await attachMutation.mutateAsync({
        articleId,
        question: exchange.question,
        keywords: keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      });
      notify.success("Question attached", {
        description: "The article now carries this phrasing — the next search finds it.",
      });
      onClose();
    } catch (error: unknown) {
      notify.error("Error", { description: handleError(error, "Attach Question") });
    }
  };

  const groups = Array.from(new Set(options.map((o) => o.group)));

  return (
    <AppDialog
      open={!!exchange}
      onClose={onClose}
      title="Attach question to an article"
      description="Adds this exact phrasing to the article's question variants (and optional keywords) so retrieval finds it — no manual KB editing."
      maxWidth="sm"
      fullWidth
      actions={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void attach()}
            disabled={attachMutation.isPending || !articleId}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {attachMutation.isPending && <Loader2 className="animate-spin" size={14} />}
            Attach
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4 py-1">
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-800">
          {exchange?.question}
        </div>
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          <span className="font-medium">Article that should answer it</span>
          <select
            value={articleId}
            onChange={(e) => setArticleId(e.target.value)}
            className="h-10 rounded-md border border-gray-200 bg-white px-2 text-sm"
          >
            <option value="" disabled>
              Choose an article…
            </option>
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {options
                  .filter((o) => o.group === g)
                  .map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.title}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          <span className="font-medium">Extra keywords (optional, comma-separated)</span>
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="refund, pengembalian dana"
            className="h-10 rounded-md border border-gray-200 bg-white px-2 text-sm"
          />
        </label>
      </div>
    </AppDialog>
  );
}

// --------------------------------------------------------------------------
// Dialog: apply the tested knobs to the stored widget config
// --------------------------------------------------------------------------
interface KnobChange {
  key: keyof UpdateWebWidgetConfigRequest;
  label: string;
  current: string;
  next: string;
  value: unknown;
}

function ApplyConfigDialog({
  accountId,
  open,
  onClose,
  overrides,
}: {
  accountId: string;
  open: boolean;
  onClose: () => void;
  overrides: BotPlaygroundOverrides | undefined;
}) {
  const { data: config } = useWebWidgetConfig(accountId);
  const updateMutation = useUpdateWebWidgetConfig(accountId);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const changes = useMemo<KnobChange[]>(() => {
    if (!config) return [];
    const out: KnobChange[] = [];
    if (overrides?.use_llm != null && overrides.use_llm !== config.answer_bot_use_llm) {
      out.push({
        key: "answer_bot_use_llm",
        label: "AI answer (LLM)",
        current: config.answer_bot_use_llm ? "On" : "Off",
        next: overrides.use_llm ? "On" : "Off",
        value: overrides.use_llm,
      });
    }
    if (
      overrides?.min_confidence != null &&
      overrides.min_confidence !== config.answer_bot_min_confidence
    ) {
      out.push({
        key: "answer_bot_min_confidence",
        label: "Min confidence",
        current: String(config.answer_bot_min_confidence),
        next: String(overrides.min_confidence),
        value: overrides.min_confidence,
      });
    }
    return out;
  }, [config, overrides]);

  React.useEffect(() => {
    if (open) setSelected(new Set(changes.map((c) => String(c.key))));
  }, [open, changes]);

  const apply = async () => {
    if (!config) return;
    const picked = changes.filter((c) => selected.has(String(c.key)));
    if (picked.length === 0) return;
    const { id: _id, account_id: _aid, ...rest } = config as any;
    const payload: UpdateWebWidgetConfigRequest = { ...rest };
    for (const c of picked) (payload as any)[c.key] = c.value;
    try {
      await updateMutation.mutateAsync(payload);
      notify.success("Config applied", {
        description: "The tested settings are now the widget's stored config.",
      });
      onClose();
    } catch (error: unknown) {
      notify.error("Error", { description: handleError(error, "Apply Config") });
    }
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title="Apply tested settings"
      description="Copies the overrides you tested with into this widget's stored configuration."
      maxWidth="sm"
      fullWidth
      actions={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void apply()}
            disabled={updateMutation.isPending || changes.length === 0 || selected.size === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {updateMutation.isPending && <Loader2 className="animate-spin" size={14} />}
            Apply to config
          </button>
        </>
      }
    >
      {changes.length === 0 ? (
        <p className="text-sm text-gray-500 py-2">
          Nothing to apply — your test overrides match the stored config. Change a knob
          in the tester first (AI answer or Min confidence), then apply it here.
        </p>
      ) : (
        <div className="flex flex-col gap-2 py-1">
          {changes.map((c) => (
            <label
              key={String(c.key)}
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm"
            >
              <input
                type="checkbox"
                checked={selected.has(String(c.key))}
                onChange={(e) => {
                  setSelected((prev) => {
                    const next = new Set(prev);
                    if (e.target.checked) next.add(String(c.key));
                    else next.delete(String(c.key));
                    return next;
                  });
                }}
              />
              <span className="font-medium text-gray-800">{c.label}</span>
              <span className="ml-auto text-gray-500">
                {c.current} <span className="mx-1">→</span>
                <strong className="text-gray-900">{c.next}</strong>
              </span>
            </label>
          ))}
        </div>
      )}
    </AppDialog>
  );
}

// --------------------------------------------------------------------------
// Tab: test set
// --------------------------------------------------------------------------
function TestSetTab({ accountId }: { accountId: string }) {
  const { data: cases, isLoading } = useBotTestCases(accountId);
  const runMutation = useRunBotTestSet(accountId);
  const deleteMutation = useDeleteBotTestCase(accountId);

  const run = async () => {
    try {
      const res = await runMutation.mutateAsync(undefined);
      notify.success(`Test set: ${res.passed}/${res.total} passed`, {
        description: `Pass rate ${res.pass_rate_pct}%. Results are saved per case.`,
      });
    } catch (error: unknown) {
      notify.error("Error", { description: handleError(error, "Run Test Set") });
    }
  };

  const remove = async (caseId: string) => {
    try {
      await deleteMutation.mutateAsync(caseId);
    } catch (error: unknown) {
      notify.error("Error", { description: handleError(error, "Delete Test Case") });
    }
  };

  const total = cases?.length ?? 0;
  const ran = (cases ?? []).filter((c) => c.last_passed != null);
  const passed = ran.filter((c) => c.last_passed).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-sm text-gray-600 flex-1 min-w-[240px]">
          This widget&apos;s own regression suite. Save real visitor questions from the
          tester, then run them all in one click — results gate the Go-Live tab.
          Runs skip the LLM (deterministic and free); pass criteria are retrieval-based.
        </p>
        <button
          type="button"
          onClick={() => void run()}
          disabled={runMutation.isPending || total === 0}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {runMutation.isPending ? (
            <Loader2 className="animate-spin" size={15} />
          ) : (
            <Play size={15} />
          )}
          Run test set
        </button>
      </div>

      {ran.length > 0 && (
        <p className="text-sm text-gray-700">
          Last run: <strong>{passed}/{ran.length} passed</strong>
          {total > ran.length && (
            <span className="text-amber-700"> · {total - ran.length} never run</span>
          )}
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-gray-400" size={22} />
        </div>
      ) : total === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          No test cases yet. In the Tester tab, ask a question and click
          &quot;Save as test case&quot;.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-gray-100 border border-gray-200 rounded-xl bg-white">
          {(cases ?? []).map((c) => (
            <li key={c.id} className="flex items-start gap-3 p-3">
              <span className="mt-0.5 shrink-0">
                {c.last_passed == null ? (
                  <span className="inline-block w-4 h-4 rounded-full bg-gray-200" title="Never run" />
                ) : c.last_passed ? (
                  <CheckCircle2 className="text-emerald-600" size={17} />
                ) : (
                  <X className="text-red-600" size={17} />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 break-words">{c.question}</p>
                <p className="text-xs text-gray-500">
                  {c.expectation === "article"
                    ? `expects: ${c.expected_article_title ?? "specific article"}`
                    : c.expectation === "no_answer"
                      ? "expects: silence"
                      : "expects: any answer"}
                  {c.last_passed != null && (
                    <>
                      {" "}· last: {c.last_outcome} ({(c.last_confidence ?? 0).toFixed(2)})
                      {c.last_top_article_title ? ` → ${c.last_top_article_title}` : ""}
                    </>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void remove(c.id)}
                className="text-gray-400 hover:text-red-600 shrink-0"
                title="Delete case"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// Tab: shadow review
// --------------------------------------------------------------------------
function ShadowTab({ accountId }: { accountId: string }) {
  const { data: config } = useWebWidgetConfig(accountId);
  const updateMutation = useUpdateWebWidgetConfig(accountId);
  const { data: shadow, isLoading } = useBotShadow(accountId, "pending");
  const reviewMutation = useReviewBotShadow(accountId);

  const shadowOn = !!config?.answer_bot_shadow;
  const botOn = !!config?.answer_bot_enabled;

  const toggleShadow = async () => {
    if (!config) return;
    const { id: _id, account_id: _aid, ...rest } = config as any;
    try {
      await updateMutation.mutateAsync({ ...rest, answer_bot_shadow: !shadowOn });
      notify.success(!shadowOn ? "Shadow mode on" : "Shadow mode off", {
        description: !shadowOn
          ? "New visitor conversations will be answered silently, for your review only."
          : "The bot stops computing shadow answers.",
      });
    } catch (error: unknown) {
      notify.error("Error", { description: handleError(error, "Shadow Mode") });
    }
  };

  const review = async (shadowId: string, approve: boolean) => {
    try {
      await reviewMutation.mutateAsync({ shadowId, approve });
    } catch (error: unknown) {
      notify.error("Error", { description: handleError(error, "Review Shadow") });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 flex-wrap rounded-xl border border-gray-200 bg-gray-50 p-3">
        <div className="flex-1 min-w-[240px]">
          <p className="text-sm font-medium text-gray-800">Shadow mode</p>
          <p className="text-sm text-gray-600">
            While the live bot stays off, every new visitor conversation gets a silent
            dry-run answer logged here. Review them; the approval rate feeds Go-Live.
          </p>
          {botOn && (
            <p className="text-xs text-amber-700 mt-1">
              The live answer bot is ON, so shadow answers are not being recorded.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void toggleShadow()}
          disabled={updateMutation.isPending || !config}
          className={`h-10 px-4 rounded-xl text-sm font-medium disabled:opacity-50 ${
            shadowOn
              ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {updateMutation.isPending ? "…" : shadowOn ? "Turn off" : "Turn on shadow mode"}
        </button>
      </div>

      {shadow && (
        <p className="text-sm text-gray-700">
          Pending <strong>{shadow.total_pending}</strong> · reviewed{" "}
          <strong>{shadow.total_reviewed}</strong>
          {shadow.approval_rate_pct != null && (
            <>
              {" "}· approval <strong>{shadow.approval_rate_pct}%</strong>
            </>
          )}
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-gray-400" size={22} />
        </div>
      ) : (shadow?.results ?? []).length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Nothing pending. {shadowOn ? "New visitor questions will appear here." : "Turn on shadow mode to start collecting."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {(shadow?.results ?? []).map((r) => (
            <li key={r.id} className="border border-gray-200 rounded-xl bg-white p-3 flex flex-col gap-2">
              <p className="text-sm text-gray-500">
                Visitor asked · {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
              </p>
              <p className="text-sm text-gray-900">{r.question}</p>
              <div className="rounded-lg bg-gray-50 border border-gray-100 p-2.5 text-sm text-gray-800 whitespace-pre-wrap">
                {r.reply_text || <em className="text-gray-500">(silence)</em>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${SOURCE_LABEL[r.reply_source]?.className ?? "bg-gray-100 text-gray-600"}`}
                >
                  {SOURCE_LABEL[r.reply_source]?.label ?? r.reply_source}
                </span>
                <span className="text-xs text-gray-500">conf {r.confidence.toFixed(2)}</span>
                <span className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={() => void review(r.id, true)}
                    disabled={reviewMutation.isPending}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <Check size={13} /> Good answer
                  </button>
                  <button
                    type="button"
                    onClick={() => void review(r.id, false)}
                    disabled={reviewMutation.isPending}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-medium hover:bg-red-100 disabled:opacity-50"
                  >
                    <X size={13} /> Not good
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// Tab: readiness gate + activation
// --------------------------------------------------------------------------
const STATUS_PILL: Record<ReadinessItem["status"], string> = {
  pass: "bg-emerald-100 text-emerald-700",
  warn: "bg-amber-100 text-amber-700",
  fail: "bg-red-100 text-red-700",
  off: "bg-gray-100 text-gray-500",
};

function GoLiveTab({ accountId }: { accountId: string }) {
  const { data: readiness, isLoading, refetch } = useBotReadiness(accountId);
  const { data: config } = useWebWidgetConfig(accountId);
  const activateMutation = useActivateBot(accountId);

  const activate = async () => {
    try {
      const res = await activateMutation.mutateAsync();
      if (res.activated) {
        notify.success("Answer bot is LIVE", {
          description: "Shadow mode ended. Visitors now get bot answers.",
        });
      } else {
        notify.error("Not ready yet", {
          description: res.failing.map((f) => f.label).join(", "),
        });
      }
      void refetch();
    } catch (error: unknown) {
      notify.error("Error", { description: handleError(error, "Activate Bot") });
    }
  };

  const alreadyLive = !!config?.answer_bot_enabled;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-600">
        The gate behind the switch: the bot goes live only when every required item
        passes — so what reaches your visitors is what your tests approved.
      </p>

      {isLoading || !readiness ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-gray-400" size={22} />
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-gray-100 border border-gray-200 rounded-xl bg-white">
          {readiness.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 p-3">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase ${STATUS_PILL[item.status]}`}>
                {item.status}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {item.label}
                  {item.required && <span className="text-red-500"> *</span>}
                </p>
                <p className="text-xs text-gray-500">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-3">
        {alreadyLive ? (
          <p className="text-sm text-emerald-700 font-medium inline-flex items-center gap-1.5">
            <CheckCircle2 size={16} /> The answer bot is live on this widget.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => void activate()}
            disabled={activateMutation.isPending || !readiness?.ready}
            className="inline-flex items-center gap-1.5 h-11 px-5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
            title={readiness?.ready ? "" : "Selesaikan item bertanda * dulu"}
          >
            {activateMutation.isPending && <Loader2 className="animate-spin" size={15} />}
            Activate answer bot
          </button>
        )}
        <span className="text-xs text-gray-400">* required to activate</span>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Main panel
// --------------------------------------------------------------------------
export default function BotPlaygroundPanel({ accountId }: BotPlaygroundPanelProps) {
  const askMutation = useBotPlaygroundAsk();
  const [tab, setTab] = useState<TabValue>("tester");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [question, setQuestion] = useState("");
  const [useLlm, setUseLlm] = useState<TriState>("config");
  const [includeSales, setIncludeSales] = useState<TriState>("config");
  const [minConfidence, setMinConfidence] = useState<string>("");
  const [saveCaseFor, setSaveCaseFor] = useState<Exchange | null>(null);
  const [attachFor, setAttachFor] = useState<Exchange | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const nextId = useRef(1);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const buildOverrides = (): BotPlaygroundOverrides | undefined => {
    const overrides: BotPlaygroundOverrides = {};
    const llm = triToBool(useLlm);
    if (llm !== undefined) overrides.use_llm = llm;
    const sales = triToBool(includeSales);
    if (sales !== undefined) overrides.include_sales = sales;
    if (minConfidence.trim() !== "") {
      const parsed = Number(minConfidence);
      if (!Number.isNaN(parsed)) overrides.min_confidence = Math.min(1, Math.max(0, parsed));
    }
    return Object.keys(overrides).length > 0 ? overrides : undefined;
  };

  const send = async () => {
    const q = question.trim();
    if (!q || askMutation.isPending) return;
    const id = nextId.current++;
    setExchanges((prev) => [...prev, { id, question: q }]);
    setQuestion("");
    setTimeout(() => bottomRef.current?.scrollIntoView({ block: "nearest" }), 50);
    try {
      const result = await askMutation.mutateAsync({
        account_id: accountId,
        question: q,
        overrides: buildOverrides(),
      });
      setExchanges((prev) => prev.map((e) => (e.id === id ? { ...e, result } : e)));
    } catch (error: unknown) {
      setExchanges((prev) =>
        prev.map((e) => (e.id === id ? { ...e, error: handleError(error, "Bot Playground") } : e)),
      );
    } finally {
      setTimeout(() => bottomRef.current?.scrollIntoView({ block: "nearest" }), 50);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Bot Playground</h2>
        <p className="text-sm text-gray-600">
          Test, tune, rehearse on real traffic, then activate — all from here. The
          playground runs the exact production pipeline (knowledge base, AI, sales
          layer) but saves nothing to visitor-facing data.
        </p>
      </div>

      <AppTabs<TabValue>
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "tester", label: "Tester" },
          { value: "testset", label: "Test set" },
          { value: "shadow", label: "Shadow review" },
          { value: "golive", label: "Go-Live" },
        ]}
      />

      {tab === "tester" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 flex-wrap rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <TriSelect label="AI answer" value={useLlm} onChange={setUseLlm} />
            <TriSelect
              label="Sales layer"
              value={includeSales}
              onChange={setIncludeSales}
              offLabel="Off (support only)"
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <span>Min confidence</span>
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={minConfidence}
                onChange={(e) => setMinConfidence(e.target.value)}
                placeholder="config"
                className="h-8 w-20 rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-700"
              />
            </label>
            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => setApplyOpen(true)}
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                <Check size={14} />
                Apply to config…
              </button>
              {exchanges.length > 0 && (
                <button
                  type="button"
                  onClick={() => setExchanges([])}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
                >
                  <RotateCcw size={14} />
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white min-h-[220px] max-h-[420px] overflow-y-auto p-4 flex flex-col gap-4">
            {exchanges.length === 0 ? (
              <p className="m-auto text-sm text-gray-400 text-center max-w-sm">
                Type a question a visitor might ask — for example the ones your team
                hears most — and see exactly what the bot would send back, and why.
              </p>
            ) : (
              exchanges.map((e) => (
                <ExchangeRow
                  key={e.id}
                  exchange={e}
                  onSaveCase={setSaveCaseFor}
                  onAttach={setAttachFor}
                />
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="flex items-center gap-2"
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask as if you were a visitor…"
              maxLength={2000}
              className="flex-1 h-11 rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <button
              type="submit"
              disabled={!question.trim() || askMutation.isPending}
              className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {askMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              Test
            </button>
          </form>
        </div>
      )}

      {tab === "testset" && <TestSetTab accountId={accountId} />}
      {tab === "shadow" && <ShadowTab accountId={accountId} />}
      {tab === "golive" && <GoLiveTab accountId={accountId} />}

      <SaveCaseDialog
        accountId={accountId}
        exchange={saveCaseFor}
        onClose={() => setSaveCaseFor(null)}
      />
      <AttachDialog
        accountId={accountId}
        exchange={attachFor}
        onClose={() => setAttachFor(null)}
      />
      <ApplyConfigDialog
        accountId={accountId}
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        overrides={buildOverrides()}
      />
    </div>
  );
}
