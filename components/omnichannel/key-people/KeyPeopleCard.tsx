"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import { useRouter } from "next/navigation";
import { KEY_PEOPLE_LIST } from "@/lib/data/company-key-people";
import { CompanyKeyPeopleCardSkeleton } from "..";

interface KeyPeopleCardProps {
  isLoading: boolean;
}

export default function KeyPeopleCard({ isLoading }: KeyPeopleCardProps) {
  const router = useRouter();

  if (isLoading) {
    return <CompanyKeyPeopleCardSkeleton />;
  }

  return (
    <Card className="rounded-2xl! shadow-lg!">
      <CardContent className="p-0!">
        {/* Header */}
        <div className="p-5">
          <Typography className="text-base! font-semibold!">Key People</Typography>
        </div>

        <Divider />

        {/* List */}
        <div className="px-5 py-3">
          {KEY_PEOPLE_LIST.map((person, index) => (
            <div key={person.id}>
              <div className="flex items-center gap-3 py-3">
                <Avatar src={person.avatarUrl} alt={person.name} className="h-9 w-9" />
                <div className="min-w-0">
                  <Typography className="text-sm! font-semibold!">{person.name}</Typography>
                  <Typography className="text-[11px]! text-slate-500!">{person.title}</Typography>
                </div>
              </div>

              {index !== KEY_PEOPLE_LIST.length - 1 && <Divider />}
            </div>
          ))}
        </div>

        <Divider />

        {/* Footer */}
        <div className="p-5 text-center">
          <button onClick={() => router.push("/omnichannel/key-people/1")} className="cursor-pointer text-xs font-medium text-[#5479EE] hover:underline">
            View All Employees
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
