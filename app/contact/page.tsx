"use client";

import { Pencil, Trash2, Search, Upload, Download, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddContactModal from "@/components/modal/AddContact";
import EditContactModal from "@/components/modal/EditContact";
import DeleteContactModal from "@/components/modal/DeleteContact";
import BannerDashboard from "@/components/ui/banner-dashboard";
import ColumnVisibilityPopover from "@/components/contact/column-visibility-popover";
import FilterPopover from "@/components/contact/filter-popover";
import DensityPopover, { Density } from "@/components/contact/density-popover";
import ExportPopover from "@/components/contact/export-popover";
import { Contact } from "@/lib/models/types";
import Pagination from "@/components/ui/pagination";
import DeleteMultipleContactModal from "@/components/modal/DeleteMultipleContact";
import ImportContactModal from "@/components/modal/ImportContactModal";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";

export default function ContactsPage() {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Contact | null>(null);
  const [dataContact, setDataContact] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [openDeleteMultiple, setOpenDeleteMultiple] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

  // Column definitions
  const allColumns = [
    { id: "selection", label: "Checkbox selection" },
    { id: "name", label: "Name" },
    { id: "phone", label: "Phone" },
    { id: "position", label: "Position" },
    { id: "company", label: "Company" },
    { id: "action", label: "Action" },
  ];

  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    allColumns.map((col) => col.id),
  );

  const [density, setDensity] = useState<Density>("standard");

  const [filters, setFilters] = useState<any[]>([]);

  const loadDataAgain = (pageNum = page, limitNum = rowsPerPage) => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/contacts?page=${
        pageNum + 1
      }&limit=${limitNum}&search=${debouncedSearch}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            document.cookie
              .split("; ")
              .find((row) => row.startsWith("access_token="))
              ?.split("=")[1]
          }`,
        },
      },
    )
      .then((res) => res.json())
      .then((res) => {
        const contacts = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.contacts)
            ? res.data.contacts
            : [];
        const total = res.data?.total || res.total || 0;

        setTotalCount(total);
        setDataContact(contacts);
      })
      .catch(() => setDataContact([]));
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
    loadDataAgain(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    loadDataAgain(0, newRowsPerPage);
  };

  function handleEdit(item: Contact) {
    setSelectedItem(item);
    setOpenEdit(true);
  }
  function handleDelete(item: Contact) {
    setSelectedItem(item);
    setOpenDelete(true);
  }

  function handleDetail(item: Contact) {
    if (item.id) {
      router.push(`/contact/detail/${item.id}`);
    }
  }

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadDataAgain();
  }, [debouncedSearch]);

  const handleSelectAll = () => {
    if (selected.length === dataContact.length) {
      setSelected([]);
      setSelectedContacts([]);
    } else {
      setSelected(dataContact.map((_, i) => i));
      setSelectedContacts(dataContact);
    }
  };

  const handleSelectRow = (index: number) => {
    if (selected.includes(index)) {
      setSelected(selected.filter((i) => i !== index));
      setSelectedContacts(
        selectedContacts.filter(
          (contact) => contact.id !== dataContact[index].id,
        ),
      );
    } else {
      setSelected([...selected, index]);
      setSelectedContacts([...selectedContacts, dataContact[index]]);
    }
  };

  const isColumnVisible = (id: string) => visibleColumns.includes(id);

  // Client-side filtering logic
  const filteredData = dataContact.filter((item) => {
    if (filters.length === 0) return true;

    return filters.every((filter) => {
      if (!filter.columnId || !filter.operator) return true;

      let itemValue = "";
      // Map column IDs to item properties
      if (filter.columnId === "name") itemValue = item.name;
      else if (filter.columnId === "phone") itemValue = item.phone_number;
      else if (filter.columnId === "position") itemValue = item.position;
      else if (filter.columnId === "company") itemValue = item.company;
      else return true; // unsupported column for filter

      itemValue = (itemValue || "").toString().toLowerCase();
      const filterValue = (filter.value || "").toString().toLowerCase();

      switch (filter.operator) {
        case "contains":
          return itemValue.includes(filterValue);
        case "does not contain":
          return !itemValue.includes(filterValue);
        case "equals":
          return itemValue === filterValue;
        case "does not equal":
          return itemValue !== filterValue;
        case "starts with":
          return itemValue.startsWith(filterValue);
        case "ends with":
          return itemValue.endsWith(filterValue);
        case "is empty":
          return itemValue === "";
        case "is not empty":
          return itemValue !== "";
        default:
          return true;
      }
    });
  });

  const handleExportCSV = () => {
    const headers = allColumns
      .filter((col) => col.id !== "selection" && col.id !== "action")
      .map((col) => col.label);
    const keys = allColumns
      .filter((col) => col.id !== "selection" && col.id !== "action")
      .map((col) => col.id);

    // Map column IDs to actual data keys if they differ
    // id "position" -> data "job_title"
    // id "company" -> data "company"
    const dataKeys = keys.map((key) => {
      if (key === "position") return "job_title";
      if (key === "company") return "company";
      return key;
    });

    const csvContent = [
      headers.join(","),
      ...filteredData.map((item) =>
        dataKeys
          .map((key) => {
            const val = (item as any)[key] || "";
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "contacts_export.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full flex flex-col gap-4 p-4 md:p-8">
      <BannerDashboard
        title="Contacts"
        breadcrumbs={["Dashboard", "Contacts"]}
      />
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <ColumnVisibilityPopover
            columns={allColumns}
            visibleColumns={visibleColumns}
            onChange={setVisibleColumns}
          />
          <FilterPopover
            columns={allColumns.filter(
              (c) => c.id !== "selection" && c.id !== "action",
            )}
            onApply={setFilters}
          />
          <DensityPopover density={density} onChange={setDensity} />
          <ExportPopover onExportCSV={handleExportCSV} onPrint={handlePrint} />
          <div className="flex items-center relative w-full md:w-64">
            {/* <Search className="absolute left-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search by email"
              className="w-full border rounded-lg px-10 py-2 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            /> */}
            <AppInput
              startIcon={<Search size={16} />}
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              isBgWhite
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          {selectedContacts.length > 0 && (
            <AppButton
              onClick={() => setOpenDeleteMultiple(true)}
              variantStyle="danger"
              startIcon={<Trash2 size={16} />}
            >
              Delete
            </AppButton>
          )}
          <AppButton
            onClick={() => setOpenImport(true)}
            variantStyle="primary"
            startIcon={<Download size={16} />}
          >
            Import
          </AppButton>
          <AppButton
            onClick={() => setOpenAdd(true)}
            variantStyle="primary"
            startIcon={<Plus size={16} />}
          >
            Add Contact
          </AppButton>
        </div>
      </section>
      <section className="w-full overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="text-left">
              {isColumnVisible("selection") && (
                <th className="text-right">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      selected.length === filteredData?.length &&
                      filteredData.length > 0
                    }
                    className="w-6 h-6 border-2 border-gray-500 rounded appearance-none checked:bg-gray-300 checked:appearance-auto cursor-pointer"
                  />
                </th>
              )}
              {isColumnVisible("name") && <th className="p-4">Name</th>}
              {isColumnVisible("phone") && <th className="p-4">Phone</th>}
              {isColumnVisible("position") && <th className="p-4">Position</th>}
              {isColumnVisible("company") && <th className="p-4">Company</th>}
              {isColumnVisible("action") && <th className="p-4">Action</th>}
            </tr>
          </thead>

          <tbody>
            {filteredData?.map((item, i) => (
              <tr
                key={i}
                className="hover:bg-gray-50 text-sm cursor-pointer"
                onClick={() => handleDetail(item)}
              >
                {isColumnVisible("selection") && (
                  <td
                    className={`text-right ${density === "compact" ? "py-1" : density === "comfortable" ? "py-4" : "py-2"}`}
                  >
                    <input
                      type="checkbox"
                      onChange={() => handleSelectRow(i)}
                      onClick={(e) => e.stopPropagation()}
                      checked={selected.includes(i)}
                      className="w-6 h-6 border-2 border-gray-500 rounded appearance-none checked:bg-gray-300 checked:appearance-auto cursor-pointer"
                    />
                  </td>
                )}

                {isColumnVisible("name") && (
                  <td
                    className={`px-4 flex items-center gap-3 ${density === "compact" ? "py-1" : density === "comfortable" ? "py-4" : "py-2"}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#5479EE]"></div>
                    <div className="flex flex-col">
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-gray-500 text-sm">
                        {item.email}
                      </span>
                    </div>
                  </td>
                )}

                {isColumnVisible("phone") && (
                  <td
                    className={`px-4 ${density === "compact" ? "py-1" : density === "comfortable" ? "py-4" : "py-2"}`}
                  >
                    {item.phone_number || "-"}
                  </td>
                )}
                {isColumnVisible("position") && (
                  <td
                    className={`px-4 ${density === "compact" ? "py-1" : density === "comfortable" ? "py-4" : "py-2"}`}
                  >
                    {item.position || "-"}
                  </td>
                )}
                {isColumnVisible("company") && (
                  <td
                    className={`px-4 ${density === "compact" ? "py-1" : density === "comfortable" ? "py-4" : "py-2"}`}
                  >
                    {item.company || "-"}
                  </td>
                )}

                {isColumnVisible("action") && (
                  <td
                    className={`px-4 flex gap-3 text-gray-600 ${density === "compact" ? "py-1" : density === "comfortable" ? "py-4" : "py-2"}`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                    >
                      <Pencil className="cursor-pointer hover:text-purple-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                    >
                      <Trash2 className="cursor-pointer text-red-500" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Pagination
        page={page}
        rowsPerPage={rowsPerPage}
        count={totalCount}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <AddContactModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={loadDataAgain}
      />
      <EditContactModal
        open={openEdit}
        initialData={selectedItem}
        onClose={() => setOpenEdit(false)}
        onSuccess={loadDataAgain}
        onDelete={() => {
          setOpenEdit(false);
          setOpenDelete(true);
        }}
      />
      <DeleteContactModal
        open={openDelete}
        initialData={selectedItem}
        onClose={() => setOpenDelete(false)}
        onSuccess={loadDataAgain}
      />
      <DeleteMultipleContactModal
        open={openDeleteMultiple}
        selected={selectedContacts}
        onClose={() => setOpenDeleteMultiple(false)}
        onSuccess={loadDataAgain}
      />
      <ImportContactModal
        open={openImport}
        onClose={() => setOpenImport(false)}
        onSuccess={loadDataAgain}
      />
    </div>
  );
}
