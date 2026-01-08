# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup placeholder

---

## [0.1.0] - 2025-01-08

### Detail Versi 0.1.0

#### 🚀 Initial Setup & Configuration

- **Deskripsi:**
  - **Project Initialization:** Setup Next.js 15 project dengan TypeScript dan Tailwind CSS
  - **Material-UI Integration:** Konfigurasi MUI dengan theme customization untuk Supercontact branding
  - **Deployment Pipeline:** Setup 3-tier deployment di Vercel (Development, Staging, Production)
  - **Environment Configuration:** Konfigurasi environment variables untuk multi-environment setup
  - **Package Management:** Setup dependency management dengan `npm` dan `--legacy-peer-deps` flag untuk kompatibilitas MUI
  - **FastAPI Integration:** Setup koneksi ke FastAPI backend dengan base URL configuration

#### 🛠️ Technical Setup

- **Deskripsi:**
  - **ESLint & Prettier:** Konfigurasi code quality tools
  - **Git Workflow:** Setup branching strategy (dev, staging, main)
  - **README Documentation:** Dokumentasi lengkap untuk developer onboarding
  - **CHANGELOG Structure:** Setup semantic versioning dan changelog convention

---

## Template untuk Update Selanjutnya

Gunakan template berikut saat menambahkan perubahan baru:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Detail Versi X.Y.Z

#### 📦 Kategori Perubahan (pilih yang sesuai)

- **Deskripsi:**
  - **Fitur/Fix Name:** Penjelasan detail tentang perubahan
  - **Impact:** Dampak perubahan terhadap sistem atau user experience
  - **Technical Notes:** Catatan teknis jika diperlukan
```

### Kategori yang Tersedia:

- `✨ Fitur Baru` - Penambahan fitur baru
- `🐛 Bug Fix` - Perbaikan bug
- `🚀 Peningkatan Performa` - Optimasi performa aplikasi
- `🔒 Security Fix` - Perbaikan keamanan
- `📝 Documentation` - Update dokumentasi
- `♻️ Refactor` - Refactoring code tanpa mengubah fungsionalitas
- `🎨 UI/UX Enhancement` - Peningkatan tampilan atau user experience
- `🔧 Configuration` - Perubahan konfigurasi
- `🧪 Testing` - Penambahan atau update test
- `🗃️ Database` - Perubahan skema atau migrasi database

---

## Contoh Entry Changelog

### Contoh 1: Penambahan Fitur Baru (MINOR Version)

```markdown
## [1.2.0] - 2025-01-15

### Detail Versi 1.2.0

#### ✨ Fitur Bulk Import Kontak

- **Deskripsi:**
  - **CSV/Excel Upload:** Implementasi drag-and-drop file upload untuk import kontak massal
  - **Field Mapping:** Interface untuk mapping kolom file ke field kontak (Name, Email, Phone, Company)
  - **Validation:** Real-time validation untuk format email dan nomor telepon
  - **Preview & Confirm:** Preview data sebelum final import dengan opsi edit
  - **API Integration:** Integrasi dengan endpoint `/api/v1/contacts/bulk-import` dengan progress tracking

#### 🚀 Peningkatan Performa

- **Deskripsi:**
  - **Virtual Scrolling:** Implementasi react-window untuk handle 10,000+ kontak
  - **Debounced Search:** Optimasi search dengan debounce 300ms
  - **Bundle Size:** Reduce bundle size sebesar 20% dengan dynamic imports
```

### Contoh 2: Bug Fix (PATCH Version)

```markdown
## [1.1.1] - 2025-01-10

### Detail Versi 1.1.1

#### 🐛 Bug Fix Contact Form

- **Deskripsi:**
  - **Email Validation:** Perbaikan regex email validation untuk support subdomain
  - **Phone Number Format:** Fix issue format nomor telepon internasional
  - **Loading State:** Fix bug tombol submit tidak disabled saat request sedang berjalan
  - **Error Handling:** Menampilkan error message yang lebih deskriptif untuk duplicate contact

#### 🎨 UI/UX Enhancement

- **Deskripsi:**
  - **Responsive Table:** Perbaikan layout contact table di tablet (768px - 1024px)
  - **Accessibility:** Menambahkan proper ARIA labels dan keyboard navigation
  - **Toast Notifications:** Migrasi dari alert() ke MUI Snackbar untuk feedback message
