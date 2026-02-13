"use client";

import React, { useState, useRef, useEffect } from "react";
import { Box, Tabs, Tab, Typography, Stack } from "@mui/material";
import { Edit3, Layout } from "lucide-react";
import EmailEditor, { EditorRef } from "react-email-editor";
import RichTextToolbar from "./RichTextToolbar";

interface EmailTabbedEditorProps {
    value: string;
    onChange: (html: string) => void;
    isLoading?: boolean;
}

const EmailTabbedEditor: React.FC<EmailTabbedEditorProps> = ({
    value,
    onChange,
    isLoading = false,
}) => {
    const [activeTab, setActiveTab] = useState(0);
    const editorRef = useRef<EditorRef>(null);
    const contentEditableRef = useRef<HTMLDivElement>(null);

    // Sync value from props to contentEditable
    useEffect(() => {
        if (contentEditableRef.current && contentEditableRef.current.innerHTML !== value) {
            contentEditableRef.current.innerHTML = value;
        }
    }, [activeTab]); // Only sync when switching tabs or initial load

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const execCommand = (command: string, value: string = "") => {
        document.execCommand(command, false, value);
        if (contentEditableRef.current) {
            onChange(contentEditableRef.current.innerHTML);
        }
    };

    const handleContentChange = () => {
        if (contentEditableRef.current) {
            onChange(contentEditableRef.current.innerHTML);
        }
    };

    const onEditorExport = () => {
        const unlayer = editorRef.current?.editor;
        unlayer?.exportHtml((data) => {
            const { html } = data;
            onChange(html);
        });
    };

    const onEditorReady = () => {
        // If we have existing HTML, we try to load it. 
        // Note: react-email-editor works best with its own JSON format, 
        // but we can try to load HTML if needed, though it might not be perfect.
        // For now, we'll just let the user build from scratch or existing JSON if we had it.
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
                            onLoad={onEditorReady}
                            minHeight="600px"
                        />
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default EmailTabbedEditor;
