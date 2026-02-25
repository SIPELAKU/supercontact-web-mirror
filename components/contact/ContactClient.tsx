"use client"

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AddContactModal from "@/components/contact/modal/AddContactModal";
import EditContactModal from "@/components/contact/modal/EditContactModal";
import DeleteContactModal from "@/components/contact/modal/DeleteContactModal";
import { Density } from "@/components/contact/density-popover";
import { Contact } from "@/lib/models/types";
import DeleteMultipleContactModal from "@/components/contact/modal/DeleteMultipleContactModal";
import ImportContactModal from "@/components/contact/modal/ImportContactModal";
import { useReactToPrint } from "react-to-print";
import { PrintableTable } from "@/components/ui/printable-table";
import PageHeader from "@/components/ui/page-header";
import { ContactToolbar } from "./ContactToolbar";
import { ContactTable } from "./ContactTable";

export const ContactClient = () => {
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
    const componentRef = useRef<HTMLDivElement>(null);

    // Column definitions
    const allColumns = [
        { id: "selection", label: "Checkbox selection" },
        { id: "name", label: "Name" },
        { id: "phone", label: "Phone" },
        { id: "position", label: "Position" },
        { id: "company", label: "Company" },
        { id: "action", label: "Action" },
    ];

    const printableColumns = [
        { header: "Name", accessorKey: "name" },
        { header: "Phone", accessorKey: "phone_number" },
        { header: "Email", accessorKey: "email" },
        { header: "Position", accessorKey: "position" },
        { header: "Company", accessorKey: "company" },
        { header: "Address", accessorKey: "address" },
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
        setPage(0);
        loadDataAgain(0);
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

        const dataKeys = keys.map((key) => {
            if (key === "phone") return "phone_number";
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

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: "Contacts",
    });

    return (
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
            <PageHeader
                title="Contacts"
                breadcrumbs={[{ label: "Dashboard" }, { label: "Contacts" }]}
            />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 space-y-8">
                <ContactToolbar
                    allColumns={allColumns}
                    visibleColumns={visibleColumns}
                    setVisibleColumns={setVisibleColumns}
                    setFilters={setFilters}
                    density={density}
                    setDensity={setDensity}
                    handleExportCSV={handleExportCSV}
                    handlePrint={handlePrint}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedContacts={selectedContacts}
                    onOpenAdd={() => setOpenAdd(true)}
                    onOpenImport={() => setOpenImport(true)}
                    onOpenDeleteMultiple={() => setOpenDeleteMultiple(true)}
                />

                <ContactTable
                    loading={loading}
                    filteredData={filteredData}
                    density={density}
                    visibleColumns={visibleColumns}
                    selected={selected}
                    handleSelectAll={handleSelectAll}
                    handleSelectRow={handleSelectRow}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    handleDetail={handleDetail}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalCount={totalCount}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                    allColumnsCount={allColumns.length}
                />
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

            <div style={{ display: "none" }}>
                <PrintableTable
                    ref={componentRef}
                    title="Contacts"
                    data={filteredData}
                    columns={printableColumns}
                />
            </div>
        </div>
    );
}
