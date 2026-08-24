"use client";

import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Clock, Plus, Trash2, Pencil } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { EmptyState } from "@/components/ui/empty-state";
import { SuperTable, MRT_ColumnDef } from "@/components/ui/super-table";
import { notify } from "@/lib/notifications";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import {
    useBusinessHours,
    useCreateBusinessHours,
    useUpdateBusinessHours,
    useDeleteBusinessHours,
} from "@/lib/hooks/useBusinessHours";
import {
    BusinessHoursCalendar,
    DEFAULT_WEEKLY_HOURS,
    WEEKDAY_LABELS,
    WeekdayHours,
} from "@/lib/types/TicketSettings";

const WEEKDAY_ORDER = ["1", "2", "3", "4", "5", "6", "7"];

export default function BusinessHoursSettingsTab() {
    const { data, isLoading, isError, refetch } = useBusinessHours();
    const calendars = data?.data?.data || [];
    const createMutation = useCreateBusinessHours();
    const updateMutation = useUpdateBusinessHours();
    const deleteMutation = useDeleteBusinessHours();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [timezone, setTimezone] = useState("Asia/Jakarta");
    const [isDefault, setIsDefault] = useState(false);
    const [weeklyHours, setWeeklyHours] = useState<Record<string, WeekdayHours>>(DEFAULT_WEEKLY_HOURS);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    const resetForm = () => {
        setEditingId(null);
        setName("");
        setTimezone("Asia/Jakarta");
        setIsDefault(false);
        setWeeklyHours(DEFAULT_WEEKLY_HOURS);
        setIsFormOpen(false);
    };

    const handleEdit = (calendar: BusinessHoursCalendar) => {
        setEditingId(calendar.id);
        setName(calendar.name);
        setTimezone(calendar.timezone);
        setIsDefault(calendar.is_default);
        setWeeklyHours({ ...DEFAULT_WEEKLY_HOURS, ...calendar.weekly_hours });
        setIsFormOpen(true);
    };

    const updateDay = (day: string, patch: Partial<WeekdayHours>) => {
        setWeeklyHours((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
    };

    const handleSave = async () => {
        if (!name.trim()) {
            notify.warning("Validation Error", { description: "Please enter a calendar name." });
            return;
        }
        try {
            if (editingId) {
                await updateMutation.mutateAsync({
                    id: editingId,
                    data: { name: name.trim(), timezone, weekly_hours: weeklyHours, is_default: isDefault },
                });
                notify.success("Calendar updated");
            } else {
                await createMutation.mutateAsync({
                    name: name.trim(),
                    timezone,
                    weekly_hours: weeklyHours,
                    is_default: isDefault,
                });
                notify.success("Calendar added");
            }
            resetForm();
        } catch (error: any) {
            notify.error("Error", { description: error.message });
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteMutation.mutateAsync(deleteTarget.id);
            notify.success("Calendar removed");
            setDeleteTarget(null);
        } catch (error: any) {
            notify.error("Error", { description: error.message });
        }
    };

    const columns = useMemo<MRT_ColumnDef<BusinessHoursCalendar>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Name",
            },
            {
                accessorKey: "timezone",
                header: "Timezone",
            },
            {
                id: "is_default",
                accessorFn: (row) => (row.is_default ? "Yes" : "No"),
                header: "Default",
            },
        ],
        []
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 max-w-lg">
                    Define your team&apos;s working hours per weekday. SLA policies use this to compute
                    due dates, skipping closed days/hours.
                </p>
                {!isFormOpen && (
                    <AppButton onClick={() => setIsFormOpen(true)} startIcon={<Plus size={16} />}>
                        Add Calendar
                    </AppButton>
                )}
            </div>

            {isFormOpen && (
                <div className="rounded-xl border border-gray-200 p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Name</label>
                            <AppInput
                                isBgWhite
                                fullWidth
                                placeholder="e.g. Standard Business Hours"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Timezone (IANA)</label>
                            <AppInput
                                isBgWhite
                                fullWidth
                                placeholder="Asia/Jakarta"
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <input
                                    type="checkbox"
                                    checked={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                    className="h-4 w-4"
                                />
                                Default calendar
                            </label>
                        </div>
                    </div>

                    {/* Weekly-hours editor - a form grid, deliberately not a SuperTable */}
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <Table>
                            <TableHead>
                                <TableRow className="bg-[#EEF2FD]!">
                                    <TableCell sx={{ color: "#6B7280", fontWeight: 600 }}>Day</TableCell>
                                    <TableCell sx={{ color: "#6B7280", fontWeight: 600 }}>Start</TableCell>
                                    <TableCell sx={{ color: "#6B7280", fontWeight: 600 }}>End</TableCell>
                                    <TableCell sx={{ color: "#6B7280", fontWeight: 600 }}>Closed</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {WEEKDAY_ORDER.map((day) => {
                                    const hours = weeklyHours[day] || DEFAULT_WEEKLY_HOURS[day];
                                    return (
                                        <TableRow key={day}>
                                            <TableCell>{WEEKDAY_LABELS[day]}</TableCell>
                                            <TableCell>
                                                <AppInput
                                                    isBgWhite
                                                    type="time"
                                                    value={hours.start}
                                                    disabled={hours.closed}
                                                    onChange={(e) => updateDay(day, { start: e.target.value })}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <AppInput
                                                    isBgWhite
                                                    type="time"
                                                    value={hours.end}
                                                    disabled={hours.closed}
                                                    onChange={(e) => updateDay(day, { end: e.target.value })}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    checked={hours.closed}
                                                    onChange={(e) => updateDay(day, { closed: e.target.checked })}
                                                    className="h-4 w-4"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-end gap-2">
                        <AppButton variantStyle="outline" onClick={resetForm}>
                            Cancel
                        </AppButton>
                        <AppButton
                            onClick={handleSave}
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {editingId ? "Save Changes" : "Add Calendar"}
                        </AppButton>
                    </div>
                </div>
            )}

            <SuperTable<BusinessHoursCalendar>
                tableId="business-hours-table"
                columns={columns}
                data={calendars}
                isLoading={isLoading}
                isError={isError}
                errorMessage="Failed to load business hours calendars. Please try again."
                onRetry={() => refetch()}
                renderRowActions={({ row }) => (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleEdit(row.original)}
                            className="text-gray-300 hover:text-gray-700"
                            aria-label="Edit calendar"
                        >
                            <Pencil size={16} />
                        </button>
                        <button
                            onClick={() => setDeleteTarget({ id: row.original.id, name: row.original.name })}
                            className="text-gray-300 hover:text-red-500"
                            aria-label="Delete calendar"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
                renderEmptyState={() => (
                    <EmptyState
                        icon={Clock}
                        title="No business hours calendars configured yet"
                        description="SLA due dates run 24/7 until you add a working-hours calendar."
                    />
                )}
                features={{ columnFilters: false }}
            />

            <ConfirmationPopup
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Calendar"
                description={`Are you sure you want to delete "${deleteTarget?.name ?? ""}"? SLA policies using this calendar will fall back to 24/7.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
