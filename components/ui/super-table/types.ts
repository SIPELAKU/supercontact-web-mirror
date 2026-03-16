import {
  MRT_ColumnDef,
  MRT_Row,
  MRT_TableInstance,
  MRT_SortingState,
  MRT_ColumnFiltersState,
  MRT_VisibilityState,
  MRT_RowSelectionState,
} from 'material-react-table';

// Re-export specific types from MRT that might be needed by parents natively
export type {
  MRT_ColumnDef,
  MRT_Row,
  MRT_TableInstance,
  MRT_SortingState,
  MRT_ColumnFiltersState,
  MRT_VisibilityState,
  MRT_RowSelectionState,
};

/**
 * SuperTableFeatures controls which features are enabled or disabled.
 * The default values align with typical Odoo list views.
 */
export interface SuperTableFeatures {
  // ─── Kolom ──────────────────────────────────────────────────────────
  /** 
   * Aktifkan show/hide column via menu hide.
   * @default true 
   */
  columnVisibility?: boolean;
  /** 
   * Aktifkan drag-and-drop kolom untuk mengurutkan (reorder).
   * @default true 
   */
  columnOrdering?: boolean;
  /** 
   * Aktifkan drag pada batas header kolom untuk mengubah lebar kolom.
   * @default true 
   */
  columnResizing?: boolean;
  /** 
   * Aktifkan pinned columns (freeze panel) ke kiri atau kanan tabel.
   * @default false 
   */
  columnPinning?: boolean;

  // ─── Sort & Filter ──────────────────────────────────────────────────
  /** 
   * Aktifkan sorting (klik panah header untuk sort).
   * @default true 
   */
  sorting?: boolean;
  /** 
   * Aktifkan sort ganda pada beberapa kolom sekaligus dengan Shift+Click.
   * @default true 
   */
  multiSort?: boolean;
  /** 
   * Munculkan kotak pencarian general (global text search) di atas tabel.
   * @default true 
   */
  globalFilter?: boolean;
  /** 
   * Munculkan filter input khusus untuk tiap-tiap kolom di bawah row header.
   * @default false 
   */
  columnFilters?: boolean;
  /** 
   * Munculkan chip/lencana yang menandakan ada filter aktif, bisa dihapus satu per satu.
   * @default true 
   */
  filterChips?: boolean;
  /** 
   * Aktifkan kemampuan menyimpan preset kombinasi filter di localStorage.
   * @default false 
   */
  savedFilters?: boolean;

  // ─── Advanced Filtering ─────────────────────────────────────────────
  /**
   * Aktifkan filter variants otomatis berdasar tipe data kolom.
   * Kolom dengan tipe 'number' → range slider
   * Kolom dengan tipe 'date' → date range picker
   * Kolom dengan enum/select → multi-select dropdown
   * Kolom text biasa → text contains filter
   * @default true
   */
  smartFilterVariants?: boolean;
  /**
   * Gunakan faceted values untuk filter dropdown —
   * dropdown otomatis berisi nilai unik dari data yang ada.
   * Sangat berguna untuk kolom status, kategori, dll.
   * @default true
   */
  facetedValues?: boolean;
  /**
   * User bisa ganti mode filter per kolom
   * (contains → startsWith → equals → dll).
   * @default true
   */
  filterSwitching?: boolean;
  /**
   * Tampilkan filter dalam popover (muncul saat klik icon filter
   * di header) bukan di bawah header kolom.
   * @default false
   */
  popoverFilters?: boolean;
  /**
   * Tampilkan search bar selalu visible (bukan di-toggle dengan icon).
   * @default true
   */
  globalFilterAlwaysVisible?: boolean;

  // ─── Grouping ───────────────────────────────────────────────────────
  /** 
   * Aktifkan row grouping berdasar kolom tertentu.
   * @default false 
   */
  grouping?: boolean;
  /** 
   * Aktifkan kalkulasi otomatis agregasi kolom yang digabung (misal Count, Sum).
   * @default true 
   */
  groupingAggregation?: boolean;

  // ─── Selection ──────────────────────────────────────────────────────
  /** 
   * Tipe selection baris: 'none' (mati), 'single' (radio/satu per satu), atau 'multi' (checkbox).
   * @default 'none' 
   */
  rowSelection?: 'none' | 'single' | 'multi';
  /** 
   * Mengatur behavior "Select All". 
   * 'page' akan select hanya dihalaman aktif.
   * 'all' akan select seluruh row di semua paginasi (data penuh).
   * @default 'page' 
   */
  selectAllMode?: 'page' | 'all';

  // ─── Editing ────────────────────────────────────────────────────────
  /**
   * Mode inline editing langsung di table tanpa buka modal.
   * 
   * 'row'   → Klik icon Edit di kolom aksi → seluruh baris jadi
   *           input fields → muncul tombol ✓ Simpan & ✗ Batal.
   *           Best for: form-like editing dengan validasi per baris.
   * 
   * 'cell'  → Klik langsung cell untuk edit satu cell saja.
   *           Auto-save saat blur (pindah ke cell lain).
   *           Best for: quick edits, spreadsheet-like experience.
   * 
   * 'table' → Semua cell langsung editable sekaligus.
   *           Satu tombol "Simpan Semua" di toolbar.
   *           Best for: bulk data entry.
   * 
   * false   → Editing dimatikan (default).
   * @default false
   */
  inlineEditing?: 'row' | 'cell' | 'table' | false;

