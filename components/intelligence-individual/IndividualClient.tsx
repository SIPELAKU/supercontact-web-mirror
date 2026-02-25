"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { IndividualCard } from './IndividualCard';
import { AppAutocomplete } from '../ui/app-autocomplete';
import { AppInput } from '../ui/app-input';
import { AppButton } from '../ui/app-button';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { INDUSTRY_OPTIONS, LOCATION_OPTIONS } from '@/lib/data/company-intelligence-options';
import PageHeader from '../ui/page-header';
import { TablePagination, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '@/lib/context/AuthContext';
import { getIndividualIntelligence, saveContactsToCrm } from '@/lib/api/company-intelligence';
import { IndividualIntelligenceItem } from '@/lib/types/individual-intelligence';
import { handleError } from '@/lib/utils/errorHandler';
import { notify } from '@/lib/notifications';

export const IndividualClient = () => {
    const { getToken, loading: authLoading } = useAuth();

    // Data states
    const [individuals, setIndividuals] = useState<IndividualIntelligenceItem[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    // Search and Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

    // Pagination States
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Selection State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSelectionEnabled, setIsSelectionEnabled] = useState(false);

    // Debounce search
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

    useEffect(() => {
        if (searchQuery === debouncedSearchQuery) return;
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery, debouncedSearchQuery]);

    const allPeople = useMemo(() => {
        return individuals.flatMap(company =>
            company.key_people.map(person => ({
                company: {
                    crm_company_id: company.crm_company_id,
                    company_name: company.company_name,
                    industry: company.industry,
                    description: company.description
                },
                person
            }))
        );
    }, [individuals]);

    const fetchIndividuals = useCallback(async () => {
        setIsLoading(true);
        setError("");
        try {
            const token = await getToken();
            const params = {
                industry: selectedIndustries.join(","), // joining as fallback if multiple selected
                location: selectedLocation || undefined,
                search: debouncedSearchQuery || undefined,
                page: page + 1,
                limit: rowsPerPage,
            };

            const data = await getIndividualIntelligence(token, params);
            setIndividuals(data.data || []);
            setTotalCount(data.meta.total);
        } catch (err: any) {
            console.error("Failed to fetch individual intelligence:", err);
            const message = handleError(err, "Fetch Individual Intelligence");
            notify.error("Error", {
                description: message,
            });
        } finally {
            setIsLoading(false);
        }
    }, [getToken, selectedIndustries, selectedLocation, debouncedSearchQuery, page, rowsPerPage]);

    useEffect(() => {
        if (!authLoading) {
            fetchIndividuals();
        }
    }, [fetchIndividuals, authLoading]);

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleCancelSelection = () => {
        setSelectedIds([]);
        setIsSelectionEnabled(false);
    };

    const handleSaveContacts = async () => {
        setIsSaving(true);
        try {
            const token = await getToken();

            const selectedPeople = allPeople
                .filter(item => selectedIds.includes(item.person.id))
                .map(item => ({
                    crm_company_id: item.company.crm_company_id,
                    person_id: item.person.id,
                    name: item.person.name,
                    role: item.person.role
                }));

            if (selectedPeople.length === 0) {
                notify.warning("No people selected");
                return;
            }

            const result = await saveContactsToCrm(token, { people: selectedPeople });

            notify.success("Contacts Saved", {
                description: `Successfully saved ${result.created_count} new contacts (${result.existing_count} already existed).`
            });

            setSelectedIds([]);
            setIsSelectionEnabled(false);
            fetchIndividuals();
        } catch (err: any) {
            console.error("Failed to save contacts:", err);
            const message = handleError(err, "Save Contacts");
            notify.error("Error", {
                description: message,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePage = (event: any, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 py-6">
            <PageHeader
                title="Individual"
                breadcrumbs={[
                    { label: "Data Inteligence" },
                    { label: "Individual" }
                ]}
            />

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="w-full md:w-[240px]">
                        <AppAutocomplete
                            multiple
                            options={INDUSTRY_OPTIONS}
                            value={selectedIndustries}
                            onChange={(_, newValue) => {
                                setSelectedIndustries(newValue);
                                setPage(0);
                            }}
                            placeholder="Industry"
                            size="small"
                            isBgWhite
                        />
                    </div>
                    <div className="w-full md:w-[320px]">
                        <AppInput
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(0);
                            }}
                            startIcon={<Search size={18} className="text-gray-400" />}
                            isBgWhite
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    {isSelectionEnabled ? (
                        <>
                            <AppButton
                                variantStyle="outline"
                                color="gray"
                                onClick={handleCancelSelection}
                                className="px-6!"
                            >
                                Cancel
                            </AppButton>
                            <AppButton
                                onClick={handleSaveContacts}
                                className="px-6!"
                                disabled={selectedIds.length === 0 || isSaving}
                                isLoading={isSaving}
                            >
                                Save Contact
                            </AppButton>
                        </>
                    ) : (
                        <AppButton
                            startIcon={<span>+</span>}
                            className="px-6!"
                            onClick={() => setIsSelectionEnabled(true)}
                        >
                            Add Contact
                        </AppButton>
                    )}
                </div>
            </div>

            {error && (
                <Alert severity="error" className="mb-6 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </Alert>
            )}

            {/* Grid / Loading */}
            {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px] gap-4">
                    <CircularProgress size={30} />
                </div>
            ) : allPeople.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {allPeople.map((item) => (
                        <IndividualCard
                            key={item.person.id}
                            person={item.person}
                            company={item.company}
                            selected={selectedIds.includes(item.person.id)}
                            onToggleSelect={handleToggleSelect}
                            isSelectionEnabled={isSelectionEnabled}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <p className="text-gray-500 font-medium">No individuals found.</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search query.</p>
                </div>
            )}

            {/* Pagination */}
            <div className="flex justify-end border-t border-gray-100 pt-6">
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={totalCount} // This count is still based on companies from API
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </div>
        </div>
    );
};
