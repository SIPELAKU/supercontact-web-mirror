"use client";

import { Suspense } from "react";
import Pagination from "@mui/material/Pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import KeyPeopleCard from "@/components/omnichannel/key-people/KeyPeopleCard";
import KeyPeopleCardSkeleton from "@/components/omnichannel/company/detail-company/KeyPeopleCardSkeleton";
import InputSearch from "@/components/ui/input-search";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useKeyPeople } from "@/lib/hooks/useKeyPeople";
import { KEY_PEOPLE_PAGE_SIZE, keyPeoplePageCount } from "@/lib/utils/keyPeople";

// The company's active Admins and Managers, to look up and contact. Read only:
// people are managed in Settings › Users, not here.
function KeyPeopleContent() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  // The API searches; one request a second at most while typing.
  const q = useDebounce(searchParams.get("q") ?? "", 1000);
  const { data, isLoading, isError } = useKeyPeople(page, q);
  const people = data?.people ?? [];
  const total = data?.total ?? 0;

  const setParams = (changes: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <div className="mt-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <InputSearch
          placeholder="Search by name, email or branch"
          handleSearch={(term) => setParams({ q: term || null, page: null })}
          searchParams={searchParams}
        />
        <p className="text-xs text-slate-500">Showing active Admins and Managers.</p>
      </div>

      {isError ? (
        <p className="mt-6 text-sm text-red-500">Key people could not be loaded. Try again later.</p>
      ) : isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <KeyPeopleCardSkeleton key={i} />
          ))}
        </div>
      ) : people.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          {q ? `Nobody matches "${q}".` : "No active Admins or Managers yet."}
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {people.map((person) => (
            <KeyPeopleCard key={person.id} person={person} />
          ))}
        </div>
      )}

      {total > KEY_PEOPLE_PAGE_SIZE && (
        <div className="mt-6 flex justify-center">
          <Pagination
            count={keyPeoplePageCount(total)}
            page={page}
            onChange={(_, next) => setParams({ page: next > 1 ? String(next) : null })}
            color="primary"
            size="small"
            showFirstButton
            showLastButton
          />
        </div>
      )}
    </>
  );
}

export default function SettingsCompanyKeyPeoplePage() {
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
      <Suspense>
        <KeyPeopleContent />
      </Suspense>
    </div>
  );
}
