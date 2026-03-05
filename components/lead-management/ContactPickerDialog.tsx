"use client";

import { Contact, fetchContacts } from "@/lib/api";
import { AppInput } from "@/components/ui/app-input";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
    CircularProgress,
    Divider,
} from "@mui/material";
import { Search, X } from "lucide-react";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useAuth } from "@/lib/context/AuthContext";

interface ContactPickerDialogProps {
    open: boolean;
    onClose: () => void;
    onSelect: (contact: Contact) => void;
    initialSearch?: string;
}

export default function ContactPickerDialog({
    open,
    onClose,
    onSelect,
    initialSearch = "",
}: ContactPickerDialogProps) {
    const { getToken } = useAuth();
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Reset when dialog opens
    useEffect(() => {
        if (open) {
            setSearchQuery(initialSearch);
            setDebouncedSearch(initialSearch);
            setPage(0);
        }
    }, [open, initialSearch]);

    // Debounce search
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(0);
        }, 300);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchQuery]);

    const fetchContactsData = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) return;

            const res = await fetchContacts(token, {
                search: debouncedSearch || undefined,
                page: page + 1,
                limit: rowsPerPage,
            });

            setContacts(res.data?.contacts || []);
            setTotal(res.data?.total || 0);
        } catch (err) {
            console.error("Error fetching contacts:", err);
        } finally {
            setLoading(false);
        }
    }, [getToken, debouncedSearch, page, rowsPerPage]);

    useEffect(() => {
        if (open) {
            fetchContactsData();
        }
    }, [open, fetchContactsData]);

    const handleSelect = (contact: Contact) => {
        onSelect(contact);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, overflow: "hidden", maxHeight: "80vh" },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    pb: 1,
                    pt: 3,
                    px: 3,
                }}
            >
                <Typography variant="h6" fontWeight={700}>
                    Select Contact
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <X size={20} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ px: 3, pb: 3 }}>
                <Divider sx={{ mb: 2 }} />

                {/* Search */}
                <div className="mb-4">
                    <AppInput
                        placeholder="Search by name, email, or company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        isBgWhite
                        rounded="8px"
                        startIcon={
                            <Search className="w-4 h-4 mr-2 text-gray-400" />
                        }
                    />
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg border border-gray-200">
                    <Table size="small">
                        <TableHead>
                            <TableRow
                                className="bg-[#EEF2FD]!"
                                sx={{
                                    "& th": {
                                        borderBottom: "1px solid #e5e7eb",
                                    },
                                }}
                            >
                                <TableCell
                                    sx={{
                                        color: "#6B7280",
                                        fontWeight: 600,
                                        py: 1.5,
                                        pl: 2.5,
                                    }}
                                >
                                    Name
                                </TableCell>
                                <TableCell
                                    sx={{
                                        color: "#6B7280",
                                        fontWeight: 600,
                                        py: 1.5,
                                    }}
                                >
                                    Email
                                </TableCell>
                                <TableCell
                                    sx={{
                                        color: "#6B7280",
                                        fontWeight: 600,
                                        py: 1.5,
                                    }}
                                >
                                    Phone
                                </TableCell>
                                <TableCell
                                    sx={{
                                        color: "#6B7280",
                                        fontWeight: 600,
                                        py: 1.5,
                                    }}
                                >
                                    Company
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        align="center"
                                        sx={{ py: 6 }}
                                    >
                                        <CircularProgress size={28} />
                                    </TableCell>
                                </TableRow>
                            ) : contacts.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        align="center"
                                        sx={{ py: 6 }}
                                    >
                                        <span className="text-gray-500">
                                            {searchQuery
                                                ? "No contacts found matching your search."
                                                : "No contacts available."}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                contacts.map((contact) => (
                                    <TableRow
                                        key={contact.id}
                                        hover
                                        onClick={() => handleSelect(contact)}
                                        sx={{
                                            cursor: "pointer",
                                            "&:hover": { bgcolor: "#EEF2FF" },
                                            "& td": {
                                                borderBottom:
                                                    "1px solid #f3f4f6",
                                            },
                                        }}
                                    >
                                        <TableCell sx={{ py: 1.5, pl: 2.5 }}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-[#5479EE] shrink-0 flex items-center justify-center text-white text-xs font-semibold">
                                                    {contact.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || "?"}
                                                </div>
                                                <span className="font-medium text-gray-900 text-sm">
                                                    {contact.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <span className="text-sm text-gray-700">
                                                {contact.email || "-"}
                                            </span>
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <span className="text-sm text-gray-700">
                                                {contact.phone || "-"}
                                            </span>
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <span className="text-sm text-gray-700">
                                                {contact.company || "-"}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={total}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(_e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
