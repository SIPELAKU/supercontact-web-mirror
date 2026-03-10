import { Plus, Download, Printer, Filter, Settings, Trash2, Search, FileDown } from "lucide-react";
import ColumnVisibilityPopover from "@/components/contact/column-visibility-popover";
import FilterPopover from "@/components/contact/filter-popover";
import DensityPopover, { Density } from "@/components/contact/density-popover";
import ExportPopover from "@/components/contact/export-popover";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { Contact } from "@/lib/models/types";

interface ContactToolbarProps {
    allColumns: { id: string; label: string }[];
    visibleColumns: string[];
    setVisibleColumns: (cols: string[]) => void;
    setFilters: (filters: any[]) => void;
    density: Density;
    setDensity: (density: Density) => void;
    handleExportCSV: () => void;
    handlePrint: () => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedContacts: Contact[];
    onOpenAdd: () => void;
    onOpenImport: () => void;
    onOpenDeleteMultiple: () => void;
    onOpenDeleteAll?: () => void;
}


export const ContactToolbar = ({
    allColumns,
    visibleColumns,
    setVisibleColumns,
    setFilters,
    density,
    setDensity,
    handleExportCSV,
    handlePrint,
    searchTerm,
    setSearchTerm,
    selectedContacts,
    onOpenAdd,
    onOpenImport,
    onOpenDeleteMultiple,
    onOpenDeleteAll,
}: ContactToolbarProps) => {


    return (
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
            <div className="flex flex-row flex-nowrap gap-3 shrink-0">
                {selectedContacts.length > 0 && (
                    <AppButton
                        onClick={onOpenDeleteMultiple}
                        variantStyle="danger"
                        startIcon={<Trash2 size={16} />}
                    >
                        Delete
                    </AppButton>
                )}
                <AppButton
                    onClick={onOpenImport}
                    variantStyle="outline"
                    color="primary"
                    startIcon={<Download size={16} />}
                >
                    Import
                </AppButton>
                <AppButton
                    onClick={onOpenAdd}
                    variantStyle="primary"
                    startIcon={<Plus size={16} />}
                >
                    Add Contact
                </AppButton>
                {selectedContacts.length === 0 && (
                    <AppButton
                        variantStyle="soft"
                        color="danger"
                        startIcon={<Trash2 size={16} />}
                        onClick={onOpenDeleteAll}
                        sx={{ px: 2, height: '40px' }}
                        className="ml-auto"
                    >
                        Delete All Data
                    </AppButton>
                )}

            </div>
        </section>
    );
};
