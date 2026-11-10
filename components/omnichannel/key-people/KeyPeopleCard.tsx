"use client";

import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import type { CompanyProfileKeyPerson } from "@/lib/types/company-profile";
import { departmentLine, personInitials, presenceBadge, whatsappLink } from "@/lib/utils/keyPeople";
import { ContactLine } from "./ContactLine";

interface KeyPeopleCardProps {
  person: CompanyProfileKeyPerson;
}

// One person on Settings › Company Profile › Key People: who they are, where
// they sit, how to reach them. Only what the API knows is shown.
export default function KeyPeopleCard({ person }: KeyPeopleCardProps) {
  const where = departmentLine(person.department, person.branch) || person.location || "";
  const presence = presenceBadge(person.presence);
  return (
    <Card className="flex flex-col rounded-2xl! border border-slate-200 shadow-sm!">
      <CardContent className="flex flex-1 flex-col p-0!">
        <div className="flex items-start gap-3 p-4">
          <div className="relative shrink-0">
            <Avatar src={person.avatarUrl || undefined} alt={person.name} className="h-15! w-15!">
              {personInitials(person.name)}
            </Avatar>
            {presence && (
              <span
                title={presence.label}
                aria-label={presence.label}
                className={`absolute -bottom-0.5 right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${presence.dot}`}
              />
            )}
          </div>
          <div className="min-w-0">
            <Typography className="truncate text-sm! font-semibold! text-slate-900!">{person.name}</Typography>
            {person.title &&
              (person.departmentId ? (
                <Link
                  href={`/settings/organization/${person.departmentId}`}
                  title="Open this department"
                  className="block truncate text-xs font-medium text-[#5479EE] hover:underline"
                >
                  {person.title}
                </Link>
              ) : (
                <p className="truncate text-xs font-medium text-[#5479EE]">{person.title}</p>
              ))}
            {where && (
              <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{where}</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pb-3">
          {person.email && (
            <ContactLine icon={<Mail className="h-4 w-4" />} value={person.email} href={`mailto:${person.email}`} copyLabel="Copy email" />
          )}
          {person.phone && (
            <ContactLine
              icon={<Phone className="h-4 w-4" />}
              value={person.phone}
              href={whatsappLink(person.phone) ?? `tel:${person.phone}`}
              copyLabel="Copy phone number"
            />
          )}
        </div>

        {person.description && (
          <>
            <div className="flex justify-center">
              <Divider className="w-[93%]" />
            </div>
            <div className="p-4">
              <Typography className="line-clamp-3 text-xs! leading-relaxed! text-slate-600!">{person.description}</Typography>
            </div>
          </>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 p-4">
          {person.level ? (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-700">{person.level}</span>
          ) : (
            <span />
          )}
          <Link
            href={`/settings/general/company/key-people/${encodeURIComponent(person.id)}`}
            className="flex items-center gap-1 text-xs font-medium text-[#5479EE] hover:underline"
          >
            Full Profile <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
