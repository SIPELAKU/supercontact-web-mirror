'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Tooltip,
  IconButton,
  Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import RestoreIcon from '@mui/icons-material/Restore';
import { toast } from 'react-hot-toast';
import { notify } from '@/lib/notifications';

// Komponen SuperTable
import { SuperTable, MRT_ColumnDef, SuperTableState } from '@/components/ui/super-table';

// Mock Data
import {
  DemoEmployee,
  DemoProduct,
  mockEmployees200,
  mockEmployees500,
  initialProducts,
} from './demo-data';

// ========================================================================
// SECTION 0 — INTEGRATION CHECKLIST (Tabel MUI Biasa)
// ========================================================================
interface TableIntegrationStatus {
  no: number;
  tableName: string;
  filePath: string;
  module: string;
  complexity: 'Low' | 'Medium' | 'High';
  migrationStatus: 'Selesai' | 'Belum' | 'Dikembalikan';
  currentFeatures: string[];
  superTableFeatures: string[];
  estimasiWaktu: string;
  blockers: string;
}

const checklistData: TableIntegrationStatus[] = [
  { no: 1, tableName: 'RolesTable', filePath: 'components/roles/roles-table/RolesTable.tsx', module: 'Roles', complexity: 'Low', migrationStatus: 'Selesai', currentFeatures: ['Pagination', 'Search'], superTableFeatures: ['manualPagination', 'server-side search', 'export Excel/CSV loop pagination', 'urlSync', 'facetedValues', 'densityToggle', 'fullScreenToggle', 'multi-select filter permissions'], estimasiWaktu: 'Selesai', blockers: '' },
  { no: 2, tableName: 'TicketTable', filePath: 'components/support/tickets/TicketTable.tsx', module: 'Support', complexity: 'Medium', migrationStatus: 'Selesai', currentFeatures: ['Pagination', 'Search', 'Status filter', 'Selection'], superTableFeatures: ['manualPagination', 'column filters per kolom (select Priority & Status, dropdown Agent dengan UUID)', 'bulk delete sequential dengan progress toast', 'export loop semua halaman', 'mobile responsive'], estimasiWaktu: 'Selesai', blockers: '' },
  { no: 3, tableName: 'ProductTable', filePath: 'components/product/ProductTable.tsx', module: 'Product', complexity: 'Medium', migrationStatus: 'Selesai', currentFeatures: ['Pagination', 'Search', 'Action menu'], superTableFeatures: ['manualPagination', 'accessorFn formatting (Rupiah & persen)', 'bulk delete sequential', 'export loop semua halaman dengan do...while', 'race condition fix dengan useRef prevState'], estimasiWaktu: 'Selesai', blockers: '' },
  { no: 4, tableName: 'TableListUsers', filePath: 'components/users/TableListUsers.tsx', module: 'Users', complexity: 'Medium', migrationStatus: 'Selesai', currentFeatures: ['Pagination', 'Search', 'Filter role'], superTableFeatures: ['manualPagination', 'server-side filter Position & Status', 'dynamic position options dari data aktif', 'bulk delete sequential', 'export Excel/CSV loop pagination', 'Print PDF di toolbar', 'mobile responsive toolbar'], estimasiWaktu: 'Selesai', blockers: '' },
  { no: 5, tableName: 'CampaignsTable', filePath: 'components/email-marketing/campaigns/CampaignsTable.tsx', module: 'Email Marketing', complexity: 'Medium', migrationStatus: 'Selesai', currentFeatures: ['Pagination', 'Search', 'Status Filter'], superTableFeatures: ['manualPagination', 'client-side status filter', 'bulk delete (Draft only) dengan skip notification', 'export Excel/CSV loop pagination', 'mobile responsive toolbar'], estimasiWaktu: 'Selesai', blockers: '' },
  { no: 6, tableName: 'ContactTable', filePath: 'components/contact/ContactTable.tsx', module: 'Contact', complexity: 'High', migrationStatus: 'Selesai', currentFeatures: ['Pagination', 'Complex API Filter', 'Selection', 'Multi actions'], superTableFeatures: [
      'manualPagination (server-side pagination)',
      'client-side filter: Name, Email, Phone (text), Position & Company (select faceted)',
      'globalFilter search (toggle show/hide)',
      'export Excel/CSV loop pagination',
      'renderRowActions: Eye (preview), Edit, Delete',
      'renderBulkActions: Delete Selected sequential (loop per ID, skip FOREIGN_KEY_VIOLATION)',
      'Add Contact + Import button di toolbar',
      'mobile responsive toolbar (Import: border biru, Add: bg biru icon-only)',
      'Preview Dialog (popup kontak info lengkap)',
      'autoResetPageIndex: false',
    ], estimasiWaktu: 'Selesai', blockers: '' },
  { no: 7, tableName: 'QuotationTable', filePath: 'components/sales/QuotationTable.tsx', module: 'Sales', complexity: 'Medium', migrationStatus: 'Selesai', currentFeatures: ['Pagination', 'Search'], superTableFeatures: ['manualPagination', 'client-side status filter', 'date range filter', 'export Excel/CSV loop', 'mobile responsive toolbar', 'accessorFn formatting Rupiah'], estimasiWaktu: '1 hari', blockers: '' },
  { no: 8, tableName: 'DepartmentsTableList', filePath: 'components/organization/departments-table/DepartmentsTableList.tsx', module: 'Organization', complexity: 'Medium', migrationStatus: 'Selesai', currentFeatures: ['Pagination', 'Tree/Expand'], superTableFeatures: ['manualPagination', 'server-side filter Department & Branch', 'dynamic branch options dari API', 'bulk delete sequential', 'export Excel/CSV loop pagination', 'Print PDF di toolbar', 'row click navigation ke detail', 'mobile responsive toolbar'], estimasiWaktu: 'Selesai', blockers: '' },
  { no: 9, tableName: 'DepartmentsTableMember', filePath: 'components/organization/departments-table/DepartmentsTableMember.tsx', module: 'Organization', complexity: 'Medium', migrationStatus: 'Selesai', currentFeatures: ['Pagination', 'Search'], superTableFeatures: ['manualPagination', 'server-side filter Position (14 opsi) & Status', 'bulk delete sequential (departmentId + memberId)', 'export Excel/CSV loop pagination', 'status badge fix (Active/Pending/Inactive)', 'AddMemberButton di toolbar', 'mobile responsive'], estimasiWaktu: 'Selesai', blockers: '' },
  { no: 10, tableName: 'CompanyTable', filePath: 'components/omnichannel/CompanyTable.tsx', module: 'Omnichannel', complexity: 'Medium', migrationStatus: 'Selesai', currentFeatures: ['Pagination', 'Search'], superTableFeatures: [
      'manualPagination + manualSorting',
      'client-side filter Industry & Location (multi-select, facetedValues: false)',
      'filter Status (select: Success/Failed/Enriching)',
      'globalFilter (search)',
      'bulk delete dengan showConfirmation modal',
      'export Excel/CSV loop pagination',
      'Print PDF di toolbar',
      'row click navigation ke profile detail',
      'mobile responsive toolbar',
      '⚠️ Catatan: Filter Industry & Location client-side only (data halaman aktif). Bug filterValue.some dari URL sync belum resolved di SuperTable core.'
    ], estimasiWaktu: 'Selesai', blockers: '' },
  { no: 11, tableName: 'SubscribersTable', filePath: 'components/email-marketing/subscribers/SubscribersTable.tsx', module: 'Email Marketing', complexity: 'High', migrationStatus: 'Selesai', currentFeatures: ['Pagination', 'Heavy selection', 'Import/Export custom'], superTableFeatures: [
      'manualPagination',
      'globalFilter search',
      'bulk delete',
      'export Excel/CSV loop pagination',
      'Add Subscriber button di toolbar',
      'Import button di toolbar',
      'mobile responsive toolbar (Import: border biru, Add: bg biru)'
    ], estimasiWaktu: 'Selesai', blockers: '' },
  { no: 12, tableName: 'Lead DataTable', filePath: 'components/lead-management/lead-management-table/data-table.tsx', module: 'Lead Management', complexity: 'High', migrationStatus: 'Selesai', currentFeatures: ['Pagination', 'Complex Filter', 'Pipeline View'], superTableFeatures: [
      'client-side filter Status, Source, Assigned To (select via columnFilters)',
      'client-side filter Last Contacted (date-range, accessorFn return Date)',
      'globalFilter search (toggle show/hide, globalFilterAlwaysVisible: false)',
      'autoResetPageIndex: false (fix infinite loop)',
      'Kanban View sync via onStateChange shared state + useRef deep comparison',
      'onRowClick → buka LeadDetailModal',
      'export Excel/CSV',
      'facetedValues: true (Assigned To auto-detect options)',
    ], estimasiWaktu: 'Selesai', blockers: '' },
];

