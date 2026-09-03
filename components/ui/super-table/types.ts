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
   *
   * Default OFF: setiap endpoint di app ini hanya menerima satu pasang
   * `sort_by`/`sort_order`, jadi panah sort kedua tidak pernah sampai ke
   * server. Nyalakan hanya untuk tabel client-side.
   * @default false
   */
  multiSort?: boolean;
  /** 
   * Munculkan kotak pencarian general (global text search) di atas tabel.
   * @default true 
   */
  globalFilter?: boolean;
  /**
   * Munculkan baris input filter MRT di bawah header kolom.
   *
   * @deprecated Pakai prop `filters` (deklaratif) sebagai gantinya. Baris
   * subheader ini memakan satu pita tinggi permanen, hanya muncul di lebar
   * desktop, dan tak punya cara menampilkan filter mana yang sedang aktif
   * selain membaca ulang tiap kotaknya. `filters` merender kontrol yang sama
   * sebagai satu tombol + chip yang bisa dibaca sekilas dan dilepas satu-satu.
   *
   * Keduanya menulis ke state yang SAMA (`columnFilters`), jadi halaman yang
   * membaca `state.columnFilters` tetap jalan saat berpindah.
   * @default false
   */
  columnFilters?: boolean;
  /**
   * Aktifkan kemampuan menyimpan preset kombinasi filter di localStorage.
   * @default false 
   */
  savedFilters?: boolean;

  // ─── Advanced Filtering ─────────────────────────────────────────────
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

  // ─── Grouping ───────────────────────────────────────────────────────
  /** 
   * Aktifkan row grouping berdasar kolom tertentu.
   * @default false 
   */
  grouping?: boolean;

  // ─── Selection ──────────────────────────────────────────────────────
  /**
   * Tipe selection baris: 'none' (mati), 'single' (radio/satu per satu), atau 'multi' (checkbox).
   * @default 'none'
   */
  rowSelection?: 'none' | 'single' | 'multi';

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
   * Bagaimana baris berikutnya didapat.
   *
   * `'lazy'`  → **default**. Tak ada nomor halaman. Baris menumpuk saat
   *             di-scroll (sentinel IntersectionObserver) dan footer
   *             menampilkan "Menampilkan 240 dari 12.431" plus tombol
   *             *Load more* untuk keyboard/pembaca layar. Berlaku untuk
   *             tabel server (`manualPagination`) maupun client-side.
   * `'pages'` → paginator bernomor yang lama. Pakai untuk tabel setelan
   *             yang isinya belasan baris dan untuk layar yang butuh
   *             deep-link `?p=3`.
   * `false`   → tak ada paginasi sama sekali (tabel sudah pasti pendek).
   *
   * `true`/`undefined` dipetakan ke `'lazy'` supaya ~44 tabel lama ikut
   * berubah tanpa menyentuh satu per satu; `false` tetap `false`.
   * @default 'lazy'
   */
  pagination?: 'lazy' | 'pages' | boolean;
  /**
   * Berapa baris ditarik sekali angkut. Di mode `'lazy'` angka pertama jadi
   * ukuran batch; opsi lain muncul di menu "Rows" pada footer.
   * @default [25, 50, 100] untuk 'lazy', [10, 25, 50, 100] untuk 'pages'
   */
  pageSizeOptions?: number[];
  /**
   * Berhenti auto-load setelah sekian batch dan mewajibkan klik *Load more*.
   *
   * Ini rem pengaman, bukan preferensi: scroll tanpa henti pada 12.000 baris
   * akan menaruh 12.000 `<tr>` di DOM. Setelah batas ini tercapai sentinel
   * dimatikan dan hanya tombol yang menambah baris.
   * @default 10
   */
  autoLoadLimit?: number;
  /**
   * Virtualisasi baris (hanya baris yang terlihat yang dirender).
   *
   * OPT-IN, dan **dibaca sekali saat mount** - MRT menyimpannya di
   * `useMemo(..., [])`, jadi tak bisa dinyalakan belakangan berdasar jumlah
   * baris. Menyalakannya memaksa `layoutMode: 'grid'`, yang berarti lebar
   * kolom mengikuti `size` di column def, bukan lagi lebar alami tabel -
   * karena itu ia tidak default. Nyalakan untuk daftar yang memang panjang
   * (Contacts, Subscribers, Companies) setelah kolomnya diberi `size`.
   * @default false
   */
  virtualize?: boolean;

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
  /**
   * Filter deklaratif (`filters`) sebagai objek datar - bentuk yang biasanya
   * langsung dioper ke query string API.
   *
   * Ini pandangan KEDUA atas data yang sama: setiap nilai di sini juga ada di
   * `columnFilters`. Halaman lama membaca `columnFilters`; halaman baru cukup
   * membaca `filters`. Tak ada yang perlu diubah untuk tetap jalan.
   */
  filters: SuperTableFilterValues;
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
   * Nonaktifkan auto-reset pageIndex ke 0 saat data/filter berubah.
   * Berguna untuk mencegah infinite loop pada client-side filtered tables.
   * @default undefined (MRT default behavior)
   */
  autoResetPageIndex?: boolean;

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
    /**
     * Call while walking pages so the export dialog can show real progress
     * instead of an indeterminate bar. Safe to ignore.
     */
    onProgress?: (fetched: number, total: number) => void;
  }) => Promise<TData[]> | TData[] | void;
}

