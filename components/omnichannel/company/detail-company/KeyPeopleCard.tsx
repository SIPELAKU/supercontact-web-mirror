"use client";

import { KEY_PEOPLE_LIST } from "@/lib/data/company-key-people";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { CompanyKeyPeopleCardSkeleton } from "../..";

interface KeyPeopleCardProps {
  isLoading: boolean;
  people?: Array<{
    id: string;
    name: string;
    title: string;
    avatarUrl?: string;
  }>;
  viewAllHref?: string;
}

export default function KeyPeopleCard({ isLoading, people, viewAllHref }: KeyPeopleCardProps) {
  const router = useRouter();
  const peopleList = people && people.length > 0 ? people : KEY_PEOPLE_LIST;

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
          {peopleList.map((person, index) => (
            <div key={person.id}>
              <div className="flex items-center gap-3 py-3">
                <Avatar src={person.avatarUrl} alt={person.name} className="h-9 w-9" />
                <div className="min-w-0">
                  <Typography className="text-sm! font-semibold!">{person.name}</Typography>
                  <Typography className="text-[11px]! text-slate-500!">{person.title}</Typography>
                </div>
              </div>

              {index !== peopleList.length - 1 && <Divider />}
            </div>
          ))}
        </div>

        <Divider />

        {/* Footer */}
        <div className="p-5 text-center">
          <button
            onClick={() => router.push(viewAllHref || "/omnichannel/company-intelligence/key-people/1")}
            className="cursor-pointer text-xs font-medium text-[#5479EE] hover:underline"
          >
            View All Employees
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
