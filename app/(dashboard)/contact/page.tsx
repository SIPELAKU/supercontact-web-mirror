"use client";

import {
  Eye,
  Pencil,
  Trash2,
  Search,
  Upload,
  SlidersHorizontal,
  Filter
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import AddContactModal from "@/components/modal/AddContact";
import EditContactModal from "@/components/modal/EditContact";

interface Contact {
    id: number,
    name: string,
    email: string,
    phone: string,
    posisi: string,
    company: string,
}

export default function ContactsPage() {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Contact | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(1);


  const [dataContact, setDataContact] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  const loadDataAgain = () => {
    fetch("/api/contact")
      .then((res) => res.json())
      .then((data) => setDataContact(data.data));
  };

  function handleEdit(item : Contact, index: number) {
    setSelectedItem(item);
    setSelectedIndex(index);
    setOpenEdit(true);
  }

  useEffect(() => {
    loadDataAgain();
  }, []);

  const handleSelectAll = () => {
    if (selected.length === dataContact.length) {
      setSelected([]);
    } else {
      setSelected(dataContact.map((_, i) => i));
    }
  };

  const handleSelectRow = (index: number) => {
    if (selected.includes(index)) {
      setSelected(selected.filter((i) => i !== index));
    } else {
      setSelected([...selected, index]);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 p-4 md:p-8">
      <section className="w-full bg-secondary rounded-2xl p-6 md:py-6 md:px-12 flex justify-between items-center relative overflow-hidden">

        <div className="flex flex-col gap-2">
          <span className="text-xl font-semibold">Contacts</span>
          <span className="flex gap-4 text-sm text-gray-600">
            <span>Dashboard</span>
            <span>•</span>
            <span>Contacts</span>
          </span>
        </div>

        <div className="w-28 h-28 md:w-40 md:h-40">
          <Image
            src="/assets/logo-company.png"
            alt="Logo Company"
            width={250}
            height={250}
            className="object-cover absolute bottom-0 right-20"
          />
        </div>
      </section>

      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-secondary text-primary text-sm rounded-lg flex items-center gap-2">
            <SlidersHorizontal /> Columns
          </button>
          <button className="px-4 py-2 bg-secondary text-primary text-sm rounded-lg flex items-center gap-2">
            <Filter /> Filters
          </button>
          <button className="px-4 py-2 bg-secondary text-primary text-sm rounded-lg flex items-center gap-2">
            <SlidersHorizontal /> Density
          </button>
          <button className="px-4 py-2 bg-secondary text-primary text-sm rounded-lg flex items-center gap-2">
            <Upload /> Export
          </button>
          <div className="flex items-center relative w-full md:w-64">
            <Search className="absolute left-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full border rounded-lg px-10 py-2 text-sm"
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <button
            onClick={() => setOpenAdd(true)}
            className="px-4 py-2 bg-primary text-white text-sm rounded-lg"
          >
            + Tambah Kontak
          </button>
        </div>
      </section>
      <section className="w-full overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="text-left">
              <th className="text-right">
                <input 
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selected.length === dataContact.length && dataContact.length > 0}
                  className="w-6 h-6 border-2 border-gray-500 rounded appearance-none checked:bg-gray-300 checked:appearance-auto cursor-pointer" 
                />
              </th>
              <th className="p-4">Nama</th>
              <th className="p-4">Telepon</th>
              <th className="p-4">Posisi</th>
              <th className="p-4">Owner</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {dataContact.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50 text-sm">
                <td className="text-right">
                  <input 
                    type="checkbox"
                    onChange={() => handleSelectRow(i)}
                    checked={selected.includes(i)}
                    className="w-6 h-6 border-2 border-gray-500 rounded appearance-none checked:bg-gray-300 checked:appearance-auto cursor-pointer"
                  />
                </td>

                <td className="px-4 py-2 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary"></div>
                  <div className="flex flex-col">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-gray-500 text-sm">{item.email}</span>
                  </div>
                </td>

                <td className="px-4 py-2">{item.phone}</td>
                <td className="px-4 py-2">{item.posisi}</td>
                <td className="px-4 py-2">{item.company}</td>

                <td className="px-4 py-2 flex gap-3 text-gray-600">
                  <Eye className="cursor-pointer hover:text-purple-600" />

                  <button
                    onClick={() => handleEdit(item, i)}
                  >
                    <Pencil className="cursor-pointer hover:text-purple-600" />
                  </button>

                  <Trash2 className="cursor-pointer text-red-500" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="flex justify-end px-2 text-sm text-gray-600">
        Rows per page: 10 • 1–10 of 266
      </section>

      <AddContactModal open={openAdd} onClose={() => setOpenAdd(false)} onSuccess={loadDataAgain} />
      <EditContactModal open={openEdit} initialData={selectedItem} index={selectedIndex} onClose={() => setOpenEdit(false)} onSuccess={loadDataAgain}/>

    </div>
  );
}
