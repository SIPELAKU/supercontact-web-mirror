import { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Ticket } from "@/lib/types/Ticket";
import { TicketPriorityBadge, TicketStatusBadge } from "./TicketBadges";
import { Button } from "@/components/ui/button";

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
        <div className="bg-white rounded-lg border shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50/50">
                        <TableHead className="w-12">
                            <Checkbox />
                        </TableHead>
                        <TableHead>Ticket ID</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned Agent</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets.map((ticket) => (
                        <TableRow key={ticket.id} className="hover:bg-gray-50">
                            <TableCell>
                                <Checkbox />
                            </TableCell>
                            <TableCell className="font-medium">{ticket.id.substring(0, 8)}...</TableCell>
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
                                {ticket.assigned_agent_name || "Unassigned"}
                            </TableCell>
                            <TableCell className="text-gray-500 text-sm">
                                {ticket.updated_at ? formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true }) : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => onEdit(ticket)} className="h-8 w-8 text-gray-500 hover:text-blue-600">
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => onDelete(ticket)} className="h-8 w-8 text-gray-500 hover:text-red-600">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