```

### Contoh 3: Breaking Changes (MAJOR Version)

```markdown
## [2.0.0] - 2025-02-01

### Detail Versi 2.0.0

#### 🚨 Breaking Changes

- **Deskripsi:**
  - **API Endpoint Migration:**
    - **BREAKING:** Base URL berubah dari `/api/contacts` ke `/api/v2/contacts`
    - Struktur response berubah untuk consistency
    - Old: `{data: {...}, status: 200}`
    - New: `{success: true, data: {...}, meta: {total, page, limit}}`
  - **Contact Model Update:**
    - **BREAKING:** Field `phone` dipecah menjadi `phone_primary` dan `phone_secondary`
    - Field `company` sekarang wajib diisi (required)

#### ✨ Fitur Baru

- **Deskripsi:**
  - **Contact Groups:** Fitur untuk grouping kontak berdasarkan kategori/tag
  - **Advanced Search:** Filter berdasarkan company, location, tags, dan custom fields
  - **Export Feature:** Export kontak ke CSV/Excel dengan custom field selection

#### 📝 Migration Guide

Untuk upgrade dari v1.x.x ke v2.0.0:

1. Update environment variables:
   ```env
   # Update base URL
   NEXT_PUBLIC_API_URL=https://supercontact-api-dev-hpfi.onrender.com/api/v2
   ```

2. Update API client:
   ```typescript
   // Old
   const response = await fetch('/api/contacts')
   const { data, status } = await response.json()
   
   // New
   const response = await fetch('/api/v2/contacts')
   const { success, data, meta } = await response.json()
   ```

3. Update contact model in your code:
   ```typescript
   // Old
   interface Contact {
     phone: string;
     company?: string;
   }
   
   // New
   interface Contact {
     phone_primary: string;
     phone_secondary?: string;
     company: string; // now required
   }
   ```

4. Run migration script:
   ```bash
   npm run migrate:v2
   ```
```

---

## Versioning Guidelines

### Kapan Increment Version?

**MAJOR (X.0.0):**
- Breaking changes di API contract
- Migration yang membutuhkan action dari developer/user
- Perubahan arsitektur fundamental
- Removal of deprecated features
- Perubahan data model yang tidak backward-compatible

**MINOR (0.X.0):**
- Penambahan fitur baru (backward-compatible)
- Penambahan endpoint API baru
- Enhancement yang tidak break existing functionality
- Deprecation warning (belum removal)
- Penambahan optional fields di API

**PATCH (0.0.X):**
- Bug fixes
- Security patches
- Performance improvements tanpa API changes
- Documentation updates
- UI tweaks tanpa functional changes
- Hotfixes untuk production issues

---

## Changelog Maintenance

### Best Practices

1. **Update setiap merge ke `main`** - Jangan tunggu sampai banyak changes
2. **Be specific** - Jelaskan apa yang berubah, kenapa, dan impact-nya
3. **Group related changes** - Kategorikan dengan emoji dan heading yang jelas
4. **Include breaking changes** - Selalu highlight breaking changes dengan badge 🚨
5. **Add migration guides** - Untuk major version, sertakan step-by-step migration
6. **Reference issues** - Link ke GitHub issues/tickets jika ada (e.g., `Closes #123`)

### Bad Examples ❌

```markdown
## [1.2.0] - 2025-01-15
- Added import
- Fixed bugs
- Updated UI
```

### Good Examples ✅

```markdown
## [1.2.0] - 2025-01-15

### Detail Versi 1.2.0

#### ✨ Bulk Contact Import

- **Deskripsi:**
  - **CSV/Excel Support:** User dapat import kontak dari file CSV atau Excel
  - **Smart Mapping:** Auto-detect kolom dan mapping ke field yang sesuai
  - **Validation:** Pre-import validation untuk email, phone, dan required fields
  - **Impact:** Mengurangi waktu input manual hingga 90% untuk bulk contact entry
  - **Technical Notes:** Menggunakan PapaParse untuk CSV parsing dan SheetJS untuk Excel
```

---

## Version History Reference

| Version | Date | Type | Description |
|---------|------|------|-------------|
| 0.1.0 | 2025-01-08 | Initial | Project setup, deployment pipeline, FastAPI integration |

---

**Note:** Changelog ini akan terus diupdate seiring development. Pastikan setiap perubahan signifikan didokumentasikan dengan baik untuk tracking dan audit purposes.