  // ─── Pagination ─────────────────────────────────────────────────────
  /** 
   * Menampilkan panel paginasi di bawah tabel.
   * @default true 
   */
  pagination?: boolean;
  /** 
   * Konfigurasi opsi menu per-halaman.
   * @default [10, 25, 50, 100]
   */
  pageSizeOptions?: number[];

  // ─── Export ─────────────────────────────────────────────────────────
  /**
   * Konfigurasi aksi eksport ke file eksternal (data difilter).
   */
  export?: {
    /** 
     * Aktifkan tombol eksport ke Excel (.xlsx).
     * @default false 
     */
    excel?: boolean;
    /** 
     * Aktifkan tombol eksport ke CSV (.csv).
     * @default false 
     */
    csv?: boolean;
  };

  // ─── Sync ───────────────────────────────────────────────────────────
  /** 
   * Sinkronisasikan secara otomatis semua status (paginasi, sortir, filter) dengan URL search parameter (browser history).
   * @default false 
   */
  urlSync?: boolean;

  // ─── UI & Layout ────────────────────────────────────────────────────
  /** 
   * Buat Header table sticky/melayang menempel di atas panel walau konten discroll ke bawah.
   * @default true 
   */
  stickyHeader?: boolean;
  /** 
   * Kepadatan tampilan baris secara standar.
   * @default 'comfortable' 
   */
  density?: 'compact' | 'comfortable' | 'spacious';
  /** 
   * Tampilkan icon density toggle bagi user untuk mengganti kepadatan sesukanya.
   * @default false 
   */
  densityToggle?: boolean;
  /** 
   * Tampilkan toggle full-screen tabel memenuhi seluruh browser viewport.
   * @default false 
   */
  fullScreenToggle?: boolean;
  
  /** 
   * Waktu jeda (MS) saat pengetikan search global (debounce interval). 
   * @default 500 
   */
  globalFilterDebounce?: number;
  /** 
   * Tinggi maksimal kontainer tabel sebelum overflow dengan internal scroll. 
   * @default '70vh' 
   */
  maxHeight?: string;
}

/**
 * SuperTableState merupakan snapshot komplit dari state aktif di tabel. 
 * Parent component butuh ini untuk API Fetch atau persistency data.
 */
export interface SuperTableState {
  pagination: { pageIndex: number; pageSize: number };
  sorting: MRT_SortingState;
  globalFilter: string;
  columnFilters: MRT_ColumnFiltersState;
  columnVisibility: MRT_VisibilityState;
  columnOrder: string[];
  grouping: string[];
  rowSelection: MRT_RowSelectionState;
}

/**
 * SuperTableServerProps berisi kontrol spesifik untuk delegasi paginasi, filter & sort ke server-side (API request).
 */
export interface SuperTableServerProps {
  /** 
   * Berhenti mengurus paginasi (slicing) client-side agar parent bisa menarik index via API. 
   */
  manualPagination?: boolean;
  /** 
   * Jika manualPagination aktif, wajib tentukan total row database agar paginator tampil benar. 
   */
  rowCount?: number;

  /** 
   * Berhenti men-sort di browser, biarkan parent mendengarkan state sorting untuk dilempar ke server.
   */
  manualSorting?: boolean;
  /** 
   * Berhenti men-search di browser, parent akan mengirim pencarian ini ke parameter backend API.
   */
  manualFiltering?: boolean;

  /** 
   * Callback vital untuk komunikasi Server-Side. Dijalankan tiap ada perubahan state 
   * pada tabel (pindah page, search ketik, filter).
   */
  onStateChange?: (state: SuperTableState) => void;
}

/**
 * SuperTableCallbacks menampung semua event custom logic interaction pengguna.
 */
export interface SuperTableCallbacks<TData extends object> {
  /** Callback jika suatu baris (row) diklik. */
  onRowClick?: (row: TData, event: React.MouseEvent) => void;
  /** Callback jika suatu baris diklik ganda/double click. */
  onRowDoubleClick?: (row: TData, event: React.MouseEvent) => void;
  /** Callback yang mengembalikan Array utuh item TData yang dicentang oleh user. */
  onSelectionChange?: (selectedRows: TData[]) => void;
  
  /** 
   * Event hook khusus Inline Edit. Jika me-return promise, baris 
   * akan ada animasi loading menyimpanner hingga resolve. 
   */
  onCellEdit?: (params: {
    row: TData;
    columnId: string;
    oldValue: unknown;
    newValue: unknown;
  }) => Promise<void> | void;
  
