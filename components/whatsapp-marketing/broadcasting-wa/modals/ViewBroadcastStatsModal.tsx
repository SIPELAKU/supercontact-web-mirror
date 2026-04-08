import React, { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
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
  CardContent,
  Chip,
  IconButton
} from '@mui/material';
import { AppButton } from '@/components/ui/app-button';
import { BroadcastCampaign, BroadcastRecipient, BroadcastTemplateType } from '@/lib/types/whatsapp-marketing';
import { format } from 'date-fns';
import { SuperTable, MRT_ColumnDef } from '@/components/ui/super-table';
import { useBroadcastRecipients, useBroadcastDetail } from '@/lib/hooks/useBroadcasts';
import { EditButton } from '@/components/ui/app-action-buttons-table';
import AddRecipientModal from '@/components/whatsapp-marketing/recipients/AddRecipientModal';
import MessagePreview from '../../templates/create/MessagePreview';

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
  });

  const [editingRecipient, setEditingRecipient] = useState<BroadcastRecipient | null>(null);

  const { data: detailResponse, isLoading: isLoadingDetail, isFetching: isFetchingDetail, refetch: refetchDetail } = useBroadcastDetail(broadcast?.id || '');
  const detailData = detailResponse?.data;

  const { data: recipientsResponse, isLoading, refetch } = useBroadcastRecipients(
    broadcast?.id || '',
    tableState.pageIndex + 1,
    tableState.pageSize,
    tableState.globalFilter
  );

  const handleReload = () => {
    // Invalidate everything related to broadcasts to ensure stats are updated
    queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
    queryClient.invalidateQueries({ queryKey: ['group-broadcast-campaigns'] });
    refetchDetail();
    refetch();
  };

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
      Cell: ({ row }) => (
        <EditButton onClick={() => setEditingRecipient(row.original)} />
      ),
    },
  ], []);

  const recipients = recipientsResponse?.data?.recipients || [];
  const totalRecipients = recipientsResponse?.data?.total || 0;

  const activeBroadcast = detailData || broadcast;
  const stats = activeBroadcast?.stats || { sent: 0, delivered: 0, read: 0, failed: 0 };

  const activeType = activeBroadcast?.template_content ? (Object.keys(activeBroadcast.template_content.types)[0] as BroadcastTemplateType) : null;
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
           startIcon={<RefreshCw size={16} className={isFetchingDetail ? "animate-spin" : ""} />}
           disabled={isFetchingDetail || isLoading}
        >
          {isFetchingDetail || isLoading ? "Reloading..." : "Reload Data"}
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
                Status: <Chip label={activeBroadcast.status} size="small" variant="outlined" sx={{ ml: 1 }} />
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <StatCard label="Sent" value={stats.sent} color="primary.main" />
              </Grid>
              <Grid item xs={6}>
                <StatCard label="Delivered" value={stats.delivered} color="info.main" />
              </Grid>
              <Grid item xs={6}>
                <StatCard label="Read" value={stats.read} color="success.main" />
              </Grid>
              <Grid item xs={6}>
                <StatCard label="Failed" value={stats.failed} color="error.main" />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Configuration</Typography>
              <Stack spacing={1}>
                <DetailItem label="Total Target" value={activeBroadcast.total_target} />
                <DetailItem label="Recipient Source" value={activeBroadcast.recipient_source?.replace(/_/g, ' ')} />
                <DetailItem label="Template ID" value={activeBroadcast.template_id} />
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
              tableId="broadcast-recipients-table"
              data={recipients}
              columns={columns}
              rowCount={totalRecipients}
              isLoading={isLoading}
              manualPagination={true}
              onStateChange={(state) => {
                setTableState({
                  pageIndex: state.pagination.pageIndex,
                  pageSize: state.pagination.pageSize,
                  globalFilter: state.globalFilter || "",
                });
              }}
              features={{
                pagination: true,
                globalFilter: true,
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
          queryClient.invalidateQueries({ queryKey: ['broadcast-recipients', activeBroadcast.id] });
          setEditingRecipient(null);
        }}
      />
    </Dialog>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card variant="outlined" sx={{ textAlign: 'center', height: '100%', borderColor: color }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>{label}</Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, color }}>{value}</Typography>
      </CardContent>
    </Card>
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
