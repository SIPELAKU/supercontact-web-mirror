import React, { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Download, RefreshCw, Users } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  Box,
  Divider,
  Stack,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { AppButton } from '@/components/ui/app-button';
import { ExportFormatMenu } from '@/components/ui/export-format-menu';
import { Spinner } from '@/components/ui/spinner';
import {
  BROADCAST_RECIPIENT_SORT_KEYS,
  BroadcastCampaign,
  BroadcastRecipient,
  BroadcastTemplateType,
} from '@/lib/types/whatsapp-marketing';
import { toApiSort } from '@/lib/utils/apiSort';
import { format } from 'date-fns';
import { notify } from '@/lib/notifications';
import { downloadRows, type ExportFileFormat } from '@/lib/utils/exportRows';
import { SuperTable, MRT_ColumnDef } from '@/components/ui/super-table';
import {
  broadcastRecipientsKey,
  reloadBroadcastStats,
  useBroadcastRecipients,
  useBroadcastDetail,
  useExportBroadcastRecipients,
} from '@/lib/hooks/useBroadcasts';
import {
  recipientExportColumns,
  recipientExportFileName,
  statusLabel,
  type ExportableStatus,
} from '../recipientExport';
import { broadcastStatusChip } from '../broadcastStatus';
import { EditButton } from '@/components/ui/app-action-buttons-table';
import AddRecipientModal from '@/components/whatsapp-marketing/recipients/AddRecipientModal';
import MessagePreview from '../../templates/create/MessagePreview';
import { primaryContentType } from '@/lib/utils/whatsapp-template';

interface ViewBroadcastStatsModalProps {
  open: boolean;
  onClose: () => void;
  broadcast: BroadcastCampaign | null;
}

