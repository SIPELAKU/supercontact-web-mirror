// lib/constants/i18n/en.ts
//
// English text of the logged-in app. id.ts must have exactly the same keys
// (TypeScript checks it). Placeholders such as {count} are filled by
// formatText() in lib/utils/language.ts.
//
// The English here is the text the app shows today, so it does not change
// anything on screen while the language switch is hidden.

export const en = {
  topbar: {
    toggleNavigation: "Toggle navigation menu",
    toggleSidebar: "Toggle sidebar",
    notifications: "Notifications",
    notificationsUnread: "Notifications, {count} unread",
    language: "Language",
  },
  profileMenu: {
    profile: "profile",
    loading: "Loading...",
    loadingEmail: "loading...",
    noCompany: "No Company",
    userFallback: "User",
    myProfile: "My Profile",
    accountSettings: "Account Settings",
    myInbox: "My Inbox",
    messagesAndEmails: "Messages & Emails",
    logout: "Logout",
  },
  // Menu names of the Sidebar and the Settings menu, keyed by their English
  // name in lib/config/sidebarNav.ts and lib/config/settingsNav.ts. English
  // needs no entries: the name itself is the English label.
  navLabels: {} as Record<string, string>,
};

export type Dictionary = typeof en;
