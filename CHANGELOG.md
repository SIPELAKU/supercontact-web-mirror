# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial project setup placeholder

---

## [1.3.5] - 2026-02-06

### Detail Versi 1.3.5

#### ✨ Fitur Baru

- **Contact Management:**
  - Add `AppDatePicker` and `AppAutocomplete` UI components.
  - Enhance contact table page with new UI components and improved styling.

---

## [1.3.4] - 2026-02-05

### Detail Versi 1.3.4

#### 🐛 Bug Fix

- **Department Management:**
  - Fixed issue with department management page not displaying data.
  - Added loading state and error handling for department data.

---

## [1.3.3] - 2026-02-03

### Detail Versi 1.3.3

#### ✨ Fitur Baru

- **Lead Management & Contacts:**
  - Introduce Lead Management component with table and Kanban views, and Contact Management page with data table and CRUD operations.
  - Implement contact listing and detail pages.
  - Implement initial lead management, quotation, pipeline, and product features with new UI components.

- **Email Marketing & Notes:**
  - Implement comprehensive email marketing functionality including mailing lists, subscribers, and campaigns, alongside new UI components and dedicated pages for notes and contact.
  - Implement notes page with listing, search, sort, add, and edit functionalities.

- **Product Management:**
  - Implement product creation and editing modal with auto-generated SKU and price formatting.

- **UI Components & UX:**
  - Introduce and integrate new `AppInput`, `AppTextarea`, `AppTimePicker`, `AppDatePicker`, and `AppButton` UI components across various forms and modals.
  - Display contact initials using Material-UI Avatar component instead of a plain div.
  - Improve login page responsiveness and replace contact list placeholder with MUI Avatar component.

- **Utilities & Notifications:**
  - Add notification utility with success, error, warning, and info types.
  - Enhance error and notification messages with React node support, improved multi-line formatting, and user-friendly field labels.

---

## [1.3.2] - 2026-02-02

### Detail Versi 1.3.2

#### 🚀 Lead Management Stability & Restructuring
- **Stability Fix**: Resolved "Maximum update depth exceeded" crash and "status.toLowerCase is not a function" error by lifting filter state and implementing memoized filtering.
- **Unified Card Layout**: Integrated Filters, View Mode toggles (Table/Kanban), and "Add Lead" button into a single, cohesive card structure.
- **Improved Performance**: Refactored `LeadFilters` into a pure controlled component to eliminate redundant re-renders.

#### 🎨 Support Ticket UI & UX Standardization
- **Refined Layout**: Migrated the Ticket Management page to a card-based structure with a unified search/action toolbar and MUI `TablePagination`.
- **High-Fidelity Modals**:
  - Enforced a strictly compliant **22px bold** title design for Add/Edit Ticket modals.
  - Eliminated default padding/margin on modal headers for precise design alignment.
  - Applied forceful white backgrounds (`isBgWhite={true}`) to all form inputs and selects.
  - Standardized label font weight to `bold` for better readability.
- **Data Mapping Fix**: Resolved the "Unassigned" agent bug by correctly mapping nested `assigned_agent` objects and displaying human-readable `ticket_code` (e.g., `TKT-005`).

#### 🎨 General UI Standardization
- **Header Color Sync**: Globally standardized table header backgrounds to `bg-[#EEF2FD]!` across all modules.
- **Table Refinement**: Applied the standard 24px padding and consistent border styling to the Contact Management table.

---

## [1.3.1] - 2026-02-02

### Changed
- Standardized table UI across the application (Leads, Quotations, Products, Email Marketing, and Contacts) with consistent 24px padding and margins.
- Improved table containers with standardized borders and rounded corners.
- Fixed Ticket Management background and assigned agent identification.
- Fixed Lead Table "stick to card" issue by adjusting spacing and borders.

---

### Detail Versi 1.3.1

#### 🎨 UI/UX Enhancement

- **Table Standardization:**
  - **Contact Module:** Refactored Contacts table to align with Sales/Product design standards (MUI Table, consistent header styling, white card container).
  - **Email Marketing:** Refactored `CampaignsTable`, `SubscribersTable`, and **Mailing List Detail tables** to match the standardized design.

- **Visual Improvements:**
  - **Ticket Management:** Updated page background color to white (`#ffffff`) for a cleaner look.

---

## [1.3.0] - 2026-01-30

### Detail Versi 1.3.0

#### ✨ Fitur Baru: Ticket Management Module

