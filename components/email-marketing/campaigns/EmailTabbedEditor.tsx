"use client";

// components/email-marketing/campaigns/EmailTabbedEditor.tsx
//
// The Simple Editor used to be a contentEditable <div> in the app's own
// document, seeded with `div.innerHTML = campaign.html_content`. A campaign's
// HTML is a whole document — Unlayer exports <html><head><style>…, and people
// paste hand-written templates with their own <style> and Google-Fonts <link>
// inside it. Assigning that to innerHTML keeps the <style> and <link> elements
// and the browser applies them to THIS page.
//
// Tailwind v4 makes that fatal rather than merely untidy: every utility lives
// in `@layer utilities`, and unlayered CSS beats any layered rule whatever its
// specificity. One line in an email — `*{box-sizing:border-box;margin:0;
// padding:0}` — therefore wins over px-4, ml-8, mb-6, space-y-1 across the
// entire app, and the sidebar's menu tree collapses into a single stack with
// no padding and no indent.
//
// So the email gets its own document. An iframe is what the Visual Builder tab
// has always used (Unlayer renders inside one), which is exactly why only this
// tab ever broke the page.
//
// It also stops us corrupting what we edit: reading a document back out of a
// contentEditable div silently dropped the <!DOCTYPE>, <html>, <head> and
// <body> the campaign was stored with, because the parser discards those tags
// outside a document context. Opening a campaign and pressing Save was enough.

import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { Box, Tabs, Tab, Typography, Tooltip, IconButton } from "@mui/material";
import { Edit3, Layout, BookOpen } from "lucide-react";
import EmailEditor, { EditorRef } from "react-email-editor";
import RichTextToolbar from "./RichTextToolbar";
import EmailTemplateGuideDialog from "./EmailTemplateGuideDialog";

interface EmailTabbedEditorProps {
    value: string;
    onChange: (html: string) => void;
    isLoading?: boolean;
    defaultEditorType?: 'simple_editor' | 'visual_builder';
    height?: string;
}

export interface EmailTabbedEditorRef {
    exportContent: () => Promise<{ html: string; design?: any }>;
    getEditorType: () => 'simple_editor' | 'visual_builder';
}

// A campaign is either a whole document (Unlayer's export, or a pasted
// template) or a bare fragment (anything typed here from scratch). We keep
// whichever it was: promoting a fragment to a full document on save would
// rewrite content the user never touched.
const FULL_DOCUMENT = /<html[\s>]/i;

// Marks the two nodes we add ourselves, so they can be stripped back out
// before the document is handed to the caller.
const CHROME_ATTR = "data-st-editor-chrome";

// The frame is same-origin by design — we have to reach into its document to
// seed it, read it back and run editing commands on it. That means a <script>
// inside a pasted template would run in the app's own origin, against a
// non-httpOnly access_token; innerHTML never executed scripts, document.write
// does. A `sandbox` without allow-scripts would block them, but it is also the
// one thing that could plausibly stop execCommand working from out here, so
// the frame carries its own CSP instead: certain about editing, and just as
// certain about scripts, inline handlers and javascript: URLs.
const CSP_META =
    `<meta ${CHROME_ATTR} http-equiv="Content-Security-Policy" ` +
    `content="script-src 'none'; object-src 'none'; base-uri 'none'">`;

// The meta only covers what the parser reaches after it, so it goes in as
// early as a valid document allows — the doctype has to stay first, or the
// frame drops into quirks mode.
function withCsp(source: string): string {
    if (/<head[^>]*>/i.test(source)) {
        return source.replace(/<head[^>]*>/i, (tag) => `${tag}${CSP_META}`);
    }
    if (/<html[^>]*>/i.test(source)) {
        return source.replace(/<html[^>]*>/i, (tag) => `${tag}<head>${CSP_META}</head>`);
    }
    return `${CSP_META}${source}`;
}

const FRAGMENT_SHELL = (body: string) =>
    `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${body}</body></html>`;

