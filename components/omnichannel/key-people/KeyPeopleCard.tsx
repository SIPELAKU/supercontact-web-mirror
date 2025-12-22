"use client";

import { KeyPersonType, Status } from "@/lib/type/Company";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { ArrowRight, Link as LinkIcon, Mail, MapPin, MoreVertical, Phone } from "lucide-react";
import KeyPeopleCardSkeleton from "../company/detail-company/KeyPeopleCardSkeleton";

interface KeyPeopleCardProps {
  person: KeyPersonType;
  isLoading: boolean;
}

function statusDotClass(status: Status) {
  if (status === "online") return "bg-green-500";
  if (status === "idle") return "bg-yellow-400";
  return "bg-slate-300";
}

function badgeClass(tone: KeyPersonType["badgeTone"]) {
  switch (tone) {
    case "red":
      return "bg-red-100 text-red-700";
    case "green":
      return "bg-green-100 text-green-700";
    case "purple":
      return "bg-purple-100 text-purple-700";
    case "orange":
      return "bg-orange-100 text-orange-700";
    case "cyan":
      return "bg-cyan-100 text-cyan-700";
    case "blue":
    default:
      return "bg-blue-100 text-blue-700";
  }
}

export default function KeyPeopleCard({ person, isLoading }: KeyPeopleCardProps) {
  if (isLoading) return <KeyPeopleCardSkeleton />;
  return (
    <Card className="rounded-2xl! border border-slate-200 shadow-sm!">
      <CardContent className="p-0!">
        {/* Top */}
        <div className="flex items-start justify-between gap-3 p-4">
          <div className="flex items-start gap-3">
            <div className="relative">
              <Avatar src={person.avatarUrl} alt={person.name} className="h-15! w-15!">
                {person.initials}
              </Avatar>
              <span className={["absolute -bottom-0.5 right-1 h-3.5 w-3.5 rounded-full border-2 border-white", statusDotClass(person.status)].join(" ")} />
            </div>

            <div className="min-w-0">
              <Typography className="truncate text-sm! font-semibold! text-slate-900!">{person.name}</Typography>

              <button className="truncate text-left text-xs font-medium text-[#5479EE] hover:underline">{person.title}</button>

              <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{person.location}</span>
              </div>
            </div>
          </div>

          <IconButton size="small">
            <MoreVertical className="h-4 w-4 text-slate-500" />
          </IconButton>
        </div>

        {/* Contacts */}
        <div className="px-4 pb-3">
          {person.email && (
            <div className="flex items-center gap-2 py-1 text-[12px] text-slate-600">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="truncate">{person.email}</span>
            </div>
          )}

          {person.phone && (
            <div className="flex items-center gap-2 py-1 text-[12px] text-slate-600">
              <Phone className="h-4 w-4 text-slate-400" />
              <span className="truncate">{person.phone}</span>
            </div>
          )}

          {person.profileLinkLabel && (
            <div className="flex items-center gap-2 py-1 text-[12px] text-slate-600">
              <LinkIcon className="h-4 w-4 text-slate-400" />
              <span className="truncate">{person.profileLinkLabel}</span>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Divider className="w-[93%] " />
        </div>

        {/* Description */}
        <div className="p-4">
          <Typography className="text-xs! leading-relaxed! text-slate-600!">{person.description}</Typography>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-4">
          <span className={["rounded-full px-3 py-1 text-[11px] font-semibold", badgeClass(person.badgeTone)].join(" ")}>{person.badgeLabel}</span>

          <button className="flex items-center gap-1 text-xs font-medium text-[#5479EE] hover:underline">
            Full Profile <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