- **Deskripsi:**
  - **Ticket Management System:** Implementasi modul manajemen tiket lengkap di bawah menu Support > Tickets.
  - **Full CRUD Capabilities:**
    - **List View:** Tabel tiket dengan filter status, prioritas, dan agen, serta pencarian.
    - **Add Ticket:** Modal form untuk membuat tiket baru dengan validasi.
    - **Edit Ticket:** Kemampuan untuk mengedit detail tiket yang ada.
    - **Delete Ticket:** Fitur penghapusan tiket dengan konfirmasi modal.
  - **API Integration:** Integrasi penuh dengan endpoint `/tickets` (GET, POST, PUT, DELETE) menggunakan React Query untuk manajemen state yang efisien.
  - **Reusable Components:** Penggunaan komponen UI yang konsisten seperti `TicketStatusBadge`, `TicketPriorityBadge`, dan form reusable.

#### 📁 Files Created

- `app/support/tickets/page.tsx`
- `components/support/tickets/TicketTable.tsx`
- `components/support/tickets/TicketForm.tsx`
- `components/support/tickets/TicketBadges.tsx`
- `components/support/tickets/modals/AddTicketModal.tsx`
- `components/support/tickets/modals/EditTicketModal.tsx`
- `lib/api/tickets.ts`
- `lib/hooks/useTickets.ts`
- `lib/types/Ticket.ts`

## [1.2.7] - 2026-01-30

### Detail Versi 1.2.7

#### 🐛 Bug Fix

- **Quotation PDF Generation**
  - Fixed issues with PDF generation for quotations.
  - Implemented `html2canvas-pro` and `jspdf` for reliable client-side PDF creation.

## [1.2.6] - 2026-01-29

### Detail Versi 1.2.6

#### 🐛 Bug Fix

- **fix: add timeout to all API calls**
  - Replaced direct `fetch` calls with a new `fetchWithTimeout` utility across all API modules.
  - Added a default timeout of 30 seconds to prevent requests from hanging indefinitely.
  - Improved error handling for timeout scenarios.

#### 📁 Files Modified

- `lib/api/api-client.ts`
- `lib/api/auth.ts`
- `lib/api/contacts.ts`
- `lib/api/departments.ts`
- `lib/api/email-marketing/campaigns.ts`
- `lib/api/email-marketing/mailing-lists.ts`
- `lib/api/email-marketing/subscribers.ts`
- `lib/api/leads.ts`
- `lib/api/manage-users.ts`
- `lib/api/notes.ts`
- `lib/api/quotations.ts`
- `lib/api/users.ts`

---

## [1.2.5] - 2026-01-29

### Detail Versi 1.2.5

#### ✨ User & Organization Management Enhancements

- **User Management:**
  - Implemented managed user API, types, and React Query hooks; refactored components to utilize them.
  - Added support for pagination, search, and filtering by position and status.

- **Department Management:**
  - Implemented comprehensive department management with new API endpoints, dedicated components, and improved type definitions.

- **Role Management:**
  - Enhanced role management by centralizing permissions and updating the Add Role modal with permission selection.

#### 🐛 Bug Fix

- **fix: user management page**
  - Resolved stability issues and improved component rendering on the user management page.

---

## [1.2.4] - 2026-01-27

### Detail Versi 1.2.4

#### ✨ Lead Management Enhancements & Validation

- **Comprehensive Validation:**
  - Implemented mandatory field validation for all lead fields in both `AddLeadForm` and `LeadDetailModal`.
  - Fields validated: Name, Email, Phone, Company, Industry, Company Size, Office Location, Lead Status, Lead Source, Assigned To, and Tag.
  - Added real-time visual feedback with red highlighting and specific error messages.

- **Editable & Sync Details:**
  - Upgraded `LeadDetailModal` to allow editing of contact information (Name, Email, Phone, Company) which was previously restricted.
  - Standardized Lead Source options to "Manual Entry", "Web Form", and "WhatsApp" across all modals.
  - Normalized `company_size` values to a consistent format (e.g., "1-50 Employees") with automatic space removal in payloads.

- **Reliability & Performance:**
  - **API Safety:** Integrated standardized error handling in `lib/api/leads.ts` with try-catch blocks and a centralized response helper to prevent crashes and improve user feedback.
  - **Smooth UI:** Optimized the `useLeads` hook using `keepPreviousData` to ensure stable transitions during pagination in both Kanban and Table views.
  - **Payload Fix:** Corrected an issue where `phone_number` and `company` were missing from create/update payloads when selecting existing contacts.

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
