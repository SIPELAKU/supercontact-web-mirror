import { Edit2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    IconButton,
} from "@mui/material";

import { Ticket } from "@/lib/types/Ticket";
import { TicketPriorityBadge, TicketStatusBadge } from "./TicketBadges";

interface TicketTableProps {
    tickets: Ticket[];
    isLoading: boolean;
    onEdit: (ticket: Ticket) => void;
    onDelete: (ticket: Ticket) => void;
}

export function TicketTable({ tickets, isLoading, onEdit, onDelete }: TicketTableProps) {
    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading tickets...</div>;
    }

    if (tickets.length === 0) {
        return <div className="p-8 text-center text-gray-500">No tickets found.</div>;
    }

    return (
        <div className="mx-6 mb-6 overflow-hidden border border-gray-200 rounded-xl">
            <Table>
                <TableHead>
                    <TableRow className="bg-[#EEF2FD]!">
                        <TableCell padding="checkbox" sx={{ pl: 3 }}>
                            <Checkbox />
                        </TableCell>
                        <TableCell>Ticket ID</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Assigned Agent</TableCell>
                        <TableCell>Last Updated</TableCell>
                        <TableCell align="right" sx={{ pr: 3 }}>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tickets.map((ticket) => (
                        <TableRow key={ticket.id} hover>
                            <TableCell padding="checkbox" sx={{ pl: 3 }}>
                                <Checkbox />
                            </TableCell>
                            <TableCell className="font-medium">{ticket.ticket_code || ticket.id.substring(0, 8)}</TableCell>
                            <TableCell className="max-w-[200px] truncate" title={ticket.subject}>
                                {ticket.subject}
                            </TableCell>
                            <TableCell>
                                <TicketPriorityBadge priority={ticket.priority} />
                            </TableCell>
                            <TableCell>
                                <TicketStatusBadge status={ticket.status} />
                            </TableCell>
                            <TableCell className="text-gray-600">
                                {ticket.assigned_agent?.fullname || "Unassigned"}
                            </TableCell>
                            <TableCell className="text-gray-500 text-sm">
                                {ticket.updated_at ? formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true }) : "-"}
                            </TableCell>
                            <TableCell align="right" sx={{ pr: 3 }}>
                                <div className="flex justify-end gap-1">
                                    <IconButton size="small" onClick={() => onEdit(ticket)} className="text-gray-500 hover:text-blue-600">
                                        <Edit2 className="h-4 w-4" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => onDelete(ticket)} className="text-gray-500 hover:text-red-600">
                                        <Trash2 className="h-4 w-4" />
                                    </IconButton>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