export default function ViewBroadcastStatsModal({ open, onClose, broadcast }: ViewBroadcastStatsModalProps) {
  const queryClient = useQueryClient();
  const [tableState, setTableState] = useState({
    pageIndex: 0,
    pageSize: 5,
    globalFilter: "",
    status: "",
    sorting: [] as { id: string; desc: boolean }[],
  });
  // Server-side sorting, same sort_by/sort_order contract as the broadcasts
  // list. Column ids are the API's sort keys (name, phone_number, status).
  const { sortBy, sortOrder } = toApiSort(tableState.sorting, BROADCAST_RECIPIENT_SORT_KEYS);

  const [editingRecipient, setEditingRecipient] = useState<BroadcastRecipient | null>(null);

  const { data: detailResponse, isLoading: isLoadingDetail, isFetching: isFetchingDetail } = useBroadcastDetail(broadcast?.id || '');
  const detailData = detailResponse?.data;

  const { data: recipientsResponse, isLoading, refetch } = useBroadcastRecipients(
    broadcast?.id || '',
    tableState.pageIndex + 1,
    tableState.pageSize,
    tableState.globalFilter,
    tableState.status || undefined,
    sortBy,
    sortOrder
  );

  const exportRecipients = useExportBroadcastRecipients();
  const exportingStatus = exportRecipients.isPending ? exportRecipients.variables?.status : undefined;
  // The card that was clicked, while its "CSV or Excel" menu is open.
  const [exportMenu, setExportMenu] = useState<{ anchor: HTMLElement; status: ExportableStatus } | null>(null);

  // Busy until EVERY request the reload started is done - not just the stats -
  // so no table changes after the button says it has finished.
  const [isReloading, setIsReloading] = useState(false);
  const handleReload = async () => {
    setIsReloading(true);
    try {
      await reloadBroadcastStats(queryClient, broadcast?.id || '');
    } finally {
      setIsReloading(false);
    }
  };
  const isReloadBusy = isReloading || isFetchingDetail || isLoading;

  // console.log("recipientsResponse", recipientsResponse);

  const columns = useMemo<MRT_ColumnDef<BroadcastRecipient>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Name',
      Cell: ({ cell }) => cell.getValue<string>() || '-',
    },
    {
      accessorKey: 'phone_number',
      header: 'Phone Number',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      Cell: ({ cell }) => {
        const val = cell.getValue<string>()?.toLowerCase();
        let color: "primary" | "info" | "success" | "error" | "default" | "warning" = "default";
        if (val === 'pending') color = "warning";
        if (val === 'sent') color = "primary";
        if (val === 'delivered') color = "info";
        if (val === 'read') color = "success";
        if (val === 'failed' || val === 'undelivered') color = "error";

        return <Chip label={val || 'unknown'} color={color as any} size="small" variant="outlined" />;
      },
    },
    {
      accessorKey: 'error_message',
      header: 'Error Message',
      // Not one of the API's sort keys.
      enableSorting: false,
      Cell: ({ row, cell }) => {
        const val = cell.getValue<string>();
        const status = row.original.status?.toLowerCase();
        if ((status === 'failed' || status === 'undelivered') && val) {
          return <Typography variant="caption" color="error" sx={{ fontStyle: 'italic' }}>{val}</Typography>;
        }
        return val || '-';
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 80,
      enableSorting: false,
      Cell: ({ row }) => (
        <EditButton onClick={() => setEditingRecipient(row.original)} />
      ),
    },
  ], []);

  const recipients = recipientsResponse?.data?.recipients || [];
  const totalRecipients = recipientsResponse?.data?.total || 0;

  const activeBroadcast = detailData || broadcast;
  const stats = activeBroadcast?.stats || { sent: 0, delivered: 0, read: 0, failed: 0 };

  // A card exports the recipients it counts, from the same endpoint as the
  // table below (is_limit=false returns the whole list). The API's status
  // filter is cumulative, like the cards: a recipient who has read the message
  // is under Sent and Delivered too, and the file's Status column shows how
  // far each one got. The Failed file also says why each one failed.
  const handleExport = async (status: ExportableStatus, fileFormat: ExportFileFormat) => {
    if (!activeBroadcast || exportRecipients.isPending) return;
    const label = statusLabel(status);
    try {
      const rows = await exportRecipients.mutateAsync({ broadcastId: activeBroadcast.id, status });
      if (rows.length === 0) {
        notify.warning(`No ${label} recipients to export`);
        return;
      }
      const fileName = recipientExportFileName(activeBroadcast.name, status, fileFormat);
      await downloadRows(fileName, recipientExportColumns(status), rows, fileFormat, label);
      notify.success(
        `Exported ${rows.length.toLocaleString()} recipient${rows.length === 1 ? '' : 's'}`,
        { description: `Saved as ${fileName}` }
      );
    } catch (err: any) {
      notify.error('Export failed', {
        description: err?.message || 'Could not build the file. Please try again.',
      });
    }
  };

  const handleChooseFormat = (fileFormat: ExportFileFormat) => {
    const target = exportMenu;
    setExportMenu(null);
    if (target) handleExport(target.status, fileFormat);
  };

  const activeType = primaryContentType(activeBroadcast?.template_content?.types) ?? null;
  const activeTemplateData = activeBroadcast?.template_content && activeType ? activeBroadcast.template_content.types[activeType] : null;

  const previewData = useMemo(() => {
    if (!activeTemplateData) return null;
    const data = JSON.parse(JSON.stringify(activeTemplateData));
    const vars = activeBroadcast?.variables || {};

    const replaceVars = (text: string) => {
      if (!text || typeof text !== 'string') return text;
      let result = text;
      Object.entries(vars).forEach(([v, val]) => {
        if (val) {
          result = result.split(`{{${v}}}`).join(val as string);
        }
      });
      return result;
    };

    if (data.body) data.body = replaceVars(data.body);
    if (data.media && data.media[0]) data.media[0] = replaceVars(data.media[0]);
    if (data.actions) {
      data.actions = data.actions.map((act: any) => ({
        ...act,
        title: replaceVars(act.title),
        url: replaceVars(act.url)
      }));
    }
    if (data.fallback_text) data.fallback_text = replaceVars(data.fallback_text);

    return data;
  }, [activeTemplateData, activeBroadcast?.variables]);

  if (!activeBroadcast) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Broadcast Details & Statistics
        <AppButton
          variantStyle="outline"
          size="small"
          onClick={handleReload}
          startIcon={<RefreshCw size={16} className={isReloadBusy ? "animate-spin" : ""} />}
          disabled={isReloadBusy}
        >
          {isReloadBusy ? "Reloading..." : "Reload Data"}
        </AppButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={4}>
          {/* Left Top Side: Stats & Info */}
          <Grid item xs={12} md={5}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>{activeBroadcast.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Created: {format(new Date(activeBroadcast.created_at), "dd MMM yyyy, HH:mm")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: <Chip size="small" sx={{ ml: 1 }} {...broadcastStatusChip(activeBroadcast.status)} />
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <StatCard
                  label="Sent"
                  value={stats.sent}
                  color="primary.main"
                  onExport={(anchor) => setExportMenu({ anchor, status: 'sent' })}
                  exporting={exportingStatus === 'sent'}
                  disabled={exportRecipients.isPending}
                />
              </Grid>
              <Grid item xs={6}>
                <StatCard
                  label="Delivered"
                  value={stats.delivered}
                  color="info.main"
                  onExport={(anchor) => setExportMenu({ anchor, status: 'delivered' })}
                  exporting={exportingStatus === 'delivered'}
                  disabled={exportRecipients.isPending}
                />
              </Grid>
              <Grid item xs={6}>
                <StatCard
                  label="Read"
                  value={stats.read}
                  color="success.main"
                  onExport={(anchor) => setExportMenu({ anchor, status: 'read' })}
                  exporting={exportingStatus === 'read'}
                  disabled={exportRecipients.isPending}
                />
              </Grid>
              <Grid item xs={6}>
                <StatCard
                  label="Failed"
                  value={stats.failed}
                  color="error.main"
                  onExport={(anchor) => setExportMenu({ anchor, status: 'failed' })}
                  exporting={exportingStatus === 'failed'}
                  disabled={exportRecipients.isPending}
                />
              </Grid>
            </Grid>

            <ExportFormatMenu
              anchorEl={exportMenu?.anchor ?? null}
              title={`Export ${exportMenu ? statusLabel(exportMenu.status) : ''} recipients`}
              onClose={() => setExportMenu(null)}
              onChoose={handleChooseFormat}
            />

            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Configuration</Typography>
              <Stack spacing={1}>
                <DetailItem label="Total Target" value={activeBroadcast.total_target} />
                <DetailItem label="Recipient Source" value={activeBroadcast.recipient_source?.replace(/_/g, ' ')} />
                {/* <DetailItem label="Template ID" value={activeBroadcast.template_id} /> */}
              </Stack>
            </Box>
          </Grid>

          {/* Right Top Side: Message Preview Mockup */}
          <Grid item xs={12} md={7}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Message Preview</Typography>
            {activeType && previewData && (
              <MessagePreview
                type={activeType}
                formData={previewData}
              />
            )}
          </Grid>
        </Grid>

        {/* Bottom Section: Recipients Table */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Recipients Status</Typography>
          <Box className="super-table-container-mini">
            <SuperTable<BroadcastRecipient>
              entityLabel="penerima"
              searchPlaceholder="Cari nomor penerima"
              tableId="broadcast-recipients-table"
              data={recipients}
              columns={columns}
              rowCount={totalRecipients}
              isLoading={isLoading}
              onRetry={() => refetch()}
              renderEmptyState={() => (
                <EmptyState
                  icon={Users}
                  title="No recipients"
                  description="Recipients and their delivery status will appear here."
                />
              )}
              manualPagination={true}
              manualFiltering={true}
              // Sorting asks the API; on the client it would only reorder the
              // five rows of the current page.
              manualSorting={true}
              filters={[
                {
                  id: "status",
                  label: "Status",
                  type: "select",
                  pinned: true,
                  options: ["pending", "sent", "delivered", "read", "failed"].map((v) => ({
                    value: v,
                    label: v.charAt(0).toUpperCase() + v.slice(1),
                  })),
                },
              ]}
              onStateChange={(state) => {
                setTableState({
                  pageIndex: state.pagination.pageIndex,
                  pageSize: state.pagination.pageSize,
                  globalFilter: state.globalFilter || "",
                  status: (state.filters.status as string) || "",
                  sorting: state.sorting || [],
                });
              }}
              features={{
                pagination: true,
                globalFilter: true,
                sorting: true,
                densityToggle: false,
                columnVisibility: false,
                fullScreenToggle: false,
              }}
              initialState={{
                pagination: { pageIndex: 0, pageSize: 5 }
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <AppButton variantStyle="outline" onClick={onClose}>
          Close
        </AppButton>
      </DialogActions>

      {/* Edit Recipient Modal */}
      <AddRecipientModal
        open={!!editingRecipient}
        recipientType="whatsapp"
        initialData={editingRecipient || undefined}
        onClose={() => setEditingRecipient(null)}
        onSuccess={() => {
          // Refresh the recipients list for this broadcast
          queryClient.invalidateQueries({ queryKey: broadcastRecipientsKey(activeBroadcast.id) });
          setEditingRecipient(null);
        }}
      />
    </Dialog>
  );
}

function StatCard({
  label,
  value,
  color,
  onExport,
  exporting = false,
  disabled = false,
}: {
  label: string;
  value: number;
  color: string;
  /** Makes the card a button; it hands over itself, to anchor the format menu. */
  onExport?: (anchor: HTMLElement) => void;
  exporting?: boolean;
  disabled?: boolean;
}) {
  const content = (
    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, position: 'relative' }}>
      {onExport && (
        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', color: 'text.secondary' }}>
          {exporting ? <Spinner /> : <Download size={14} />}
        </Box>
      )}
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>{label}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, color }}>{value}</Typography>
    </CardContent>
  );

  if (!onExport) {
    return (
      <Card variant="outlined" sx={{ textAlign: 'center', height: '100%', borderColor: color }}>
        {content}
      </Card>
    );
  }

  // The tooltip sits on the Card, not on the action area: a disabled button
  // cannot host a tooltip, and the area is disabled while any export runs.
  return (
    <Tooltip title={`Export ${label} recipients (CSV or Excel)`}>
      <Card variant="outlined" sx={{ textAlign: 'center', height: '100%', borderColor: color }}>
        <CardActionArea
          onClick={(event) => onExport(event.currentTarget)}
          disabled={disabled}
          aria-haspopup="menu"
          aria-label={`Export ${label} recipients`}
          sx={{ height: '100%' }}
        >
          {content}
        </CardActionArea>
      </Card>
    </Tooltip>
  );
}

function DetailItem({ label, value }: { label: string; value: any }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
    </Box>
  );
}
