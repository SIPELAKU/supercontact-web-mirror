"use client";

// Desktop: exactly the height under the Topbar (h-[52px]), so the page itself
// never scrolls - only SettingsContent does, and both sidebars stay put. A
// sticky sidebar can't do this here: the app's content column is
// overflow-x-hidden (AuthenticatedLayout), which turns it into the scroll
// container and silently disables sticky inside it. Below lg the settings
// sidebar is a drawer and the window scrolls as before.
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex w-full lg:h-[calc(100vh-52px)] lg:overflow-hidden">{children}</div>;
}
