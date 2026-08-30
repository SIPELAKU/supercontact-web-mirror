"use client";

import React, { useRef, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Loader2, RotateCcw, Send } from "lucide-react";
import { useBotPlaygroundAsk } from "@/lib/hooks/useBotPlayground";
import { handleError } from "@/lib/utils/errorHandler";
import type {
  BotPlaygroundAskResponse,
  BotPlaygroundOverrides,
} from "@/lib/types/botPlayground";

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

const SOURCE_LABEL: Record<string, { label: string; className: string }> = {
  llm: { label: "AI answer", className: "bg-emerald-100 text-emerald-700" },
  articles: { label: "Article list", className: "bg-blue-100 text-blue-700" },
  no_answer_text: { label: "No-answer text", className: "bg-amber-100 text-amber-700" },
  silence: { label: "Silence", className: "bg-red-100 text-red-700" },
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

function ExchangeRow({ exchange }: { exchange: Exchange }) {
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
            <div className="mt-1 flex items-center gap-2 flex-wrap">
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

export default function BotPlaygroundPanel({ accountId }: BotPlaygroundPanelProps) {
  const askMutation = useBotPlaygroundAsk();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [question, setQuestion] = useState("");
  const [useLlm, setUseLlm] = useState<TriState>("config");
  const [includeSales, setIncludeSales] = useState<TriState>("config");
  const [minConfidence, setMinConfidence] = useState<string>("");
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
          Test how the answer bot replies before your visitors do. Runs the exact production
          pipeline (knowledge base, AI, sales layer) but saves nothing — no conversation, no
          ticket, no analytics. It works even while the answer bot is switched off, so you can
          rehearse and tune first, then activate.
        </p>
      </div>

      <div className="flex items-center gap-4 flex-wrap rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
        <TriSelect label="AI answer" value={useLlm} onChange={setUseLlm} />
        <TriSelect label="Sales layer" value={includeSales} onChange={setIncludeSales} offLabel="Off (support only)" />
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
        {exchanges.length > 0 && (
          <button
            type="button"
            onClick={() => setExchanges([])}
            className="ml-auto inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <RotateCcw size={14} />
            Clear
          </button>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white min-h-[220px] max-h-[420px] overflow-y-auto p-4 flex flex-col gap-4">
        {exchanges.length === 0 ? (
          <p className="m-auto text-sm text-gray-400 text-center max-w-sm">
            Type a question a visitor might ask — for example the ones your team hears most —
            and see exactly what the bot would send back, and why.
          </p>
        ) : (
          exchanges.map((e) => <ExchangeRow key={e.id} exchange={e} />)
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
  );
}
