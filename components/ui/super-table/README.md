# SuperTable

Wrapper `material-react-table` untuk seluruh tabel SuperContact (~44 layar).
Tujuannya satu: pengembang fitur tidak menyentuh API MRT yang besar itu, cukup
mendeklarasikan **apa** yang tabelnya punya — kolom, filter, aksi baris — dan
SuperTable yang memutuskan **bagaimana** semuanya dirender, termasuk varian
layar sempitnya.

## Tiga hal yang membedakannya dari MRT polos

### 1. Paginasi malas (default)

Tidak ada nomor halaman. Baris menumpuk sambil di-scroll dan footer menjawab
tiga pertanyaan yang selalu muncul di daftar tanpa ujung:

```
Menampilkan 240 dari 12.431 kontak        [ Muat lebih banyak ]   Baris: 25 ▾
```

- **Auto-load** lewat sentinel `IntersectionObserver`, 300px sebelum baris
  terakhir tercapai, supaya terasa menyambung dan bukan tersendat per batch.
- **Tombol** selalu ada. Scroll bukan afordansi bagi pengguna keyboard maupun
  pembaca layar; tombol itulah cara mereka sampai ke baris 241.
- **Rem `autoLoadLimit`** (default 10 batch): setelah itu auto-load berhenti dan
  hanya tombol yang menambah baris. Tanpa rem, scroll yang cukup panjang menaruh
  12.000 `<tr>` di DOM.

Untuk daftar yang memang panjang, nyalakan `features.virtualize` — tapi baca
peringatannya di bawah.

```tsx
<SuperTable
  data={rows}
  columns={columns}
  rowCount={total}                 // WAJIB untuk "dari 12.431"
  manualPagination
  entityLabel="kontak"
  onStateChange={(s) => fetch(s.pagination.pageIndex + 1, s.pagination.pageSize)}
/>
```

**Satu aturan yang tak boleh dilanggar:** ukuran batch halaman harus sama dengan
milik tabel. SuperTable menyiarkan state-nya sekali saat mount (`limit` termasuk)
supaya halaman ikut, jadi biasanya ini beres sendiri — tapi kalau halaman
memaksakan `limit` sendiri yang berbeda, "muat lebih banyak" akan melompati
baris tanpa jejak apa pun di layar.

Butuh nomor halaman (tabel setelan kecil, atau layar yang perlu deep-link
`?p=3`)? `features={{ pagination: 'pages' }}`.

### 2. Filter deklaratif

```tsx
filters={[
  { id: "status",   label: "Status", type: "select",
    options: [{ value: "Open", label: "Open" }] },
  { id: "assignee", label: "Agen",   type: "select", options: agentOptions },
]}
```

Dirender jadi satu tombol **Filters** dengan jumlah aktif, popover berisi
kontrolnya (drawer bawah 48px di bawah 720px), dan **satu chip per filter aktif**
yang bisa dilepas sendiri-sendiri. Chip-nya tetap terlihat di semua lebar: tombol
hanya bilang ada filter menyala, chip yang bilang filter yang mana.

Nilainya mendarat di `state.columnFilters` **dan** `state.filters`. Yang pertama
adalah bentuk lama, jadi halaman yang sudah menulis
`state.columnFilters.find(f => f.id === 'status')` tidak perlu diubah sama sekali.
Untuk tabel client-side, nilai itu langsung menggerakkan mesin filter MRT.

> Deklarasikan **hanya** filter yang didukung server. Sebelum ini tiga tabel
> (Contacts, WA Recipients, Broadcast Templates) merender kotak filter dengan
> `manualFiltering` menyala sementara halamannya tak pernah meneruskan
> `columnFilters` — mengetik di sana tidak melakukan apa pun. Kotak yang diam-diam
> tak berfungsi lebih buruk daripada tidak ada kotak sama sekali.

### 3. Aksi baris deklaratif

`rowActions` (array atau fungsi row) → satu kebab di desktop, drawer bawah
berlabel 48px di layar sempit. `disabled` boleh mengembalikan **string**, dan
string itu jadi alasan yang terbaca — menutup pola lama
`<Tooltip><span><IconButton disabled>` yang menaruh alasannya di luar jangkauan
keyboard, pembaca layar, dan sentuhan.

## Pencarian & pengurutan

Keduanya kontrol permanen di toolbar kanan, bukan ikon yang menyingkap sesuatu.

- **Search** — fokus dengan `/` dari mana saja, `Esc` mengosongkan. Isi
  `searchPlaceholder` dengan APA yang dicari ("Cari nama, email, atau
  perusahaan"), bukan kata "Search" saja.
- **Sort** — tombol berlabel yang menyebut urutan yang sedang aktif
  ("Nama ↑") dan membuka daftar kolom. Klik header tetap jalan; ini untuk
  saat header sudah ter-scroll keluar layar atau di ponsel, ketika header ada
  di luar layar sebelah kanan. Sort tunggal saja — tiap endpoint di app ini
  cuma menerima satu pasang `sort_by`/`sort_order`.

## Props penting

| Prop | Tipe | Deskripsi | Default |
|---|---|---|---|
| `columns` | `MRT_ColumnDef[]` | Definisi kolom | Wajib |
| `data` | `TData[]` | Satu batch data (SuperTable yang menumpuknya) | Wajib |
| `rowCount` | `number` | Total baris yang cocok di server | untuk lazy |
| `filters` | `SuperTableFilterDef[]` | Filter sebagai data → tombol + chip | - |
| `rowActions` | `SuperTableRowAction[]` \| `(row) => …` | Aksi baris sebagai data | - |
| `primaryColumn` | `{ accessorKey, href }` | Satu kolom jadi `<a href>` asli | - |
| `entityLabel` | `string` | Kata benda jamak untuk footer & empty state | `'baris'` |
| `searchPlaceholder` | `string` | Sebutkan kolom yang ikut dicari | - |
| `renderEmptyState` | `(ctx) => node` | `ctx` membawa `clearFilters`, `hasActiveFilters`, `hasSearch` | - |
| `renderTopLeftToolbar` | `function` | Tombol Add/Import. Diganti BulkActionsBar saat ada seleksi — jangan taruh filter di sini | - |
| `renderBulkActions` | `function` | Aksi saat ada baris tercentang | - |
| `features.pagination` | `'lazy'` \| `'pages'` \| `false` | `true`/kosong = `'lazy'` | `'lazy'` |
| `features.autoLoadLimit` | `number` | Batch sebelum auto-load berhenti | `10` |
| `features.virtualize` | `boolean` | ⚠️ lihat di bawah | `false` |

### ⚠️ `features.virtualize`

Dibaca **sekali saat mount** (MRT menyimpannya di `useMemo(…, [])`), jadi tidak
bisa dinyalakan belakangan berdasar jumlah baris. Menyalakannya memaksa
`layoutMode: 'grid'`: lebar kolom mengikuti `size` di column def, bukan lagi
lebar alami tabel. Beri `size` pada kolomnya dulu, baru nyalakan.

## Yang TIDAK didukung, dan kenapa

- **Inline cell editing.** `lib/ReactQueryProvider.tsx` kini punya
  `staleTime: 30s` + `refetchOnWindowFocus: false`, jadi halangan lama sudah
  hilang — tapi di MRT v3 editor sel hanya bisa dibuka lewat double-click atau
  menu klik-kanan yang tidak diaktifkan: tidak ada jalur keyboard sama sekali.
- **Multi-sort.** Server hanya menerima satu `sort_by`.
- **Dua UI filter sekaligus.** `filters` mematikan subheader MRT dan memperingatkan
  di dev kalau `features.columnFilters` masih ikut diset.