function doctypeOf(html: string): string {
    const match = html.match(/<!doctype[^>]*>/i);
    return match ? match[0] : "<!DOCTYPE html>";
}

const EmailTabbedEditor = forwardRef<EmailTabbedEditorRef, EmailTabbedEditorProps>((
    { value, onChange, isLoading = false, defaultEditorType = 'simple_editor', height },
    ref
) => {
    const [activeTab, setActiveTab] = useState(0);
    const [isGuideOpen, setGuideOpen] = useState(false);
    const editorRef = useRef<any>(null);
    const frameRef = useRef<HTMLIFrameElement>(null);
    const [internalHtml, setInternalHtml] = useState(value);

    // What we last wrote into the frame. The seeding effect compares against
    // this so a keystroke never re-seeds the document under the caret.
    const seededRef = useRef<string | null>(null);
    const fullDocRef = useRef(false);
    const doctypeRef = useRef("");
    // Exactly what was seeded, and whether anything has happened to it since.
    // Round-tripping a document through the parser normalises it — tag case,
    // attribute quoting, void elements — so an untouched campaign that gets
    // saved would come back subtly rewritten. Hand back the original instead.
    const pristineRef = useRef<string | null>(null);
    const dirtyRef = useRef(false);
    const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Kept in a ref so a new onChange identity doesn't re-seed the frame.
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    // The Visual Builder's deferred retry reads this rather than a closed-over
    // render value, so a hand-off from the other tab isn't missed by 500ms.
    const internalHtmlRef = useRef(internalHtml);
    internalHtmlRef.current = internalHtml;
    // Bumped by the frame's own load event, so seeding can't run before the
    // frame has a document to write into.
    const [frameEpoch, setFrameEpoch] = useState(0);

    // Serialize the frame back to HTML, minus the two things we added.
    const readFrame = useCallback((): string | null => {
        const doc = frameRef.current?.contentDocument;
        if (!doc?.body) return null;
        if (!dirtyRef.current && pristineRef.current !== null) return pristineRef.current;
        if (!fullDocRef.current) return doc.body.innerHTML;

        const clone = doc.documentElement.cloneNode(true) as HTMLElement;
        clone.querySelectorAll(`[${CHROME_ATTR}]`).forEach((node) => node.remove());
        clone.querySelector("body")?.removeAttribute("contenteditable");
        return `${doctypeRef.current}\n${clone.outerHTML}`;
    }, []);

    // Push the frame's current content up. Serializing a 40KB document on
    // every keystroke is wasted work, so this is debounced — `flush` forces it
    // for the moments that matter (toolbar commands, leaving the tab, saving).
    const publish = useCallback(() => {
        const next = readFrame();
        if (next === null) return;
        seededRef.current = next;
        setInternalHtml(next);
        onChangeRef.current(next);
    }, [readFrame]);

    const flush = useCallback(() => {
        if (flushTimer.current) {
            clearTimeout(flushTimer.current);
            flushTimer.current = null;
        }
        publish();
    }, [publish]);

    const seedFrame = useCallback((html: string) => {
        const frame = frameRef.current;
        const doc = frame?.contentDocument;
        if (!frame || !doc) return;

        const isFullDoc = FULL_DOCUMENT.test(html);
        fullDocRef.current = isFullDoc;
        doctypeRef.current = isFullDoc ? doctypeOf(html) : "";

        doc.open();
        doc.write(withCsp(isFullDoc ? html : FRAGMENT_SHELL(html)));
        doc.close();

        const chrome = doc.createElement("style");
        chrome.setAttribute(CHROME_ATTR, "");
        chrome.textContent = isFullDoc
            ? "body{outline:none}"
            : "body{outline:none;margin:0;padding:12px;font:14px/1.6 Poppins,Arial,sans-serif;color:#111827}";
        doc.head.appendChild(chrome);

        // Only the body is editable: the campaign's own <style> and <link> sit
        // in <head>, where a stray Ctrl+A can't take them with it.
        doc.body.setAttribute("contenteditable", "true");

        doc.addEventListener("input", () => {
            dirtyRef.current = true;
            if (flushTimer.current) clearTimeout(flushTimer.current);
            flushTimer.current = setTimeout(publish, 400);
        });

        pristineRef.current = html;
        dirtyRef.current = false;
        seededRef.current = html;
    }, [publish]);

    // Accept content pushed in from outside (seeding an edit, restoring a
    // draft, or the Visual Builder handing content over).
    useEffect(() => {
        setInternalHtml((prev) => (prev === value ? prev : value));
    }, [value]);

    // A tab switch unmounts the frame, so the next one starts blank however
    // familiar its content looks. Declared before the seeding effect so it
    // clears first on the same commit.
    useEffect(() => {
        seededRef.current = null;
    }, [activeTab]);

    useEffect(() => {
        if (activeTab !== 0) return;
        if (seededRef.current === internalHtml) return;
        seedFrame(internalHtml);
    }, [activeTab, internalHtml, frameEpoch, seedFrame]);

    useEffect(() => () => {
        if (flushTimer.current) clearTimeout(flushTimer.current);
    }, []);

    // Export content from whichever tab is showing
    const exportContent = (): Promise<{ html: string; design?: any }> => {
        return new Promise((resolve) => {
            if (activeTab === 0) {
                const html = readFrame();
                if (html === null) {
                    resolve({ html: internalHtml });
                    return;
                }
                seededRef.current = html;
                setInternalHtml(html);
                resolve({ html });
            } else if (editorRef.current?.editor) {
                const unlayer = editorRef.current.editor;
                console.log('[EmailTabbedEditor] Exporting from Visual Builder...');

                // First export the design so we can embed it
                unlayer.exportHtml((data: any) => {
                    const { html, design } = data;

                    if (html && design) {
                        try {
                            const designBase64 = typeof window !== 'undefined' ? btoa(unescape(encodeURIComponent(JSON.stringify(design)))) : '';
                            const htmlWithDesign = `${html}\n<!-- UNLAYER_DESIGN_JSON: ${designBase64} -->`;

                            setInternalHtml(htmlWithDesign);
                            onChange(htmlWithDesign);
                            resolve({ html: htmlWithDesign, design });
                        } catch (e) {
                            console.error('Failed to stringify design', e);
                            resolve({ html });
                        }
                    } else {
                        resolve({ html: html || '' });
                    }
                });
            } else {
                console.log('[EmailTabbedEditor] Visual Builder not initialized, using current HTML');
                resolve({ html: internalHtml });
            }
        });
    };

    // Expose exportContent method via ref
    useImperativeHandle(ref, () => ({
        exportContent,
        getEditorType: () => activeTab === 1 ? 'visual_builder' : 'simple_editor',
    }));

    const handleTabChange = async (event: React.SyntheticEvent, newValue: number) => {
        // Export content before switching tabs, in either direction — the tab
        // being left is about to be unmounted with whatever is in it.
        if (activeTab === 1 && newValue !== 1) {
            await exportContent();
        } else if (activeTab === 0 && newValue !== 0) {
            flush();
        }
        setActiveTab(newValue);
    };

    const execCommand = (command: string, value: string = "") => {
        const frame = frameRef.current;
        const doc = frame?.contentDocument;
        if (!doc) return;
        // The caret lives in the frame's document, so the command has to run
        // there — and the frame has to hold focus for it to have a selection.
        frame?.contentWindow?.focus();
        // Set before the command runs: execCommand does not fire `input` in
        // every browser, and this is unambiguously an edit either way.
        dirtyRef.current = true;
        doc.execCommand(command, false, value);
        flush();
    };

    const loadDesignIfPresent = (unlayer: any, htmlString: string) => {
        const designMatch = htmlString.match(/<!-- UNLAYER_DESIGN_JSON: (.*?) -->/);
        if (designMatch && designMatch[1]) {
            try {
                const designStr = typeof window !== 'undefined' ? decodeURIComponent(escape(atob(designMatch[1]))) : '{}';
                const designObj = JSON.parse(designStr);

                unlayer.loadDesign(designObj);
                console.log('[EmailTabbedEditor] Loaded existing design successfully.');
                return true;
            } catch (error) {
                console.error('[EmailTabbedEditor] Failed to load design from HTML:', error);
            }
        }
        return false;
    }

    const onReady = (unlayer: any) => {
        console.log('[EmailTabbedEditor] Visual Builder ready');

        // Immediately try to load design
        const loaded = loadDesignIfPresent(unlayer, internalHtml);

        // If it wasn't there yet, check again after a short delay to account for React state propagation
        if (!loaded) {
            setTimeout(() => {
                loadDesignIfPresent(unlayer, internalHtmlRef.current);
            }, 500);
        }

        // Listen for design updates
        unlayer.addEventListener("design:updated", () => {
            unlayer.exportHtml((data: any) => {
                const { html, design } = data;
                try {
                    const designBase64 = typeof window !== 'undefined' ? btoa(unescape(encodeURIComponent(JSON.stringify(design)))) : '';
                    const htmlWithDesign = `${html}\n<!-- UNLAYER_DESIGN_JSON: ${designBase64} -->`;
                    setInternalHtml(htmlWithDesign);
                    onChange(htmlWithDesign);
                } catch (e) {
                    setInternalHtml(html);
                    onChange(html);
                }
            });
        });
    };

    return (
        <Box sx={{ 
            width: "100%", 
            height: height || "auto",
            display: height ? "flex" : "block",
            flexDirection: "column",
            border: "1px solid #e5e7eb", 
            borderRadius: "8px", 
            overflow: "hidden" 
        }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="email editor tabs">
                    <Tab
                        icon={<Edit3 size={18} />}
                        iconPosition="start"
                        label="Editor Sederhana"
                        sx={{ textTransform: "none", minHeight: 48 }}
                    />
                    <Tab
                        icon={<Layout size={18} />}
                        iconPosition="start"
                        label="Visual Builder (Dengan AI)"
                        sx={{ textTransform: "none", minHeight: 48 }}
                    />
                </Tabs>
                <Tooltip title="Panduan Template Email Aman">
                    <IconButton size="small" onClick={() => setGuideOpen(true)} sx={{ mr: 1.5 }}>
                        <BookOpen size={18} />
                    </IconButton>
                </Tooltip>
            </Box>
            <EmailTemplateGuideDialog open={isGuideOpen} onClose={() => setGuideOpen(false)} />

            <Box sx={{ 
                p: 0, 
                flex: height ? 1 : "0 1 auto", 
                display: "flex", 
                flexDirection: "column",
                minHeight: 0
            }}>
                {activeTab === 0 ? (
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
                        <RichTextToolbar onAction={execCommand} />
                        <Box sx={{ 
                            p: 2, 
                            flex: 1, 
                            display: "flex", 
                            flexDirection: "column", 
                            minHeight: 0, 
                            bgcolor: "white"
                        }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                                Isi Email
                            </Typography>
                            <iframe
                                ref={frameRef}
                                title="Isi email"
                                onLoad={() => setFrameEpoch((n) => n + 1)}
                                style={{
                                    flex: 1,
                                    width: "100%",
                                    minHeight: height ? 0 : 350,
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "4px",
                                    backgroundColor: "white",
                                    display: "block",
                                }}
                            />
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                        <EmailEditor
                            ref={editorRef}
                            onReady={onReady}
                            minHeight="100%"
                        />
                    </Box>
                )}
            </Box>
        </Box>
    );
});

EmailTabbedEditor.displayName = 'EmailTabbedEditor';

export default EmailTabbedEditor;
