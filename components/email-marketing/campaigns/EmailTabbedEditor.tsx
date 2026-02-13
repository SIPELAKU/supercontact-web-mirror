"use client";

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Box, Tabs, Tab, Typography, Stack } from "@mui/material";
import { Edit3, Layout } from "lucide-react";
import EmailEditor, { EditorRef } from "react-email-editor";
import RichTextToolbar from "./RichTextToolbar";

interface EmailTabbedEditorProps {
    value: string;
    onChange: (html: string) => void;
    isLoading?: boolean;
}

export interface EmailTabbedEditorRef {
    exportContent: () => Promise<void>;
}


const EmailTabbedEditor = forwardRef<EmailTabbedEditorRef, EmailTabbedEditorProps>((
    { value, onChange, isLoading = false },
    ref
) => {
    const [activeTab, setActiveTab] = useState(0);
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
    const exportVisualBuilderContent = (): Promise<void> => {
        return new Promise((resolve) => {
            // Check if the Visual Builder editor exists and is ready
            if (editorRef.current?.editor) {
                const unlayer = editorRef.current.editor;
                console.log('[EmailTabbedEditor] Exporting from Visual Builder...');
                try {
                    unlayer.exportHtml((data: any) => {
                        const { html } = data;
                        console.log('[EmailTabbedEditor] Exported HTML length:', html?.length || 0);
                        if (html) {
                            setInternalHtml(html);
                            onChange(html);
                        }
                        resolve();
                    });
                } catch (error) {
                    console.error('[EmailTabbedEditor] Failed to export from Visual Builder:', error);
                    resolve();
                }
            } else {
                console.log('[EmailTabbedEditor] Visual Builder not initialized, using current HTML');
                // If Visual Builder hasn't been used, just resolve
                resolve();
            }
        });
    };

    // Expose exportContent method via ref
    useImperativeHandle(ref, () => ({
        exportContent: exportVisualBuilderContent,
    }));

    const handleTabChange = async (event: React.SyntheticEvent, newValue: number) => {
        // Export content before switching tabs if coming from Visual Builder
        if (activeTab === 1 && newValue !== 1) {
            await exportVisualBuilderContent();
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

    const onEditorReady = (unlayer: any) => {
        console.log('[EmailTabbedEditor] Visual Builder ready');

        // Note: We cannot load HTML into the Visual Builder because it uses a design JSON format.
        // The Visual Builder will start empty, which is the expected behavior.
        // If we want to preserve designs, we would need to save/load the design JSON separately.

        // Listen for design updates
        unlayer.addEventListener("design:updated", () => {
            unlayer.exportHtml((data: any) => {
                const { html } = data;
                setInternalHtml(html);
                onChange(html);
            });
        });
    };

    return (
        <Box sx={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "#f9fafb" }}>
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
            </Box>

            <Box sx={{ p: activeTab === 0 ? 0 : 0 }}>
                {activeTab === 0 ? (
                    <Box>
                        <RichTextToolbar onAction={execCommand} />
                        <Box sx={{ p: 2, minHeight: "400px", bgcolor: "white" }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                                Isi Email
                            </Typography>
                            <div
                                ref={contentEditableRef}
                                contentEditable
                                onInput={handleContentChange}
                                style={{
                                    minHeight: "350px",
                                    padding: "12px",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "4px",
                                    outline: "none",
                                    backgroundColor: "white",
                                    fontFamily: "inherit",
                                }}
                            />
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ height: "600px" }}>
                        <EmailEditor
                            ref={editorRef}
                            onReady={onEditorReady}
                            minHeight="600px"
                        />
                    </Box>
                )}
            </Box>
        </Box>
    );
});

EmailTabbedEditor.displayName = 'EmailTabbedEditor';

export default EmailTabbedEditor;