  /**
   * Dipanggil saat user klik Simpan setelah inline row editing.
   * Khusus untuk inlineEditing: 'row'.
   * 
   * @param params.row - Data asli row sebelum diedit
   * @param params.values - Object berisi semua nilai baru dari input
   * @param params.exitEditingMode - WAJIB dipanggil setelah save berhasil
   *   untuk keluar dari mode edit. Jika tidak dipanggil, row tetap
   *   dalam mode edit.
   * 
   * Throw Error untuk batalkan save dan tampilkan error state.
   * Return Promise untuk async save (loading indicator otomatis).
   */
  onSaveRow?: (params: {
    row: TData;
    values: Record<string, unknown>;
    exitEditingMode: () => void;
  }) => Promise<void> | void;

  /**
   * Dipanggil saat user klik Batal saat inline row editing.
   * Opsional — gunakan untuk cleanup atau notifikasi.
   */
  onCancelRowEdit?: (row: TData) => void;
  
  /** 
   * Apabila export terjadi pada Server-Side table, parent dipaksa menjawab pemanggilan ini
   * lalu membalas dengan set data penuh untuk bisa diexport. 
   */
  onExportRequest?: (params: {
    format: 'csv' | 'excel';
    currentState: SuperTableState;
  }) => Promise<TData[]> | TData[] | void;
}

/**
 * SuperTableSlots mengatur inject/insert Element UI React bebas (children slots).
 */
export interface SuperTableSlots<TData extends object> {
  /** 
   * Disuntikkan di atas kiri dekat dengan input search.
   * Umum digunakan untuk tombol 'Tambah', 'Import'. 
   */
  renderTopLeftToolbar?: (table: MRT_TableInstance<TData>) => React.ReactNode;
  
  /** 
   * Disuntikkan di toolbar kanan di deretan icon toggle MRT. 
   */
  renderTopRightToolbar?: (table: MRT_TableInstance<TData>) => React.ReactNode;

  /** 
   * Sebuah block element yang akan menggantikan TopLeftToolbar SEPENUHNYA
   * jika dan hanya jika kotak row selection ada yang tercentang.
   */
  renderBulkActions?: (params: {
    selectedRows: TData[];
    clearSelection: () => void;
  }) => React.ReactNode;

  /**
   * Custom row action buttons di kolom paling kanan.
   * 
   * PENTING: Jika inlineEditing='row' aktif, saat row sedang
   * diedit tombol ini otomatis diganti dengan tombol Save/Cancel.
   * Tombol ini hanya tampil saat row TIDAK sedang diedit.
   */
  renderRowActions?: (params: {
    row: MRT_Row<TData>;
    table: MRT_TableInstance<TData>;
  }) => React.ReactNode;

  /** 
   * Render drop-down detail panel tersembunyi untuk tiap row. Klik '>' akan membuka slot ini.
   */
  renderDetailPanel?: (params: { row: MRT_Row<TData> }) => React.ReactNode;

  /** 
   * Menggantikan teks basic 'Data Tidak Ditemukan' dengan full component JSX.
   */
  renderEmptyState?: () => React.ReactNode;
}

/**
 * Props Utama untuk merender komponen SuperTable Odoo standar.
 */
export interface SuperTableProps<TData extends object>
  extends SuperTableServerProps,
    SuperTableCallbacks<TData>,
    SuperTableSlots<TData> {
  
  // ─── DATA ───────────────────────────────────────────────────────────
  /** Array input data referensi tabel. Wajib. */
  data: TData[];
  /** Skema definisi kolom (mirip Odoo tree list). Wajib. */
  columns: MRT_ColumnDef<TData>[];

  // ─── LOADING POINT ──────────────────────────────────────────────────
  /** 
   * Pasang Skeleton Load pertama kali loading, mendisable interaksi selagi TRUE. 
   */
  isLoading?: boolean;
  /** 
   * Mengeluarkan efek loading 'memudar' dengan spinner kecil 
   * mengindikasikan background process (refetch). 
   */
  isFetching?: boolean;
  /** 
   * Masuk mode Error. Melarang tampilan Data Body.
   */
  isError?: boolean;
  /** 
   * Pesan string ketika error terjadi, contoh: 'Koneksi Tembus Gagal'.
   */
  errorMessage?: string;
  /** 
   * Tombol retry untuk menyegarkan dari error state.
   */
  onRetry?: () => void;

  // ─── FEATURE CONFIG ─────────────────────────────────────────────────
  /** Konfigurasi set-tings kapabilitas tabel. Cek Tipe `SuperTableFeatures`. */
  features?: SuperTableFeatures;

  // ─── STYLE HACKS ────────────────────────────────────────────────────
  /** Kustom warna inline react berdasar kondisi object row . */
  getRowStyles?: (row: TData) => React.CSSProperties;
  /** String untuk tailwind atau CSS kustom di tiap elemen row (`<tr>`). */
  getRowClassName?: (row: TData) => string;

  // ─── UTILS ──────────────────────────────────────────────────────────
  /** 
   * ID Unik agar browser bisa melacak table (URL Query keys / Storage keys). 
   * Sangat Wajib dipasang apabila `urlSync` dan `savedFilters` di-On-kan.
   */
  tableId?: string;
  /** 
   * Overwrite default start table state, ex: `{ sorting: [ {id: 'date', desc: true} ] }`. 
   */
  initialState?: Partial<SuperTableState>;
}
