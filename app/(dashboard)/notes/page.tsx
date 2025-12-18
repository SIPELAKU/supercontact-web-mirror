'use client'

import BannerDashboard from "@/components/ui/banner-dashboard"
import { usePathname } from "next/navigation"
import { SortOrder } from "@/lib/models/types"
import { useState, useEffect } from "react"
import { IoIosSearch } from "react-icons/io";
import { BiSolidBellRing } from "react-icons/bi";
import AddNoteModal from "@/components/modal/AddNote"
import { Note } from "@/lib/models/types"
import { GetRelativeTime } from "@/lib/utils"
import EditNoteModal from "@/components/modal/EditNote"

export default function NotesPage(){
    const pathname = usePathname()
    const [order, setOrder] = useState<SortOrder>("");
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [selectedId, setSelectedId]= useState(0)
    const [dataNote, setDataNote] = useState<Note[]>([])


      const loadDataAgain = () => {
        fetch("/api/note")
          .then((res) => res.json())
          .then((data) => setDataNote(data.data));
      };
    
      function handleEdit(item : Note, id: number) {
        setSelectedNote(item);
        setSelectedId(id)
        setOpenEdit(true);
      }
    
      useEffect(() => {
        loadDataAgain();
      }, []);

    return(
    <div className="w-full flex flex-col gap-4 p-4 md:p-8">
      <BannerDashboard
        title="Notes"
        breadcrumbs={["Dashboard", "Notes"]}
      />
      <div className="w-full flex gap-4 border-b pb-4">
        <div className="relative w-2/3">
          <IoIosSearch className="absolute text-xl left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Notes"
            className="border w-full text-black border-gray-400 rounded-full pl-10 pr-4 py-2"
          />
        </div>
        <div className="flex w-1/3 gap-2">
          <select
              value={order}
              onChange={(e) => setOrder(e.target.value as SortOrder)}
              className="border border-gray-400 p-2 rounded-md w-1/3"
            >
              <option value="" disabled>Date created</option>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
          </select>
          <button onClick={() => setOpenAdd(true)} className="bg-[#6739EC] text-white p-2 rounded-md w-2/3">+ Add New Notes</button>
        </div>
      </div>
      {dataNote.map((item, i)=>(
        <button onClick={() => handleEdit(item, item.id)} key={i} className="drop-shadow-xl cursor-pointer">
          <div className="flex justify-between rounded-md items-center p-4 border-l-8 border-[#6739EC] bg-white">
            <div className="flex flex-col items-start gap-2">
              <div className="flex gap-2 items-center text-sm bg-amber-200 text-amber-500 px-4 py-2 rounded-full">
                <BiSolidBellRing />
                {GetRelativeTime(item.date, item.time)}
              </div>
              <h1 className="font-semibold">{item?.title}</h1>
              <div className="text-gray-500">
                {item?.content}
              </div>
            </div>
            <div>{GetRelativeTime(item.date, item.time)}</div>
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
    )
}