const IntegrationChecklist = () => {
  return (
    <Card variant="outlined" sx={{ mb: 4 }} id="section-0">
      <CardContent>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Status Integrasi SuperTable
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Checklist semua tabel di codebase dan kesiapannya untuk migrasi ke SuperTable.
        </Typography>

        {/* Summary */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Box p={2} border="1px solid" borderColor="divider" borderRadius={2} textAlign="center" flex={1} minWidth={120}>
            <Typography variant="h4" color="success.main" fontWeight="bold">12</Typography>
            <Typography variant="body2" color="text.secondary">✅ Selesai</Typography>
          </Box>
          <Box p={2} border="1px solid" borderColor="divider" borderRadius={2} textAlign="center" flex={1} minWidth={120}>
            <Typography variant="h4" color="warning.main" fontWeight="bold">0</Typography>
            <Typography variant="body2" color="text.secondary">🔄 Dikembalikan</Typography>
          </Box>
          <Box p={2} border="1px solid" borderColor="divider" borderRadius={2} textAlign="center" flex={1} minWidth={120}>
            <Typography variant="h4" color="text.secondary" fontWeight="bold">0</Typography>
            <Typography variant="body2" color="text.secondary">⏳ Belum</Typography>
          </Box>
          <Box p={2} border="1px solid" borderColor="divider" borderRadius={2} textAlign="center" flex={1} minWidth={120}>
            <Typography variant="h4" color="text.primary" fontWeight="bold">12</Typography>
            <Typography variant="body2" color="text.secondary">Total</Typography>
          </Box>
        </Box>

        {/* Tabel Manual Sederhana untuk Checklist */}
        <Box sx={{ overflowX: 'auto', mb: 3 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 800 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '12px 8px' }}>No</th>
                <th style={{ padding: '12px 8px' }}>Table Component</th>
                <th style={{ padding: '12px 8px' }}>Modul</th>
                <th style={{ padding: '12px 8px' }}>Status</th>
                <th style={{ padding: '12px 8px' }}>Kompleksitas</th>
                <th style={{ padding: '12px 8px' }}>Fitur Baru Mendarat</th>
                <th style={{ padding: '12px 8px' }}>Estimasi</th>
              </tr>
            </thead>
            <tbody>
              {checklistData.map((row) => (
                <tr key={row.no} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 8px' }}>{row.no}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <Typography variant="body2" fontWeight="bold">{row.tableName}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.filePath}</Typography>
                  </td>
                  <td style={{ padding: '12px 8px' }}><Chip size="small" label={row.module} /></td>
                  <td style={{ padding: '12px 8px' }}>
                    {row.migrationStatus === 'Selesai' && <Chip size="small" color="success" icon={<CheckCircleIcon />} label="Selesai" />}
                    {row.migrationStatus === 'Belum' && <Chip size="small" color="default" icon={<PendingIcon />} label="Belum" />}
                    {row.migrationStatus === 'Dikembalikan' && <Chip size="small" color="warning" icon={<RestoreIcon />} label="Dikembalikan" />}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <Chip 
                      size="small" 
                      variant="outlined" 
                      color={row.complexity === 'High' ? 'error' : row.complexity === 'Medium' ? 'warning' : 'success'} 
                      label={row.complexity} 
                    />
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <Tooltip arrow title={row.superTableFeatures.join(', ')}>
                      <Chip size="small" label={`${row.superTableFeatures.length} Fitur Baru`} sx={{ cursor: 'help' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '12px 8px' }}>{row.estimasiWaktu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        {/* Callout Info */}
        <Box sx={{ p: 3, bgcolor: '#f4f6f8', borderRadius: 2, borderLeft: '4px solid #1976d2' }}>
          <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
            💡 Cara Migrasi Table ke SuperTable
          </Typography>
          <Typography variant="body2" component="ol" sx={{ m: 0, pl: 2, color: 'text.secondary', lineHeight: 1.8 }}>
            <li>Import <code>SuperTable</code> dari <code>@/components/ui/super-table</code></li>
            <li>Definisikan columns dengan tipikal `MRT_ColumnDef` & sesuaikan filterVariant</li>
            <li>Ganti render <code>{'<Table> / <MuiTable>'}</code> dengan <code>{'<SuperTable data={data} columns={columns} />'}</code></li>
            <li>Aktifkan fitur via parameter options <code>features={`{{ ... }}`}</code></li>
            <li>Hubungkan ke server-side state (jika perlu) via <code>manualPagination</code> & <code>onStateChange</code></li>
          </Typography>
          <Typography variant="caption" sx={{ mt: 2, display: 'block', fontWeight: 'bold' }}>
            Estimasi total penyelesaian migrasi sisa table: ~12 hari kerja
          </Typography>
        </Box>

      </CardContent>
    </Card>
  );
};

// ========================================================================
// SECTION 1 — FILTER VARIANTS DEMO
// ========================================================================
const filterColumns: MRT_ColumnDef<DemoEmployee>[] = [
  { accessorKey: 'id', header: 'ID', enableColumnFilter: false, size: 60 },
  { accessorKey: 'name', header: 'Nama', filterVariant: 'text' },
  { accessorKey: 'email', header: 'Email', filterVariant: 'text' },
  { 
    accessorKey: 'department', 
    header: 'Departemen', 
    filterVariant: 'multi-select',
    // enableFacetedValues handled by features config by default
  },
  { 
    accessorKey: 'status', 
    header: 'Status', 
    filterVariant: 'multi-select',
    Cell: ({ cell }) => {
      const val = cell.getValue<string>();
      return (
        <Chip 
          size="small" 
          label={val} 
          color={val === 'Aktif' ? 'success' : val === 'Cuti' ? 'warning' : 'error'} 
        />
      );
    }
  },
  { 
    accessorKey: 'salary', 
    header: 'Gaji', 
    filterVariant: 'range-slider', 
    filterFn: 'betweenInclusive',
    Cell: ({ cell }) => `Rp ${cell.getValue<number>().toLocaleString('id-ID')}`
  },
  { 
    accessorKey: 'age', 
    header: 'Usia', 
    filterVariant: 'range-slider', 
    filterFn: 'betweenInclusive',
    size: 90
  },
  { 
    accessorKey: 'joinDate', 
    header: 'Tgl Bergabung', 
    filterVariant: 'date-range',
    Cell: ({ cell }) => {
      const date = cell.getValue<Date>();
      return date ? date.toLocaleDateString('id-ID') : '-';
    }
  },
  { 
    accessorKey: 'isRemote', 
    header: 'Remote', 
    filterVariant: 'checkbox',
    Cell: ({ cell }) => {
      const val = cell.getValue<boolean>();
      return <Chip size="small" label={val ? 'Remote' : 'Onsite'} color={val ? 'info' : 'default'} />;
    }
  },
  { accessorKey: 'city', header: 'Kota', filterVariant: 'multi-select' },
];


// ========================================================================
// SECTION 2A — ACCESSORFN FORMATTING DEMO
// ========================================================================
const AccessorFnFormattingDemo = () => {
  const discountValues = [10, 15, 20, 25, 5, 30, 12, 18, 22, 12];

  const formattingData = React.useMemo(() => 
    initialProducts.slice(0, 10).map((p, i) => ({
      ...p,
      discount: discountValues[i % discountValues.length]
    }))
  , []);

  const formattingColumns: MRT_ColumnDef<any>[] = [
    { accessorKey: 'name', header: 'Nama Produk' },
    {
      id: "price",
      accessorFn: (row) => new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', 
        minimumFractionDigits: 0
      }).format(Number(row.price)),
      header: "Harga",
      Cell: ({ cell }) => (
        <span className="font-medium text-gray-900">
          {cell.getValue<string>()}
        </span>
      ),
    },
    { accessorKey: 'status', header: 'Status' },
    {
      id: "discount",
      accessorFn: (row: any) => `${row.discount}%`,
      header: "Diskon Simulasi",
      enableColumnFilter: false,
      Cell: ({ cell }) => (
        <span className="font-medium text-green-600">
          {cell.getValue<string>()}
        </span>
      ),
    }
  ];

  return (
    <Card variant="outlined" sx={{ mb: 4 }} id="section-formatting">
      <CardContent>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          AccessorFn Formatting — Format Data untuk UI & Export Sekaligus
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Cara yang benar untuk format data (currency, persen, dll) agar tampil rapi di tabel DAN terformat dengan benar saat di-export ke Excel/CSV
        </Typography>
        
        <SuperTable
          data={formattingData}
          columns={formattingColumns}
          features={{ 
            export: { excel: true, csv: true },
          }}
        />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 3 }}>
          <Box flex={1} p={2} bgcolor="#f8fafc" borderRadius={2} border="1px solid #e2e8f0">
            <Typography variant="subtitle2" fontWeight="bold" color="success.main" mb={1}>✅ Cara Benar</Typography>
            <pre style={{ margin: 0, fontSize: '0.8rem', overflowX: 'auto' }}>
{`{
  id: "price",
  accessorFn: (row) => formatRupiah(row.price),
  header: "Harga",
  Cell: ({ cell }) => (
    <span className="font-medium">
      {cell.getValue<string>()}
    </span>
  ),
  // Export otomatis dapat "Rp. 10.000.000" ✅
}`}
            </pre>
          </Box>
          <Box flex={1} p={2} bgcolor="#fff1f2" borderRadius={2} border="1px solid #ffe4e6">
            <Typography variant="subtitle2" fontWeight="bold" color="error.main" mb={1}>❌ Cara Salah</Typography>
            <pre style={{ margin: 0, fontSize: '0.8rem', overflowX: 'auto' }}>
{`{
  accessorKey: "price",
  header: "Harga", 
  Cell: ({ row }) => (
    <span>{formatRupiah(row.original.price)}</span>
  ),
  // Export dapat raw number "10000000.00" ❌
}`}
            </pre>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

// ========================================================================
// SECTION 2B — BULK DELETE DEMO
// ========================================================================
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const BulkDeleteDemo = () => {
  const [items, setItems] = useState<DemoEmployee[]>(mockEmployees200.slice(0, 8));
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [progress, setProgress] = useState("");

  const handleBulkDelete = async (
    selectedItems: any[], 
    clearSelection: () => void
  ) => {
    setIsBulkDeleting(true);
    let done = 0;
    
    for (const item of selectedItems) {
      await simulateDelay(400); // simulasi API call
      setItems(prev => prev.filter(i => i.id !== item.id));
      done++;
      setProgress(`Menghapus... (${done}/${selectedItems.length} selesai)`);
    }
    
    setIsBulkDeleting(false);
    setProgress("");
    clearSelection();
    notify.success(`${done} data berhasil dihapus`);
  };

  return (
    <Card variant="outlined" sx={{ mb: 4 }} id="section-bulk-delete">
      <CardContent>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Bulk Delete — Hapus Banyak Data Sekaligus
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sequential bulk delete — setiap item dihapus satu per satu dengan progress tracking real-time
        </Typography>
        
        <SuperTable
          data={items}
          columns={filterColumns}
          features={{ 
            rowSelection: 'multi',
          }}
          renderBulkActions={({ selectedRows, clearSelection }) => (
            <Box display="flex" alignItems="center" gap={2}>
              <Button 
                variant="contained" 
                color="error" 
                size="small"
                disabled={isBulkDeleting}
                onClick={async () => {
                  await handleBulkDelete(selectedRows as DemoEmployee[], clearSelection);
                }}
              >
                {isBulkDeleting && progress ? progress : `Hapus ${selectedRows.length} Data`}
              </Button>
              <Button 
                variant="outlined" 
                color="inherit" 
                size="small"
                disabled={isBulkDeleting}
                onClick={clearSelection}
              >
                Batal
              </Button>
            </Box>
          )}
        />

        <Box mt={3} p={2} bgcolor="#f8fafc" borderRadius={2} border="1px solid #e2e8f0">
          <pre style={{ margin: 0, fontSize: '0.8rem', overflowX: 'auto' }}>
{[
  'const handleBulkDelete = async (',
  '  selectedItems, ',
  '  clearSelection',
  ') => {',
  '  setIsBulkDeleting(true);',
  '  let done = 0;',
  '  ',
  '  for (const item of selectedItems) {',
  '    await simulateDelay(400); // simulasi API call',
  '    setItems(prev => prev.filter(i => i.id !== item.id));',
  '    done++;',
  '    setProgress(`Menghapus... (${done}/${selectedItems.length})`);',
  '  }',
  '  ',
  '  setIsBulkDeleting(false);',
  '  clearSelection();',
  '  notify.success(`${done} data berhasil dihapus`);',
  '};'
].join('\n')}
          </pre>
        </Box>
      </CardContent>
    </Card>
  );
};

// ========================================================================
// SECTION 3 — SERVER-SIDE SIMULATION
// ========================================================================
const simulateServerFetch = async (state: SuperTableState) => {
  await new Promise(r => setTimeout(r, 600)); // Latency delay
  let filtered = [...mockEmployees500];

  // Dummy global filtering logic
  if (state.globalFilter) {
    const query = state.globalFilter.toLowerCase();
    filtered = filtered.filter(e => 
      e.name.toLowerCase().includes(query) || 
      e.email.toLowerCase().includes(query)
    );
  }

  // Dummy sorting logic
  if (state.sorting.length > 0) {
    const sort = state.sorting[0];
    filtered.sort((a, b) => {
      const aVal = a[sort.id as keyof DemoEmployee];
      const bVal = b[sort.id as keyof DemoEmployee];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sort.desc ? -cmp : cmp;
    });
  }

  const total = filtered.length;
  const { pageIndex, pageSize } = state.pagination;
  const paginated = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  
  return { data: paginated, total };
};

const ServerSideDemo = () => {
  const [serverData, setServerData] = useState<DemoEmployee[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleStateChange = async (state: SuperTableState) => {
    setIsLoading(true);
    const result = await simulateServerFetch(state);
    setServerData(result.data);
    setTotalRows(result.total);
    setIsLoading(false);
  };

  // Initial fetch mount
  useEffect(() => {
    handleStateChange({
      pagination: { pageIndex: 0, pageSize: 10 },
      sorting: [], globalFilter: '', columnFilters: [],
      columnVisibility: {}, columnOrder: [], grouping: [], rowSelection: {},
    });
  }, []);

  return (
    <Card variant="outlined" sx={{ mb: 4 }} id="section-3">
      <CardContent>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Server-Side Pagination & Filtering
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Simulasi memanggil API sungguhan. Menyerahkan slicing data, sorting, dan filter ke server. (Latency 600ms teratur).
        </Typography>
        
        <SuperTable
          data={serverData}
          columns={filterColumns} // Reuse columns dari Section 1
          manualPagination={true}
          manualSorting={true}
          manualFiltering={true}
          rowCount={totalRows}
          isLoading={isLoading}
          onStateChange={handleStateChange}
          features={{
            globalFilterAlwaysVisible: true,
          }}
        />
      </CardContent>
    </Card>
  );
};

// ========================================================================
// PAGE EXPORT
// ========================================================================
export default function SuperTableDemoPage() {

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box p={4} maxWidth={1400} mx="auto">
      <Typography variant="h3" fontWeight="900" gutterBottom>
        SuperTable Showroom
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Eksplorasi dokumentasi interaktif seluruh kemampuan adaptif Advanced `{'<SuperTable />'}`
      </Typography>

      {/* Quick Nav anchor */}
      <Stack direction="row" gap={1} sx={{ my: 3, flexWrap: 'wrap' }}>
        <Chip label="📋 Checklist Integrasi" onClick={() => scrollTo('section-0')} clickable color="primary" variant="outlined" />
        <Chip label="🔍 Filter Variants" onClick={() => scrollTo('section-1')} clickable color="primary" variant="outlined" />
        <Chip label="💲 AccessorFn Format" onClick={() => scrollTo('section-formatting')} clickable color="primary" variant="outlined" />
        <Chip label="🗑️ Bulk Delete" onClick={() => scrollTo('section-bulk-delete')} clickable color="primary" variant="outlined" />
        <Chip label="🌐 Server-Side Logics" onClick={() => scrollTo('section-3')} clickable color="primary" variant="outlined" />
      </Stack>

      {/* Section 0: Checklist Migration Status */}
      <IntegrationChecklist />

      {/* Section 1: Data Types Smart Filter Variants */}
      <Card variant="outlined" sx={{ mb: 4 }} id="section-1">
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Advanced Filtering — Semua Tipe Filter Kolom Otomatis
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Setiap kolom mengenali filter `filterVariant` yang presisi. Tersertifikasi tipe (Range Slider untuk Gaji umur, Date Range untuk Tanggal, Dropdown enum untuk kota & dept).
          </Typography>
          <SuperTable
            data={mockEmployees200}
            columns={filterColumns}
            features={{
              columnFilters: true,
              facetedValues: true,
              filterSwitching: true,
              globalFilterAlwaysVisible: true,
              rowSelection: 'multi',
              export: { excel: true, csv: true },
              densityToggle: true,
              columnPinning: true,
            }}
          />
        </CardContent>
      </Card>

      <AccessorFnFormattingDemo />
      <BulkDeleteDemo />

      {/* Section 3: API Request Backend Fetching */}
      <ServerSideDemo />

    </Box>
  );
}
