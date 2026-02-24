import { Box, CircularProgress, Checkbox, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Contact } from "@/lib/models/types";
import { Density } from "@/components/contact/density-popover";
import { DeleteButton, EditButton } from "@/components/ui/app-action-buttons-table";
import Pagination from "@/components/ui/pagination";

interface ContactTableProps {
    loading: boolean;
    filteredData: Contact[];
    density: Density;
    visibleColumns: string[];
    selected: number[];
    handleSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectRow: (index: number) => void;
    handleEdit: (item: Contact) => void;
    handleDelete: (item: Contact) => void;
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
    handleEdit,
    handleDelete,
    handleDetail,
    page,
    rowsPerPage,
    totalCount,
    handleChangePage,
    handleChangeRowsPerPage,
    allColumnsCount,
}: ContactTableProps) => {
    const isColumnVisible = (id: string) => visibleColumns.includes(id);

    return (
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
                        {isColumnVisible("phone") && <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Phone</TableCell>}
                        {isColumnVisible("position") && <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Position</TableCell>}
                        {isColumnVisible("company") && <TableCell sx={{ color: '#6B7280', fontWeight: 600, py: 2 }}>Company</TableCell>}
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
                                            pr: 6
                                        }}
                                    >
                                        <div className="flex gap-3 text-gray-600">
                                            <EditButton onClick={(e) => { e.stopPropagation(); handleEdit(item) }} />
                                            <DeleteButton onClick={(e) => { e.stopPropagation(); handleDelete(item) }} />
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
    );
};
