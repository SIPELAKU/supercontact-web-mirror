"use client";

import KeyPeopleCard from "@/components/omnichannel/key-people/KeyPeopleCard";
import InputSearch from "@/components/ui/input-search";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchCompanyProfileKeyPeople } from "@/lib/api/company-profile";
import { KeyPersonType } from "@/lib/types/Company";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

export default function SettingsCompanyKeyPeoplePage() {
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
    <div>
      <SettingsPageHeader
        title="Key People"
        breadcrumbs={[
          { label: "Settings", href: "/settings" },
          { label: "Company Profile", href: "/settings/general/company" },
          { label: "Key People" },
        ]}
      />

      <div className="mt-4 flex flex-row items-center justify-between">
        <Suspense>
          <InputSearch placeholder="Search People" handleSearch={handleSearch} searchParams={searchParams} />
        </Suspense>

        {/*
          "Add People" / "Export" buttons removed: the backend only exposes
          read-only key-people endpoints (GET /company-profile/key-people[/{id}]);
          entries are derived from managed users, so there is no POST to wire an
          add flow to and no export endpoint. Re-add these buttons once the API
          supports those operations.
        */}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredKeyPeople.map((item) => (
          <KeyPeopleCard key={item.id} person={item} isLoading={isLoading} />
        ))}
      </div>
    </div>
  );
}
