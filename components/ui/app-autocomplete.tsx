"use client";

import React from "react";
import { Autocomplete, AutocompleteProps, Box, TextField, Typography } from "@mui/material";
import { ChevronDown } from "lucide-react";
import { styled } from "@mui/material/styles";

// --- Design Tokens (copied from app-input.tsx for consistency) ---
const INPUT_BG = "#FAFAF6";
const BORDER_COLOR = "#262B43/22"; // soft gray
const FOCUS_COLOR = "#5479EE";

// --- Styled Component (matching AppInput's StyledTextField) ---
const StyledTextField = styled(TextField, {
    shouldForwardProp: (prop) => prop !== "isBgWhite",
})<{ isBgWhite?: boolean; rounded?: string; height?: string; width?: string }>(
    ({ theme, isBgWhite, rounded, height, width }) => ({
        "& .MuiInputLabel-root": {
            fontSize: "14px",
            fontWeight: 500,
            color: "#6B7280",
            marginBottom: "6px",
        },

        "& .MuiOutlinedInput-root": {
            backgroundColor: isBgWhite ? "white" : INPUT_BG,
            borderRadius: rounded ? rounded : "6px",
            fontSize: "16px",
            fontWeight: 400,
            lineHeight: "24px",
            minHeight: height ? height : "40px", // Use minHeight for Autocomplete as it can grow
            width: width ? width : "100%",

            "& fieldset": {
                borderColor: BORDER_COLOR,
            },

            "&:hover fieldset": {
                borderColor: BORDER_COLOR,
            },

            "&.Mui-focused fieldset": {
                borderColor: FOCUS_COLOR,
                borderWidth: "1px",
            },

            "&.Mui-error fieldset": {
                borderColor: theme.palette.error.main,
            },

            // Adjust padding for Autocomplete tags
            "& .MuiAutocomplete-input": {
                padding: "4px 4px !important",
            },
            padding: "6px",
        },

        "& .MuiFormHelperText-root": {
            marginLeft: 0,
            fontSize: "12px",
        },

        "& .MuiFormLabel-asterisk": {
            color: "#EF4444", // red-500
        },
    })
);


export type AppAutocompleteProps<
    T,
    Multiple extends boolean | undefined,
    DisableClearable extends boolean | undefined,
    FreeSolo extends boolean | undefined
> = Omit<AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>, 'renderInput'> & {
    label?: string;
    placeholder?: string;
    error?: boolean;
    helperText?: React.ReactNode;
    isBgWhite?: boolean;
    rounded?: string;
    height?: string;
    width?: string;
    required?: boolean;
};

// --- Component ---
export function AppAutocomplete<
    T,
    Multiple extends boolean | undefined,
    DisableClearable extends boolean | undefined,
    FreeSolo extends boolean | undefined
>(props: AppAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>) {
    const {
        label,
        placeholder,
        error,
        helperText,
        isBgWhite,
        rounded,
        height,
        width,
        required,
        className,
        sx,
        fullWidth = true,
        ...autocompleteProps
    } = props;

    return (
        <Box
            className={className}
            sx={{ width: fullWidth ? "100%" : "auto", ...sx }}
        >
            {label && (
                <Typography
                    variant="body2"
                    sx={{ mb: 1, fontWeight: 500, color: "text.secondary" }}
                >
                    {label}
                </Typography>
            )}
            <Autocomplete
                popupIcon={<ChevronDown size={18} className="text-gray-500" />}
                {...autocompleteProps}
                renderInput={(params) => (
                    <StyledTextField
                        {...params}
                        placeholder={placeholder}
                        error={error}
                        helperText={helperText}
                        isBgWhite={isBgWhite}
                        rounded={rounded}
                        height={height}
                        width={width}
                        required={required}
                        fullWidth
                        InputLabelProps={{
                            ...params.InputLabelProps,
                            shrink: true, // Keep this to ensure placeholder/value doesn't overlap if we switch back, but effectively label is outside now
                        }}
                    />
                )}
            />
        </Box>
    );
}
