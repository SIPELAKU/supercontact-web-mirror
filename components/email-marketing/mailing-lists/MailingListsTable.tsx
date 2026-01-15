// components/email-marketing/mailing-lists/MailingListsTable.tsx
"use client";

import { MailingList } from '@/lib/types/email-marketing';
import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    Paper,
    Tooltip,
    Typography
} from '@mui/material';
import { ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface MailingListsTableProps {
  onAdd: () => void;
  onEdit: (list: MailingList) => void;
  onDeleteRequest: (list: MailingList) => void;
  refreshTrigger: number;
}

const MailingListsTable = ({ onAdd, onEdit, onDeleteRequest, refreshTrigger }: MailingListsTableProps) => {
  const [lists, setLists] = useState<MailingList[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // MOCK DATA - Remove this when backend is ready
        const { mockMailingLists, simulateApiDelay } = await import('@/lib/data/email-marketing-mock');
        await simulateApiDelay(300);
        
        setLists(mockMailingLists);
      } catch (err: any) {
        toast.error('Failed to fetch mailing lists.');
        setLists([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refreshTrigger]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Toolbar */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Mailing Lists</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Plus className="w-4 h-4" />} 
          onClick={onAdd}
        >
          Create New List
        </Button>
      </Box>

      {/* Lists */}
      <Box sx={{ px: 2, pb: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : lists.length === 0 ? (
          <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            No mailing lists yet.
          </Typography>
        ) : (
          lists.map((list) => (
            <Paper
              key={list.id}
              variant="outlined"
              sx={{ 
                mb: 1.5, 
                display: 'flex',
                alignItems: 'center',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
              }}
            >
              <Link 
                href={`/email-marketing/mailing-lists/${list.id}`}
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
                  <Typography variant="h6">{list.name}</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', mx: 2, minWidth: '80px' }}>
                  <Typography variant="body1" fontWeight={600}>{list.contact_count}</Typography>
                  <Typography variant="caption" color="text.secondary">Contacts</Typography>
                </Box>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>

              <Box sx={{ borderLeft: 1, borderColor: 'divider', p: 1, display: 'flex', gap: 0.5 }}>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => onEdit(list)}>
                    <Pencil className="w-4 h-4" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => onDeleteRequest(list)}>
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          ))
        )}
      </Box>
    </Box>
  );
};

export default MailingListsTable;
