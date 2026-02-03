"use client";

import BannerDashboard from "@/components/ui/banner-dashboard";
import { SortOrder } from "@/lib/models/types";
import { useState, useEffect } from "react";
import { IoIosAdd, IoIosSearch } from "react-icons/io";
import { BiSolidBellRing } from "react-icons/bi";
import AddNoteModal from "@/components/modal/AddNote";
import { Note } from "@/lib/models/types";
import { GetRelativeTime } from "@/lib/utils";
import EditNoteModal from "@/components/modal/EditNote";
import { useAuth } from "@/lib/context/AuthContext";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { AppButton } from "@/components/ui/app-button";
import { useDebounce } from "@/lib/hooks/useDebounce";

export default function NotesPage() {
  const { getToken } = useAuth();
  const [order, setOrder] = useState<SortOrder>("");
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [dataNote, setDataNote] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const loadDataAgain = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notes?search=${debouncedSearch}&sort_order=${order}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const res = await response.json();
      const notes = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.notes)
          ? res.data.notes
          : [];
      setDataNote(notes);
    } catch (error) {
      console.error("Error loading notes:", error);
      setDataNote([]);
    }
  };

  function handleEdit(item: Note, id: string) {
    setSelectedNote(item);
    setSelectedId(id);
    setOpenEdit(true);
  }

  useEffect(() => {
    loadDataAgain();
  }, [debouncedSearch, order]);

  return (
    <div className="w-full flex flex-col gap-4 p-4 md:p-8">
      <BannerDashboard title="Notes" breadcrumbs={["Dashboard", "Notes"]} />

      <div className="w-full flex flex-col md:flex-row md:items-center gap-3 md:gap-4 border-b pb-4">
        {/* SEARCH — selalu prioritas lebar */}
        <div className="w-full md:flex-1">
          <AppInput
            startIcon={<IoIosSearch />}
            placeholder="Search Notes"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            isBgWhite
            rounded="30px"
          />
        </div>

        {/* RIGHT CONTROLS */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2 md:gap-3 md:shrink-0">
          <div className="w-full sm:w-48">
            <AppSelect
              value={order}
              placeholder="Sort by"
              onChange={(e) => setOrder(e.target.value as SortOrder)}
              options={[
                { value: "", label: "Sort by" },
                { value: "asc", label: "Oldest" },
                { value: "desc", label: "Newest" },
              ]}
              fullWidth
              isBgWhite
            />
          </div>

          <div className="w-full sm:w-auto">
            <AppButton
              onClick={() => setOpenAdd(true)}
              variantStyle="primary"
              color="primary"
              startIcon={<IoIosAdd />}
              className="whitespace-nowrap px-5"
            >
              Add New Notes
            </AppButton>
          </div>
        </div>
      </div>

      {dataNote.length === 0 && (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">No notes found</p>
        </div>
      )}
      {dataNote.map((item, i) => (
        <button
          onClick={() => handleEdit(item, item.id)}
          key={i}
          className="drop-shadow-xl cursor-pointer"
        >
          <div className="flex justify-between rounded-md items-center p-4 border-l-8 border-[#6739EC] bg-white">
            <div className="flex flex-col items-start gap-2">
              <div className="flex gap-2 items-center text-sm bg-amber-200 text-amber-500 px-4 py-2 rounded-full">
                <BiSolidBellRing />
                {GetRelativeTime(item.reminder_date, item.reminder_time)}
              </div>
              <h1 className="font-semibold">{item?.title}</h1>
              <div className="text-gray-500">{item?.content}</div>
            </div>
            <div>{GetRelativeTime(item.reminder_date, item.reminder_time)}</div>
          </div>
        </button>
      ))}

      <AddNoteModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={loadDataAgain}
      />

      <EditNoteModal
        open={openEdit}
        initialData={selectedNote}
        id={selectedId}
        onClose={() => setOpenEdit(false)}
        onSuccess={loadDataAgain}
      />
    </div>
  );
}
