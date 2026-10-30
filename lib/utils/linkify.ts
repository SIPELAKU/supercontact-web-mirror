// lib/utils/linkify.ts
//
// Splits plain chat text into text and http(s) link pieces, so the embeddable
// widget (widget/src/widget.ts, bundled on its own by esbuild) can turn the
// links into anchors while every other character stays text - it builds DOM
// nodes from these pieces and never parses the message as HTML. Keep this
// file free of imports: it ships inside the widget bundle.

export type TextPiece = { kind: "text"; text: string } | { kind: "link"; text: string; href: string };

const URL_RE = /https?:\/\/[^\s<>"']+/gi;
const TRAILING_PUNCTUATION = /[.,;:!?]+$/;

/** A URL at the end of a sentence carries the sentence's punctuation; a
 *  closing bracket belongs to the URL only when it opens one too
 *  (wikipedia/Foo_(bar)). */
function trimUrl(raw: string): string {
  let url = raw;
  for (;;) {
    const before = url;
    url = url.replace(TRAILING_PUNCTUATION, "");
    if (url.endsWith(")") && (url.match(/\)/g) || []).length > (url.match(/\(/g) || []).length) {
      url = url.slice(0, -1);
    }
    if (url === before) return url;
  }
}

export function splitLinks(text: string): TextPiece[] {
  const pieces: TextPiece[] = [];
  let last = 0;
  const pushText = (t: string) => {
    if (!t) return;
    const prev = pieces[pieces.length - 1];
    if (prev?.kind === "text") prev.text += t;
    else pieces.push({ kind: "text", text: t });
  };
  // exec, not matchAll: the widget bundle targets es2018.
  const re = new RegExp(URL_RE.source, URL_RE.flags);
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const start = match.index;
    const url = trimUrl(match[0]);
    // "https://" alone is not a link.
    if (!/^https?:\/\/[^/?#]+/i.test(url) || /^https?:\/\/$/i.test(url)) continue;
    pushText(text.slice(last, start));
    pieces.push({ kind: "link", text: url, href: url });
    last = start + url.length;
  }
  pushText(text.slice(last));
  return pieces;
}
