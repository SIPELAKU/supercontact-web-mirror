"use client";

import KeyPeopleCard from "@/components/omnichannel/key-people/KeyPeopleCard";
import InputSearch from "@/components/ui/input-search";
import PageHeader from "@/components/ui/page-header";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchCompanyProfileKeyPeople } from "@/lib/api/company-profile";
import { KeyPersonType } from "@/lib/types/Company";
import { Button } from "@mui/material";
import { Plus, Upload } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

export default function CompanyProfileKeyPeoplePage() {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [people, setPeople] = useState<KeyPersonType[]>([]);

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

  useEffect(() => {
    let isMounted = true;
    const loadKeyPeople = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        const result = await fetchCompanyProfileKeyPeople(token, 1, 12);
        if (!isMounted) return;
        const mapped: KeyPersonType[] = result.map((person) => ({
          id: person.id,
          name: person.name,
          title: person.title || "-",
          location: person.location || "-",
          avatarUrl: person.avatarUrl,
          status: "online",
          email: person.email,
          phone: person.phone,
          description: person.description || "No description provided.",
          badgeLabel: person.title || "Team Member",
          badgeTone: "blue",
        }));
        setPeople(mapped);
      } catch (error) {
        if (!isMounted) return;
        setPeople([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadKeyPeople();
    return () => {
      isMounted = false;
    };
  }, [getToken]);

  const searchQuery = searchParams.get("q")?.toLowerCase() ?? "";

  const filteredKeyPeople = useMemo(() => {
    if (!searchQuery) return people;

    return people.filter((p) => {
      const haystack = [
        p.name,
        p.title,
        p.location,
        p.email,
        p.phone,
        p.description,
        p.badgeLabel,
        p.profileLinkLabel,
        p.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(searchQuery);
    });
  }, [people, searchQuery]);

  return (
    <div className="p-6">
      <PageHeader
        title="Key People"
        breadcrumbs={[{ label: "Company Profile", href: "/admin/company-profile" }, { label: "Key People" }]}
      />

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
