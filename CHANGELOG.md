# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial project setup placeholder

---

## [1.2.3] - 2026-01-27

### Detail Versi 1.2.3

#### 🐛 Bug Fix

- **fix: pipeline + notes double added + leads**
  - **Pipeline:** Fixed TypeScript argument mismatch and ensured stage updates are correctly persisted to the API during drag-and-drop operations.
  - **Notes:** Added submission locking (`isSubmittingRef`) to prevent duplicate note creation when clicking the submit button multiple times.
  - **Leads:** 
    - Implemented server-side pagination for the Leads table.
    - Fixed Kanban status update error when dropping a card onto another card by correctly resolving the target status name.

---

## [1.2.2] - 2026-01-27

### Detail Versi 1.2.2

#### ✨ Fitur Baru: Import Contact Modal Enhancements

- **Deskripsi:**
  - **UI/UX Improvement:**
    - Mengubah tampilan tombol Cancel dan Import Data menjadi komponen `AppButton` dengan gaya yang konsisten.
    - Mengubah warna tombol Cancel menjadi biru dan tombol Import Data menjadi biru dengan efek hover.
    - Mengubah tampilan tombol Cancel menjadi "Cancel" dan tombol Import Data menjadi "Import Data".
    - Mengubah tampilan tombol Cancel menjadi "Cancel" dan tombol Import Data menjadi "Import Data".

## [1.2.1] - 2026-01-27

### Detail Versi 1.2.1

#### ✨ Fitur Baru: AppInput Component Enhancements

- **Deskripsi:**
  - **Checkbox Support:** Ditambahkan dukungan `type="checkbox"` yang secara otomatis merender komponen MUI Checkbox dengan gaya yang konsisten.
  - **Icon Support:** Ditambahkan props opsional `startIcon` dan `endIcon` untuk kustomisasi elemen visual di dalam input field.
  - **Register Page Integration:** Diintegrasikan penggunaan checkbox pada halaman registrasi untuk persetujuan Syarat & Ketentuan.
  - **Updated Documentation:** Memperbarui `REUSABLE_COMPONENTS_GUIDE.md` dengan instruksi penggunaan fitur baru ini.

---

## [1.2.0] - 2026-01-27

### Detail Versi 1.2.0

#### ♻️ Refactor: Reusable Components Standardization

