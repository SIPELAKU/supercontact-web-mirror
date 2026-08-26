"use client";

import { Eye, Pencil, Trash2, Copy, RotateCw, CircleStop } from "lucide-react";
import { AppButtonIconProps } from "./app-button-icon";
import { Spinner } from "./spinner";

interface ActionButtonProps extends Omit<AppButtonIconProps, "icon"> {
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    customTitle?: string;
}

import { IconButton, Tooltip } from "@mui/material";

export const EditButton: React.FC<ActionButtonProps> = ({ onClick, variantStyle, color, isLoading, customTitle, ...props }) => {
    return (
        <Tooltip title={customTitle || "Edit"}>
            <span>
                <IconButton size="small" onClick={onClick} disabled={isLoading} {...props}>
                    {isLoading ? <Spinner /> : <Pencil className="w-4 h-4" />}
                </IconButton>
            </span>
        </Tooltip>
    );
};

export const DeleteButton: React.FC<ActionButtonProps> = ({ onClick, color, variantStyle, isLoading, customTitle, ...props }) => {
    return (
        <Tooltip title={customTitle || "Delete"}>
            <span>
                <IconButton size="small" color="error" onClick={onClick} disabled={isLoading} {...props}>
                    {isLoading ? <Spinner /> : <Trash2 className="w-4 h-4" />}
                </IconButton>
            </span>
        </Tooltip>
    );
};

export const ViewButton: React.FC<ActionButtonProps> = ({ onClick, color, variantStyle, isLoading, customTitle, ...props }) => {
    return (
        <Tooltip title={customTitle || "View"}>
            <span>
                <IconButton size="small" onClick={onClick} disabled={isLoading} {...props}>
                    {isLoading ? <Spinner /> : <Eye className="w-4 h-4" />}
                </IconButton>
            </span>
        </Tooltip>
    );
};

export const DuplicateButton: React.FC<ActionButtonProps> = ({ onClick, color, variantStyle, isLoading, customTitle, ...props }) => {
    return (
        <Tooltip title={customTitle || "Duplicate"}>
            <span>
                <IconButton size="small" onClick={onClick} disabled={isLoading} {...props}>
                    {isLoading ? <Spinner /> : <Copy className="w-4 h-4" />}
                </IconButton>
            </span>
        </Tooltip>
    );
};

export const ResendButton: React.FC<ActionButtonProps> = ({ onClick, color, variantStyle, isLoading, customTitle, ...props }) => {
    return (
        <Tooltip title={customTitle || "Resend"}>
            <span>
                <IconButton size="small" color="primary" onClick={onClick} disabled={isLoading} {...props}>
                    {isLoading ? <Spinner /> : <RotateCw className="w-4 h-4" />}
                </IconButton>
            </span>
        </Tooltip>
    );
};

export const StopButton: React.FC<ActionButtonProps> = ({ onClick, color, variantStyle, isLoading, customTitle, ...props }) => {
    return (
        <Tooltip title={customTitle || "Stop"}>
            <span>
                <IconButton size="small" color="warning" onClick={onClick} disabled={isLoading} {...props}>
                    {isLoading ? <Spinner /> : <CircleStop className="w-4 h-4" />}
                </IconButton>
            </span>
        </Tooltip>
    );
};
