import { Box, CircularProgress, Checkbox, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogContent, DialogTitle, IconButton, Typography, Chip, Divider } from "@mui/material";
import { Contact } from "@/lib/models/types";
import { Density } from "@/components/contact/density-popover";
import { DeleteButton, EditButton } from "@/components/ui/app-action-buttons-table";
import Pagination from "@/components/ui/pagination";
import { useState } from "react";
import { Eye, X, Mail, Phone, Building2, MapPin, Briefcase, Calendar } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";

interface ContactTableProps {
    loading: boolean;
    filteredData: Contact[];
    density: Density;
    visibleColumns: string[];
    selected: number[];
    handleSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectRow: (index: number) => void;
    onEdit: (item: Contact) => void;
    onDeleteRequest: (item: Contact) => void;
    handleDetail: (item: Contact) => void;

    page: number;
    rowsPerPage: number;
    totalCount: number;
    handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
    handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    allColumnsCount: number;
}

export const ContactTable = ({
    loading,
    filteredData,
    density,
    visibleColumns,
    selected,
    handleSelectAll,
    handleSelectRow,
    onEdit,
    onDeleteRequest,
    handleDetail,

    page,
    rowsPerPage,
    totalCount,
    handleChangePage,
    handleChangeRowsPerPage,
    allColumnsCount,
}: ContactTableProps) => {
    const isColumnVisible = (id: string) => visibleColumns.includes(id);
    const [previewContact, setPreviewContact] = useState<Contact | null>(null);

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch {
            return "-";
        }
    };

    return (
        <>
            <div className="overflow-hidden rounded-lg border border-gray-200 mx-6 mb-6">
                <Table sx={{ minWidth: 900 }}>
                    <TableHead>
                        <TableRow className="bg-[#EEF2FD]!" sx={{ '& th': { borderBottom: '1px solid #e5e7eb' } }}>
                            {isColumnVisible("selection") && (
                                <TableCell align="center" sx={{ py: 2, pl: 3, maxWidth: 50, width: 30 }}>
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
                            {isColumnVisible("email") && <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Email</TableCell>}
                            {isColumnVisible("phone") && <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Phone</TableCell>}
                            {isColumnVisible("position") && <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Position</TableCell>}
                            {isColumnVisible("company") && <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Company</TableCell>}
                            {isColumnVisible("address") && <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Address</TableCell>}
                            {isColumnVisible("action") && <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2, pr: 6 }}>Action</TableCell>}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={allColumnsCount} sx={{ p: 0 }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            height: 120,
                                        }}
                                    >
                                        <CircularProgress size={30} />
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={allColumnsCount} sx={{ p: 0 }}>
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
                                                <div className="w-8 h-8 rounded-full bg-[#5479EE] shrink-0 flex items-center justify-center text-white text-sm font-semibold">
                                                    {item.name?.charAt(0)?.toUpperCase() || "?"}
                                                </div>
                                                <span className="font-semibold text-gray-900">{item.name}</span>
                                            </div>
                                        </TableCell>
                                    )}

                                    {isColumnVisible("email") && (
                                        <TableCell
                                            sx={{
                                                py: density === "compact" ? 1 : density === "comfortable" ? 2.5 : 2,
                                                color: 'text.primary'
                                            }}
                                        >
                                            {item.email || "-"}
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
                                    {isColumnVisible("address") && (
                                        <TableCell
                                            sx={{
                                                py: density === "compact" ? 1 : density === "comfortable" ? 2.5 : 2,
                                                color: 'text.primary',
                                                maxWidth: 200,
                                            }}
                                        >
                                            <span className="truncate block">{item.address || "-"}</span>
                                        </TableCell>
                                    )}

                                    {isColumnVisible("action") && (
                                        <TableCell
                                            sx={{
                                                py: density === "compact" ? 1 : density === "comfortable" ? 2.5 : 2,
                                                pr: 6
                                            }}
                                        >
                                            <div className="flex gap-2 text-gray-600">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => { e.stopPropagation(); setPreviewContact(item); }}
                                                    sx={{ color: '#5479EE', '&:hover': { bgcolor: '#EEF2FF' } }}
                                                >
                                                    <Eye size={18} />
                                                </IconButton>
                                                <EditButton onClick={(e) => { e.stopPropagation(); onEdit(item) }} />
                                                <DeleteButton onClick={(e) => { e.stopPropagation(); onDeleteRequest(item) }} />
                                            </div>

                                        </TableCell>
                                    )}
                                </TableRow>
                            )))
                        }
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

            {/* Contact Preview Popup */}
            <Dialog
                open={Boolean(previewContact)}
                onClose={() => setPreviewContact(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, overflow: 'hidden' }
                }}
            >
                {previewContact && (
                    <>
                        {/* Header */}
                        <DialogTitle
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                pb: 1,
                                pt: 3,
                                px: 3,
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#5479EE] flex items-center justify-center text-white text-lg font-bold">
                                    {previewContact.name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <div>
                                    <Typography variant="h6" fontWeight={700}>{previewContact.name}</Typography>
                                    {previewContact.position && (
                                        <Typography variant="body2" color="text.secondary">{previewContact.position}</Typography>
                                    )}
                                </div>
                            </div>
                            <IconButton onClick={() => setPreviewContact(null)} size="small">
                                <X size={20} />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent sx={{ px: 3, pb: 3 }}>
                            <Divider sx={{ mb: 2.5 }} />

                            {/* Contact Info Grid */}
                            <div className="space-y-3">
                                {previewContact.email && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                            <Mail size={16} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="text-sm font-medium text-gray-900">{previewContact.email}</p>
                                        </div>
                                    </div>
                                )}

                                {previewContact.phone_number && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                            <Phone size={16} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Phone</p>
                                            <p className="text-sm font-medium text-gray-900">{previewContact.phone_number}</p>
                                        </div>
                                    </div>
                                )}

                                {previewContact.company && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                            <Building2 size={16} className="text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Company</p>
                                            <p className="text-sm font-medium text-gray-900">{previewContact.company}</p>
                                        </div>
                                    </div>
                                )}

                                {previewContact.position && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                            <Briefcase size={16} className="text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Position</p>
                                            <p className="text-sm font-medium text-gray-900">{previewContact.position}</p>
                                        </div>
                                    </div>
                                )}

                                {previewContact.address && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                                            <MapPin size={16} className="text-rose-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Address</p>
                                            <p className="text-sm font-medium text-gray-900">{previewContact.address}</p>
                                        </div>
                                    </div>
                                )}

                                {previewContact.created_at && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                            <Calendar size={16} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Created</p>
                                            <p className="text-sm font-medium text-gray-900">{formatDate(previewContact.created_at)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Subscription Status */}
                            <div className="mt-4 flex items-center gap-2">
                                <Chip
                                    label={previewContact.is_subscribed ? "Subscribed" : "Not Subscribed"}
                                    size="small"
                                    color={previewContact.is_subscribed ? "success" : "default"}
                                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                                />
                            </div>

                            {/* Custom Fields */}
                            {previewContact.custom_fields && Object.keys(previewContact.custom_fields).length > 0 && (
                                <>
                                    <Divider sx={{ my: 2.5 }} />
                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                        Additional Info
                                    </Typography>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(previewContact.custom_fields).map(([key, value]) => (
                                            <div key={key} className="bg-gray-50 rounded-lg p-2.5">
                                                <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, " ")}</p>
                                                <p className="text-sm font-medium text-gray-900">{value || "-"}</p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 mt-5">
                                <AppButton
                                    variantStyle="primary"
                                    color="primary"
                                    className="flex-1"
                                    onClick={() => {
                                        const contact = previewContact;
                                        setPreviewContact(null);
                                        handleDetail(contact);
                                    }}
                                >
                                    View Full Details
                                </AppButton>
                                <AppButton
                                    variantStyle="outline"
                                    color="primary"
                                    onClick={() => {
                                        const contact = previewContact;
                                        setPreviewContact(null);
                                        onEdit(contact);
                                    }}
                                >
                                    Edit
                                </AppButton>

                            </div>
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </>
    );
};
