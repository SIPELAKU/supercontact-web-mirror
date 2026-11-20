"use client";

// The logged-in app's text in the chosen language:
//   const { t, nav } = useT();
//   t.topbar.notifications, formatText(t.topbar.notificationsUnread, { count }), nav("Contacts")

import { useLanguage } from "@/lib/context/LanguageContext";
import { DICTIONARIES } from "@/lib/constants/i18n";
import { navLabel } from "@/lib/utils/language";

export function useT() {
  const { appLanguage } = useLanguage();
  const t = DICTIONARIES[appLanguage];
  return { t, language: appLanguage, nav: (name: string) => navLabel(t, name) };
}
