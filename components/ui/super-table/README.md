# SuperTable

Komponen wrapper untuk `material-react-table` yang disesuaikan dengan Design System MUI aplikasi SuperContact. 
SuperTable dirancang agar pengembang fitur tidak perlu langsung mengutak-atik API kompleks MRT melainkan cukup menggunakan props standard (seperti `columns`, `data`, `isLoading`, dll).

## Cara Penggunaan (Client-Side Table)
Gunakan ini untuk tabel list sederhana di mana data sudah berada di sisi client sepenuhnya (misal Roles).

```tsx
import { useMemo } from 'react';
import { SuperTable, MRT_ColumnDef } from '@/components/ui/super-table';

// ...
const columns = useMemo<MRT_ColumnDef<DataType>[]>(() => [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" }
], []);

return (
  <SuperTable
    columns={columns}
    data={dataArray}
    isLoading={false}
    enableSorting={true}
    enableGlobalFilter={true}
  />
);
```

## Cara Penggunaan (Server-Side Pagination dengan Zustand)
Gunakan hook Zustand untuk controller state, dan tembak state-nya ke dalam SuperTable.

```tsx
import { useGetProductStore } from '@/lib/store/product';
import { SuperTable, MRT_ColumnDef } from '@/components/ui/super-table';

export default function ProductTable() {
    const { listProduct, pagination, setPage, setLimit, loading, searchQuery, setSearchQuery } = useGetProductStore();
    
    // ... define columns
    
    return (
        <SuperTable
            columns={columns}
            data={listProduct}
            isLoading={loading}
            
            // Server-side setting
            manualPagination={true}
            rowCount={pagination.total}
            pagination={{ pageIndex: pagination.page - 1, pageSize: pagination.limit }}
            onPaginationChange={(updater: any) => {
                const newState = typeof updater === 'function' 
                   ? updater({ pageIndex: pagination.page - 1, pageSize: pagination.limit }) 
                   : updater;
                setPage(newState.pageIndex + 1);
                setLimit(newState.pageSize);
            }}
            
            manualFiltering={true}
            globalFilter={searchQuery}
            onGlobalFilterChange={setSearchQuery}
            
            enableSorting={false} // Atur sesuai dukungan API server
        />
    )
}
```

## Daftar Props Penting
| Prop | Tipe | Deskripsi | Default |
|---|---|---|---|
| `columns` | `MRT_ColumnDef[]` | Definisi kolom | Wajib |
| `data` | `TData[]` | Array data | Wajib |
| `isLoading` | `boolean` | Menampilkan skeleton loading otomatis | `false` |
| `enableRowSelection` | `boolean` | Memunculkan checkbox tiap row | `false` |
| `enableGlobalFilter` | `boolean` | Memunculkan search bar | `true` |
| `renderTopToolbarCustomActions`| `function` | Injeksi elemen spesifik ke sebelah kiri bilah pencarian | - |
| `renderBulkActions` | `function` | Memunculkan action ketika ada baris yang dicentang | - |
