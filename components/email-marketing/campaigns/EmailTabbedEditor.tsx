"use client";

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Box, Tabs, Tab, Typography, Stack, Tooltip, IconButton } from "@mui/material";
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


const EmailTabbedEditor = forwardRef<EmailTabbedEditorRef, EmailTabbedEditorProps>((
    { value, onChange, isLoading = false, defaultEditorType = 'simple_editor', height },
    ref
) => {
    const [activeTab, setActiveTab] = useState(0);
    const [isGuideOpen, setGuideOpen] = useState(false);
    const editorRef = useRef<any>(null);
    const contentEditableRef = useRef<HTMLDivElement>(null);
    const [internalHtml, setInternalHtml] = useState(value);

    // Sync internalHtml with value prop when value changes externally
    useEffect(() => {
        if (value !== internalHtml) {
            setInternalHtml(value);
            if (contentEditableRef.current && contentEditableRef.current.innerHTML !== value) {
                contentEditableRef.current.innerHTML = value;
            }
        }
    }, [value]);

    // Sync contentEditable when coming back to it
    useEffect(() => {
        if (activeTab === 0 && contentEditableRef.current && contentEditableRef.current.innerHTML !== internalHtml) {
            contentEditableRef.current.innerHTML = internalHtml;
        }
    }, [activeTab]);

    // Export content from Visual Builder
    const exportContent = (): Promise<{ html: string; design?: any }> => {
        return new Promise((resolve) => {
            if (activeTab === 0) {
                // If Simple Editor is active, just return curruent HTML.
                // It does not have design JSON.
                resolve({ html: contentEditableRef.current?.innerHTML || internalHtml });
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
        // Export content before switching tabs if coming from Visual Builder
        if (activeTab === 1 && newValue !== 1) {
            await exportContent();
        }
        setActiveTab(newValue);
    };

    const execCommand = (command: string, value: string = "") => {
        document.execCommand(command, false, value);
        if (contentEditableRef.current) {
            const newHtml = contentEditableRef.current.innerHTML;
            setInternalHtml(newHtml);
            onChange(newHtml);
        }
    };

    const handleContentChange = () => {
        if (contentEditableRef.current) {
            const newHtml = contentEditableRef.current.innerHTML;
            setInternalHtml(newHtml);
            onChange(newHtml);
        }
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
                const retryHtml = contentEditableRef.current?.innerHTML || internalHtml;
                loadDesignIfPresent(unlayer, retryHtml);
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
                            bgcolor: "white",
                            overflowY: "auto"
                        }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                                Isi Email
                            </Typography>
                            <div
                                ref={contentEditableRef}
                                contentEditable
                                onInput={handleContentChange}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "4px",
                                    outline: "none",
                                    backgroundColor: "white",
                                    fontFamily: "inherit",
                                    minHeight: height ? "auto" : "350px",
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
