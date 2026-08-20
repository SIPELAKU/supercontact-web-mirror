// lib/utils/markdown.ts
//
// Minimal, dependency-free Markdown -> HTML renderer used for the Knowledge Base
// authoring preview (and read-only version previews). The KB backend stores
// `body` verbatim, so this is purely a client-side preview convenience.
//
// Security: all input is HTML-escaped FIRST, then a small, fixed set of inline /
// block Markdown constructs are re-introduced as known-safe tags. Link hrefs are
// restricted to http(s), mailto and site-relative paths so a `javascript:` URL
// can't be smuggled through the preview.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function safeHref(url: string): string | null {
  const trimmed = url.trim();
  if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed;
  if (/^\/[^/]/.test(trimmed) || trimmed.startsWith("/")) return trimmed;
  if (/^#/.test(trimmed)) return trimmed;
  return null;
}

// Inline transforms applied to already-escaped text.
function inline(text: string): string {
  // Inline code first so its contents aren't further transformed.
  let out = text.replace(/`([^`]+)`/g, (_m, code) => `<code>${code}</code>`);

  // Links [label](href)
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label, href) => {
    const safe = safeHref(String(href));
    if (!safe) return label;
    return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });

  // Bold then italic.
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\b_([^_]+)_\b/g, "<em>$1</em>");
  out = out.replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, "$1<em>$2</em>");

  return out;
}

export function renderMarkdown(markdown: string): string {
  if (!markdown) return "";
  const escaped = escapeHtml(markdown);
  const lines = escaped.split(/\r?\n/);
  const html: string[] = [];

  let inCode = false;
  let listType: "ul" | "ol" | null = null;

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const raw of lines) {
    const line = raw;

    // Fenced code blocks.
    if (/^```/.test(line.trim())) {
      if (inCode) {
        html.push("</code></pre>");
        inCode = false;
      } else {
        closeList();
        html.push('<pre class="kb-code"><code>');
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      html.push(line + "\n");
      continue;
    }

    const trimmed = line.trim();

    if (trimmed === "") {
      closeList();
      continue;
    }

    // Horizontal rule.
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      closeList();
      html.push("<hr />");
      continue;
    }

    // Headings.
    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    // Blockquote.
    const quote = trimmed.match(/^&gt;\s?(.*)$/);
    if (quote) {
      closeList();
      html.push(`<blockquote>${inline(quote[1])}</blockquote>`);
      continue;
    }

    // Ordered list.
    const ol = trimmed.match(/^\d+\.\s+(.*)$/);
    if (ol) {
      if (listType !== "ol") {
        closeList();
        html.push("<ol>");
        listType = "ol";
      }
      html.push(`<li>${inline(ol[1])}</li>`);
      continue;
    }

    // Unordered list.
    const ul = trimmed.match(/^[-*]\s+(.*)$/);
    if (ul) {
      if (listType !== "ul") {
        closeList();
        html.push("<ul>");
        listType = "ul";
      }
      html.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }

    // Paragraph.
    closeList();
    html.push(`<p>${inline(trimmed)}</p>`);
  }

  if (inCode) html.push("</code></pre>");
  closeList();

  return html.join("\n");
}

// Strips HTML tags (e.g. the <b>/<mark> highlight markup Postgres ts_headline
// wraps around matched terms) so a search snippet can be shown / inserted as
// plain text.
export function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}
