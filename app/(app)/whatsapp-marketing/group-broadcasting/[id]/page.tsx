// app/whatsapp-marketing/group-broadcasting/[id]/page.tsx
"use client";

import { AppButton } from '@/components/ui/app-button';
import PageHeader from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { SuperTable, MRT_ColumnDef } from '@/components/ui/super-table';
import { useGroupBroadcastDetail, useGroupBroadcastCampaigns } from '@/lib/hooks/useGroupBroadcasts';
import {
    Box,
    Chip,
    CircularProgress,
    Typography
} from '@mui/material';
import { AppTabs } from '@/components/ui/app-tabs';
import { format } from 'date-fns';
import { ArrowLeft, Upload, Plus, Eye, Send, Users } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import AddRecipientModal from '@/components/whatsapp-marketing/recipients/AddRecipientModal';
import ImportWaRecipientModal from '@/components/whatsapp-marketing/recipients/ImportWaRecipientModal';
import ViewBroadcastCampaignStatsModal from '@/components/whatsapp-marketing/group-broadcasting/modals/ViewBroadcastCampaignStatsModal';
import { useQueryClient } from '@tanstack/react-query';
import { BroadcastCampaign, WaRecipient } from '@/lib/types/whatsapp-marketing';

type GroupTab = 'recipients' | 'campaigns';
const VALID_TABS: GroupTab[] = ['recipients', 'campaigns'];


// Rebuilding the URL from a template silently discards every OTHER query
// param - the table's own ?p / ?q / ?sort included - so switching tabs threw
// away the page and search the user had set. Merge instead of replace.
function withTab(pathname: string, current: URLSearchParams, tab: string) {
  const params = new URLSearchParams(current.toString());
  params.set("tab", tab);
  return `${pathname}?${params.toString()}`;
}

const GroupBroadcastDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const broadcastGroupId = String(params.id);

    const [activeTab, setActiveTab] = useState<GroupTab>(() => {
        const fromUrl = searchParams.get('tab') as GroupTab | null;
        return fromUrl && VALID_TABS.includes(fromUrl) ? fromUrl : 'recipients';
    });

    const queryClient = useQueryClient();
    const [isAddRecipientModalOpen, setAddRecipientModalOpen] = useState(false);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<BroadcastCampaign | null>(null);

    // Pagination for recipients (server-side via SuperTable state)
    const [recipientPage, setRecipientPage] = useState(0);
    const [recipientRowsPerPage, setRecipientRowsPerPage] = useState(10);

    // Pagination + search for campaigns (server-side; SuperTable debounces
    // the search input 500ms before it reaches onStateChange)
    const [campaignPage, setCampaignPage] = useState(0);
    const [campaignRowsPerPage, setCampaignRowsPerPage] = useState(10);
    const [campaignSearch, setCampaignSearch] = useState('');

    const { data: detailData, isLoading: isLoadingDetail, error: detailError } = useGroupBroadcastDetail(
        broadcastGroupId,
        recipientPage + 1,
        recipientRowsPerPage
    );

    const { data: campaignsData, isLoading: isLoadingCampaigns } = useGroupBroadcastCampaigns(
        broadcastGroupId,
        campaignPage + 1,
        campaignRowsPerPage,
        campaignSearch,
        activeTab === 'campaigns'
    );

    const groupBroadcast = detailData?.data;
    const recipients = groupBroadcast?.recipients?.recipients || [];
    const totalRecipients = groupBroadcast?.recipients?.total || 0;

    const campaigns = campaignsData?.data?.broadcasts || [];
    const totalCampaigns = campaignsData?.data?.total || 0;

    const handleTabChange = (tab: GroupTab) => {
        setActiveTab(tab);
        router.replace(withTab(`/whatsapp-marketing/group-broadcasting/${broadcastGroupId}`, searchParams, tab), { scroll: false });
    };

    const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['group-broadcast-detail', broadcastGroupId] });
    };

    const recipientColumns = useMemo<MRT_ColumnDef<WaRecipient>[]>(
        () => [
            {
                accessorKey: 'name',
                header: 'Name',
                Cell: ({ cell }) => <>{cell.getValue<string>() || '-'}</>,
            },
            {
                accessorKey: 'email',
                header: 'Email',
                Cell: ({ cell }) => <>{cell.getValue<string>() || '-'}</>,
            },
            {
                accessorKey: 'phone_number',
                header: 'Phone Number',
                Cell: ({ cell }) => <>{cell.getValue<string>() || '-'}</>,
            },
            {
                accessorKey: 'company',
                header: 'Company',
                Cell: ({ cell }) => <>{cell.getValue<string>() || '-'}</>,
            },
        ],
        []
    );

    const campaignColumns = useMemo<MRT_ColumnDef<BroadcastCampaign>[]>(
        () => [
            {
                accessorKey: 'name',
                header: 'Campaign Name',
            },
            {
                accessorKey: 'sent_at',
                header: 'Sent Date',
                Cell: ({ cell }) => {
                    const value = cell.getValue<string>();
                    return <>{value ? format(new Date(value), 'dd MMM yyyy, HH:mm') : '-'}</>;
                },
            },
            {
                id: 'sent',
                accessorFn: (row) => row.stats.sent,
                header: 'Sent',
            },
            {
                id: 'delivered',
                accessorFn: (row) => row.stats.delivered,
                header: 'Delivered',
            },
            {
                id: 'read',
                accessorFn: (row) => row.stats.read,
                header: 'Read',
            },
            {
                id: 'failed',
                accessorFn: (row) => row.stats.failed,
                header: 'Failed',
            },
        ],
        []
    );

    if (detailError) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">Failed to load group broadcast details</Typography>
                <AppButton onClick={() => router.push('/whatsapp-marketing/group-broadcasting')} sx={{ mt: 2 }} variantStyle="primary">
                    Back to Group Broadcasting
                </AppButton>
            </Box>
        );
    }

    if (isLoadingDetail && !groupBroadcast) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!groupBroadcast) return null;

    return (
        <Box sx={{ p: 3 }}>
            <PageHeader
                title={groupBroadcast.name}
                breadcrumbs={[
                    { label: "WhatsApp Marketing" },
                    { label: "Group Broadcasting", href: "/whatsapp-marketing/group-broadcasting" },
                    { label: groupBroadcast.name }
                ]}
            />

            <Box sx={{ mb: 3 }}>
                <AppButton
                    variantStyle="outline"
                    color="primary"
                    startIcon={<ArrowLeft size={18} />}
                    onClick={() => router.push('/whatsapp-marketing/group-broadcasting')}
                    sx={{ textTransform: 'none' }}
                >
                    Back to Group Broadcasting
                </AppButton>
            </Box>

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {groupBroadcast.name}
                </Typography>
                <Chip
                    label={`${groupBroadcast.recipient_count} Recipients`}
                    color="primary"
                    size="medium"
                />
            </Box>

            <Box sx={{ mb: 3 }}>
                <AppTabs<GroupTab>
                    value={activeTab}
                    onChange={handleTabChange}
                    tabs={[
                        { value: 'recipients', label: 'Recipients' },
                        { value: 'campaigns', label: 'Broadcast (campaign) sent' },
                    ]}
                />
            </Box>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                {/* Recipients Tab */}
                {activeTab === 'recipients' && (
                    // INTERIM: the /broadcast-groups/{id} recipients endpoint does not
                    // support a `search` param yet, so the search box filters
                    // client-side over the currently loaded page only (manualFiltering
                    // stays off). Switch to a server `search` param once the backend
                    // supports it.
                    <SuperTable<WaRecipient>
                        entityLabel="penerima"
                        searchPlaceholder="Cari nomor atau nama"
                        tableId="group-broadcast-recipients-table"
                        urlKey=""
                        columns={recipientColumns}
                        data={recipients}
                        isLoading={isLoadingDetail}
                        manualPagination={true}
                        rowCount={totalRecipients}
                        onStateChange={(state) => {
                            setRecipientPage(state.pagination.pageIndex);
                            setRecipientRowsPerPage(state.pagination.pageSize);
                        }}
                        renderTopLeftToolbar={() => (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <AppButton
                                    variantStyle="outline"
                                    onClick={() => setImportModalOpen(true)}
                                    startIcon={<Upload size={16} />}
                                    color="primary"
                                >
                                    Import
                                </AppButton>
                                <AppButton
                                    variantStyle="primary"
                                    onClick={() => setAddRecipientModalOpen(true)}
                                    startIcon={<Plus size={16} />}
                                >
                                    Add Recipient
                                </AppButton>
                            </Box>
                        )}
                        renderEmptyState={() => (
                            <EmptyState
                                icon={Users}
                                title="No recipients found"
                                description="Add or import recipients to this broadcast group."
                                action={{ label: "Add Recipient", onClick: () => setAddRecipientModalOpen(true), icon: <Plus size={16} /> }}
                            />
                        )}
                        features={{
          urlSync: true,
                            // API has no sort params - avoid a misleading page-only sort
                            sorting: false,
                            globalFilter: true,
                            columnFilters: false,
                            pagination: true,
                            pageSizeOptions: [5, 10, 25, 50],
                        }}
                    />
                )}

                {/* Campaigns Tab */}
                {activeTab === 'campaigns' && (
                    <SuperTable<BroadcastCampaign>
                        tableId="group-broadcast-campaigns-table"
                        columns={campaignColumns}
                        data={campaigns}
                        isLoading={isLoadingCampaigns}
                        manualPagination={true}
                        manualFiltering={true}
                        rowCount={totalCampaigns}
                        onStateChange={(state) => {
                            setCampaignPage(state.pagination.pageIndex);
                            setCampaignRowsPerPage(state.pagination.pageSize);
                            setCampaignSearch(state.globalFilter);
                        }}
                        onRowClick={(row) => {
                            setSelectedCampaign(row);
                            setViewModalOpen(true);
                        }}
                        rowActions={[
                            {
                                id: 'view',
                                label: 'View',
                                icon: <Eye size={16} />,
                                onClick: (row) => {
                                    setSelectedCampaign(row);
                                    setViewModalOpen(true);
                                },
                            },
                        ]}
                        renderEmptyState={() => (
                            <EmptyState
                                icon={Send}
                                title="No campaigns found"
                                description="Broadcast campaigns sent to this group will appear here."
                            />
                        )}
                        features={{
                            // API has no sort params - avoid a misleading page-only sort
                            sorting: false,
                            globalFilter: true,
                            columnFilters: false,
                            pagination: true,
                            pageSizeOptions: [5, 10, 25, 50],
                        }}
                    />
                )}
            </div>

            <AddRecipientModal
                open={isAddRecipientModalOpen}
                recipientType="whatsapp"
                onClose={() => setAddRecipientModalOpen(false)}
                onSuccess={handleSuccess}
                target="broadcast_group"
                broadcastGroupId={broadcastGroupId}
            />

            <ImportWaRecipientModal
                open={isImportModalOpen}
                recipientType="whatsapp"
                onClose={() => setImportModalOpen(false)}
                onSuccess={handleSuccess}
                target="broadcast_group"
                broadcastGroupId={broadcastGroupId}
            />

            <ViewBroadcastCampaignStatsModal
                open={isViewModalOpen}
                onClose={() => {
                    setViewModalOpen(false);
                    setSelectedCampaign(null);
                }}
                campaign={selectedCampaign}
                onRefresh={() => {
                    queryClient.invalidateQueries({ queryKey: ['group-broadcast-campaigns', broadcastGroupId] });
                }}
            />
        </Box>
    );
};

export default GroupBroadcastDetailPage;
