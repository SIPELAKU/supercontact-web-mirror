# Panduan Pembaruan Reusable Components - Supercontact Web

Dokumen ini berisi daftar komponen UI yang telah diperbarui/distandarisasi untuk meningkatkan konsistensi desain dan kemudahan pengembangan. Semua komponen ini berbasis **Material UI (MUI)** dengan kustomisasi gaya menggunakan **Tailwind CSS** atau **MUI Styled Components**.

---

## 🚀 Ringkasan Perubahan Utama

1.  **Standardisasi Desain**: Penggunaan token warna yang konsisten (`#5479EE` untuk Primary, `#FAFAF6` untuk Background Input).
2.  **MUI Integration**: Migrasi dari Radix UI/Native HTML ke MUI untuk aksesibilitas yang lebih baik.
3.  **Type Safety**: Definisi Props yang lebih ketat menggunakan TypeScript.

---

## 🛠 Daftar Komponen & Cara Penggunaan

### 1. `AppButton`

Komponen tombol utama dengan berbagai varian gaya.

**Fitur Baru:**

- Mendukung varian: `primary`, `outline`, `danger`, `text`.
- Integrasi icon otomatis (`startIcon`, `endIcon`).
- Loading state (via MUI props).

**Contoh Penggunaan:**

```tsx
import { AppButton } from "@/components/ui/app-button";
import { Plus } from "lucide-react";

// Tombol Primary
<AppButton onClick={() => {}}>Simpan Data</AppButton>

// Tombol Outline dengan Icon
<AppButton
  variantStyle="outline"
  startIcon={<Plus size={18} />}
>
  Tambah Item
</AppButton>

// Tombol Bahaya (Delete)
<AppButton variantStyle="danger">Hapus</AppButton>
```

---

### 2. `AppInput`

Input field standar dengan label dan dukungan untuk field password.

**Fitur Baru:**

- **Password Toggle**: Otomatis menampilkan icon mata untuk sembunyikan/tampilkan password jika `type="password"`.
- **isBgWhite**: Opsi untuk mengubah background menjadi putih bersih (default: soft ivory).

**Contoh Penggunaan:**

```tsx
import { AppInput } from "@/components/ui/app-input";

<AppInput
  label="Nama Lengkap"
  placeholder="Masukkan nama..."
  required
/>

<AppInput
  label="Kata Sandi"
  type="password"
/>
```

---

### 3. `AppSelect`

Komponen dropdown/select yang lebih rapi menggunakan MUI Select.

**Fitur Baru:**

- Render value kustom untuk placeholder yang lebih baik.
- Icon `ChevronDown` yang konsisten.

**Contoh Penggunaan:**

```tsx
import { AppSelect } from "@/components/ui/app-select";

const options = [
  { value: "admin", label: "Administrator" },
  { value: "user", label: "Standard User" },
];

<AppSelect
  label="Pilih Role"
  placeholder="Pilih satu..."
  options={options}
  value={selectedRole}
  onChange={(e) => setSelectedRole(e.target.value)}
/>;
```

---

### 4. `AppDatePicker`

Input tanggal yang mendukung mode single dan range.

**Fitur Baru:**

- **Mode Range**: Memungkinkan pemilihan rentang tanggal (Start - End) dalam satu kalender.
- **Clearable**: Tombol 'X' untuk menghapus tanggal yang dipilih.

**Contoh Penggunaan:**

```tsx
import { AppDatePicker } from "@/components/ui/app-datepicker";

// Single Date
<AppDatePicker
  label="Tanggal Lahir"
  value={birthDate}
  onChange={(date) => setBirthDate(date)}
/>

// Date Range
<AppDatePicker
  label="Periode Laporan"
  mode="range"
  value={[startDate, endDate]}
  onChange={([start, end]) => {
     setStartDate(start);
     setEndDate(end);
  }}
/>
```

---

### 5. `AppAlert`

Komponen feedback/notifikasi inline dengan desain vibrant.

**Fitur Baru:**

- 4 Varian: `success`, `failed`, `warning`, `info`.
- Desain modern dengan icon box dan bayangan.

**Contoh Penggunaan:**

```tsx
import { AppAlert } from "@/components/ui/app-alert";

<AppAlert
  variant="success"
  title="Berhasil!"
  description="Data telah disimpan ke server."
  onClose={() => setShowAlert(false)}
/>;
```

---

> [!TIP]
> Semua komponen di atas terletak di folder `components/ui/`. Sangat disarankan untuk menggunakan komponen ini daripada elemen HTML standar untuk menjaga konsistensi UI Supercontact.
