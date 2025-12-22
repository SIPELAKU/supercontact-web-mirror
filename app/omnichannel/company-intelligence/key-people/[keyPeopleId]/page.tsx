"use client";

import KeyPeopleCard from "@/components/omnichannel/key-people/KeyPeopleCard";
import PageHeader from "@/components/ui-mui/page-header";
import InputSearch from "@/components/ui/input-search";
import { KeyPersonType } from "@/lib/type/Company";
import { Button } from "@mui/material";
import { Plus, Upload } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

const KEY_PEOPLE: KeyPersonType[] = [
  {
    id: "1",
    name: "Sarah Connor",
    title: "Chief Executive Officer",
    location: "San Francisco, CA",
    avatarUrl: "https://i.pravatar.cc/120?img=47",
    status: "online",
    email: "sarah@acmecorp.com",
    phone: "+1 (555) 123-4567",
    description: "Driving global strategy and innovation. Formerly VP of Operations at TechGiant. Known for aggressive market expansion and product-led growth strategies.",
    badgeLabel: "Decision Maker",
    badgeTone: "blue",
  },
  {
    id: "2",
    name: "John Reese",
    title: "Chief Technology Officer",
    location: "New York, NY",
    avatarUrl: "https://i.pravatar.cc/120?img=12",
    status: "idle",
    email: "john@acmecorp.com",
    profileLinkLabel: "linkedin.com/in/jreese",
    description: "Leading technical vision and engineering teams. Focus on AI integration and cloud infrastructure scalability. 15+ years in SaaS architecture.",
    badgeLabel: "Technical Lead",
    badgeTone: "red",
  },
  {
    id: "3",
    name: "Emily Chen",
    title: "VP of Sales",
    location: "Austin, TX",
    avatarUrl: "https://i.pravatar.cc/120?img=32",
    status: "offline",
    email: "emily@acmecorp.com",
    phone: "+1 (555) 987-6543",
    description: "Managing enterprise accounts and sales strategy for North America. Expert in B2B negotiation and building high-performance sales cultures.",
    badgeLabel: "Budget Owner",
    badgeTone: "green",
  },
  {
    id: "4",
    name: "Michael Scott",
    title: "Head of Marketing",
    location: "London, UK",
    avatarUrl: "https://i.pravatar.cc/120?img=5",
    status: "online",
    email: "michael@acmecorp.com",
    profileLinkLabel: "@mscott_mktg",
    description: "Overseeing brand identity and digital campaigns. Driving lead generation through content marketing and social engagement.",
    badgeLabel: "Influencer",
    badgeTone: "purple",
  },
  {
    id: "5",
    name: "Lisa Wong",
    title: "Chief Financial Officer",
    location: "San Francisco, CA",
    avatarUrl: "https://i.pravatar.cc/120?img=15",
    status: "offline",
    email: "lisa@acmecorp.com",
    profileLinkLabel: "view recent filings",
    description: "Managing financial risk, planning, and record-keeping. Key stakeholder in all major procurement decisions over $50k.",
    badgeLabel: "Final Approver",
    badgeTone: "orange",
  },
  {
    id: "6",
    name: "David Kim",
    title: "VP of Product",
    location: "Remote",
    initials: "DK",
    status: "online",
    email: "david@acmecorp.com",
    profileLinkLabel: "Usually busy Tue/Thu",
    description: "Defining the product roadmap and user experience. Balances stakeholder needs with engineering constraints.",
    badgeLabel: "Evaluator",
    badgeTone: "cyan",
  },
];

export default function KeyPeoplePage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // SEARCH PEOPLE
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }

    replace(`${pathname}?${params.toString()}`);
  };

  const searchQuery = searchParams.get("q")?.toLowerCase() ?? "";

  function normalize(value: string) {
    return value.trim().toLowerCase();
  }

  const filteredKeyPeople = useMemo(() => {
    if (!searchQuery) return KEY_PEOPLE;

    return KEY_PEOPLE.filter((p) => {
      const haystack = [p.name, p.title, p.location, p.email, p.phone, p.description, p.badgeLabel, p.profileLinkLabel, p.status].filter(Boolean).join(" ");

      return normalize(haystack).includes(searchQuery);
    });
  }, [searchQuery]);
  return (
    <div className="p-6">
      <PageHeader title="Key People" breadcrumbs={[{ label: "Omnichannel" }, { label: "Key People" }]} />

      <div className="mt-10 flex flex-row items-center justify-between">
        <Suspense>
          <InputSearch placeholder="Search People" handleSearch={handleSearch} searchParams={searchParams} />
        </Suspense>

        <div className="flex items-center gap-2">
          <Button variant="contained" className="min-w-40! bg-[#5479EE]! pl-2! capitalize! hover:bg-[#5479EE]/80!">
            <Plus className="mr-2 ml-1 h-3.5 w-3.5" /> Add People
          </Button>
          <Button variant="outlined" className="min-w-[98px]! border-gray-500! text-gray-500! capitalize!">
            <Upload className="mr-2 ml-1 h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredKeyPeople.map((item) => (
          <KeyPeopleCard key={item.id} person={item} isLoading={isLoading} />
        ))}
      </div>
    </div>
  );
}
