// components/whatsapp-marketing/group-broadcasting/GroupBroadcastingTable.tsx
"use client";

import { DeleteButton, EditButton, DuplicateButton } from '@/components/ui/app-action-buttons-table';
import { AppButton } from '@/components/ui/app-button';
import { useGroupBroadcasts, useDuplicateGroupBroadcasts } from '@/lib/hooks/useGroupBroadcasts';
import { GroupBroadcast } from '@/lib/types/whatsapp-marketing';
import {
  Box,
  CircularProgress,
  Paper,
  Typography,
  Checkbox
} from '@mui/material';
import { ChevronRight, Plus, Copy } from 'lucide-react';
import Link from 'next/link';
import { notify } from '@/lib/notifications';
import { useState, useEffect } from 'react';

interface GroupBroadcastingTableProps {
  onAdd: () => void;
  onEdit: (broadcast: GroupBroadcast) => void;
  onDeleteRequest: (broadcast: GroupBroadcast) => void;
  refreshTrigger: number;
}

const GroupBroadcastingTable = ({ onAdd, onEdit, onDeleteRequest }: GroupBroadcastingTableProps) => {
  const { data, isLoading, error } = useGroupBroadcasts();
  const duplicateMutation = useDuplicateGroupBroadcasts();
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (error) {
      notify.error('Failed to fetch group broadcasts.');
    }
  }, [error]);

  const broadcasts = data?.data?.broadcast_groups || [];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(broadcasts.map(b => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleDuplicate = async (ids: string[]) => {
    try {
      await duplicateMutation.mutateAsync({ broadcast_group_ids: ids });
      notify.success(`${ids.length} group(s) duplicated successfully.`);
      setSelectedIds([]);
    } catch (err: any) {
      notify.error(err.message || 'Failed to duplicate group(s).');
    }
  };

  const allSelected = broadcasts.length > 0 && selectedIds.length === broadcasts.length;
  const isSomeSelected = selectedIds.length > 0;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Toolbar */}
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Checkbox 
            checked={allSelected}
            indeterminate={isSomeSelected && !allSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
          />
          <Typography variant="h6">Group Broadcasts ({broadcasts.length})</Typography>
          {isSomeSelected && (
            <AppButton
              variantStyle="outline"
              color="primary"
              startIcon={<Copy className="w-4 h-4" />}
              onClick={() => handleDuplicate(selectedIds)}
              disabled={duplicateMutation.isPending}
              sx={{ ml: 2 }}
            >
              Duplicate ({selectedIds.length})
            </AppButton>
          )}
        </Box>
        <AppButton
          variantStyle="primary"
          startIcon={<Plus className="w-4 h-4" />}
          onClick={onAdd}
        >
          Create New Group Broadcast
        </AppButton>
      </Box>

      {/* Lists */}
      <Box sx={{ px: 3, pb: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : broadcasts.length === 0 ? (
          <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            No group broadcasts yet.
          </Typography>
        ) : (
          broadcasts.map((broadcast) => (
            <Paper
              key={broadcast.id}
              variant="outlined"
              sx={{
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 2,
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
              }}
            >
              <Checkbox 
                checked={selectedIds.includes(broadcast.id)}
                onChange={(e) => handleSelectOne(broadcast.id, e.target.checked)}
                sx={{ ml: 1 }}
              />
              <Link
                href={`/whatsapp-marketing/group-broadcasting/${broadcast.id}`}
                style={{
                  flex: 1,
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px'
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{broadcast.name}</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', mx: 2, minWidth: '80px' }}>
                  <Typography variant="body1" fontWeight={600}>{broadcast.recipient_count}</Typography>
                  <Typography variant="caption" color="text.secondary">Recipients</Typography>
                </Box>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>

              <Box sx={{ borderLeft: 1, borderColor: 'divider', p: 1, display: 'flex', gap: 0.5 }}>
                <DuplicateButton onClick={() => handleDuplicate([broadcast.id])} isLoading={duplicateMutation.isPending && selectedIds.includes(broadcast.id)} />
                <EditButton onClick={() => onEdit(broadcast)} />
                <DeleteButton onClick={() => onDeleteRequest(broadcast)} />
              </Box>
            </Paper>
          ))
        )}
      </Box>
    </Box>
  );
};

export default GroupBroadcastingTable;
