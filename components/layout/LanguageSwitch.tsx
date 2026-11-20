"use client";

// ID/EN switch in the app Topbar. It shares one choice with the public site's
// Navbar button. Hidden while HIDDEN_FEATURES.languageSwitch is true.

import { AppButton } from "@/components/ui/app-button";
import { isFeatureHidden } from "@/lib/config/featureFlags";
import { LANGUAGE_OPTIONS } from "@/lib/constants/i18n";
import { useLanguage } from "@/lib/context/LanguageContext";
import { useT } from "@/lib/hooks/useT";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { Check, Languages } from "lucide-react";
import { useState } from "react";

export default function LanguageSwitch() {
  const { setLanguage } = useLanguage();
  const { t, language } = useT();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (isFeatureHidden("languageSwitch")) return null;

  const current = LANGUAGE_OPTIONS.find((option) => option.value === language);

  return (
    <>
      <AppButton
        variantStyle="text"
        aria-label={t.topbar.language}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchorEl)}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        className="h-9 min-w-0 gap-1.5 px-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        <Languages className="h-5 w-5" />
        {current?.short}
      </AppButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
      >
        {LANGUAGE_OPTIONS.map((option) => {
          const selected = option.value === language;
          return (
            <MenuItem
              key={option.value}
              selected={selected}
              lang={option.value}
              onClick={() => {
                setLanguage(option.value);
                setAnchorEl(null);
              }}
            >
              <ListItemIcon>{selected ? <Check className="h-4 w-4" /> : null}</ListItemIcon>
              <ListItemText>{option.label}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
