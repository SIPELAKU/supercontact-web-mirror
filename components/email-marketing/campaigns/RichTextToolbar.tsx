"use client";

import React from "react";
import {
    Bold,
    Italic,
    Strikethrough,
    List,
    ListOrdered,
    Quote,
    Code,
    Minus,
    Undo2,
    Redo2,
    RemoveFormatting,
    Type
} from "lucide-react";
import { Box, Button, MenuItem, Select, Stack, Tooltip } from "@mui/material";

interface RichTextToolbarProps {
    onAction: (command: string, value?: string) => void;
}

const RichTextToolbar: React.FC<RichTextToolbarProps> = ({ onAction }) => {
    const handleCommand = (e: React.MouseEvent, command: string, value: string = "") => {
        e.preventDefault();
        onAction(command, value);
    };

    return (
        <Box
            sx={{
                p: 1,
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 0.5,
                bgcolor: "white",
            }}
        >
            <Select
                size="small"
                defaultValue="p"
                onChange={(e) => onAction("formatBlock", e.target.value)}
                sx={{
                    height: 32,
                    minWidth: 120,
                    "& .MuiSelect-select": { py: 0.5, fontSize: "14px" }
                }}
            >
                <MenuItem value="p">Paragraph</MenuItem>
                <MenuItem value="h1">Heading 1</MenuItem>
                <MenuItem value="h2">Heading 2</MenuItem>
                <MenuItem value="h3">Heading 3</MenuItem>
            </Select>

            <Box sx={{ width: "1px", height: 24, bgcolor: "#e5e7eb", mx: 1 }} />

            <Stack direction="row" spacing={0.5}>
                <ToolbarButton
                    icon={<Bold size={18} />}
                    onClick={(e) => handleCommand(e, "bold")}
                    tooltip="Bold"
                />
                <ToolbarButton
                    icon={<Italic size={18} />}
                    onClick={(e) => handleCommand(e, "italic")}
                    tooltip="Italic"
                />
                <ToolbarButton
                    icon={<Strikethrough size={18} />}
                    onClick={(e) => handleCommand(e, "strikeThrough")}
                    tooltip="Strikethrough"
                />
            </Stack>

            <Box sx={{ width: "1px", height: 24, bgcolor: "#e5e7eb", mx: 1 }} />

            <Stack direction="row" spacing={0.5}>
                <ToolbarButton
                    icon={<ListOrdered size={18} />}
                    onClick={(e) => handleCommand(e, "insertOrderedList")}
                    tooltip="Numbered List"
                />
                <ToolbarButton
                    icon={<List size={18} />}
                    onClick={(e) => handleCommand(e, "insertUnorderedList")}
                    tooltip="Bullet List"
                />
            </Stack>

            <Box sx={{ width: "1px", height: 24, bgcolor: "#e5e7eb", mx: 1 }} />

            <Stack direction="row" spacing={0.5}>
                <ToolbarButton
                    icon={<Quote size={18} />}
                    onClick={(e) => handleCommand(e, "formatBlock", "blockquote")}
                    tooltip="Quote"
                />
                <ToolbarButton
                    icon={<Code size={18} />}
                    onClick={(e) => handleCommand(e, "formatBlock", "pre")}
                    tooltip="Code"
                />
                <ToolbarButton
                    icon={<Minus size={18} />}
                    onClick={(e) => handleCommand(e, "insertHorizontalRule")}
                    tooltip="Horizontal Line"
                />
            </Stack>

            <Box sx={{ width: "1px", height: 24, bgcolor: "#e5e7eb", mx: 1 }} />

            <Stack direction="row" spacing={0.5}>
                <ToolbarButton
                    icon={<Undo2 size={18} />}
                    onClick={(e) => handleCommand(e, "undo")}
                    tooltip="Undo"
                />
                <ToolbarButton
                    icon={<Redo2 size={18} />}
                    onClick={(e) => handleCommand(e, "redo")}
                    tooltip="Redo"
                />
                <ToolbarButton
                    icon={<RemoveFormatting size={18} />}
                    onClick={(e) => handleCommand(e, "removeFormat")}
                    tooltip="Clear Formatting"
                />
            </Stack>
        </Box>
    );
};

interface ToolbarButtonProps {
    icon: React.ReactNode;
    onClick: (e: React.MouseEvent) => void;
    tooltip: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, onClick, tooltip }) => (
    <Tooltip title={tooltip} arrow>
        <Button
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss from editor
            onClick={onClick}
            sx={{
                minWidth: 32,
                width: 32,
                height: 32,
                p: 0,
                color: "#4b5563",
                "&:hover": {
                    bgcolor: "#f3f4f6",
                    color: "#111827",
                },
            }}
        >
            {icon}
        </Button>
    </Tooltip>
);

export default RichTextToolbar;
