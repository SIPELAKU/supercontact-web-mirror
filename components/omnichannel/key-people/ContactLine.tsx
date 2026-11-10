"use client";

import { CopyIconButton } from "./CopyIconButton";

interface ContactLineProps {
  icon: React.ReactNode;
  /** What is shown and copied. */
  value: string;
  /** Where a click on the value goes, e.g. mailto:. */
  href: string;
  copyLabel: string;
}

// An email or phone number on a Key People card: click it to write or call,
// or copy it with the icon beside it.
export function ContactLine({ icon, value, href, copyLabel }: ContactLineProps) {
  return (
    <div className="flex items-center gap-2 py-1 text-[12px] text-slate-600">
      <span className="shrink-0 text-slate-400">{icon}</span>
      <ContactLink value={value} href={href} />
      <span className="ml-auto">
        <CopyIconButton value={value} label={copyLabel} />
      </span>
    </div>
  );
}

export function ContactLink({ value, href }: { value: string; href: string }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      className="min-w-0 truncate hover:text-[#5479EE] hover:underline"
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {value}
    </a>
  );
}