/**
 * Satu aksi baris, dideklarasikan sebagai DATA - bukan JSX.
 *
 * Kenapa data: renderer-nya jadi milik SuperTable, sehingga varian mobile
 * (drawer berlabel 48px) cukup ditulis sekali dan seluruh tabel ikut. Selama
 * ini tiap layar merender sendiri gerombolan IconButton-nya, jadi tak ada satu
 * tempat pun untuk memperbaiki target sentuh, urutan, atau label.
 */
export interface SuperTableRowAction<TData extends object> {
  /** Stabil, dipakai sebagai React key. */
  id: string;
  /** Boleh fungsi bila labelnya bergantung pada barisnya. */
  label: string | ((row: TData) => string);
  icon?: React.ReactNode;
  onClick: (row: TData, ctx: { table: MRT_TableInstance<TData> }) => void;
  /**
   * `'quick'` menyematkan aksi sebagai ikon di luar menu. Sediakan hanya untuk
   * aksi yang benar-benar dipakai berulang seharian pada layar itu - tiap ikon
   * yang disematkan mengembalikan sebagian keramaian yang baru saja dihapus.
   * @default 'menu'
   */
  placement?: 'quick' | 'menu';
  /** Sembunyikan total untuk baris ini (mis. aksi yang tak berlaku). */
  hidden?: (row: TData) => boolean;
  /**
   * `true` menonaktifkan tanpa penjelasan; **string** menonaktifkan DAN
   * menjadi alasan yang terbaca di bawah labelnya.
   *
   * Ini menutup cacat nyata: pola lama
   * `<Tooltip><span><IconButton disabled>` menaruh nama aksesibel pada `span`
   * yang tak bisa difokus, dan tombol disabled keluar dari urutan tab - jadi
   * alasannya tak terjangkau keyboard, pembaca layar, maupun sentuhan.
   */
  disabled?: (row: TData) => boolean | string;
  /** Diberi warna error dan ditaruh di bawah pemisah. */
  destructive?: boolean;
  isLoading?: (row: TData) => boolean;
  /** Disembunyikan bila pengguna tak punya permission ini. */
  permission?: string | string[];
}

/**
 * Satu filter, dideklarasikan sebagai DATA.
 *
 * Sama alasannya dengan `SuperTableRowAction`: begitu filter jadi data,
 * SuperTable yang memiliki renderer-nya - jadi chip "filter aktif", tombol
 * hapus per-filter, "Clear all", serialisasi URL dan varian layar sempit
 * cukup ditulis SEKALI, bukan 44 kali. Sebelum ini ada tiga idiom filter yang
 * hidup berdampingan (subheader MRT, `TableFilterBar`, dan `<Select>` buatan
 * tangan di atas tabel), dan tak satu pun bisa memberi tahu "filter apa yang
 * sedang menyala" tanpa dibaca satu-satu.
 *
 * Nilainya mendarat di `state.columnFilters` dalam bentuk `{ id, value }` -
 * bentuk yang sudah dibaca 8 halaman - sehingga migrasi tidak memutus
 * kontrak API mana pun.
 */
