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
import { Avatar, Box } from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox
} from "@mui/material";
import { Spinner } from "@/components/ui/spinner";
import PageHeader from "@/components/ui/page-header";

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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/contacts?page=${pageNum + 1
      }&limit=${limitNum}&search=${debouncedSearch}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${document.cookie
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
      .catch(() => setDataContact([]))
      .finally(() => setLoading(false));
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

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(dataContact.map((_, i) => i));
      setSelectedContacts(dataContact);
    } else {
      setSelected([]);
      setSelectedContacts([]);
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
      <PageHeader
        title="Contacts"
        breadcrumbs={[{ label: "Dashboard" }, { label: "Contacts" }]}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 space-y-8">
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 pt-5">
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

        <div className="overflow-hidden rounded-lg border border-gray-200 mx-6 mb-6">
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow className="bg-[#EEF2FD]!" sx={{ '& th': { borderBottom: '1px solid #e5e7eb' } }}>
                {isColumnVisible("selection") && (
                  <TableCell align="right" sx={{ py: 2, pl: 3 }}>
                    <Checkbox
                      checked={
                        selected.length === filteredData?.length &&
                        filteredData.length > 0
                      }
                      onChange={handleSelectAll}
                      color="primary"
                      sx={{ p: 0 }}
                    />
                  </TableCell>
                )}
                {isColumnVisible("name") && <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Name</TableCell>}
                {isColumnVisible("phone") && <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Phone</TableCell>}
                {isColumnVisible("position") && <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Position</TableCell>}
                {isColumnVisible("company") && <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Company</TableCell>}
                {isColumnVisible("action") && <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2, pr: 3 }}>Action</TableCell>}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={allColumns.length} sx={{ p: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: 120,
                      }}
                    >
                      <Spinner />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={allColumns.length} sx={{ p: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: 120,
                      }}
                    >
                      <p className="text-gray-500">No contacts found</p>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData?.map((item, i) => (
                  <TableRow
                    key={i}
                    hover
                    onClick={() => handleDetail(item)}
                    sx={{
                      '&:hover': { bgcolor: '#f9fafb' },
                      '& td': { borderBottom: '1px solid #f3f4f6' },
                      cursor: 'pointer'
                    }}
                  >
                    {isColumnVisible("selection") && (
                      <TableCell
                        align="right"
                        sx={{
                          py: density === "compact" ? 1 : density === "comfortable" ? 2.5 : 2,
                          pl: 3
                        }}
                      >
                        <Checkbox
                          checked={selected.includes(i)}
                          onChange={() => handleSelectRow(i)}
                          onClick={(e) => e.stopPropagation()}
                          color="primary"
                          sx={{ p: 0 }}
                        />
                      </TableCell>
                    )}

                    {isColumnVisible("name") && (
                      <TableCell
                        sx={{
                          py: density === "compact" ? 1 : density === "comfortable" ? 2.5 : 2
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#5479EE] shrink-0"></div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">{item.name}</span>
                            <span className="text-gray-500 text-sm">{item.email}</span>
                          </div>
                        </div>
                      </TableCell>
                    )}

                    {isColumnVisible("phone") && (
                      <TableCell
                        sx={{
                          py: density === "compact" ? 1 : density === "comfortable" ? 2.5 : 2,
                          color: 'text.primary'
                        }}
                      >
                        {item.phone_number || "-"}
                      </TableCell>
                    )}
                    {isColumnVisible("position") && (
                      <TableCell
                        sx={{
                          py: density === "compact" ? 1 : density === "comfortable" ? 2.5 : 2,
                          color: 'text.primary'
                        }}
                      >
                        {item.position || "-"}
                      </TableCell>
                    )}
                    {isColumnVisible("company") && (
                      <TableCell
                        sx={{
                          py: density === "compact" ? 1 : density === "comfortable" ? 2.5 : 2,
                          color: 'text.primary'
                        }}
                      >
                        {item.company || "-"}
                      </TableCell>
                    )}

                    {isColumnVisible("action") && (
                      <TableCell
                        sx={{
                          py: density === "compact" ? 1 : density === "comfortable" ? 2.5 : 2,
                          pr: 3
                        }}
                      >
                        <div className="flex gap-3 text-gray-600">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(item);
                            }}
                          >
                            <Pencil className="cursor-pointer hover:text-purple-600" size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item);
                            }}
                          >
                            <Trash2 className="cursor-pointer text-red-500" size={18} />
                          </button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                )))}
            </TableBody>
          </Table>

          <Pagination
            page={page}
            rowsPerPage={rowsPerPage}
            count={totalCount}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      </div>

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
