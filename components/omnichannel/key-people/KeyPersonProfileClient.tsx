"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Paper, Skeleton, Stack, Typography } from "@mui/material";
import { CalendarToday, CheckCircle, Email, LocationOn, Phone, Schedule, Star, Work } from "@mui/icons-material";
import { ArrowLeft } from "lucide-react";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import { ProfileHeroCard } from "@/components/profile/ProfileHeroCard";
import { ProfileInfoCard } from "@/components/profile/ProfileInfoCard";
import { useKeyPersonDetail } from "@/lib/hooks/useKeyPeople";
import { departmentLine, personInitials, presenceBadge, whatsappLink } from "@/lib/utils/keyPeople";
import { formatJoinedDate, localTime } from "@/lib/utils/profileFormat";
import { ContactLink } from "./ContactLine";
import { CopyIconButton } from "./CopyIconButton";

const iconSx = { color: "text.secondary", fontSize: 20 };

// The clock where someone is, refreshed every minute.
function useLocalTime(timezone?: string) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!timezone) return;
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, [timezone]);
  return localTime(timezone, now);
}

function Contact({ value, href, copyLabel }: { value: string; href: string; copyLabel: string }) {
  return (
    <span className="flex min-w-0 max-w-full items-center gap-1 text-sm text-slate-600">
      <ContactLink value={value} href={href} />
      <CopyIconButton value={value} label={copyLabel} />
    </span>
  );
}

// Key People › one person: read only, laid out like My Profile.
export default function KeyPersonProfileClient({ id }: { id: string }) {
  const { data: person, isLoading, isError } = useKeyPersonDetail(id);
  const clock = useLocalTime(person?.timezone);

  const breadcrumbs = [
    { label: "Settings", href: "/settings" },
    { label: "Company Profile", href: "/settings/general/company" },
    { label: "Key People", href: "/settings/general/company/key-people" },
    { label: person?.name || "Profile" },
  ];

  const back = (
    <Link href="/settings/general/company/key-people" className="inline-flex items-center gap-1 text-sm text-[#5479EE] hover:underline">
      <ArrowLeft className="h-4 w-4" /> Key People
    </Link>
  );

  if (isLoading) {
    return (
      <div>
        <SettingsPageHeader title="Profile" breadcrumbs={breadcrumbs} />
        <Stack spacing={4} mt={2}>
          <Skeleton variant="rounded" height={280} />
          <Skeleton variant="rounded" height={220} />
        </Stack>
      </div>
    );
  }

  if (isError || !person) {
    return (
      <div>
        <SettingsPageHeader title="Profile" breadcrumbs={breadcrumbs} />
        <div className="mt-4 space-y-3">
          {back}
          <p className="text-sm text-red-500">This profile could not be loaded. The person may no longer be an active Admin or Manager.</p>
        </div>
      </div>
    );
  }

  const presence = presenceBadge(person.presence);
  const role = [person.title, person.department].filter(Boolean).join(" · ");
  const place = [person.branch, person.country].filter(Boolean).join(", ");

  return (
    <div>
      <SettingsPageHeader title={person.name} breadcrumbs={breadcrumbs} />
      <div className="mt-4">{back}</div>
      <Stack spacing={4} mt={2}>
        <ProfileHeroCard
          name={person.name}
          avatarUrl={person.avatarUrl}
          avatarFallback={personInitials(person.name)}
          nameAdornment={
            presence && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                <span className={`h-2 w-2 rounded-full ${presence.dot}`} />
                {presence.label}
              </span>
            )
          }
          meta={[
            ...(role ? [{ icon: <Work fontSize="small" />, text: role }] : []),
            ...(place ? [{ icon: <LocationOn fontSize="small" />, text: place }] : []),
            ...(person.joinedAt ? [{ icon: <CalendarToday fontSize="small" />, text: formatJoinedDate(person.joinedAt) }] : []),
          ]}
        />

        <ProfileInfoCard
          hideEmpty
          layout="narrow"
          sections={[
            {
              heading: "ABOUT",
              rows: [
                { icon: <Star sx={iconSx} />, label: "Level", value: person.level },
                { icon: <Work sx={iconSx} />, label: "Department", value: departmentLine(person.department, person.branch) },
                { icon: <CheckCircle sx={iconSx} />, label: "Employee ID", value: person.employeeCode },
                { icon: "🏳️", label: "Country", value: person.country },
                { icon: "🌐", label: "Language", value: person.language },
              ],
            },
            {
              heading: "CONTACTS",
              rows: [
                {
                  icon: <Phone sx={iconSx} />,
                  label: "Contact",
                  value: person.phone && (
                    <Contact value={person.phone} href={whatsappLink(person.phone) ?? `tel:${person.phone}`} copyLabel="Copy phone number" />
                  ),
                },
                {
                  icon: <Email sx={iconSx} />,
                  label: "Email",
                  value: person.email && <Contact value={person.email} href={`mailto:${person.email}`} copyLabel="Copy email" />,
                },
                {
                  icon: <Schedule sx={iconSx} />,
                  label: "Local time",
                  value: clock && `${clock} (${person.timezone})`,
                },
              ],
            },
          ]}
        >
          {person.description && (
            <Paper variant="outlined" sx={{ mt: 4, p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={1} sx={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                BIO
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                {person.description}
              </Typography>
            </Paper>
          )}
        </ProfileInfoCard>
      </Stack>
    </div>
  );
}