- **Deskripsi:**
  - **Core Components Update:** Standardized and upgraded core UI components (`AppButton`, `AppInput`, `AppSelect`, `AppDatePicker`, `AppAlert`) using Material UI (MUI) for better accessibility and design consistency.
  - **ConfirmModal System:** Implemented a new context-based confirmation system (`useConfirmation`) for streamlined approval/deletion flows.
  - **Enhanced Input Features:** Added password visibility toggles and customizable background colors to `AppInput`.
  - **Date Range Support:** Extended `AppDatePicker` to support full date range selection modes.
  - **Design Token Integration:** Applied consistent primary color (#5479EE) and refined typography across all updated components.
  - **Documentation:** Created `REUSABLE_COMPONENTS_GUIDE.md` for clear implementation guidance.

#### 📁 Files Created

- `REUSABLE_COMPONENTS_GUIDE.md`

---

## [1.1.2] - 2026-01-26

### Detail Versi 1.1.1

#### ♻️ Refactor

- **Deskripsi:**
  - **Company Intelligence Migration:** Moved Company Intelligence page from "Omnichannel" to "Data Intelligence" section in the Sidebar to better organize the application structure.
  - **Navigation Update:** Updated `Sidebar.tsx` to reflect the new route `/data-intelligence/company-intelligence` and removed the old link from Omnichannel.
  - **Breadcrumbs:** Updated breadcrumbs in Company Intelligence pages to show "Data Intelligence" instead of "Omnichannel".

## [1.1.1] - 2026-01-23

### Detail Versi 1.1.1

#### 🐛 Bug Fix

- **Fixing DND for Updated Components same as Pipeline**

  -DND Bug

  -Fix Structure type for Users in Leads

## [1.1.0] - 2026-01-26

### Detail Versi 1.1.0

#### ♻️ Refactor & Code Cleanup

- **Deskripsi:**
  - **Codebase Conflict Resolution:** Resolved git conflicts and standardized authentication implementation across contact-related modals (`AddContact`, `EditContact`, `DeleteContact`, `AddNote`).
  - **MUI Date Adapter Optimization:** Optimized `MuiLocalizationProvider` to use `AdapterDateFnsV3` and downgraded `@mui/x-date-pickers` to v7.23.0 to resolve version mismatch with simple `@mui/material` v5 installation, preventing "Module not found" errors.

  - **Type Safety Enhancements:** Improved type definitions in `useContacts` hook to ensure secure and type-safe token retrieval.

#### 🐛 Bug Fix

- **Deskripsi:**
  - **MUI Date Picker Adapter Error:** Fixed `ENOENT: no such file or directory` error by correcting the import path for `AdapterDateFns` and ensuring `date-fns` v3 compatibility.

  - **Import not found errors**: Fixed "Module not found" errors for `@mui/material/version` by aligning `@mui/x-date-pickers` version with the project's `@mui/material` version.

#### ✨ Fitur Baru

- **Deskripsi:**
  - **Bulk Import Data Contacts:**
    - **Import Interface:** A new streamlined modal (`ImportContactModal`) for bulk importing contacts.
    - **File Support:** Support for `.xlsx` (Excel) and `.csv` files.
    - **Smart Integration:** Drag-and-drop support, template download, and automatic data parsing.
    - **Seamless API:** Direct integration with `/api/proxy/contacts/bulk` for secure data submission.

## [1.0.0] - 2026-01-23

### Detail Versi 1.0.0

#### ♻️ Refactor & Code Cleanup

- **Deskripsi:**
  - **Remove ui-mui folder into one ui folder**

  - **Update Context to hit Proxy instead of direct BE**
  - **Type Definitions Consolidation:** Merged duplicate `lib/type/` folder into `lib/types/` for better organization. Moved 7 type files (Company.ts, Departments.ts, Pipeline.ts, Products.ts, Quotation.ts, Role.ts, Users.ts) and updated 18 import statements across the codebase from `@/lib/type/` to `@/lib/types/`.
  - **Route Structure Cleanup:** Removed redundant `app/(dashboard)/` route group folder including duplicate layout.tsx and unused pages (email-marketing duplicate, contact, mailing-list, mytask, notes, notification). Moved 3 active pages to proper locations:
    - `app/(dashboard)/profile/page.tsx` → `app/profile/page.tsx`
    - `app/(dashboard)/inbox/page.tsx` → `app/inbox/page.tsx`
    - `app/(dashboard)/profile-user-setting/page.tsx` → `app/profile-user-setting/page.tsx`
  - **Dependencies Cleanup:** Removed 8 unused npm packages from package.json:
    - `@formkit/drag-and-drop`
    - `@radix-ui/react-popover`
    - `@radix-ui/react-select`
    - `@radix-ui/react-tabs`
    - `@tanstack/react-table`
    - `react-day-picker`
    - `react-redux`
    - `@reduxjs/toolkit`
  - **Impact:** Cleaner codebase structure, reduced bundle size, eliminated confusion from duplicate folders and unused dependencies.

#### 🎨 UI/UX Enhancement

- **Email Marketing Button Standardization:**
  - **Consistent Styling:** Updated all email marketing table buttons to use custom blue color (`#5D87FF`) matching lead-management style with hover effect (`#4570ea`).
  - **Button Updates:**
    - CampaignsTable.tsx - "Create Campaign" button
    - MailingListsTable.tsx - "Create New List" button
    - SubscribersTable.tsx - "Add Subscriber" button
    - Mailing List Detail page - "Tambah Subscriber" button
  - **Impact:** Consistent visual design across all email marketing modules, improved user experience with unified button styling.

#### 📁 Files Modified

```
lib/types/ (consolidated from lib/type/)
├── Company.ts
├── Departments.ts
├── Pipeline.ts
├── Products.ts
├── Quotation.ts
├── Role.ts
└── Users.ts

app/
├── profile/page.tsx (moved from (dashboard))
├── inbox/page.tsx (moved from (dashboard))
├── profile-user-setting/page.tsx (moved from (dashboard))
└── email-marketing/mailing-lists/[id]/page.tsx (updated)

components/email-marketing/
├── campaigns/CampaignsTable.tsx (updated)
├── mailing-lists/MailingListsTable.tsx (updated)
└── subscribers/SubscribersTable.tsx (updated)

package.json (cleaned up)
```

#### 🗑️ Files Removed

```
app/(dashboard)/ (entire folder removed)
lib/type/ (merged into lib/types/)
```

#### 🐛 Bug Fix

- **Deskripsi:**
  - **Contact:** Update contact data fetching to use an authenticated external API endpoint.

#### ✨ Fitur Baru

# Email Marketing Section - Mail Marketing, All Subscribers, and Campaigns

# Email Marketing Module

### 1. Subscribers Module

- ✅ Subscribers table with search and pagination
- ✅ Add subscriber (manual or import from contacts)
- ✅ Edit subscriber
- ✅ Delete single or multiple subscribers
- ✅ All using mock data

**Test at:** `/email-marketing/subscribers`

### 2. Campaigns Module

- ✅ Campaigns table with search and pagination
- ✅ Status badges (Draft, Sending, Sent, etc.)
- ✅ Add campaign modal
- ✅ View statistics (placeholder)
- ✅ Edit campaign (placeholder)
- ✅ Delete campaign
- ✅ All using mock data

**Test at:** `/email-marketing/campaigns`

### 3. Mailing Lists Module

- ✅ Mailing lists display with contact counts
- ✅ Add mailing list
- ✅ Edit mailing list (placeholder)
- ✅ Delete mailing list
- ✅ Click to view details (link ready)
- ✅ All using mock data

**Test at:** `/email-marketing/mailing-lists`

## 📁 Files Created

### Components

```
components/email-marketing/
├── subscribers/
│   ├── SubscribersTable.tsx
│   └── modals/
│       ├── AddSubscriberModal.tsx
│       └── EditSubscriberModal.tsx
├── campaigns/
│   ├── CampaignsTable.tsx
│   └── modals/
│       └── AddCampaignModal.tsx
└── mailing-lists/
    ├── MailingListsTable.tsx
    └── modals/
        └── AddMailingListModal.tsx
```

### Pages

```
app/email-marketing/
├── subscribers/page.tsx
├── campaigns/page.tsx
└── mailing-lists/page.tsx
```

### Supporting Files

```
lib/
├── types/email-marketing.ts
└── data/email-marketing-mock.ts

components/forms/
└── RichTextEditor.tsx

app/layout.tsx (updated with Toaster)
```

## 🧪 Testing

All three modules are ready to test with mock data:

1. **Subscribers**: Full CRUD operations working
2. **Campaigns**: Create, view, delete working (edit/view stats are placeholders)
3. **Mailing Lists**: Create, delete working (edit is placeholder, detail page not yet created)

## 🔄 Switching to Real API

When your backend is ready, search for comments in the code:

```typescript
// TODO: Replace with real API call when backend is ready
// MOCK DATA - Remove this when backend is ready
```

Then uncomment the real API calls and remove the mock data imports.

## 📝 What's Not Included (Can Add Later)

1. **Campaign Edit Modal** - Currently shows "coming soon" toast
2. **Campaign View Statistics Modal** - Currently shows "coming soon" toast
3. **Mailing List Edit Modal** - Currently shows "coming soon" toast
4. **Mailing List Detail Page** - Link is ready at `/email-marketing/mailing-lists/[id]`
5. **Visual Email Editor** - Using simple HTML textarea instead
6. **AI Email Generation** - Not implemented
7. **Email Templates** - Not implemented

## 🎨 Features Included

- ✅ Clean, consistent UI using MUI components
- ✅ Toast notifications for all actions
- ✅ Loading states
- ✅ Error handling
- ✅ Search functionality
- ✅ Pagination
- ✅ Confirmation dialogs for deletions
- ✅ Status badges for campaigns
- ✅ Responsive design
- ✅ Mock data for testing

## 🚀 Next Steps

1. **Test all three modules** to ensure they work as expected
2. **Report any issues or desired changes**
3. **When backend is ready**, we can easily switch from mock to real API
4. **Optional**: Add the missing features listed above

## 💡 Notes

- All components stil use standard MUI Table (no DataGrid dependency issues)
- All icons use Lucide React (already in your project)
- Toast notifications work globally
- Mock data simulates realistic API delays
- Code is clean and well-commented for easy maintenance

## [0.5.1] - 2026-01-14

### Detail Versi 0.5.1

#### ♻️ Refactor Add Contact Modal

- **Deskripsi:**
  - **Modal Architecture:** Refactor Add Contact modal dari SweetAlert2-based container menjadi standalone React modal (overlay).
  - **Separation of Concerns:** Memisahkan lifecycle modal React dari SweetAlert2 untuk menghindari konflik state dan unmount tidak terduga.
  - **Validation Handling:** Validasi form dipindahkan sepenuhnya ke React state agar error tidak memicu penutupan modal.
  - **Technical Notes:** SweetAlert2 kini digunakan hanya untuk feedback (success dan global error), bukan sebagai container UI.
  - **Impact:** Arsitektur UI lebih stabil, predictable, dan mudah di-maintain.

#### 🐛 Bug Fix Contact Form Modal

- **Deskripsi:**
  - **Unexpected Modal Close:** Fix issue di mana Add Contact modal tertutup saat terjadi error validasi atau API error.
  - **Reopen Failure:** Fix bug modal tidak bisa dibuka kembali setelah error tanpa reload halaman.
  - **User Experience:** Modal tetap terbuka saat validasi gagal sehingga user dapat langsung memperbaiki input.
  - **Impact:** Menghilangkan kebutuhan reload halaman dan mencegah kehilangan input user.

### [0.5.0] - 2026-01-14

#### ✨ Fitur Baru

- **Deskripsi:**
  - **Inbox:** Slicing inbox page.

---

## [0.4.1] - 2026-01-14

### Detail Versi 0.4.1

#### 🚀 Peningkatan Performa

- **Sidebar:** Hapus console.log.

## [0.4.0] - 2026-01-14

### Detail Versi 0.4.0

#### ✨ Fitur Baru

- **Deskripsi:**
  - **Data Intelligence:** Tambah item sidebar baru yaitu Data Intelligence dengan child menu yaitu Company, Industry Leader, dan Individual.
  - **Data Intelligence Icon:** Tambah icon untuk Data Intelligence.
  - **Technical Notes:**
    - Belum ada desain halaman Data Intelligence dari Tim UI/UX.

## [0.3.0] - 2026-01-14

### Detail Versi 0.3.0

#### ✨ Fitur Baru

- **Deskripsi:**
  - **Security Page:** Slicing security tab di halaman profile setting.

## [0.2.1] - 2026-01-13

### Detail Versi 0.2.1

#### 🎨 UI/UX Enhancement

- **Account Settings:**
  - **Profile Settings:** Penyesuaian layout dan desain halaman pengaturan akun untuk konsistensi dengan desain baru.

## [0.2.0] - 2026-01-13

### Detail Versi 0.2.0

#### 🎨 UI/UX Enhancement

- **Profile Page Revamp:**
  - **New Dashboard UI:** Implementasi halaman profile baru dengan desain dashboard modern, cover image, dan ringkasan informasi user.
  - **Responsive Design:** Penyesuaian layout untuk tampilan mobile dan desktop yang konsisten.

#### ♻️ Refactor

- **Settings Migration:**
  - **Account Settings Move:** Memindahkan form pengaturan akun dari halaman utama profile ke sub-halaman `/profile/settings`.
  - **Navigation Update:** Menambahkan tombol "Settings" di halaman profile untuk akses cepat ke konfigurasi akun.

---

## [0.1.1] - 2025-01-09

### Detail Versi 0.1.1

#### ✨ Fitur Baru

- **Deskripsi:**
  - **Forgot Password Flow:** Implementasi _end-to-end_ fitur lupa kata sandi mulai dari request email, input OTP, hingga set password baru.
  - **UI/UX Implementation:**
    - Halaman input email dengan validasi client-side.
    - Halaman verifikasi OTP dengan _countdown timer_ dan fitur resend.
    - Halaman reset password baru dengan validasi match password.
  - **Security:** Handling expired token dan generic success message untuk mencegah _email enumeration_.
  - **Technical Notes:**
    - Integrasi endpoint `POST /api/v1/auth/otp/resend` (Request OTP)
    - Integrasi endpoint `POST /api/v1/auth/otp/verify` (Verify OTP)
    - Integrasi endpoint `POST /api/v1/auth/otp/reset-password` (New Password)
    - Redirect otomatis ke `/login` setelah sukses reset.
  - **Impact:** User dapat memulihkan akses akun secara mandiri tanpa bantuan admin, melengkapi _core auth flow_.