export interface SuperTableFilterDef {
  /** Dikirim ke API (dan ditulis ke URL) dengan kunci ini. */
  id: string;
  /** Label yang dibaca manusia; dipakai di popover DAN di chip. */
  label: string;
  /**
   * `'select'`      → satu pilihan dari daftar
   * `'multiselect'` → banyak pilihan; nilainya array
   * `'text'`        → cocokkan teks bebas
   * `'date-range'`  → dua tanggal; nilainya `[from, to]`
   * `'boolean'`     → ya/tidak
   */
  type: 'select' | 'multiselect' | 'text' | 'date-range' | 'boolean';
  /** Wajib untuk `select` dan `multiselect`. */
  options?: { value: string; label: string }[];
  /** Teks untuk "tanpa filter" pada `select`. @default `Semua ${label}` */
  anyLabel?: string;
  /** Placeholder untuk `text`. */
  placeholder?: string;
  /**
   * Tampilkan langsung di toolbar sebagai kontrol tersendiri, bukan di dalam
   * popover. Hemat-hemat: satu, kalau memang dipakai sepanjang hari di layar
   * itu. Sisanya biarkan di dalam popover.
   */
  pinned?: boolean;
}

/** Nilai filter aktif, dipetakan dari `SuperTableFilterDef['id']`. */
export type SuperTableFilterValues = Record<string, unknown>;

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
   * Filter sebagai DATA - cara yang dianjurkan untuk memfilter tabel apa pun.
   *
   * SuperTable merendernya menjadi satu tombol **Filters** (dengan jumlah
   * filter aktif), popover berisi kontrolnya, dan satu chip per filter aktif
   * yang bisa dilepas sendiri-sendiri. Di layar sempit popover berubah jadi
   * drawer bawah dengan target sentuh 48px.
   *
   * Nilainya masuk ke `state.columnFilters` DAN `state.filters`. Untuk tabel
   * client-side ia langsung menggerakkan mesin filter MRT tanpa kode tambahan;
   * untuk tabel server, halaman meneruskan `state.filters` ke API-nya.
   *
   * Deklarasikan hanya filter yang benar-benar didukung server. Kotak filter
   * yang tidak tersambung ke apa pun adalah cacat yang paling mahal di tabel:
   * kelihatan berfungsi, dan diam-diam tidak.
   */
  filters?: SuperTableFilterDef[];

  /**
   * Kontrol filter yang dirender DI DALAM toolbar tabel, paling kiri, sebelum
   * tombol aksi `renderTopLeftToolbar`.
   *
   * Bedanya dengan `renderTopLeftToolbar`: slot ini TIDAK digantikan saat ada
   * baris tercentang. `BulkActionsBar` hanya mengambil alih tombol aksi di
   * sebelahnya, bukan filternya - jadi user yang mencentang checkbox tetap
   * melihat (dan bisa mengubah) filter yang sedang aktif. Itulah alasan slot
   * ini ada dan bukan sekadar memakai `renderTopLeftToolbar`.
   *
   * Hanya untuk filter yang dikirim halaman ke server. JANGAN dipakai bersama
   * `features.columnFilters: true` - user akan mendapat dua afordansi filter
   * sekaligus (kontrol ini + tombol corong bawaan MRT).
   *
   * PENTING: kembalikan `null` (bukan elemen yang kebetulan me-render null)
   * bila tidak ada filter untuk ditampilkan. MRT memasang spacer `<span/>`
   * hanya saat render prop ini MENGEMBALIKAN null; elemen yang me-render null
   * tetap truthy dan membuat cluster search/Export/View tertarik ke kiri.
   */
  renderFilters?: (table: MRT_TableInstance<TData>) => React.ReactNode;

  /**
   * Aksi baris sebagai DATA. SuperTable merendernya sebagai satu kebab di
   * desktop dan drawer bawah berlabel di layar sempit.
   *
   * Lebih disukai daripada `renderRowActions`, yang tetap didukung tanpa
   * tanggal kedaluwarsa sebagai jalan keluar untuk kasus yang benar-benar
   * tidak umum (mis. tabel bersarang di dalam modal).
   *
   * Boleh berupa fungsi bila daftar aksinya bergantung pada barisnya.
   */
  rowActions?:
    | SuperTableRowAction<TData>[]
    | ((row: TData) => SuperTableRowAction<TData>[]);

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
   *
   * Menerima konteks supaya keadaan "kosong karena filter" bisa menawarkan
   * satu-satunya aksi yang memperbaikinya. Tanpa ini tiap halaman harus
   * menyalin sendiri state filternya untuk tahu apakah tabelnya kosong karena
   * memang tak ada data, atau karena filter yang menyaring habis - dua hal
   * yang butuh kalimat dan tombol berbeda.
   */
  renderEmptyState?: (ctx: {
    /** Kosongkan semua filter deklaratif sekaligus. */
    clearFilters: () => void;
    /** Ada filter yang sedang menyala. */
    hasActiveFilters: boolean;
    /** Ada teks di kotak pencarian. */
    hasSearch: boolean;
  }) => React.ReactNode;
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
   * Menghasilkan ID unik & stabil per row untuk selection/expansion state.
   * WAJIB stabil antar halaman saat `manualPagination` aktif — tanpa ini
   * MRT memakai index baris, sehingga selection di page 1 "nempel" ke
   * baris page 2 saat pindah halaman.
   * @default (row, index) => String(row.id ?? index)
   */
  getRowId?: (row: TData, index: number) => string;
  /**
   * ID Unik agar browser bisa melacak table (URL Query keys / Storage keys).
   * Sangat Wajib dipasang apabila `urlSync` dan `savedFilters` di-On-kan.
   */
  tableId?: string;
  /**
   * Namespace untuk query key `urlSync`. Isi `''` (default yang dianjurkan
   * untuk halaman dengan satu tabel) supaya URL-nya jadi `?p=2&q=budi`, bukan
   * `?subscribers-table_p=2&subscribers-table_gf=budi`. Kalau tidak diisi,
   * `tableId` yang dipakai.
   */
  urlKey?: string;
  /**
   * Nama dasar file hasil export, dalam bahasa manusia ("Subscribers").
   * Default-nya diturunkan dari `tableId`, jadi `subscribers-table` menjadi
   * `Subscribers` - bukan `subscribers-table_20260826_1030.xlsx`.
   */
  exportFileName?: string;
  /**
   * `accessorKey` satu kolom yang dibungkus menjadi tautan `<a href>` asli
   * menuju rekamannya. Ini titik masuk yang benar secara aksesibilitas: satu
   * perhentian tab per baris, nama aksesibel = judul rekaman itu sendiri, plus
   * klik-tengah dan buka-di-tab-baru gratis.
   *
   * JANGAN diganti dengan `role="link"` pada `<tr>`: itu merusak pohon
   * rowgroup>row>cell, meruntuhkan seluruh teks baris jadi satu nama
   * aksesibel, dan menyarangkan checkbox seleksi di dalam sebuah tautan.
   *
   * `onRowClick` tetap boleh dipasang sebagai kemudahan untuk mouse di atasnya.
   */
  primaryColumn?: {
    /** Kolom mana yang jadi tautan. */
    accessorKey: string;
    /** Tujuan tautannya untuk baris ini. */
    href: (row: TData) => string;
  };
  /**
   * Placeholder kotak pencarian. Isi dengan APA yang bisa dicari, bukan kata
   * "Search" saja - "Cari nama, email, atau perusahaan" memberi tahu pengguna
   * kolom mana yang ikut dicari tanpa harus mencoba-coba.
   */
  searchPlaceholder?: string;
  /**
   * Kata benda jamak untuk baris tabel ini ("kontak", "tiket", "kampanye").
   * Dipakai footer ("Menampilkan 240 dari 12.431 kontak") dan status
   * pencarian. @default 'baris'
   */
  entityLabel?: string;
  /** 
   * Overwrite default start table state, ex: `{ sorting: [ {id: 'date', desc: true} ] }`. 
   */
  initialState?: Partial<SuperTableState>;
  /**
   * Change this whenever a filter the PAGE owns (outside the table) changes -
   * e.g. a status filter bar. SuperTable resets to page 1, the same way it
   * does for its own search box, so the paginator can't keep highlighting a
   * page the new result set no longer has.
   *
   * It ALSO clears the row selection. `rowSelection` is keyed by `getRowId`
   * and survives a refetch, so without this the bulk bar could keep reading
   * "3 selected" for rows the server no longer returns - a real hazard now
   * that `renderFilters` puts the filter control right next to that bar.
   */
  resetPageKey?: string | number;
  /**
   * Ubah nilainya untuk MENGOSONGKAN seleksi baris saja - tanpa memulangkan
   * tabel ke batch pertama.
   *
   * Bedanya dengan `resetPageKey`: itu untuk filter yang mengubah HASIL, jadi
   * memuat ulang dari atas memang benar. Ini untuk tombol "Batal pilih" yang
   * dimiliki halaman (bar bulk action di luar tabel): membatalkan centang tidak
   * boleh membuang baris yang sudah di-scroll dan memaksa memuat ulang.
   */
  clearSelectionKey?: string | number;
}
