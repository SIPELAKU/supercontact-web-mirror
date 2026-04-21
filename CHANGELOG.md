# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.18.2] - 2026-04-21

### Fix
- **Smart Capture (Lead Magnets) Module Expansion**:
    - **Row Click Navigation**: Fixed the issue where clicking on a row in the Lead Magnets table was not navigating to the detail or edit page.
    - **Edit Button**: Removed the edit button from the Lead Magnets table as it was not needed.
    - **Wiring Conversions Column**: Wiring conversions column to the Lead Magnets table to display the number of conversions.

## [1.18.1] - 2026-04-20

### ✨ Added
- **Smart Capture (Lead Magnets) Module Expansion**:
    - **Mail Sender Selection**: Added mail sender selection to the Smart Capture creation form.
    - **Mail Sender Management**: Added mail sender management to the Smart Capture detail page.

### 🛠️ Refactor & Enhancements
- **Modular Component Architecture**: Refactored all Smart Capture creation tabs to be data-aware and reusable, enabling a shared codebase between Lead Magnet creation and editing workflows.
- **Cross-Component Navigation**: Integrated specialized row actions and preview triggers that bridge the gap between admin management and public-facing assets.
- **Visual Polish**: Applied premium SaaS aesthetics to the public magnet page, including micro-animations, glassmorphism effects, and secure data handling indicators.

### 📁 Created Files
- `components/smart-capture/detail/SmartCaptureDetailClient.tsx`
- `components/smart-capture/edit/EditSmartCaptureClient.tsx`
- `components/smart-capture/public/PublicMagnetClient.tsx`
- `components/smart-capture/detail/sections/DetailHeader.tsx`
- `components/smart-capture/detail/sections/PerformanceStats.tsx`
- `components/smart-capture/detail/sections/ConfigurationInfo.tsx`
- `components/smart-capture/detail/sections/CapturedLeadsTable.tsx`

### 📁 Modified Files
- `components/layout/AuthenticatedLayout.tsx`
- `components/smart-capture/LeadMagnetsTable.tsx`
- `components/smart-capture/create/RewardSetupTab.tsx`
- `components/smart-capture/create/DynamicFormTab.tsx`
- `components/smart-capture/create/OutreachHookTab.tsx`
- `components/smart-capture/create/EmbedShareTab.tsx`

## [1.18.0] - 2026-04-20

### ✨ Added
- **Smart Capture (Lead Magnets) Module Expansion**:
    - **Performance Dashboard**: Integrated a comprehensive detail page with real-time performance analytics including total views, validated leads count, and conversion rate tracking.
    - **Public Landing Page**: Deployed a high-conversion, mobile-optimized public landing page at `/m/[id]` featuring dynamic forms and instant reward delivery success states.
    - **Edit Wizard**: Implemented a full multi-tab editing experience (`Reward`, `Form`, `Hook`, `Share`) allowing users to modify existing lead magnets seamlessly.
    - **Capture Leads Analytics**: Added a dedicated "Captured Leads" table within the detail view utilizing the standardized `SuperTable` for easy data management.
    - **Public Access Logic**: Configured the application shell to allow bypass of authentication for magnet landing pages, ensuring prospects can access forms immediately.

### 🛠️ Refactor & Enhancements
- **Modular Component Architecture**: Refactored all Smart Capture creation tabs to be data-aware and reusable, enabling a shared codebase between Lead Magnet creation and editing workflows.
- **Cross-Component Navigation**: Integrated specialized row actions and preview triggers that bridge the gap between admin management and public-facing assets.
- **Visual Polish**: Applied premium SaaS aesthetics to the public magnet page, including micro-animations, glassmorphism effects, and secure data handling indicators.

### 📁 Created Files
- `app/smart-capture/detail/[id]/page.tsx`
- `app/smart-capture/edit/[id]/page.tsx`
- `app/m/[id]/page.tsx`
- `components/smart-capture/detail/SmartCaptureDetailClient.tsx`
- `components/smart-capture/edit/EditSmartCaptureClient.tsx`
- `components/smart-capture/public/PublicMagnetClient.tsx`
- `components/smart-capture/detail/sections/DetailHeader.tsx`
- `components/smart-capture/detail/sections/PerformanceStats.tsx`
- `components/smart-capture/detail/sections/ConfigurationInfo.tsx`
- `components/smart-capture/detail/sections/CapturedLeadsTable.tsx`

### 📁 Modified Files
- `components/layout/AuthenticatedLayout.tsx`
- `components/smart-capture/LeadMagnetsTable.tsx`
- `components/smart-capture/create/RewardSetupTab.tsx`
- `components/smart-capture/create/DynamicFormTab.tsx`
- `components/smart-capture/create/OutreachHookTab.tsx`
- `components/smart-capture/create/EmbedShareTab.tsx`

## [1.17.0] - 2026-04-15

### ✨ Added
- **Smart Capture (Lead Magnets) Module Expansion**:
    - **Performance Dashboard**: Integrated a comprehensive detail page with real-time performance analytics including total views, validated leads count, and conversion rate tracking.
    - **Public Landing Page**: Deployed a high-conversion, mobile-optimized public landing page at `/m/[id]` featuring dynamic forms and instant reward delivery success states.
    - **Edit Wizard**: Implemented a full multi-tab editing experience (`Reward`, `Form`, `Hook`, `Share`) allowing users to modify existing lead magnets seamlessly.
    - **Capture Leads Analytics**: Added a dedicated "Captured Leads" table within the detail view utilizing the standardized `SuperTable` for easy data management.
    - **Public Access Logic**: Configured the application shell to allow bypass of authentication for magnet landing pages, ensuring prospects can access forms immediately.

### 🛠️ Refactor & Enhancements
- **Modular Component Architecture**: Refactored all Smart Capture creation tabs to be data-aware and reusable, enabling a shared codebase between Lead Magnet creation and editing workflows.
- **Cross-Component Navigation**: Integrated specialized row actions and preview triggers that bridge the gap between admin management and public-facing assets.
- **Visual Polish**: Applied premium SaaS aesthetics to the public magnet page, including micro-animations, glassmorphism effects, and secure data handling indicators.

### 📁 Created Files
- `app/smart-capture/detail/[id]/page.tsx`
- `app/smart-capture/edit/[id]/page.tsx`
- `app/m/[id]/page.tsx`
- `components/smart-capture/detail/SmartCaptureDetailClient.tsx`
- `components/smart-capture/edit/EditSmartCaptureClient.tsx`
- `components/smart-capture/public/PublicMagnetClient.tsx`
- `components/smart-capture/detail/sections/DetailHeader.tsx`
- `components/smart-capture/detail/sections/PerformanceStats.tsx`
- `components/smart-capture/detail/sections/ConfigurationInfo.tsx`
- `components/smart-capture/detail/sections/CapturedLeadsTable.tsx`

### 📁 Modified Files
- `components/layout/AuthenticatedLayout.tsx`
- `components/smart-capture/LeadMagnetsTable.tsx`
- `components/smart-capture/create/RewardSetupTab.tsx`
- `components/smart-capture/create/DynamicFormTab.tsx`
- `components/smart-capture/create/OutreachHookTab.tsx`
- `components/smart-capture/create/EmbedShareTab.tsx`

## [1.16.0] - 2026-04-10

### ✨ Added
- **"Save As" Bulk Operation**: Implemented a powerful cross-entity migration feature that allows users to bulk-save Contacts, Subscribers, or Recipients as alternative target types.
- **Cross-Entity Targets**: Simplified data management by allowing entities to coexist as multiple types (Contact, Subscriber, and Recipient) without record duplication.
- **Reusable SaveAsModal**: Developed a modular modal component that dynamically adapts its options based on the source page (e.g., hiding the "Contact" option when saving from the Contacts page).
- **Green UI Action**: Introduced a new "success" (green) color variant for `AppButton` and applied it to the "Save As" action across all relevant tables for better visual distinction.

### 🛠️ Refactor & Enhancements
- **Global Table Integration**: Unified the bulk actions toolbar in `ContactTable`, `SubscribersTable`, and `RecipientsTable` to include the functional "Save As" trigger.
- **Localization Polish**: Standardized technical descriptions within the Save As workflow from Bahasa Indonesia to English for professional consistency.
- **API Versioning Integration**: New endpoints (`/api/v1/.../save-as`) implemented across all marketing modules with support for both `contact_ids` and `recipient_ids` payloads.
- **Auth Context Integration**: Secured CRM migration operations by integrating `useAuth` into the modal workflow, ensuring only authenticated tokens are used for cross-entity operations.

### 📁 Created Files
- `components/modal/SaveAsModal.tsx`

### 📁 Modified Files
- `lib/api/contacts.ts`
- `lib/api/email-marketing/subscribers.ts`
- `lib/api/whatsapp-marketing.ts`
- `components/contact/ContactTable.tsx`
- `components/email-marketing/subscribers/SubscribersTable.tsx`
- `components/whatsapp-marketing/recipients/RecipientsTable.tsx`
- `components/ui/app-button.tsx`

## [1.15.8] - 2026-04-10

### 🛠️ Refactor & Enhancements
- **Price Page**: Updated the price page to remove some features which are not available yet.
- **Login Page**: Change language from Bahasa Indonesia to English.
- **Error Page**: Change language from Bahasa Indonesia to English.
- **Not Found Page**: Change language from Bahasa Indonesia to English.

### 📁 Modified Files
- `components/price/PricingCards.tsx`
- `app/auth/login/page.tsx`
- `app/error/page.tsx`
- `app/not-found/page.tsx`

## [1.15.7] - 2026-04-09

### ✨ Added
- **Premium Subscription UI**: Completely redesigned the "My Subscription" interface with a modern 2-card layout (Free Trial & Exclusive) featuring premium SaaS aesthetics.
- **Active Plan Indicators**: Added dynamic "ACTIVE" badges with pulse animations and card scaling effects to highlight the current active subscription.
- **WhatsApp Sales Integration**: Integrated WhatsApp-based call-to-actions for all plan upgrades with brand-consistent styling (#25D366).

### 🛠️ Refactor & Enhancements
- **Admin Settings Migration**: Moved Omnichannel account management from the general settings page to a centralized Admin area (`Admin > WhatsApp Accounts` and `Admin > Email Accounts`).
- **Sidebar Restructuring**: Updated the main navigation sidebar to reflect the new centralized account management structure under the Admin section.
- **Codebase Hardening**: Optimized the `SubscriptionClient` component by cleaning up dynamic API falls-back and standardizing layout structures.

### 🐛 Fixed
- **JSX Syntax Stability**: Resolved critical build errors related to "Unexpected token" and "JSX element has no corresponding closing tag" in the subscription module.
- **TypeScript Type Safety**: Fixed prop-type mismatches in MUI Buttons and resolved literal type comparison errors for `currentPlan` detection.

### 📁 Modified Files
- `components/subscription/SubscriptionClient.tsx`
- `components/layout/Sidebar.tsx`
- `app/admin/whatsapp-accounts/page.tsx`
- `app/admin/email-accounts/page.tsx`
- `app/omnichannel/settings/page.tsx` (Deleted)

## [1.15.6] - 2026-04-09

### ✨ Added
- **Duplicate Broadcast Functionality**: Added a "Duplicate" button to the Broadcast Table and Edit Broadcast modal, allowing users to clone existing campaigns.

### 🛠️ Refactor & Enhancements
- **UI Polish**: Updated the "Broadcast Details & Statistics" modal to hide the Template ID field for better UX.

### 📁 Modified Files
- `components/whatsapp-marketing/broadcasting-wa/BroadcastingWAClient.tsx`
- `components/whatsapp-marketing/broadcasting-wa/modals/ViewBroadcastStatsModal.tsx`

## [1.15.5] - 2026-04-08

### ✨ Added
- **WhatsApp Recipient Management Tab**: Enhanced the "Add New Recipient" modal to support "Buat Manual" and "Import dari Kontak" tabs natively, ensuring UI consistency with Email Marketing.
- **Broadcast Group Assignment**: Added a robust Multiple Select Autocomplete input to assign imported/manual contacts seamlessly directly into active Broadcast Groups.
- **Dynamic Stats Independent Reload**: The WhatsApp Broadcasting "View Details & Statistics" modal now fetches real-time isolated data via `useBroadcastDetail` (`/api/v1/broadcasts/{broadcast_id}`) with an inline "Reload Data" button for immediate campaign status sync without page reloads.
- **Error Status Transparency**: Injected a direct `Error Message` column into the Broadcast Recipients status table that prominently highlights message delivery failures or unmapped variables.

### 🛠️ Refactor & Enhancements
- **Global Contacts Bypass**: Integrated the `include_all` parameter across WhatsApp Marketing and Email Marketing contact importation hooks to securely fetch unfiltered global contacts (bypassing the `is_contact` default query limit).
- **Template Builder Polish**: Enforced a `read-only` (disabled) state on the "Template Language" dropdown selection specifically during Edit mode, safeguarding core template properties post-creation.

### 🐛 Fixed
- **TypeScript Strict Data Parsing**: Remedied the `Type 'Element' is not assignable to type 'string'` error generated in customized `AppAutocomplete` implementations and secured the `activeBroadcast` prop pipeline against uninitialized null-state errors in the detailed statistics view.

### 📁 Modified Files
- `lib/hooks/useContacts.ts`
- `lib/hooks/useBroadcasts.ts`
- `lib/api/contacts.ts`
- `lib/api/whatsapp-marketing.ts`
- `components/whatsapp-marketing/recipients/AddRecipientModal.tsx`
- `components/whatsapp-marketing/broadcasting-wa/modals/ViewBroadcastStatsModal.tsx`
- `components/whatsapp-marketing/templates/create/GeneralInfoCard.tsx`
- `components/whatsapp-marketing/templates/detail/TemplateDetailClient.tsx`
- `components/email-marketing/subscribers/modals/AddSubscriberModal.tsx`

## [1.15.4] - 2026-04-08

### ✨ Added
- **WhatsApp Message Preview**: Integrated a real-time WhatsApp-style mockup in both "Broadcast Details" and "Edit Broadcast" modals, allowing users to visualize how templates and dynamic variables will appear to recipients.
- **Pending Status Support**: Added visual support for the `pending` recipient status in the broadcast statistics table with a dedicated warning indicator.

### 🛠️ Refactor & Enhancements
- **Broadcast Detail Layout**: Redesigned the "Broadcast Details & Statistics" modal into a modern 2-column layout (Statistics/Info on the left, Message Preview on the right) with the recipient status table positioned at the bottom.
- **Edit Broadcast UI Sync**: Refactored the "Edit Broadcast" modal to achieve 100% parity with t1he "Create Broadcast" experience, including full support for Individual Contacts vs. Broadcast Groups and automated variable mapping.
- **API Versioning & Standardization**: 
  - Migrated Broadcast Recipient fetching to the versioned `/api/v1` endpoint.
  - Updated the Broadcast update method to use **`PUT`** for backend consistency.
- **UI Refinements**: 
  - Replaced underscores with spaces in labels (e.g., "Recipient Source") within the detail view for better readability.
  - Simplified the main Broadcast Table by hiding row selection checkboxes.
- **Cache Synchronization**: Implemented React Query invalidation to automatically refresh the recipient list in the statistics modal after editing a contact.

### 📁 Modified Files
- `lib/api/whatsapp-marketing.ts`
- `components/whatsapp-marketing/broadcasting-wa/modals/EditBroadcastModal.tsx`
- `components/whatsapp-marketing/broadcasting-wa/modals/ViewBroadcastStatsModal.tsx`
- `components/whatsapp-marketing/broadcasting-wa/BroadcastingWATable.tsx`


## [1.15.3] - 2026-04-08

### 🛠️ Refactor & Enhancements
- **TrustedBy Testimonials**: Updated the "Trusted By" carousel with real-world Indonesian corporate data, featuring executives from various industries.
- **Content Optimization**: Refined and trimmed testimonial text across all cards to ensure all UI elements (logos, 5-star ratings, names, and roles) remain perfectly visible within fixed-height containers.
- **Logo Visibility & Fixes**: Implemented dark-mode variants for light background visibility and resolved broken asset issues by sourcing verified image URLs directly from official company websites.

### 📁 Modified Files
- `components/layout/TrustedBy.tsx`

## [1.15.2] - 2026-04-07

### ✨ Added
- **Official Company Logos**: Replaced AI-generated placeholders with official logos for PT Sigap, PT Kansai Paint, PT Sunson Textile, PT Woori Consulting, and PT Megacon to ensure brand authenticity.
- **Logo Asset Management**: Created a dedicated `public/assets/logos/` directory to store high-quality official corporate assets for improved stability and performance.

### 🛠️ Refactor & Enhancements
- **TrustedBy Testimonials**: Updated the "Trusted By" carousel with real-world Indonesian corporate data, featuring executives from various industries.
- **Content Optimization**: Refined and trimmed testimonial text across all cards to ensure all UI elements (logos, 5-star ratings, names, and roles) remain perfectly visible within fixed-height containers.
- **Logo Visibility & Fixes**: Implemented dark-mode variants for light background visibility and resolved broken asset issues by sourcing verified image URLs directly from official company websites.

### 📁 Modified Files
- `package.json`
- `components/layout/TrustedBy.tsx`

## [1.15.1] - 2026-04-06

### ✨ Added
- **WhatsApp Marketing Recipients**: Simplified the recipient creation and update payloads by removing the redundant `recipient_type` field and standardizing the data structure for single and bulk operations.
- **Row-level Navigation**: Enhanced the Broadcast Templates table by enabling direct navigation to the detail page upon clicking a table row, improving the interaction flow.

### 🛠️ Refactor & Enhancements
- **Template Table Interaction**: Added a visual hover effect (underline) to campaign names and removed the redundant "Edit" button from the action column.
- **Navigation UX**: Updated the "Back" button in the template detail view to use a text variant with an arrow icon for a cleaner, more consistent interface.
- **Form Focus Stability**: Fixed a focus loss issue in the template creation form where inputs would unmount on every keystroke by refactoring sub-components to the top level.

### 🐛 Fixed
- **Product Price Formatting**: Fixed a bug in the product edit modal where backend prices with decimal points (e.g., `10000.00`) were incorrectly formatted as `1.000.000` instead of `10.000`.

### 📁 Modified Files
- `lib/types/whatsapp-marketing.ts`
- `components/whatsapp-marketing/recipients/AddRecipientModal.tsx`
- `components/whatsapp-marketing/recipients/ImportWaRecipientModal.tsx`
- `components/product/AddProductModal.tsx`
- `components/whatsapp-marketing/templates/create/TemplateFormContent.tsx`
- `components/whatsapp-marketing/templates/BroadcastTemplatesTable.tsx`
- `components/whatsapp-marketing/templates/detail/TemplateDetailClient.tsx`

## [1.15.0] - 2026-04-02

### ✨ Added
- **Broadcast Template Features**: Implemented core enhancements and visual refinements for the WhatsApp Broadcast Template module.
- **Inline Variable Samples**: Implemented direct editing of variable sample values (e.g., {{1}}) within the template creation and detail forms.
- **Character Counters**: Added real-time character count display (e.g., 50/1600) for WhatsApp template body fields in read-only mode.

### 🛠️ Refactor & Enhancements
- **Read-only Visual Overhaul**: Refined the "Content Configuration" section in template details with externalized labels, light-gray backgrounds, and muted borders for a professional disabled look.
- **Automatic Name Sanitization**: Updated the template name field to automatically convert spaces to underscores and enforce lowercase alphanumeric characters during input.
- **Dialog System Update**: Enhanced custom `DialogContent`, `DialogTitle`, and `DialogFooter` wrappers to properly forward the `sx` prop and other standard MUI attributes, resolving persistent TypeScript errors.

### 🐛 Fixed
- **Responsive Layout Overlap**: Fixed a layout bug in `GeneralInfoDetail` where long SID strings and template names would overlap in multi-column views on smaller screens using `word-break: break-word`.

### 📁 Modified Files
- `components/ui/dialog.tsx`
- `components/ui/app-input.tsx`
- `components/ui/app-textarea.tsx`
- `components/whatsapp-marketing/templates/create/TemplateFormContent.tsx`
- `components/whatsapp-marketing/templates/create/CreateTemplateClient.tsx`
- `components/whatsapp-marketing/templates/create/GeneralInfoCard.tsx`
- `components/whatsapp-marketing/templates/create/AddVariableSamplesModal.tsx`
- `components/whatsapp-marketing/templates/detail/TemplateDetailClient.tsx`
- `components/whatsapp-marketing/templates/detail/GeneralInfoDetail.tsx`

## [1.14.0] - 2026-04-01

### ✨ Added
- **WhatsApp Group Broadcast Detail**: Implemented a comprehensive detail page for WhatsApp groups with dual-tab navigation.
- **Recipient Management**: Added a dedicated "Recipients" tab with server-side pagination, search, and "Import/Add" functionality directly within the group context.
- **Campaign Statistics**: Added a "Broadcast (campaign) sent" tab listing all sent broadcasts with aggregated delivery stats (Sent, Delivered, Read, Failed).
- **Campaign Detail Modal**: Created `ViewBroadcastCampaignStatsModal` to visualize detailed WhatsApp campaign metrics, account info, and template variables.
- **Bulk Operations**: Implemented bulk deletion and bulk duplication for WhatsApp Broadcast Groups with integrated selection toolbar.
- **Contextual Imports**: Enhanced `AddRecipientModal` and `ImportWaRecipientModal` to support `target: 'broadcast_group'`, ensuring imported contacts are automatically linked to the active group.

### 🛠️ Refactor & Enhancements
- **Hook Optimization**: Updated `useGroupBroadcasts` for improved cache invalidation and state synchronization across the broadcasting module.
- **API Harmonization**: Updated delete API integration to follow the bulk deletion pattern (IDs in request body) across the broadcasting module.

### 🐛 Fixed
- **State Update Warning**: Fixed a React error "Cannot update a component while rendering a different component" in `GroupBroadcastingTable` by wrapping notification logic in `useEffect`.

### 📁 Created Files
- `components/whatsapp-marketing/group-broadcasting/modals/ViewBroadcastCampaignStatsModal.tsx`

### 📁 Modified Files
- `lib/types/whatsapp-marketing.ts`
- `lib/hooks/useGroupBroadcasts.ts`
- `components/whatsapp-marketing/group-broadcasting/GroupBroadcastingTable.tsx`
- `components/whatsapp-marketing/group-broadcasting/GroupBroadcastingClient.tsx`
- `components/whatsapp-marketing/recipients/AddRecipientModal.tsx`
- `components/whatsapp-marketing/recipients/ImportWaRecipientModal.tsx`
- `app/whatsapp-marketing/group-broadcasting/[id]/page.tsx`

## [1.13.2] - 2026-03-31

### 🛠️ Refactor & Enhancements
- **Campaign Payload Harmonization**: Menyesuaikan pengiriman payload `mail_server_id` (menggunakan `null` untuk opsi Brevo) dan mengkondisikan `mail_sender_id` hanya jika Brevo dipilih.

### 📁 Modified Files
- `components/email-marketing/campaigns/modals/AddCampaignModal.tsx`
- `components/email-marketing/campaigns/modals/EditCampaignModal.tsx`

## [1.13.1] - 2026-03-30

### ✨ Added
- **SMTP Selection in Campaigns**: Menambahkan dropdown pemilihan SMTP (Brevo vs Custom Mail Server) pada modal Add/Edit Campaign.
- **SMTP Tracking Warning**: Menambahkan alert informatif saat menggunakan SMTP eksternal bahwa fitur tracking (delivery, opens, clicks, bounces) tidak tersedia.
- **Improved SMTP Labels**: Format label SMTP server kini menampilkan `Name (From Email)` untuk kejelasan dan kemudahan identifikasi.
- **Recipient Status in Contacts**: Menambahkan field `is_recipient` pada model `Contact` dan menampilkan status "Recipient" berdampingan dengan "Subscribed" menggunakan Chip pada preview tabel Contact.

### 🛠️ Refactor & Enhancements
- **AppSelect Disabled Styling**: Memperbarui styling `AppSelect` saat dalam keadaan `disabled` (background abu-abu, menonaktifkan hover border) agar representasi visual lebih akurat.
- **Campaign Payload Harmonization**: Menyesuaikan pengiriman payload `mail_server_id` (menggunakan `null` untuk opsi Brevo) dan mengkondisikan `mail_sender_id` hanya jika Brevo dipilih.
- **Contact Property Renaming**: Mengubah property `is_subscribed` menjadi `is_subscriber` pada model `Contact` untuk konsistensi penamaan dengan entitas subscriber.

### 📁 Modified Files
- `lib/types/email-marketing.ts`
- `lib/models/types.ts`
- `components/email-marketing/campaigns/modals/AddCampaignModal.tsx`
- `components/email-marketing/campaigns/modals/EditCampaignModal.tsx`
- `components/contact/ContactTable.tsx`
- `components/ui/app-select.tsx`

## [1.13.0] - 2026-03-30

### ✨ Added
- **Mail Server Sender Email**: Menambahkan field `from_email` pada konfigurasi Mail Server (Add/Edit Modal). Ini memisahkan username SMTP dengan alamat email pengirim yang muncul di pesan.
- **Email Validation**: Menambahkan validasi pada field `from_email` untuk memastikan alamat email mengandung karakter `@`.

### 📁 Modified Files
- `lib/models/types.ts`
- `components/admin/mail-servers/AddMailServerModal.tsx`
- `components/admin/mail-servers/EditMailServerModal.tsx`

## [1.12.1] - 2026-03-27

### 🐛 Fixed
- **Mail Server Validation**: Menghapus validasi email pada username field di Add/Edit Mail Server modal. Server akan melakukan validasi email saat testing koneksi.

## [1.12.0] - 2026-03-26

### ✨ Added
- **Campaign Duplication**: Implementasi fitur cloning campaign (single & bulk) dengan suffix `(duplicate)` dan status default `draft`. API: `POST /api/v1/campaigns/duplicate`.
- **Subscriber Duplication**: Implementasi fitur cloning subscriber (single & bulk) berdasarkan `contact_ids`. API: `POST /api/v1/subscribers/duplicate`.
- **Contact Duplication**: Implementasi fitur cloning global contact (single & bulk) dengan `contact_ids`. Email & phone number dikosongkan pada hasil clone untuk menghindari unique constraint conflicts. API: `POST /api/v1/contacts/duplicate`.
- **DuplicateButton Component**: Komponen reusable icon-button untuk aksi duplikasi di tabel.
- **AppButton - White Color**: Menambahkan varian warna `white` pada komponen `AppButton`.

### 🛠️ Refactor & Enhancements
- **BulkActionsBar Styling**: Memperbarui warna teks dan icon pada `BulkActionsBar` agar lebih kontras menggunakan `primary.contrastText`.
- **Duplicate Bulk Action**: Menambahkan tombol duplikasi pada toolbar aksi massal di `CampaignsTable`, `SubscribersTable`, dan `ContactTable`.

### 🐛 Fixed
- **API Error Handling**: Memperbarui parsing error pada API client agar dapat menampilkan detail validasi dari server (e.g. `smtp_username` invalid) alih-alih hanya pesan generic "Invalid request data".
- **SubscribersTable Bulk Variant**: Mengubah variant tombol bulk duplicate dari `outline` ke `primary` dan bulk delete ke `danger` untuk konsistensi UI.

### 📁 Created Files
- `lib/api/email-marketing/subscribers.ts` (Modified with `duplicateSubscribers`)
- `lib/api/contacts.ts` (Modified with `duplicateContacts`)

### 📁 Modified Files
- `lib/api/email-marketing/campaigns.ts`
- `lib/api/mail-servers.ts`
- `lib/api/index.ts`
- `lib/hooks/useCampaigns.ts`
- `lib/hooks/useSubscribers.ts`
- `lib/hooks/useContacts.ts`
- `components/email-marketing/campaigns/CampaignsClient.tsx`
- `components/email-marketing/campaigns/CampaignsTable.tsx`
- `components/email-marketing/subscribers/SubscribersClient.tsx`
- `components/email-marketing/subscribers/SubscribersTable.tsx`
- `components/contact/ContactClient.tsx`
- `components/contact/ContactTable.tsx`
- `components/ui/app-action-buttons-table.tsx`
- `components/ui/app-button.tsx`
- `components/ui/super-table/components/BulkActionsBar.tsx`

## [1.11.2] - 2026-03-18

### ✨ Added
- **ContactTable → SuperTable**: manualPagination, client-side filter (Name/Email/Phone text filter, Position & Company select faceted), globalFilter search toggle, export Excel/CSV loop pagination, renderRowActions (Eye preview + Edit + Delete), renderBulkActions sequential loop per ID, Add Contact + Import toolbar mobile responsive (Import: border biru icon-only, Add: bg biru icon-only), Preview Dialog popup info lengkap, autoResetPageIndex: false
- **✅ Semua 12 tabel selesai dimigrasi ke SuperTable!**

### 🐛 Fixed
- **ContactTable — Bulk delete**: Ganti endpoint DELETE /contacts dengan body contact_ids (500 error) ke sequential loop deleteContact per ID. Menampilkan successCount/failCount informatif. Contact linked ke resource lain (FOREIGN_KEY_VIOLATION) akan di-skip dengan pesan error yang jelas.
- **ContactTable — Filter tidak berfungsi**: Root cause: manualFiltering: true membuat MRT tidak menjalankan client-side filter. Fix: hapus manualFiltering: true, tambah filterVariant text pada Name/Email/Phone, filterVariant select pada Position/Company.
- **ContactTable — Mobile buttons**: Import dan Add Contact button disesuaikan dengan pattern SubscribersTable (Import: border biru icon-only, Add: bg solid biru icon-only di mobile view).

### 📁 Modified Files
- `components/contact/ContactTable.tsx`
- `components/contact/ContactClient.tsx`
- `components/contact/columns.tsx` [NEW]
- `components/contact/modal/DeleteMultipleContactModal.tsx`
- `app/demo/super-table/page.tsx`

## [1.11.1] - 2026-03-17

### 🐛 Fixed
- **LeadDataTable — Infinite loop**: Fixed runtime error `Maximum update depth exceeded` saat pertama kali filter. Root cause: MRT `autoResetPageIndex` reset pageIndex setiap kali data/filter berubah dan trigger setState loop tanpa henti. Fix: `autoResetPageIndex: false` ditambahkan ke SuperTable core (types.ts + useTableConfig.tsx).
- **LeadDataTable — Filter pindah ke SuperTable**: LeadFilters custom component dihapus dari parent, diganti columnFilters SuperTable: Status (select), Source (select), Assigned To (select), Last Contacted (date-range). Kanban View tetap sync via onStateChange + shared filteredLeads useMemo di lead-management.tsx.
- **LeadDataTable — Search toggle**: `globalFilterAlwaysVisible: false` agar search bar toggle show/hide via icon kaca pembesar seperti tabel lain, bukan selalu tampil.
- **LeadDataTable — Date range Last Contacted**: accessorFn return Date object (bukan string) agar MRT betweenInclusive filterFn berfungsi dengan benar. Cell renderer disesuaikan ke getValue<Date | null>().
- **LeadDataTable — handleTableStateChange**: Tambahkan useRef + JSON.stringify deep comparison agar setState hanya dipanggil jika columnFilters benar-benar berubah nilainya.

### 📁 Modified Files
- `components/lead-management/lead-management-table/data-table.tsx`
- `components/lead-management/lead-management-table/columns.tsx`
- `components/lead-management/lead-management.tsx`
- `components/ui/super-table/types.ts`
- `components/ui/super-table/hooks/useTableConfig.tsx`
- `app/demo/super-table/page.tsx`

## [1.11.0] - 2026-03-17

### ✨ Added
- **Industry Solution Pages**: Developed a full suite of marketing landing pages for **Sales, Customer Service, Marketing, Human Resource,** and **Operations** industries at `/solusi/[industry]`.
- **Dynamic Industry Components**: Implemented custom sections (`Hero`, `Challenges`, `Solutions`, `ImpactCTA`) for each industry with optimized "Glassmorphism" UI and interactive mockups.
- **Automated WhatsApp Links**: Integrated `getWhatsAppLink` utility across all solution Hero and CTA buttons to trigger context-aware WhatsApp messages.
- **Multilingual Support**: Added comprehensive Indonesian and English localization for all five new industry solution pages in `lib/utils/strings.ts`.
- **Public Route Accessibility**: Configured `AuthenticatedLayout.tsx` to whitelist the new solution routes, allowing public unauthenticated access.
- **Enhanced Navigation**: Updated `SolutionMenu.tsx` (Desktop & Mobile) to include direct links to the newly created industry solution modules.

### 📁 Created Files
- `app/solusi/sales/page.tsx`
- `app/solusi/customer-service/page.tsx`
- `app/solusi/marketing/page.tsx`
- `app/solusi/human-resource/page.tsx`
- `app/solusi/operasional/page.tsx`
- `components/solusi/sales/*`
- `components/solusi/customer-service/*`
- `components/solusi/marketing/*`
- `components/solusi/human-resource/*`
- `components/solusi/operasional/*`

### 📁 Modified Files
- `lib/utils/strings.ts`
- `components/home/SolutionMenu.tsx`
- `components/layout/AuthenticatedLayout.tsx`

## [1.10.7] - 2026-03-17

### ✨ Added
- **CompanyTable → SuperTable**: manualPagination,
  manualSorting, manualFiltering, globalFilter search,
  server-side filter Industry & Location (multi-select array),
  filter Status client-side (API tidak support param status),
  bulk delete dengan confirmation modal (Promise.all),
  export Excel/CSV loop pagination, Print PDF toolbar,
  row click navigation ke profile detail,
  mobile responsive toolbar

### 🐛 Fixed
- **SubscribersTable**: mobile buttons Import dan Add
  styling disesuaikan referensi CampaignsTable
  (Import: border biru text biru, Add: bg solid biru text putih)

### 📁 Modified Files
- components/omnichannel/company/company-table/CompanyTable.tsx
- components/omnichannel/CompanyIntelligenceClient.tsx
- components/email-marketing/subscribers/SubscribersTable.tsx
- components/email-marketing/subscribers/SubscribersClient.tsx
- app/demo/super-table/page.tsx

## [1.10.6] - 2026-03-17

### 🐛 Fixed
- **CompanyTable — filterValue.some crash**: Fixed runtime crash
  `TypeError: filterValue.some is not a function` pada MRT_SelectCheckbox. 
  Root cause: columnFilters di-restore dari URL sebagai string bukan array.

- **useUrlSync.ts — Array serialization**: Serialize & deserialize
  columnFilters kini support array value dengan separator pipe `|`.
  Format: `industry:Tech|Finance` untuk array,
  `status:success` untuk single value.

- **useTableConfig.tsx — Defense layer**: Sanitasi columnFilters
  di state sebelum dipass ke MRT dihapus karena clash dengan internal
  array state mutation MRT saat multiple selection terjadi.

- **CompanyTable — Status filter**: Fix case mismatch antara
  filterSelectOptions vs data API lowercase. Pakai format
  `{ value: "success", label: "Success" }`. Hapus
  `columnFilterModeOptions: undefined` yang konflik.

- **CompanyTable — Status client-side**: API tidak support param
  status, difilter client-side di CompanyIntelligenceClient.

- **CompanyTable — manualFiltering**: Set `manualFiltering={true}`
  konsisten dengan manualPagination & manualSorting. Sebelumnya
  false menyebabkan filter hanya cocokkan baris halaman aktif.

- **CompanyTable — filterFn conflict**: Hapus
  `filterFn: 'arrIncludesSome'` eksplisit dari kolom Industry &
  Location. MRT v3 auto-set filterFn dari filterVariant.

### 📁 Modified Files
- components/omnichannel/company/company-table/CompanyTable.tsx
- components/omnichannel/CompanyIntelligenceClient.tsx
- components/ui/super-table/hooks/useUrlSync.ts
- components/ui/super-table/hooks/useTableConfig.tsx

## [1.10.5] - 2026-03-17

### ✨ Added
- **DepartmentsTableMember → SuperTable**: manualPagination,
  server-side filter Position & Status, bulk delete 
  sequential, export Excel/CSV loop pagination,
  fix status badge dari hardcoded ke dynamic API value,
  AddMemberButton di toolbar

### 📁 Modified Files
- components/organization/departments-table/DepartmentsTableMember.tsx
- app/organization/[id]/page.tsx

## [1.10.4] - 2026-03-17

### ✨ Added
- **DepartmentsTableList → SuperTable**: manualPagination,
  server-side filter Department (hardcoded select) &
  Branch (dynamic dari API), bulk delete sequential,
  export Excel/CSV loop pagination, Print PDF toolbar,
  row click navigation, mobile responsive

### 📁 Modified Files
- components/organization/departments-table/DepartmentsTableList.tsx
- components/organization/OrganizationClient.tsx

## [1.10.3] - 2026-03-17

### ✨ Added
- **QuotationTable → SuperTable**: manualPagination,
  client-side status filter (Accepted/Pending/Rejected),
  date range filter server-side, export Excel/CSV 
  loop pagination, accessorFn Rupiah formatting,
  mobile responsive toolbar

### 📁 Modified Files
- components/quotation/QuotationTable.tsx
- components/quotation/QuotationClient.tsx
- lib/store/quotation/index.ts

## [1.10.2] - 2026-03-16

### ✨ Added
- **CampaignsTable → SuperTable**: manualPagination,
  client-side status filter (Draft/In Queue/Sending/
  Sent/Canceled), bulk delete dengan skip otomatis 
  untuk non-Draft, export Excel/CSV loop pagination,
  mobile responsive toolbar

### 📁 Modified Files
- components/email-marketing/campaigns/CampaignsTable.tsx
- components/email-marketing/campaigns/CampaignsClient.tsx

## [1.10.1] - 2026-03-16

### ✨ Added
- **TableListUsers → SuperTable**: manualPagination,
  server-side filter Position & Status, dynamic 
  position options, bulk delete sequential,
  export loop pagination, Print PDF toolbar,
  mobile responsive

### 📁 Modified Files
- components/users/users-table/TableListUsers.tsx
- components/users/UsersClient.tsx

## [1.10.0] - 2026-03-16

### ✨ Added
- **SuperTable Core**: Komponen tabel universal dengan dukungan manualPagination, columnFilters, export Excel/CSV, bulk actions, dan urlSync
- **RolesTable → SuperTable**: Server-side pagination & search, export loop pagination, facetedValues, urlSync, densityToggle, fullScreenToggle
- **TicketTable → SuperTable**: Column filters per kolom (Priority/Status select, Agent UUID dropdown), bulk delete sequential dengan progress toast, export loop pagination, mobile responsive toolbar
- **ProductTable → SuperTable**: accessorFn formatting (Rupiah & persen), bulk delete sequential, export do...while loop, race condition fix dengan useRef prevState
- **Demo Page /demo/super-table**: Integration checklist, filter variants demo, accessorFn formatting demo, bulk delete demo, server-side simulation

### 🐛 Fixed
- Generic constraint TData diubah dari Record<string,unknown> ke object untuk kompatibilitas semua TypeScript interface
- Double pagination dihapus dari RolesTable dan TicketTable
- Export kosong karena Authorization header tidak terkirim ke API
- Export 422 error karena limit melebihi batas backend

#### 📁 Modified Files
- components/roles/RolesClient.tsx
- components/roles/roles-table/RolesTable.tsx
- components/roles/roles-button-open-modal/AddRoleButton.tsx
- components/support/tickets/TicketTable.tsx
- app/support/tickets/page.tsx
- components/product/ProductTable.tsx
- components/product/ProductClient.tsx
- components/ui/super-table/types.ts
- components/ui/super-table/SuperTable.tsx
- components/ui/super-table/hooks/useTableConfig.tsx
- components/ui/super-table/hooks/useTableState.ts
- components/ui/super-table/hooks/useTableExport.ts
- components/ui/super-table/components/BulkActionsBar.tsx
- app/demo/super-table/page.tsx

#### 📁 Created Files
- (tidak ada file baru, hanya modifikasi)

---

## [1.9.7] - 2026-03-13

### Detail Versi 1.9.7

#### ✨ Enhancements - WhatsApp Redirect & Dynamic Messaging

- **Global WhatsApp Redirect Integration**: Implemented a standardized WhatsApp redirect system for all "Mulai Uji Coba Gratis" (Hero) and CTA buttons across 12 product and solution landing pages.
- **Dynamic Messaging Utility (`getWhatsAppLink`)**: Created a centralized utility to generate context-aware WhatsApp messages tailored to specific industry sectors (CRM Sales, IT & SaaS, Finance, etc.) while adhering to the "Smartsales" branding.
- **Hero & CTA Components Coverage**: Updated 24 components (12 Hero + 12 CTA) with reactive path tracking to trigger personalized WhatsApp redirects.
- **Unified Brand Voice**: Migrated all dynamic WhatsApp interest messages to use "Smartsales" branding.

#### 📁 Files Created

- `lib/utils/wa-link.ts`

#### 📁 Files Modified

- `CHANGELOG.md`
- `components/crm-sales/*` (Hero, Cta)
- `components/crm-services/*` (Hero, Cta)
- `components/public-omnichannel/*` (Hero, Cta)
- `components/ticket-public/*` (Hero, Cta)
- `components/solution-finance/*` (Hero, ImpactCta)
- `components/solution-fmcg/*` (Hero, ImpactCta)
- `components/solution-hotel/*` (Hero, ImpactCta)
- `components/solution-it-saas/*` (Hero, ImpactCta)
- `components/solution-logistics/*` (Hero, ImpactCta)
- `components/solution-outsourcing/*` (Hero, ImpactCta)
- `components/solution-retail/*` (Hero, ImpactCta)
- `components/solution-travel/*` (Hero, ImpactCta)

## [1.9.6]

### Detail Versi - 2026-03-18

#### 🛠️ Hotfixes

- **Notification Visibility Fix**: Resolved a z-index conflict where error notifications were being covered by modals (such as the Import Contact modal). The `Toaster` component in `app/layout.tsx` now uses a `zIndex` of `100000` to ensure it stays above all UI overlays.
- **Mobile Responsiveness - CRM Modules**: Fixed layout overflow issues on mobile devices for card components in the CRM Sales and CRM Services sections. Optimized grid spacing, padding, and font sizes to ensure content fits within smaller screen widths.

#### 📁 Files Modified

- `app/layout.tsx`
- `components/crm-sales/CrmSalesClient.tsx`
- `components/crm-services/CrmServicesClient.tsx`
- `components/crm-sales/CrmSalesFeatures.tsx`
- `components/crm-services/CrmServicesWhyChoose.tsx`

### Detail Versi - 2026-03-13

#### ✨ Enhancements - Industry Specific Solution Pages (Extended)

- **Logistics Solution Page (`/solusi/logistik`)**: Introduced a dedicated marketing page for the logistics sector.
  - Implemented "Operational & Pickup Pipeline" Kanban board mockup.
  - Added industry-specific challenge sections (Resi Menumpuk, Pickup Terlewat, Investigasi Lambat).
  - Integrated CRM Sales, Omnichannel, and Ticketing for logistics operations.
- **FMCG Solution Page (`/solusi/fmcg`)**: Added a comprehensive solution page for Fast-Moving Consumer Goods.
  - Designed "Distributor Order Pipeline" mockup for order management.
  - Showcased field canvassing and store visit tracking (GPS) features.
  - Detailed the unified ordering center via WhatsApp API.
- **Retail Industry Solution Page (`/solusi/ritel`)**: Implemented a new marketing page for the retail sector.
  - Created "Member Promo Campaign" and "Customer Member Profile" mockups.
  - Highlighted loyalty management, stock check via WhatsApp, and after-sales warranty claims.
- **IT & SaaS Solution Page (`/solusi/it-saas`)**: Developed a dedicated solution page for the IT sector.
  - Designed "IT Project Sales Pipeline" mockup for B2B deal management.
  - Implemented Helpdesk Center via WhatsApp and Bug/Incident management ticketing sections.
- **Outsourcing Solution Page (`/solusi/outsourcing`)**: Created a marketing page for the outsourcing industry.
  - Implemented "Recruitment & Placement Pipeline" mockup.
  - Showcased candidate database management and mass communication via WhatsApp Broadcast.

#### 🏗️ Global Navigation & Layout
- **Solution Menu**: Updated the `SolutionMenu` component to include the new industry solution pages.
- **Authenticated Layout**: Configured all new solution routes in the `AuthenticatedLayout` to ensure public accessibility and consistent UI.

#### 📁 Files Created

- `app/solusi/logistik/page.tsx`
- `app/solusi/fmcg/page.tsx`
- `app/solusi/ritel/page.tsx`
- `app/solusi/it-saas/page.tsx`
- `app/solusi/outsourcing/page.tsx`
- `components/solution-logistics/*`
- `components/solution-fmcg/*`
- `components/solution-retail/*`
- `components/solution-it-saas/*`
- `components/solution-outsourcing/*`

#### 📁 Files Modified

- `CHANGELOG.md`
- `components/home/SolutionMenu.tsx`
- `components/layout/AuthenticatedLayout.tsx`

## [1.9.5] - 2026-03-11

### Detail Versi 1.9.4

#### ✨ Enhancements - Company Intelligence Bulk Operations

- **Bulk Save to CRM**: Implemented bulk selection and save functionality for company intelligence search results:
  - Added checkbox selection on each company result card
  - Implemented "Select All" checkbox in the results header with indeterminate state support
  - Added "Save Selected to CRM" button that appears when companies are selected
  - Shows count of selected companies in both the header text and the bulk save button
  - Bulk save uses a single API request (`POST /company-intelligence/bulk-save-to-crm`) with array of cache_ids
  - Selection state is automatically cleared after successful bulk save
  - Loading state with disabled button during bulk save operation
  - Individual "Save To CRM" buttons remain available for single company saves

#### 📁 Files Modified

- `components/data-intelligence/CompanyResultCard.tsx`
- `app/data-intelligence/industry-leaders/results/page.tsx`
- `lib/api/company-intelligence.ts`



## [1.9.4] - 2026-03-11

### Detail Versi 1.9.4

#### ✨ Enhancements - Industry Specific Solution Pages

- **Tour & Travel Solution Page (`/solusi/tour-travel`)**: Implemented a comprehensive marketing page for the travel sector.
  - Added "Sales Pipeline Paket Liburan" Kanban board mockup.
  - Created industry-specific pain point sections (Pesan Menumpuk, Data Tercecer, Reschedule).
  - Showcased integrated CRM, Omnichannel, and Ticketing applications for travel agents.
- **Hotel Industry Solution Page (`/solusi/perhotelan`)**: Created a dedicated hospitality solution page.
  - Designed "Sales Pipeline Reservasi" mockup for guest booking management.
  - Implemented sections for hospitality challenges and specific module applications (Room Reservation Profile, Shared WhatsApp, Guest Service Tickets).
  - Added hospitality impact metrics (+35% occupancy, etc.).
- **Multilingual Support**: Expanded `lib/utils/strings.ts` with hundreds of new localized strings (Indonesian & English) for Travel and Hotel sectors.
- **Global Navigation & Security**:
  - Integrated both industry pages into the `SolutionMenu` dropdown.
  - Configured `AuthenticatedLayout` to allow public unauthenticated access to these routes.

#### 📁 Files Created

- `app/solusi/tour-travel/page.tsx`
- `app/solusi/perhotelan/page.tsx`
- `components/solution-travel/*` (Hero, Challenges, Solutions, Impact CTA, Client)
- `components/solution-hotel/*` (Hero, Challenges, Solutions, Impact CTA, Client)

#### 📁 Files Modified

- `lib/utils/strings.ts`
- `components/layout/AuthenticatedLayout.tsx`
- `components/home/SolutionMenu.tsx`

## [1.9.3] - 2026-03-10


### Detail Versi 1.9.3

#### ✨ Enhancements - Data Governance & Destructive Actions

- **Global "Delete All" Functionality**: Implemented a standardized way to clear data across core modules, protected by severe confirmation dialogs.
  - **Subscribers**: Added `deleteAllSubscribers` API and the corresponding `Delete All Data` action in the Subscribers list.
  - **Contacts**: Added `deleteAllContacts` API and integrated the `Delete All Data` action in the Contacts toolbar.
  - **Mailing List Subscribers**: Added list-specific `deleteAllMailingListSubscribers` functionality to remove all subscribers from a specific list without deleting them from global contacts.
- **UI Standardization**:
  - Standardized Table and Toolbar props (`onEdit`, `onDeleteRequest`, `onDeleteAllRequest`) across multiple components for better consistency.
  - Implemented high-contrast, red-themed warning modals for irreversible destructive actions.

#### 📁 Files Modified

- `lib/api/email-marketing/subscribers.ts`
- `lib/api/contacts.ts`
- `lib/api/email-marketing/mailing-lists.ts`
- `lib/hooks/useSubscribers.ts`
- `lib/hooks/useContacts.ts`
- `lib/hooks/useMailingLists.ts`
- `components/contact/ContactClient.tsx`
- `components/contact/ContactToolbar.tsx`
- `components/contact/ContactTable.tsx`
- `components/email-marketing/subscribers/SubscribersClient.tsx`
- `components/email-marketing/subscribers/SubscribersTable.tsx`
- `app/email-marketing/mailing-lists/[id]/page.tsx`

## [1.9.2] - 2026-03-10


### Detail Versi 1.9.1

#### 🧪 Testing & Quality Assurance — Comprehensive Unit Test Expansion

- **Cookies Utility Tests** (`cookies.test.ts`): Validates `AUTH_COOKIE_NAME` constant, `hasAuthToken` behavior for valid/dummy/missing tokens, and auth action function existence.
- **Auth Tokens Utility Tests** (`auth-tokens.test.ts`): Validates `generateSecureToken` output length, `generateTokenWithExpiration` timing accuracy, `isTokenExpired` for past/future dates, and `hashToken` deterministic consistency.
- **Error Handler Utility Tests** (`error-handler.test.ts`): Validates string error passthrough, fallback messages for null/undefined, nested `data.detail` extraction, Axios-style `response.data.detail`, details array formatting with field names, standard `Error.message` extraction, and `handleError` return value.
- **Taxonomy Utility Tests** (`taxonomy.test.ts`): Validates data integrity for industry/geographic/role taxonomies, `normalizeIndustry` exact and unknown lookups, `normalizeLocation` for Jakarta Pusat/Surabaya/unknown cities, and `getIndustryBreadcrumb` for known/unknown categories.
- **Debounce Utility Tests** (`debounce.test.ts`): Validates return type, delayed execution, rapid-fire call cancellation, and default 300ms delay behavior.
- **Strings / Localization Tests** (`strings.test.ts`): Validates default language (Indonesian), Indonesian/English string resolution, language switching, `formatString` placeholder replacement, fallback for missing keys, and key consistency across languages for critical UI strings.
- **Middleware Route Logic Tests** (`middleware-routes.test.ts`): Validates protected route detection, public route exclusion, auth route exact matching, and redirect logic for authenticated users on auth routes, unauthenticated users on protected routes, and unauthenticated users on public routes.

#### 📁 Files Created

- `lib/tests/cookies.test.ts`
- `lib/tests/auth-tokens.test.ts`
- `lib/tests/error-handler.test.ts`
- `lib/tests/taxonomy.test.ts`
- `lib/tests/debounce.test.ts`
- `lib/tests/strings.test.ts`
- `lib/tests/middleware-routes.test.ts`

## [1.9.1] - 2026-03-09

### Detail Versi 1.9.1

#### ✨ Enhancements - Public Marketing Pages

- **Omnichannel Public Page (`/public-omnichannel`)**: Created a dedicated public marketing route highlighting Omnichannel features.
  - Added dynamic hero mockup showcasing a unified inbox across WhatsApp, Instagram, and Web.
  - Built interactive collaboration section featuring bouncing CSS keyframe animations for floating cards.
  - Implemented bilingual (ID/EN) translation strings for all sections.
- **Ticket Creation Integration Page (`/public-ticket`)**: Created a new public page detailing the ticketing module.
  - Built custom interactive flowcharts demonstrating data flowing from chats directly to CRM.
  - Added 3-column feature highlights for 1-Click Ticketing, Escalation, and Monitoring.
- **Finance Solution Page (`/solusi-keuangan`)**: Implemented industry-specific solution page for the financial sector.
  - Designed custom Kanban board mockups ("Pipeline Pengajuan Kredit").
  - Added alternating layout demonstrating CRM Sales, Omnichannel, and Ticketing applications in finance.
- **CRM Service Page Refinement**: Ported the internal CRM Service page into a public-facing variant showcasing service request workflows.
- **Navigation & Access**:
  - Updated `ProductMenu` and `SolutionMenu` components to seamlessly route to these new public endpoints.
  - Configured `AuthenticatedLayout` to safely bypass these routes from access-control middleware, allowing prospective users to view them without logging in.

#### 📁 Files Created

- `app/public-omnichannel/page.tsx`
- `app/public-ticket/page.tsx`
- `app/solusi-keuangan/page.tsx`
- `components/public-omnichannel/*` (Hero, Features, Collaboration, CTA)
- `components/ticket-public/*` (Hero, Features, Integration, CTA)
- `components/solution-finance/*` (Hero, Challenges, Solutions, Impact CTA)

#### 📁 Files Modified

- `components/home/ProductMenu.tsx`
- `components/home/SolutionMenu.tsx`
- `components/layout/AuthenticatedLayout.tsx`
- `lib/utils/strings.ts`


## [1.9.0] - 2026-03-08

### Detail Versi 1.9.0

#### ✨ Enhancements - Campaigns & Infrastructure

- **Campaigns - Workflow Optimization**: Major overhaul of the campaign draft saving process to prioritize user speed and flexibility:
  - **Relaxed Draft Validation**: Only the **Email Subject** is now required to save a draft.
  - **Atomic Send Validation**: Strict validation for Mail Sender, Content, and Recipients is now deferred until the final "Send" action.
  - **Label Refinement**: Removed mandatory markers (`*`) from elective fields to align with the new elective validation logic.
  - **Error Visibility**: Implemented context-aware error messages that only appear when relevant to the user's current action.
- **Data Governance - Global Taxonomy**: Introduced a comprehensive industry and geographic mapping layer:
  - Added `INDUSTRY_TAXONOMY` with multi-level sector classifications.
  - Implemented `GEOGRAPHIC_TAXONOMY` covering all Indonesian provinces and cities.
  - Added normalization helpers to standardize user input for CRM and Campaign data.
- **Testing & Quality Assurance**: 
  - Created a high-volume **Mock Data Generator** for stress-testing campaign listings with 500+ records.
  - Implemented a functional **Validation Test Suite** to ensure draft/send logic integrity.

#### 🏗️ Architectural Refactoring

- **Component Decoupling**: Extracted `RecipientSourceSelector` into a standalone modular component to reduce logic duplication in Add/Edit modals.
- **Centralized Constants**: Migrated magic strings and error messages to `lib/constants/campaign.ts` for improved maintainability.
- **Type Safety**: Updated `CreateCampaignData` and `UpdateCampaignData` interfaces to support elective fields for legacy and future drafts.

#### 🐛 Bug Fixes

- **TypeScript - AppButton Propping**: Fixed a type error where the redundant `variant` prop was passed to the custom `AppButton` component.
- **Campaign Payloads - Property Alignment**: Synchronized the frontend `mail_sender_id` property with the backend update, resolving a mapping issue during campaign creation.

#### 📁 Files Created

- `lib/utils/taxonomy.ts`
- `lib/mocks/campaign-data.ts`
- `lib/constants/campaign.ts`
- `lib/tests/campaign-validation.test.ts`
- `components/email-marketing/campaigns/modals/RecipientSourceSelector.tsx`

#### 📁 Files Modified

- `package.json`
- `components/email-marketing/campaigns/modals/AddCampaignModal.tsx`
- `components/email-marketing/campaigns/modals/EditCampaignModal.tsx`
- `lib/types/email-marketing.ts`



## [1.8.35] - 2026-03-06

### Detail Versi 1.8.35

#### ✨ Enhancements

- **Campaigns - Mail Sender Management**: Added edit and delete functionality for mail senders directly in the campaign modals:
  - Added "Edit" and "Delete" buttons next to the selected mail sender dropdown
  - Edit button opens a dialog to update the sender name via `PUT /mail-senders/{id}`
  - Delete button shows confirmation before removing via `DELETE /mail-senders/{id}`
  - Both buttons use consistent AppButton styling with primary blue and danger red colors
  - After deletion, the mail sender selection is automatically cleared
- **Campaigns - Subscriber Selection Improvements**: Enhanced the subscriber selection experience in Add Campaign and Edit Campaign modals with pagination and search functionality:
  - Added pagination controls showing 10 subscribers per page instead of limiting to 1000 total
  - Implemented search field to filter subscribers by email or name
  - Search automatically resets to page 1 when typing
  - Pagination controls only appear when there are multiple pages
  - Shows appropriate "No subscribers found" message when search returns no results
- **Campaign Statistics - Refresh Button**: Added a refresh icon button in the Campaign Statistics modal header that refetches the latest campaign data from the backend API (`/api/v1/campaigns/{campaign_id}`):
  - Icon spins during data refresh for visual feedback
  - Tooltip shows "Refresh statistics" on hover
  - Updates all campaign stats (delivered, opened, clicked, bounced) in real-time
  - Positioned next to the "Campaign Statistics" title for easy access

#### 🐛 Bug Fixes

- **Campaigns - Subscriber Limit Removed**: Fixed the 10-subscriber limit in campaign creation/editing modals. Previously, only the first 10 subscribers were available for selection even when more existed in the system. Now all subscribers are accessible through pagination and search.
- **Sidebar - Icon Layout Shift**: Fixed text movement issue in the sidebar when scrolling. Custom icons (Omnichannel, Sales, Data Intelligence) now have explicit width/height attributes and min-width/min-height styles to prevent layout shifts during image loading.
- **Campaigns - Button Color Consistency**: Fixed inconsistent blue colors between "+ Add New Mail Sender" link and action buttons. All buttons now use the same primary blue (#5479EE) from the AppButton component.

#### 📁 Files Created

- `components/email-marketing/campaigns/modals/MailSenderManager.tsx`

#### 📁 Files Modified

- `lib/api/email-marketing/mail-senders.ts`
- `lib/hooks/useMailSenders.ts`
- `components/email-marketing/campaigns/modals/AddCampaignModal.tsx`
- `components/email-marketing/campaigns/modals/EditCampaignModal.tsx`
- `components/email-marketing/campaigns/modals/ViewCampaignStatsModal.tsx`
- `components/layout/Sidebar.tsx`

## [1.8.34] - 2026-03-05

### Detail Versi 1.8.34

#### ✨ Enhancements

- **Subscribers - Bulk Delete**: Implemented a true bulk delete API request allowing users to delete multiple subscribers simultaneously, replacing the previous sequential one-by-one deletion flow.
- **Mailing Lists - Bulk Delete Subscribers**: Added checkboxes and a "Delete Selected" bulk action to the mailing list subscribers table, allowing for the rapid removal of multiple subscribers from a specific mailing list via a dedicated API endpoint.
- **Campaigns - Mail Senders Integration**: Swapped the campaign creation/editing flow from relying on Mail Servers to using Mail Senders. Features include:
  - Add & Edit Campaign modals now use the `/mail-senders` API to fetch sending domains.
  - Added a new, inline "+ Add New Mail Sender" button directly in the Campaign modal.
  - Implemented an inline 2-step `AddMailSenderDialog` that supports sender creation followed by immediate OTP validation (sending `name`, `email`, and `otp`).
  - Adjusted underlying backend payload property from `mail_server_id` to `mail_sender_id` as specified by the updated API schema.

#### 🐛 Bug Fixes

- **Edit Campaign Modal**: Fixed an issue where the `Button` component was not imported, causing a `ReferenceError` when opening the modal after the mail senders integration.

## [1.8.33] - 2026-03-05

### Detail Versi 1.8.33

#### ✨ Enhancements

- **Add Lead - Contact Picker**: The Name autocomplete dropdown now shows a maximum of 10 results. When more results are available, a "Show More" link opens a full Contact Picker dialog with a searchable, paginated table (Name, Email, Phone, Company columns).
- **Edit Lead - Contact Picker**: The "Detail Lead" (edit) modal now uses the same Name autocomplete with contact search, 10-item limit, "Show More", and Contact Picker dialog — replacing the plain text input.
- **Add Lead - Phone Number**: Phone number validation now allows an optional `+` prefix (e.g. `+628123456789`).
- **Add Lead - Company Label**: Removed the red `*` (required indicator) from the Company label for consistency.

#### 🐛 Bug Fixes

- **Add Lead - Null Safety**: Fixed a crash in the contact search filter when contacts have null email or company values.
- **Add Lead - Selection Validation**: Fixed validation error persisting after selecting a contact from the autocomplete dropdown.
- **Edit Contact - ID in Payload**: Removed `id` from the PUT request body — the backend uses JSONB and was storing the `id` as a custom field.

#### 📁 Files Modified

- `components/lead-management/ContactPickerDialog.tsx` [NEW]
- `components/lead-management/add-lead-form.tsx`
- `components/lead-management/lead-detail-modal.tsx`
- `components/contact/modal/EditContactModal.tsx`


## [1.8.32] - 2026-03-06
### Detail Versi 1.8.32
#### ✨ Enhancements
- **Pricing Page**: Added a new pricing trial component and a localization utility with various pricing-related strings.
#### 📁 Files Modified
- `components/price/PricingTrial.tsx` [NEW]
- `lib/utils/strings.ts`
## [1.8.31] - 2026-03-05
### Detail Versi 1.8.31
#### ✨ Omnichannel Enhancements & Dynamic Channels
- **Unified Contacts API**: Refactored the Omnichannel Contact listing to use the new `/omnichannels/inbox/contacts` API via the `useOmnichannelContacts` hook. This provides unified access to contact details, dynamic channel availability, latest conversations, and unread counts.
- **Dynamic Channel Selection**: Chat mode toggles (WhatsApp and Email) in the Chat Header now appear dynamically based on the contact's `channel_types`.
- **Intelligent Conversation Routing**: Switching tabs automatically looks up and mounts the existing conversation ID for that specific channel type referencing the `useInbox` hook.
- **Optimized Create Payload**: Creating new conversations for existing contacts now correctly prioritizes the `contact_id` reference instead of the raw `to` field.
- **Email Composer Redesign**: Implemented a collapsible, rich text Email Composer complete with styling toolbar, "Reply via Email" toggle, and self-clearing Send/Cancel buttons.
- **Email Sync Actions**: Added "Refresh" (24h sync) and "Full Sync" action buttons safely tucked in the Contact Sidebar for quick inbox synchronization without cluttering the chat view.
- **Responsive Layout**: Re-engineered the chat interface for smaller screens. The Chat Header correctly wraps, and the Contact Details column transforms into a sliding overlay drawer with a backdrop on laptop sizes (`< xl` breakpoint).
- **UI & Sentiment Polish**: Surfaced `sentiment_label` at the top of the chat header. Softened the read tick icon color and unified outbound message bubbles to use the primary brand blue (`#5479EE`).
#### 📁 Files Modified
- `components/omnichannel/OmnichannelClient.tsx`
- `components/omnichannel/MessageList.tsx`
- `lib/api/omnichannel.ts`
- `lib/hooks/useOmnichannel.ts`
- `lib/types/omnichannel.ts`
## [1.8.30] - 2026-03-05
### Detail Versi 1.8.30
#### ✨ Enhancements
- **Add Lead - Contact Picker**: The Name autocomplete dropdown in the "Add New Lead" form now shows a maximum of 10 results. When more results are available, a "Show More" link appears at the bottom that opens a full Contact Picker dialog with a searchable, paginated table (Name, Email, Phone, Company columns) for easier contact selection.
#### 🐛 Bug Fixes
- **Add Lead - Null Safety**: Fixed a crash in the contact search filter when contacts have null email or company values, which caused the autocomplete dropdown to silently break and show no results.
#### 📁 Files Modified
- `components/lead-management/ContactPickerDialog.tsx` [NEW]
- `components/lead-management/add-lead-form.tsx`
## [1.8.29] - 2026-03-04
### Detail Versi 1.8.29
#### 🐛 Bug Fixes
- **Dashboard Sales Funnel**: Fixed an issue where the Sales Funnel chart would appear completely blank (no axes or labels) if the backend returned an object containing an `items` array instead of a direct array, or if it returned an empty dataset. The chart data mapping now safely extracts the items array and always fills all 6 funnel stages (Prospect, Qualified, Negotiation, Proposal, Closed - Won, Closed - Lost) with zero-counts when no data is present, ensuring the chart structure always renders properly.
#### 📁 Files Modified
- `components/dashboard/DashboardClient.tsx`

## [1.8.28] - 2026-03-04

### Detail Versi 1.8.28

#### 🎨 Pricing UI Redesign & Brand Alignment

- **Exclusive Card Overhaul**: Completely redesigned the "Exclusive" (formerly Enterprise) pricing card with a high-contrast primary blue background (`#5479EE`) and white text for a premium look.
- **Multi-line Price Layout**: Refactored the "Hubungi Kami" / "Contact Us" text into a two-line layout with increased font size (2.1rem) and integrated the contract duration text directly after the second line for better spatial efficiency.
- **WhatsApp Themed CTA**: Updated all pricing card action buttons to use the WhatsApp green theme (`#25D366`) with darker hover states for a more actionable UI.
- **Recommended Badge**: Replaced the "Popular" tag with a "Recommended" badge using a bold green background to align with the new CTA styling.
- **Feature Visuals**: Applied strikethrough decorations to features 4 & 5 on the Free Trial card to clearly communicate plan limitations.
- **Improved Contrast**: Adjusted feature icons and list text colors to maintain high accessibility on both light and dark card backgrounds.

#### 🌐 Localization & Copy Updates

- **Plan Renaming**: Globally updated the second pricing tier name from "Enterprise" to "Exclusive" in both English and Indonesian locales.
- **Contractual Strings**: Standardized the contract duration text for the Exclusive plan to " / sesuai kontrak" (ID) and "/ per contract" (EN).
- **Tag Updates**: Updated localized plan tags to "Recommended" across all languages.

#### 📁 Files Modified

- `components/price/PricingCards.tsx`
- `lib/utils/strings.ts`

## [1.8.27] - 2026-03-04

### Detail Versi 1.8.27

#### ✨ Enhancements

- **Campaigns Table Pagination**: Successfully migrated the Campaigns module from client-side array slicing to full backend server-side pagination and debounced textual searching.
  - Implemented dynamic argument passing for `page`, `limit` and `search` inside `useCampaigns` hook.
  - Mapped URLSearchParams directly within `lib/api/email-marketing/campaigns.ts`.
  - Re-mapped the Data Table payload schema and correctly extracted `data.total` for accurate dynamic pagination markers, greatly improving listing performance on heavy databases.

#### 📁 Files Modified

- `components/email-marketing/campaigns/CampaignsTable.tsx`
- `lib/api/email-marketing/campaigns.ts`
- `lib/hooks/useCampaigns.ts`
- `lib/types/email-marketing.ts`

## [1.8.26] - 2026-03-04

### Detail Versi 1.8.26

#### 🏗️ Navigation & UI Polish

- **Compact Menus**: Refined `ProductMenu` and `SolutionMenu` with a more compact design, reducing `minHeight` from 400px to 280px and optimizing internal padding/spacing for a sleeker look.
- **WhatsApp Localization**: Implemented multi-language support for all WhatsApp interest messages across `Hero`, `WhatsAppFloatingButton`, and `PricingCards`.
- **FAQ Refinement**: Cleaned up the `FAQ` component to strictly use localized strings, ensuring consistent branding and translations.

#### 📁 Files Modified

- `components/layout/FAQ.tsx`
- `components/layout/WhatsAppFloatingButton.tsx`
- `components/home/Hero.tsx`
- `components/home/ProductMenu.tsx`
- `components/home/SolutionMenu.tsx`
- `components/price/PricingCards.tsx`
- `lib/utils/strings.ts`

## [1.8.25] - 2026-03-04

### Detail Versi 1.8.25

#### 🐛 Bug Fixes
- **Contact Import - Name Only Required**: Fixed the 'Import Contacts' button disabled state logic to only require the Name field to be valid, previously it mistakenly required both Name and Email data to be present.

#### 📁 Files Modified

- `components/contact/modal/ImportContactModal.tsx`

## [1.8.24] - 2026-03-04

### Detail Versi 1.8.24

#### 🎨 Global Branding & UI Consistency

- **SmartSales Rebranding**: Finalized the revert of project-wide branding from "SuperContact" back to "SmartSales".
  - **Sidebar**: Switched to high-quality SVG primary logo and added `logo3d.png` for collapsed state.
  - **Email Templates**: Rebranded all HTML and Text email templates, including subject lines.
  - **Site-wide Branding**: Updated logo and brand name in `Navbar`, `Footer`, `Hero` analytics, `EmailVerification`, and `PrintableTable`.
  - **Metadata**: Updated root `layout.tsx` title, description, and OpenGraph tags.
  - **Strings**: Refined localized string constants in `lib/utils/strings.ts`.

#### 🔐 Authentication Flow & Layout

- **Login Page**: Added a "Kembali ke Beranda" (Back to Home) button with icon and hover effects for better navigation.
- **Forgot Password**: Refactored the layout to use a centered card design with shadow and rounded corners.
- **OTP Verification**: Aligned layout with the centered card design to match the password recovery flow.
- **New Password**: Unified the password reset page styling with the new card design and fixed zoom responsiveness.
- **Zoom Optimization**: Resolved layout shifts and misalignment issues when the browser is zoomed (125%-200%) by migrating from fixed margins to dynamic flexbox centering.

#### 📁 Files Modified

- `app/layout.tsx`
- `app/(auth)/login/page.tsx`
- `app/(auth)/forgot-password/page.tsx`
- `app/(auth)/forgot-password/verify-otp/page.tsx`
- `app/(account)/new-password/page.tsx`
- `app/(account)/email-verification/page.tsx`
- `components/layout/Navbar.tsx`
- `components/layout/Footer.tsx`
- `components/layout/Sidebar.tsx`
- `components/ui/printable-table.tsx`
- `lib/utils/strings.ts`
- `lib/utils/email-templates.ts`

## [1.8.23] - 2026-03-02

### Detail Versi 1.8.23

#### ✨ Data Intelligence & Optimization

- **Server-Side Pagination & Search**: Shifted subscriber lists from front-end pagination to highly efficient backend server-side pagination.
  - **All Subscribers**: Updated the table to dynamically fetch chunked pages and pass search queries directly to the backend.
  - **Mailing List Details**: The subscriber table within a specific mailing list now uses server-side pagination, ensuring fast load times even for mailing lists with thousands of contacts.
  - **Debounced Search**: Input searches are now throttled by 500ms to prevent spamming the API with requests while typing.

#### 📁 Files Modified

- `app/email-marketing/mailing-lists/[id]/page.tsx`
- `components/email-marketing/subscribers/SubscribersTable.tsx`
- `lib/api/email-marketing/mailing-lists.ts`
- `lib/api/email-marketing/subscribers.ts`
- `lib/hooks/useMailingLists.ts`
- `lib/hooks/useSubscribers.ts`

## [1.8.22] - 2026-03-01

### Detail Versi 1.8.22

#### ✨ Enhancements

- **Subscriber Preview Popup**: Added an eye icon (👁) button to subscriber table rows on both the All Subscribers page and the Mailing List Subscriber tab. Clicking the icon opens a preview popup showing full subscriber details: email, phone, company, position, address, creation date, subscription status, and custom fields.
- **Subscriber Custom Fields (Preview)**: Custom fields (e.g. "occupation") are displayed in the preview popup under an "Additional Info" section in a 2-column grid.
- **Subscriber Custom Fields (Edit)**: The Edit Subscriber modal now loads and displays custom fields. Users can edit values, delete fields, and add new custom fields.

#### 📁 Files Modified

- `components/email-marketing/subscribers/SubscriberPreviewPopup.tsx` [NEW]
- `components/email-marketing/subscribers/SubscribersTable.tsx`
- `components/email-marketing/subscribers/modals/EditSubscriberModal.tsx`
- `app/email-marketing/mailing-lists/[id]/page.tsx`
- `lib/types/email-marketing.ts`

## [1.8.21] - 2026-03-01

### Detail Versi 1.8.21

#### 🐛 Bug Fixes

- **Preview Popup - View Full Details**: Fixed "View Full Details" button not navigating to the contact detail page. The popup now closes before triggering navigation.
- **Edit Contact Modal - Custom Fields**: The edit modal now loads and displays existing custom fields (e.g. "occupation"). Users can edit values, delete fields, and add new custom fields. Custom fields are included in the PUT payload.

#### ✨ Enhancements

- **Contact Detail - Custom Fields**: The contact detail page now displays custom fields (like "Occupation") below the Address row, matching the same style as other contact info rows.

#### 📁 Files Modified

- `components/contact/ContactTable.tsx`
- `components/contact/modal/EditContactModal.tsx`
- `components/contact/detail/sections/ContactInfo.tsx`
- `lib/models/types.ts`

## [1.8.20] - 2026-03-01

### Detail Versi 1.8.20

#### 🐛 Bug Fixes

- **Contact Import - Name Only Required**: For contact import, only the Name field is now required (previously both Name and Email were required). Email remains required for subscriber imports only.

#### ✨ Enhancements

- **Contact Table - New Columns**: Added separate Email and Address columns to the contact table, toggleable via column visibility settings.
- **Contact Table - Preview Popup**: Added an eye icon (👁) button in each row's action column. Clicking it opens a preview popup showing the full contact details including email, phone, company, position, address, subscription status, custom fields, and creation date. The popup also has "View Full Details" and "Edit" action buttons.
- **Contact Table - Avatars**: Updated the name column avatar to show the contact's initial letter instead of a plain blue circle.

#### 📁 Files Modified

- `components/contact/modal/ImportContactModal.tsx`
- `components/contact/ContactTable.tsx`
- `components/contact/ContactClient.tsx`
- `lib/models/types.ts`

## [1.8.19] - 2026-03-01

### Detail Versi 1.8.19

#### 🐛 Bug Fixes

- **Individual Intelligence Pagination**: Fixed pagination showing more cards than the "per page" setting. The API paginates by companies (each with multiple key people), so setting "10 per page" could display 20-30+ cards. Switched to client-side pagination: all companies are fetched at once, key people are flattened, and the flattened list is paginated locally so "10 per page" now shows exactly 10 people cards.

#### 📁 Files Modified

- `components/intelligence-individual/IndividualClient.tsx`

## [1.8.18] - 2026-02-28

### Detail Versi 1.8.18

#### 🐛 Bug Fixes

- **Checkout Redirect Fix**: Fixed "Checkout Failed - Invalid checkout response received" error when upgrading subscription plan. The backend migrated from Midtrans to Xendit, returning `payment_redirect_url` instead of `midtrans_redirect_url`. Updated the checkout handler and `CheckoutResponseData` type to match the new API response.

#### 📁 Files Modified

- `components/subscription/SubscriptionClient.tsx`
- `lib/api/billings.ts`

## [1.8.17] - 2026-02-28

### Detail Versi 1.8.17

#### 🐛 Bug Fixes & UI Polish

- **AppButton Loading Spinner**: Fixed the `isLoading` prop to actually render a `CircularProgress` spinner. Previously it only disabled the button without visual feedback.
- **Page Loading Indicator**: Added a global `loading.tsx` at the app root level to display a centered spinner during all page transitions.
- **Import Email Required**: Made email a required field in both Import Subscriber and Import Contact modals. Rows missing email are now marked invalid and skipped during import.
- **Import Button Styling**: Standardized all Import buttons (Contact, Subscriber, Mailing List) to use `outline` variant with a downward arrow (`Download`) icon instead of `Upload` for correct semantics.
- **Add Deal Modal Cancel Button**: Removed the confirmation popup when clicking the Cancel button in the Add Deal modal. Backdrop click still triggers confirmation.

#### 📁 Files Created

- `app/loading.tsx`

#### 📁 Files Modified

- `components/ui/app-button.tsx`
- `components/quotation/QuotationTable.tsx`
- `components/email-marketing/subscribers/modals/ImportSubscriberModal.tsx`
- `components/contact/modal/ImportContactModal.tsx`
- `components/contact/ContactToolbar.tsx`
- `components/email-marketing/subscribers/SubscribersTable.tsx`
- `app/email-marketing/mailing-lists/[id]/page.tsx`
- `components/pipeline/AddDealModal.tsx`

## [1.8.16] - 2026-02-28

### Detail Versi 1.8.16

#### 🐛 Bug Fixes & UI Polish

- **Import Modals (Subscriber & Contact)**: Removed the confirmation popup when clicking the "Cancel" button in Import Subscriber and Import Contact modals. Clicking Cancel now immediately closes the modal. The confirmation popup is still shown when clicking on the backdrop (background overlay) to prevent accidental data loss.
- **Add Contact Modal**: Removed the confirmation popup from the Cancel button. Backdrop click still triggers confirmation.

#### 📁 Files Modified

- `components/email-marketing/subscribers/modals/ImportSubscriberModal.tsx`
- `components/contact/modal/ImportContactModal.tsx`
- `components/contact/modal/AddContactModal.tsx`

## [1.8.15] - 2026-02-27

### Detail Versi 1.8.15

#### ✉️ Enhanced Bulk Import with Custom Column Mapping

- **Import Subscribers Modal**: Enhanced with 3-step wizard and custom column mapping
  - Step 1: Upload Excel/CSV file with drag-and-drop
  - Step 2: Map columns with customizable field mapping UI
  - Step 3: Preview data before importing
  - Add custom fields dynamically (e.g., Gender, Company)
  - Combine multiple columns into Name field (first_name + last_name)
  - Fixed endpoint to `/api/proxy/subscribers/bulk`

- **Import Contact Modal**: Added same 3-step wizard with custom column mapping
  - Default fields: Name, Email, Phone Number, Position, Company, Address
  - Support for custom fields creation
  - Payload format: `{ "contacts": [...] }`
  - Uses `/api/proxy/contacts/bulk` endpoint

#### 🐛 Bug Fixes
- **Google Fonts**: Removed all Poppins font imports to fix build timeout issues on restricted networks
- **Localization**: Created custom LocalizedStrings implementation to replace react-localization dependency

#### 📁 Files Modified

- `components/email-marketing/subscribers/modals/ImportSubscriberModal.tsx`
- `components/contact/modal/ImportContactModal.tsx`
- `app/(auth)/forgot-password/verify-otp/page.tsx`
- `lib/utils/strings.ts`

## [1.8.14] - 2026-02-27

### Detail Versi 1.8.14

#### ✉️ Email Marketing - Bulk Import Subscribers

- **Import Subscribers Modal**: Added bulk import functionality for subscribers via Excel/CSV files
  - Drag-and-drop file upload with .xlsx and .csv support
  - Auto-mapping of columns (Name, Email, Phone Number)
  - Validation for required fields (Name and Email)
  - Support for both subscriber page and mailing list page imports
  - Uses `/subscribers/bulk` API endpoint with `target` parameter

- **Subscribers Page**: Added Import button next to Add Subscriber button
- **Mailing List Detail Page**: Added Import button to bulk add subscribers to specific mailing list

#### 📁 Files Created

- `components/email-marketing/subscribers/modals/ImportSubscriberModal.tsx`

#### 📁 Files Modified

- `components/email-marketing/subscribers/SubscribersTable.tsx`
- `components/email-marketing/subscribers/SubscribersClient.tsx`
- `app/email-marketing/mailing-lists/[id]/page.tsx`

## [1.8.13] - 2026-02-27

### Detail Versi 1.8.13

#### 🐛 Bug Fixes & UI Polish

- **Hamburger Button on Topbar**: Fixed an issue where the hamburger button on Topbar was showing double on all screen sizes. Now it is showing only one hamburger button on all screen sizes.

#### 📁 Files Modified

- `components/layout/Topbar.tsx`

## [1.8.12] - 2026-02-26

### Detail Versi 1.8.12

#### 🐛 Bug Fixes & UI Polish

- **WhatsApp Floating Button**: Fixed an issue where the WhatsApp floating button would briefly appear during the loading screen immediately after a successful login. The button is now strictly hidden for authenticated users to prevent this flash before redirection.

#### 📁 Files Modified

- `components/layout/AuthenticatedLayout.tsx`

## [1.8.11] - 2026-02-26

### Detail Versi 1.8.11

#### 🎨 Landing Page & UI Responsiveness

- **TrustedBy Section**: Overhauled the brand logos footer layout for mobile devices using a 2-column Grid. Ensured the last item centers dynamically if the total count is odd. Applied distinct custom sizing for targeted logos (Eckerd and Dribbble).
- **CTA & FAQ Components**: Refined vertical padding (`py`, `pb`) specifically for mobile viewports to ensure consistent and balanced spacing.
- **Footer Updates**: Improved the newsletter subscription form layout to be full-width and stacked vertically on small screens for better accessibility.
- **Company & Pricing**: Cleaned up redundant bottom margins on the CTA wrapper within the Company page and adjusted mobile vertical padding in the PricingTrial section.

#### 📁 Files Modified

- `components/layout/TrustedBy.tsx`
- `components/layout/CTA.tsx`
- `components/layout/FAQ.tsx`
- `components/layout/Footer.tsx`
- `components/company/CompanyClient.tsx`
- `components/price/PricingTrial.tsx`

## [1.8.10] - 2026-02-26

### Detail Versi 1.8.10

#### 📇 Contact Tasks

- **Status & Priority Badges**: Updated the `Task` interface to use strict union types for `priority` and `status`. Added color-coded priority badges (High: Red, Medium: Orange, Low: Green) below task descriptions for better visual hierarchy.
- **Task Status Icons**: Added UI support for the "in_progress" task status in the Contact Detail page, displaying a primary blue (`#5479EE`) circle icon with three dots (`MoreHorizontal`). Adjusted the status timeline line spacing.

#### 📁 Files Modified

- `components/contact/detail/sections/ContactTasks.tsx`
- `lib/models/types.ts`

## [1.8.9] - 2026-02-26

### Detail Versi 1.8.9

#### 📇 Contact Detail Page

- **Enhanced Loading & Empty States**: Upgraded the loading state to use a centered `CircularProgress` indicator and redesigned the empty state (contact not found) with a styled, descriptive container to improve user experience.

#### 📁 Files Modified

- `components/contact/detail/ContactDetailClient.tsx`

## [1.8.8] - 2026-02-26

### Detail Versi 1.8.8

#### 🧹 UI Component Cleanup & Refactoring

- **Component Standardization**: Replaced all usages of `Button` from `@/components/ui/button` with the more robust `AppButton` across the entire codebase to ensure UI consistency.
- **Removal of Unused Components**: Deleted unused UI components including `button`, `accordion`, `alert-dialog`, `alert`, `app-timepicker`, `aspect-ratio`, `custom-icon`, `native-select`, `progress`, `sheet`, and `use-mobile` to simplify the project structure and reduce bundle size.

#### 📁 Files Modified

- `components/ui/accordion.tsx` [DELETE]
- `components/ui/alert-dialog.tsx` [DELETE]
- `components/ui/alert.tsx` [DELETE]
- `components/ui/app-timepicker.tsx` [DELETE]
- `components/ui/aspect-ratio.tsx` [DELETE]
- `components/ui/button.tsx` [DELETE]
- `components/ui/custom-icon.tsx` [DELETE]
- `components/ui/native-select.tsx` [DELETE]
- `components/ui/progress.tsx` [DELETE]
- `components/ui/sheet.tsx` [DELETE]
- `components/ui/use-mobile.tsx` [DELETE]
- 14 other files modified to replace Button with AppButton.

## [1.8.7] - 2026-02-26

### Detail Versi 1.8.7

#### 📇 Contact Detail Page

- **Modular Contact Detail**: Refactored `ContactDetailClient.tsx` into smaller, manageable sections (`ContactHeader`, `ContactInfo`, `ContactTags`, `ContactNotes`, and `ContactTasks`) for improved code readability and maintainability.
- **State Management**: Moved local states specific to certain sections (e.g., note input state, active tabs) into their respective component modules.
- **UI Tweaks**: Updated the "Back" button styling on the Contact Detail page to use an `outline` variant with the `primary` theme color.
- **Code Clean Up**: Fixed Tailwind class naming convention warnings (`break-words` updated to `wrap-break-word`).

#### 📁 Files Modified

- `components/contact/detail/ContactDetailClient.tsx`
- `components/contact/detail/sections/ContactHeader.tsx` [NEW]
- `components/contact/detail/sections/ContactInfo.tsx` [NEW]
- `components/contact/detail/sections/ContactTags.tsx` [NEW]
- `components/contact/detail/sections/ContactNotes.tsx` [NEW]
- `components/contact/detail/sections/ContactTasks.tsx` [NEW]

## [1.8.6] - 2026-02-25

### Detail Versi 1.8.6

#### 🎫 Support Tickets
- **Modal Confirmation Fixes**: Adjusted the behavior of the confirmation popup in the Add Ticket and Edit Ticket modals. Clicking the "Cancel" button now immediately closes the modal without a prompt, while clicking on the backdrop (shadow area) or pressing Escape retains the confirmation popup to prevent accidental data loss.

#### 📁 Files Modified
- `components/support/tickets/modals/AddTicketModal.tsx`
- `components/support/tickets/modals/EditTicketModal.tsx`

## [1.8.5] - 2026-02-25

### Detail Versi 1.8.5

#### Subscription & Billing
- **Midtrans Billing Integration**: Implemented API endpoints for fetching billing plans (`GET /billings/plans`), fetching current billing status (`GET /billings/current`), and initiating plan checkouts (`POST /billings/checkout`) inside `lib/api/billings.ts`.
- **Dynamic Subscription UI**: Replaced static pricing tiers with real billing plans fetched from the backend. The active plan and cycle end date are now dynamically displayed. The "Upgrade" action will trigger the `checkoutBillingPlan` endpoint and redirect users to the Midtrans snap page.
- **Menu Relocation**: Moved the "My Subscription" / "Subscription / Billing" navigation link from the top-right profile dropdown menu to the main left `Sidebar` under the **ADMIN** section for better visibility.

## [1.8.4] - 2026-02-25

### Detail Versi 1.8.4

#### 🎯 Individual Intelligence - Bulk Selection

- **Select All Feature**: Added a "Select All" button in selection mode for bulk selection/deselection of individuals in the grid.

#### 📁 Files Modified

- `components/intelligence-individual/IndividualClient.tsx`

## [1.8.3] - 2026-02-26

### Detail Versi 1.8.3

#### Subscription & Billing

- **Payload Key Migration**: Standardized the login payload to use `plan_name` (formerly `subscription_status`) and began capturing `plan_expires_at` systematically.
- **My Subscription Page**: Created a newly dedicated `/subscription` page summarizing the user's active billing plan and account owner details.
- **Midtrans Prep**: Built up the upgrade and payment management layout explicitly designed with placeholders for upcoming Midtrans payment gateway integrations.
- **Profile Navigation**: Added a direct quick-link to the new Subscription management page within the top-right user profile dropdown menu, marked with a `CreditCard` icon.

#### 📇 Contact Management

- **Edit Contact Action**: Changed the primary destructive action in the Edit Contact modal from "Delete" to "Cancel" for safer UX. Clicking Cancel now immediately dismisses the modal without requiring secondary confirmation.
- **Search Debouncing**: Implemented a 500ms debounce guard on the search input to optimize network utilization.
- **Loading & Error Feedback**: Integrated `CircularProgress` and `notify` alert systems to provide clear status updates during data fetching and saving operations.

#### 📁 Files Modified

- `components/contact/modal/EditContactModal.tsx`
- `components/contact/ContactClient.tsx`

## [1.8.2] - 2026-02-25

### Detail Versi 1.8.2

#### 🎯 Individual Intelligence - Person Refinement
- **Person-based Grid**: Refactored the display logic to flatten the API response, ensuring every key person from a company is shown as an individual, selectable card.
- **Design Restoration**: Restored the original "Company Title" layout while maintaining a unique card per person, preserving visual consistency with existing designs.
- **Standardized UI**: Switched the selection checkbox to use the `AppInput` component for consistency with the rest of the application.
- **Data Integrity**: Verified the flattening logic to ensure 100% visibility of key people returned by the backend.

#### 📁 Files Modified

- `components/intelligence-individual/IndividualClient.tsx`
- `components/intelligence-individual/IndividualCard.tsx`

- **Payload Key Migration**: Standardized the login payload to use `plan_name` (formerly `subscription_status`) and began capturing `plan_expires_at` systematically.

#### Subscription & Billing

- **My Subscription Page**: Created a newly dedicated `/subscription` page summarizing the user's active billing plan and account owner details.
- **Midtrans Prep**: Built up the upgrade and payment management layout explicitly designed with placeholders for upcoming Midtrans payment gateway integrations.
- **Profile Navigation**: Added a direct quick-link to the new Subscription management page within the top-right user profile dropdown menu, marked with a `CreditCard` icon.

#### 📇 Contact Management

- **Edit Contact Action**: Changed the primary destructive action in the Edit Contact modal from "Delete" to "Cancel" for safer UX. Clicking Cancel now immediately dismisses the modal without requiring secondary confirmation.
- **Search Debouncing**: Implemented a 500ms debounce guard on the search input to optimize network utilization.
- **Loading & Error Feedback**: Integrated `CircularProgress` and `notify` alert systems to provide clear status updates during data fetching and saving operations.

#### 📁 Files Modified

- `components/contact/modal/EditContactModal.tsx`
- `components/contact/ContactClient.tsx`

#### 🎯 Individual Intelligence - Bulk Selection

- **Select All Feature**: Added a "Select All" button in selection mode for bulk selection/deselection of individuals in the grid.

## [1.8.1] - 2026-02-25

### Detail Versi 1.8.1

#### Subscription & Billing

- **My Subscription Page**: Created a newly dedicated `/subscription` page summarizing the user's active billing plan and account owner details.
- **Midtrans Prep**: Built up the upgrade and payment management layout explicitly designed with placeholders for upcoming Midtrans payment gateway integrations.
- **Profile Navigation**: Added a direct quick-link to the new Subscription management page within the top-right user profile dropdown menu, marked with a `CreditCard` icon.

#### 📇 Contact Management

- **Edit Contact Action**: Changed the primary destructive action in the Edit Contact modal from "Delete" to "Cancel" for safer UX. Clicking Cancel now immediately dismisses the modal without requiring secondary confirmation.
- **Search Debouncing**: Implemented a 500ms debounce guard on the search input to optimize network utilization.
- **Loading & Error Feedback**: Integrated `CircularProgress` and `notify` alert systems to provide clear status updates during data fetching and saving operations.

#### 📁 Files Modified

- `components/contact/modal/EditContactModal.tsx`
- `components/contact/ContactClient.tsx`

## [1.8.0] - 2026-02-25

### Detail Versi 1.8.0

#### 🎯 Data Intelligence - Individual Profiles

- **Real API Integration**: Successfully wired the Individual Intelligence page to the `/api/v1/company-intelligence/individual` endpoint, replacing all dummy data with real-time backend results.
- **Server-side Capabilities**: Implemented server-side pagination, text-based search, and multi-select filters for Industry and Location.
- **Save to CRM**: Added bulk "Save to CRM" functionality using the `/api/v1/company-intelligence/individual/save-to-contact` endpoint. Users can now select multiple key people across different companies and save them directly to their CRM in a single action.
- **Improved Data Display**: Refactored `IndividualCard` to elegantly handle the `key_people` array, displaying primary person details and indicating total person counts per company.
- **Industry Hierarchy**: Updated industry badges with responsive font scaling for better readability on smaller screens.

#### ⚡ Performance & Stability

- **Redundant Call Fix**: Resolved an issue where the API was being called three times on page load by stabilizing authentication and search debouncer dependencies.
- **Memoized Auth**: Wrapped `getToken` in `useCallback` within `AuthContext` to prevent cascading re-renders in consumer components.

####  Files Modified

- `components/intelligence-individual/IndividualClient.tsx`
- `components/intelligence-individual/IndividualCard.tsx`
- `lib/api/company-intelligence.ts`
- `lib/types/individual-intelligence.ts`
- `lib/context/AuthContext.tsx`
- `app/data-intelligence/individual/page.tsx`

## [1.7.8] - 2026-02-25

### Detail Versi 1.7.8

#### ✉️ Email Marketing & Campaigns

- **Campaign Stats Preview**: Added a live HTML preview of the campaign message directly alongside the delivery statistics in the "Campaign Statistics" modal for immediate visual review of drafted and sent campaigns.
- **Visual Builder State Preservation**: Fixed an issue where the Unlayer visual builder would lose its drag-and-drop design state after saving as a draft. The rich design JSON is now seamlessly embedded and hydrated from within the `html_content` payload.
- **Simple Editor Saving**: Fixed a race condition where saving a campaign from the Simple Editor tab would sometimes overwrite the content with an empty visual builder state.
- **Editor Default State**: Campaigns now always open in the "Editor Sederhana" (Simple Editor) tab by default. This ensures the Visual Builder's iframe fully mounts in the background before use, preventing empty canvas loads.

#### 📁 Files Modified

- `components/email-marketing/campaigns/EmailTabbedEditor.tsx`
- `components/email-marketing/campaigns/modals/AddCampaignModal.tsx`
- `components/email-marketing/campaigns/modals/EditCampaignModal.tsx`
- `components/email-marketing/campaigns/modals/ViewCampaignStatsModal.tsx`

## [1.7.7] - 2026-02-24

### Detail Versi 1.7.7

- **Campaign Editor Type**: Added support for `editor_type` tracking in `POST` and `PUT` payloads to differentiate between Simple Editor and Visual Builder.
- **Campaign Statistics**: Added a new popup view to visualize delivery statistics (Delivered, Opened, Clicked, Bounced) on the Campaigns table.
- **Mailing List Campaigns**: Implemented a new "Campaign Terkirim" tab fetching real data from `GET /mailing-lists/{mailing_list_id}/campaigns` replacing dummy states on the mailing list details page.

#### 📁 Files Modified

- `lib/api/email-marketing/mailing-lists.ts`
- `lib/hooks/useMailingLists.ts`
- `app/email-marketing/mailing-lists/[id]/page.tsx`
- `components/email-marketing/campaigns/CampaignsClient.tsx`
- `components/email-marketing/campaigns/modals/ViewCampaignStatsModal.tsx`

## [1.7.6] - 2026-02-24

### Detail Versi 1.7.6

#### 🏗️ Contact Module Architecture & Modularity

- **Sub-component Extraction**: Refactored `ContactClient.tsx` by extracting the toolbar and table logic into standalone components (`ContactToolbar.tsx` and `ContactTable.tsx`) to improve maintainability and readability.
- **Modal Organization**: Centralized all contact-related modals into a dedicated `components/contact/modal/` directory.
- **Naming Consistency**: Standardized modal filenames by appending the `Modal` suffix (e.g., `AddContactModal.tsx`, `EditContactModal.tsx`).
- **Dependency Resolution**: Updated all import references in the main contact page and detail page.
- **Import Fixes**: Resolved broken relative imports in the moved modal components by implementing absolute path aliases.

#### 📁 Files Modified

- `app/contact/detail/[id]/page.tsx`
- `components/contact/ContactClient.tsx`
- `components/contact/ContactTable.tsx` [NEW]
- `components/contact/ContactToolbar.tsx` [NEW]
- `components/contact/modal/AddContactModal.tsx` [MOVED/RENAMED]
- `components/contact/modal/AddTaskModal.tsx` [MOVED/RENAMED]
- `components/contact/modal/DeleteContactModal.tsx` [MOVED/RENAMED]
- `components/contact/modal/DeleteMultipleContactModal.tsx` [MOVED/RENAMED]
- `components/contact/modal/EditContactModal.tsx` [MOVED/RENAMED]
- `components/contact/modal/ImportContactModal.tsx` [MOVED/RENAMED]

## [1.7.5] - 2026-02-24

### Detail Versi 1.7.5

#### 🏗️ Contact Module Refactoring & UI Fixes

- **Architectural Cleanup**: Relocated all contact-related components from a generic `modal` folder to a dedicated `components/contact/` directory for better project structure.
- **New Contact Management**:
  - Introduced `ContactClient.tsx` to centralize contact list logic, searching, filtering, and bulk actions.
  - Refactored `app/contact/page.tsx` to utilize the new modular `ContactClient`.
- **Modal Overlay Standard**: Standardized modal overlays across contact management components to ensure full-screen coverage.
- **UI Consistency Fixes**:
  - Implemented **React Portals** for `ImportContactModal`, `EditContact`, and `DeleteContact` to fix backdrop truncation issues.
  - Standardized all contact modals to use a clean opaque backdrop without blur for optimal performance and design consistency.
  - Set universal `z-index: 9999` for all contact-related overlays.

#### 📁 Files Modified

- `app/contact/page.tsx`
- `app/contact/detail/[id]/page.tsx`
- `components/contact/ContactClient.tsx` [NEW]
- `components/contact/AddContact.tsx` [RENAMED]
- `components/contact/AddTaskModal.tsx` [RENAMED]
- `components/contact/DeleteContact.tsx` [RENAMED]
- `components/contact/DeleteMultipleContact.tsx` [RENAMED]
- `components/contact/DetailContact.tsx` [RENAMED]
- `components/contact/EditContact.tsx` [RENAMED]
- `components/contact/ImportContactModal.tsx` [RENAMED]

## [1.7.4] - 2026-02-24

### Detail Versi 1.7.4

#### ✨ Landing Page Enhancements & Global Setup

- **Global Constants**: Introduced `lib/constants/constants.tsx` to centralize business contact information (`NO_WA`, `EMAIL`).
- **WhatsApp Integration**:
  - **Conditional Rendering**: The WhatsApp floating button in `AuthenticatedLayout` is now restricted to landing routes (`/`, `/price`, `/company`) only.
  - **Dynamic Messaging**: Standardized WhatsApp redirect links in `Hero` and `PricingCards` to use the global `NO_WA` constant and include context-specific messages (e.g., product/plan name).
- **CTA & Forms**:
  - **Validation**: Added field validation to the CTA form; the submit button is now disabled until Name, Email, and Message are filled.
  - **Email Integration**: Updated the `mailto` link in the CTA component to use the new global `EMAIL` constant.
- **UI/UX Improvements**:
  - **Pricing Cards**: Refined price display logic for better readability.
  - **Company Hero**: Updated the "Hubungi Kami" button to link directly to the official Solvera contact page.

#### 📁 Files Modified

- `components/layout/AuthenticatedLayout.tsx`
- `components/company/CompanyHero.tsx`
- `components/home/Hero.tsx`
- `components/price/PricingCards.tsx`
- `components/layout/CTA.tsx`
- `lib/constants/constants.tsx` [NEW]

## [1.7.3] - 2026-02-24

### Detail Versi 1.7.3

#### 🏗️ Refactoring & Performance

- **Inbox Component Refactor**: Major architectural improvement of the Inbox system.
  - Split the massive `InboxClient.tsx` into clean, modular sub-components: `ChatSidebar`, `ChatHeader`, `MessageList`, `MessageItem`, `ChatInput`, `ContactList`, and `ChatModals`.
  - Extracted shared logic and state management into a dedicated `useChat` custom hook.
  - Improved code readability and maintainability by separating concerns.
- **UI/UX Improvements**:
  - **Auto-scroll**: Implemented automatic scrolling to the latest message on initial load and when receiving new messages.
  - **Selected Messages**: Improved selection logic and visual feedback in chat.
- **Bug Fixes & Optimizations**:
  - **Infinite Fetch Fix**: Resolved multiple infinite network fetching loops in the chat and notifications systems.
  - **API Fetch Optimization**: Reduced redundant `count` API calls by 66% through stabilization of the `AuthContext` and `getToken` function.
  - **Memoization**: Applied `useMemo` and `useCallback` to core providers and hooks to prevent cascading re-renders.

#### 📁 Files Modified

- `components/inbox/InboxClient.tsx`
- `components/inbox/MessageList.tsx`
- `components/inbox/MessageItem.tsx`
- `components/inbox/ChatSidebar.tsx`
- `components/inbox/ChatHeader.tsx`
- `components/inbox/ChatInput.tsx`
- `components/inbox/ContactList.tsx`
- `components/inbox/ChatModals.tsx`
- `lib/hooks/useChat.ts`
- `lib/context/AuthContext.tsx`
- `components/layout/Topbar.tsx`

## [1.7.2] - 2026-02-24

### Detail Versi 1.7.2

#### ✨ New Features & Improvements

- **Omnichannel Chat**: Added in-app image attachments preview with Next.js `Image`. Clicking on a chat image now seamlessly opens a full-screen lightbox modal instead of opening in a new tab. 
- **Next Config**: Whitelisted `vercel-storage.com` in `next.config.mjs` to support Next image optimization for message attachments.

#### 📁 Files Modified

- `components/omnichannel/MessageList.tsx`
- `next.config.mjs`
- `package.json`
- `package-lock.json`

## [1.7.1] - 2026-02-24

### Detail Versi 1.7.1

#### 🎨 UI/UX Improvements

- **Analytics Dashboard Cards**: Fixed an issue where the `CardStatistik` component's height was uneven and large numbers (like Average Deal Size) would wrap poorly or get cut off. Fixed applying `height: 100%`, `white-space: nowrap`, responsive font scaling, and text truncation (`text-overflow: ellipsis`) so cards align perfectly in grid view and big numbers always fit nicely.

#### 📁 Files Modified

- `components/ui/card-stat.tsx`
- `package.json`

## [1.7.0] - 2026-02-23

### Detail Versi 1.7.0

#### Added

- **Landing Page Refactor**: Completely redesigned the landing page with high-quality assets and responsive sections.
- **New Components**:
  - **Hero**: Interactive slider with localized content.
  - **Productivity**: Feature highlights with animations.
  - **Company**: New section for vision, mission, and story.
  - **Pricing**: Interactive pricing plan comparison.
  - **FAQ**: Categorized frequently asked questions.
  - **Footer**: Redesigned site footer with localized links.
  - **WhatsAppFloatingButton**: Quick access to customer support.
- **Localization**: Full support for Indonesian and English languages.
  - **LanguageContext**: for global state management.
  - **lib/utils/strings.ts**: for centralized translation strings.
- **Dependencies**:
  - **framer-motion**: for smooth UI animations.
  - **react-slick & slick-carousel**: for interactive sliders.
  - **react-localization**: for efficient string management.

#### Changed

- **Navbar**: Optimized for responsiveness. Added a mobile side drawer and interactive desktop dropdowns for "Product" and "Solution" menus.
- **Middleware**: Updated route protection to allow public access to landing, company, and price pages.
- **SEO**: Updated `RootLayout` with comprehensive meta tags, open graph support, and Poppins font integration.
- **Authentication Flow**: Updated redirection logic to handle new landing page routes.
- **Assets**:
  - Added multiple UI illustrations, logos, and icons for the new landing page sections.

## [1.6.21] - 2026-02-23

### Detail Versi 1.6.21

#### 📇 Contact Management

- **Phone Number Validation**: Removed format restrictions for phone number field
  - Removed minimum/maximum character length validation (10-15 characters)
  - Now accepts numbers and symbols (e.g., +, -, (, ), spaces, dots)
  - Still prevents letters/words from being entered
  - Supports international phone formats like +1-234-567-8900, (123) 456-7890, etc.
  - Applied to both Add Contact and Edit Contact modals

#### 💬 Omnichannel Communication System

- **Unified Inbox**: Implemented complete omnichannel communication platform
  - Multi-channel support for WhatsApp and Email in a single interface
  - Real-time conversation management with message history
  - Conversation list with unread count, last message preview, and timestamps
  - Custom time formatting utility to avoid external dependencies
  - **Real-time Updates**: Automatic polling for new messages and conversations
    - Inbox polls every 10 seconds for new conversations
    - Conversation view polls every 5 seconds for new messages
    - Supports webhook-based message delivery from WhatsApp/Email

- **Account Management**: 
  - Connect WhatsApp accounts via Twilio integration (phone number, account SID, auth token)
  - Connect Email accounts with Gmail IMAP/SMTP support (email, app password, display name)
  - Account list with delete functionality and confirmation modal
  - Settings page with tabbed interface for managing multiple accounts

- **Conversation Features**:
  - Message list with sent/received differentiation and timestamps
  - Message input with text and file upload support
  - Auto-scroll to latest messages
  - Mark conversations as read automatically
  - Delete conversation functionality
  - New conversation modal with dynamic fields based on channel type

- **API Integration**:
  - Complete API client with endpoints for accounts, inbox, conversations, and messages
  - React Query hooks for data fetching with proper cache invalidation
  - TypeScript type definitions for all data structures
  - Error handling with user-friendly notifications
  - Fixed API response parsing to handle nested data structures

- **Navigation**:
  - Omnichannel menu restored in sidebar with Unified Inbox submenu
  - Accessible from main navigation under Apps section

- **Bug Fixes**:
  - Fixed TypeScript errors in AccountList component (button props, modal imports)
  - Fixed ConversationView to handle both API field name variations (contact_name vs external_contact_name)
  - Fixed inbox data parsing to extract conversations from nested response structure
  - Added automatic refetch when navigating back to inbox from conversation

#### 🎨 Navigation

- **Sidebar Cleanup**: Removed unused Power icon import from Sidebar component

#### 📁 Files Modified
- `components/modal/AddContact.tsx`
- `components/modal/EditContact.tsx`
- `components/layout/Sidebar.tsx`
- `lib/hooks/useOmnichannel.ts`
- `lib/api/omnichannel.ts`
- `lib/types/omnichannel.ts`
- `components/omnichannel/AccountList.tsx`
- `components/omnichannel/ConversationView.tsx`
- `components/omnichannel/InboxList.tsx`

#### 📁 Files Created (Omnichannel)

- `lib/api/omnichannel.ts`
- `lib/hooks/useOmnichannel.ts`
- `lib/types/omnichannel.ts`
- `components/omnichannel/ConnectWhatsAppForm.tsx`
- `components/omnichannel/ConnectEmailForm.tsx`
- `components/omnichannel/AccountList.tsx`
- `components/omnichannel/InboxList.tsx`
- `components/omnichannel/NewConversationModal.tsx`
- `components/omnichannel/MessageList.tsx`
- `components/omnichannel/MessageInput.tsx`
- `components/omnichannel/ConversationView.tsx`
- `app/omnichannel/page.tsx`
- `app/omnichannel/settings/page.tsx`
- `app/omnichannel/conversations/[id]/page.tsx`

## [1.6.20] - 2026-02-20

### Detail Versi 1.6.20

#### 🎫 Support Tickets

- **Filter Improvements**: Enhanced filter dropdowns
  - Fixed placeholder text color to match other pages (gray instead of black)
  - Added "All Status" and "All Priority" options to clear filters
  - Consistent styling across all filter components

#### 📇 Contact Management

- **Table Layout**: Improved action column spacing
  - Increased right padding on Action column for better icon spacing
  - Trash and edit icons now have more breathing room from table edge

## [1.6.19] - 2026-02-20

### Detail Versi 1.6.19

#### 📇 Contact Management

- **Import Validation**: Enhanced Excel/CSV import validation
  - Name field is now required for all imported contacts
  - Rows without names are automatically skipped with warning notification
  - Shows count of skipped rows due to missing name field
  - Improved error messages for better user feedback

#### 🎨 Navigation

- **Sidebar Update**: Hidden Omnichannel section from sidebar navigation
  - Omnichannel and Unified Inbox menu items temporarily hidden

## [1.6.18] - 2026-02-20

### Detail Versi 1.6.18

#### 🎨 UI Components

- **AppAutocomplete Consistency**: Fixed height inconsistency between AppSelect and AppAutocomplete components
  - Changed from minHeight to fixed height of 40px to match AppSelect
  - Standardized border radius to 8px
  - Standardized font size to 14px and line height to 20px
  - Matched padding and border styles for consistent appearance
  - Fixes filter height mismatch in Support Tickets and other pages

#### 📇 Contact Management

- **Import Validation**: Enhanced Excel/CSV import validation
  - Name field is now required for all imported contacts
  - Rows without names are automatically skipped with warning notification
  - Shows count of skipped rows due to missing name field
  - Improved error messages for better user feedback

#### 🎨 Navigation

- **Sidebar Update**: Hidden Omnichannel section from sidebar navigation
  - Omnichannel and Unified Inbox menu items temporarily hidden

#### 🔧 Build & Deployment

- **Postinstall Script**: Updated to handle environments without git
  - Added `|| true` to git config command to prevent CI/CD failures
  - Allows builds to proceed in Docker containers without git installed

## [1.6.17] - 2026-02-20

### Detail Versi 1.6.17

#### 👥 User Management

- **Admin Level Option**: Added "Admin" as a level option in Add User and Edit User modals
  - Level dropdown now includes: Admin, Manager, Staff
- **Total Users Display**: Updated Manage Users statistics card
  - Changed "Session" label to "Total Users"
  - Now uses API stats data (`data.stats.total`, `data.stats.active`, `data.stats.pending`)
  - More efficient and accurate user count display

## [1.6.16] - 2026-02-20

### Detail Versi 1.6.16

#### 🎯 Data Intelligence & Company Management

- **Industry Leaders Search Caching**: Implemented client-side caching for industry leaders search results
  - Results are cached in sessionStorage after first search
  - Cache is cleared when clicking "Temukan Perusahaan" button for fresh search
  - Client-side filtering for instant search within cached results
- **Company Intelligence Profile**: Fixed key people and subsidiaries display
  - Now handles both raw_data and root-level data structures
  - Properly displays key people after saving company to CRM
- **Company Table Email Display**: Updated to show email addresses instead of "N/A"
  - Priority: email → domain → ticker → dash
- **Export Functionality**: Added export button to My Target Companies page
  - Export to CSV feature
  - Print functionality
  - Styled to match Manage Users page design

#### 📧 Email Marketing - Subscribers

- **Simplified Requirements**: Modified subscriber forms to require only Name and Email
  - Phone Number, Position, Company, and Address are now optional
  - Applied to both Add Subscriber and Edit Subscriber modals
  - Improved data flexibility for subscriber management

#### 🎨 UI/UX Improvements

- **Modal Backdrop Fix**: Fixed full-height backdrop for Add Contact modal
  - Ensures backdrop covers entire viewport on all screen sizes (1920x1080+)
  - Prevents body scroll when modal is open
- **Lead Management Enhancement**: Improved contact selection in Add New Leads
  - Name autocomplete now displays both contact name and company name
  - Format: "Contact Name - Company Name"
  - Prevents confusion when multiple contacts have the same name
  - Two-line dropdown display for better readability

#### 🔧 Configuration

- **Font Optimization**: Disabled Next.js font optimization to skip Google Fonts fetching
  - Resolves SSL certificate errors in corporate networks
  - Prevents build delays from font download failures

#### 📁 Files Modified

- `app/data-intelligence/industry-leaders/results/page.tsx`
- `app/data-intelligence/industry-leaders/page.tsx`
- `app/data-intelligence/industry-leaders/profile/[id]/page.tsx`
- `components/omnichannel/company/company-table/CompanyTable.tsx`
- `components/omnichannel/CompanyIntelligenceClient.tsx`
- `components/email-marketing/subscribers/modals/AddSubscriberModal.tsx`
- `components/email-marketing/subscribers/modals/EditSubscriberModal.tsx`
- `components/modal/AddContact.tsx`
- `components/lead-management/add-lead-form.tsx`
- `next.config.mjs`

## [1.6.15] - 2026-02-20

### Detail Versi 1.6.15

#### 🔐 Authentication

- **Login Feedback**: Optimized error handling in `LoginPage` to display specific backend error messages and increased the notification duration to 5 seconds for better readability.

#### 🏢 Organization

- **Department Management**: Temporarily removed the `manager_id` requirement and selection field from both "Add Department" and "Edit Department" modals.

#### 📁 Files Modified

- `app/(auth)/login/page.tsx`
- `components/organization/departments-modal/add-departments.tsx`
- `components/organization/departments-modal/edit-departments.tsx`
- `lib/api/departments.ts`
- `package.json`

## [1.6.14] - 2026-02-19

### Detail Versi 1.6.14

#### 👥 User Management & Modal Standardization

- **Modal Synchronization**: Aligned "Add User" and "Edit User" modals for a consistent look and feel (size, header styling, and grid layout).
- **Field Pairings**: Implemented logical side-by-side field arrangements (Email | Full Name, Employee ID | Department, Branch | Level, Role Access | Position).
- **Edit User Enhancements**:
  - Added "Employee ID" field.
  - Implemented dynamic "Position" selection based on the selected Department.
- **Stability**: Added defensive null checks for department and role data to resolve `Cannot read properties of null (reading 'department_name')` errors.

#### 📇 Contact Management Refinements

- **Simplified Requirements**: Modified "Add Contact" and "Edit Contact" flows to make only the **Name** field required.
- **Optional Fields**: Email, Phone Number, Company, and Position are now optional, providing more flexibility during data entry.
- **UI Clean Up**: Removed required asterisks from all non-name fields.

#### 🔐 Authentication & Profile UI

- **User Context Persistence**: Updated `AuthContext` to track and persist `userCompany` and `userSubscription` status in local storage.
- **Profile Dropdown Enhancements**:
  - Added **Company Name** display to the dropdown header.
  - Added a styled **Subscription Badge** (e.g., TRIAL, ACTIVE) next to the user's role.
  - Increased dropdown width (320px) and refined padding (2.5) for improved readability and a more premium feel.
  - Implemented ellipsis truncation for long email and company strings.

#### 📁 Files Modified

- `components/users/users-modal/add-users.tsx`
- `components/users/users-modal/edit-users.tsx`
- `components/modal/AddContact.tsx`
- `components/modal/EditContact.tsx`
- `components/layout/ProfileDropdown.tsx`
- `lib/context/AuthContext.tsx`
- `lib/api/users.ts`

## [1.6.13] - 2026-02-19

### Detail Versi 1.6.13

#### 🎯 "My Target Companies" & CRM Integration Refactor

- **"My Target Companies" Page Refactor:**
  - Renamed page title to "My Target Companies".
  - Implemented **Tab Navigation**: Added switcher for "Dashboard List" vs "Industry Leaders".
  - **Refactored Filters**: Moved filters (Industry, Location, Search, Export) to a single row and removed input labels for a cleaner, modern look.
  - **Table Updates**:
    - Removed "Insight Score" column to match design.
    - Added "Action" column with a delete button (placeholder functionality).
  - UI Clean Up: Removed boxed "Core Criteria" layout.

- **"Save to CRM" UX Enhancement:**
  - Replaced native `alert()` popups with premium `notify` toast notifications (`success` and `error`) across:
    - `Data Intelligence > Industry Leaders > Results Page`
    - `Data Intelligence > Industry Leaders > Profile Page`

#### 📁 Files Modified

- `components/omnichannel/CompanyIntelligenceClient.tsx`
- `components/omnichannel/company/company-table/CompanyTable.tsx`
- `app/data-intelligence/industry-leaders/results/page.tsx`
- `app/data-intelligence/industry-leaders/profile/[id]/page.tsx`
- `app/(auth)/login/page.tsx`

#### 🔗 API Integration

- **"My Target Companies" List:**
  - Integrated `getMyTargetCompanies` API endpoint (`/company-intelligence/my-target-companies`) to fetch dynamic company lists.
  - Updated `CompanyStats` to display real-time summary metrics from the API response.

#### 📁 Files Modified (API)

- `lib/api/company-intelligence.ts`
- `lib/types/company-intelligence.ts`
- `components/omnichannel/CompanyIntelligenceClient.tsx`
- `components/omnichannel/company/CompanyStats.tsx`

#### ✨ Features

- Added delete functionality to "My Target Companies" table with confirmation modal.
- Removed "ESTIMASI HASIL" count from Industry Leaders filter summary card.
- Removed "Export" button from "My Target Companies" page.
- Enabled row click navigation to company profile from "My Target Companies" list.
- Updated company profile to fetch details from target list when accessed via "My Target Companies".
- Added bulk delete functionality to "My Target Companies" list.
- Fixed issue where selected items remained checked after deletion.
- Updated "Department" dropdown options in "Add User" modal.
- Added "Employee ID" field to "Add User" modal.
- Refactored "Add User" modal to display all fields in a unified side-by-side grid layout.
- Fixed vertical alignment issue between Email and Full Name fields in "Add User" modal.
- Implemented dynamic "Position" dropdown options in "Add User" modal based on the selected "Department".
- Updated "Select Position" filter in User List with specific job titles (Brand Manager, Content Writer, etc.).
- Replaced "Finance" with "Customer Support" in Organization filters and "Add Department" modal.

#### 🐛 Bug Fixes

- Fixed `Cannot read properties of undefined (reading 'length')` error by adding defensive checks for API response data in `CompanyIntelligenceClient` and `CompanyTable`.
- Fixed `TypeError` in `getDynamicChipStyle` by handling undefined labels and adding fallback values for industry and financial status in `CompanyTable`.

## [1.6.12] - 2026-02-18

### Detail Versi 1.6.12

#### 🚀 Navigation & Component Restoration

- **Sidebar Integration:**
  - Restored **Omnichannel** (Unified Inbox) and **Data Intelligence** (Target Customer, Company, Individual) sections to the primary sidebar.
- **Company Profile Enhancements:**
  - Restored the **Recent Signals** section with its timeline view and "Add Signal" capabilities.
  - Implemented a robust **Company Document Management** system:
    - **PDF Upload:** New interface for uploading PDF documents (up to 10MB).
    - **Document Listing:** Dynamic fetching and display of company documents from the backend API.
    - **PDF Preview:** Integrated iframe-based PDF viewer with fallback states and "Open in New Tab" option.
    - **Standardized Deletion:** Integrated `ConfirmationPopup` for secure document removal.

#### 🔧 Infrastructure & Bug Fixes

- **WebSocket Connectivity:**
  - Implemented dynamic WebSocket URL resolution logic in the **Unified Inbox** to automatically derive protocol and host from `NEXT_PUBLIC_API_URL` when `NEXT_PUBLIC_WS_URL` is missing, resolving connection issues in production/Vercel environments.
- **Inbox UI Cleanup:**
  - Removed unused states and orphaned handlers to maintain a clean and performant codebase.

#### 📁 Files Modified

- `components/layout/Sidebar.tsx`
- `components/admin/CompanyProfileClient.tsx`
- `components/inbox/InboxClient.tsx`
- `lib/api/company-profile.ts`
- `lib/types/company-profile.ts`
- `components/omnichannel/company/detail-company/CompanyDocumentsCard.tsx`

## [1.6.11] - 2026-02-16

### Detail Versi 1.6.11

#### 🛠️ Error Handling & UX Improvements

- **Global Error Handling:**
  - Implemented `handleError` across **Notes** and **Tasks** modules to provide consistent and user-friendly error messages from backend responses.
  - Enhanced `getErrorMessage` utility to properly format field names by replacing underscores with spaces (e.g., `reminder_date` -> `reminder date`).

- **Note Management:**
  - **Default Reminder Date:** The "Add Note" modal now automatically pre-fills the reminder date with the current date, improving user convenience.

#### 📁 Files Modified

- `lib/utils/errorHandler.ts`
- `components/modal/AddNote.tsx`
- `components/modal/AddTaskModal.tsx`
- `components/modal/EditNote.tsx`
- `app/contact/detail/[id]/page.tsx`

## [1.6.10] - 2026-02-17

### Detail Versi 1.6.10

#### 🛠️ CI/CD Pipeline Optimization

- **Pipeline Structure:**
  - Consolidated build stages to remove redundant steps and improve execution efficiency.
  - Streamlined deployment workflow for faster release cycles.

#### 📁 Files Modified

- `.gitlab-ci.yml`
- `.gitlab-ci.yml.bak`

## [1.6.9] - 2026-02-16

### Detail Versi 1.6.9

#### 🏢 Company Profile API Response Alignment

- **Company Profile (Admin):**
  - Adjusted backend response mapping to match actual payload structure from `/internal/company-profile`:
    - `overview` (`name`, `headquarters`, `founded_year`, `status`)
    - `metrics` array (`total_employees`, `active_employees`, `departments_count`)
    - `key_people` list
    - `departments` list for organization summary
- **Key People API:**
  - Updated mapper to support `/internal/company-profile/key-people` response shape (`items` list).
  - Mapped `manage_user_id`, `full_name`, `manage_user_position`, and `department_branch` into UI model.
- **Result:**
  - Company Profile and Key People pages now render real backend fields consistently.
- **UI Cleanup:**
  - Removed the "AI Intelligence Summary" section from the admin Company Profile page.
- **About Field Mapping:**
  - Updated description fallback order to use `overview.about` first, then fallback to legacy fields/default message.

#### 📁 Files Modified

- `lib/api/company-profile.ts`
- `components/admin/CompanyProfileClient.tsx`
- `app/admin/company-profile/key-people/page.tsx`

## [1.6.8] - 2026-02-16

### Detail Versi 1.6.8

#### 🛠️ Proxy Auth & Redirect Handling

- **API Proxy (`/api/proxy/[...path]`):**
  - Added bearer token fallback from `access_token` cookie when `Authorization` header is missing.
  - Added manual redirect handling (`301/302/307/308`) to preserve auth headers across upstream redirects.
  - Improved proxy behavior for chat-related endpoints that previously returned `401` after redirect hops.

#### 👥 User Management Modal Improvements

- **Add User Modal:**
  - Added `Full Name` field and validation.
  - Updated field layout to match requested pairings:
    - Full Name + Department
    - Branch + Level
    - Role Access + Position
  - Included `fullname` in create payload.
- **Edit User Modal:**
  - Aligned form layout with Add User modal.
  - Added editable `Full Name` field and payload mapping.
  - Removed visible `Status` field from form UI to keep consistency with Add User flow.
- **User Detail (Eye) Modal:**
  - Replaced hardcoded values with API-backed data:
    - department, branch, level, position, role access.
  - Fixed Role Access mapping to use `role.role_name`.
  - Improved status badge mapping for case variations (`Active/active`, etc.).

#### 🎨 Sidebar Navigation Update

- **Admin Menu:**
  - Hid `Company Profile` menu item by commenting it out (not deleted), so it can be re-enabled easily.

#### 🏢 Company Profile Backend Integration

- **Company Profile (Admin):**
  - Integrated backend GET endpoints:
    - `/internal/company-profile`
    - `/internal/company-profile/key-people?page=1&limit=12`
    - `/internal/company-profile/organization-structure`
  - Added dynamic mapping for company overview, AI summary, key people list, and organization structure count.
  - Added new API and type modules for company profile domain.
- **Key People Navigation:**
  - Updated "View All Employees" from the company profile card to open admin company profile key-people route.
  - Added new page: `/admin/company-profile/key-people` with backend-powered key-people list and breadcrumb context under Company Profile.

#### 📚 Documentation Sync

- **README consistency fixes:**
  - Synced script list with `package.json` (`type-check`, `release`, `tag:delete`, etc.).
  - Updated framework version to match actual dependency (`Next.js 14.2.5`).
  - Added `BACKEND_URL` to required environment variables.
  - Updated lint troubleshooting command to `npx eslint . --fix`.

#### 📁 Files Modified

- `app/api/proxy/[...path]/route.ts`
- `components/users/users-modal/add-users.tsx`
- `components/users/users-modal/edit-users.tsx`
- `components/users/users-modal/detail-users.tsx`
- `components/layout/Sidebar.tsx`
- `lib/types/manage-users.ts`
- `components/admin/CompanyProfileClient.tsx`
- `components/omnichannel/company/detail-company/CompanyDetailStats.tsx`
- `components/omnichannel/company/detail-company/KeyPeopleCard.tsx`
- `components/omnichannel/company/detail-company/OrganizationStructureCard.tsx`
- `app/admin/company-profile/key-people/page.tsx`
- `lib/api/company-profile.ts`
- `lib/types/company-profile.ts`
- `README.md`

## [Release to Staging 2026-02-13]

---

## [1.6.7] - 2026-02-13

### Detail Versi 1.6.7

#### 🛠️ Bug Fixes & UI Improvements

- **Managed Users:**
  - Fixed can't delete user
- **Tickets Management:**
  - Fixed style input add ticket, change page header & fix error id ticket showing on modal delete.

#### 📁 Files Modified

- `components/users/UsersClient.tsx`
- `components/users/users-table.tsx`
- `components/support/tickets/TicketsClient.tsx`
- `app/support/tickets/page.tsx`

---

## [1.6.6] - 2026-02-13

### Detail Versi 1.6.6

#### 🛠️ Bug Fixes & UI Improvements

- **Mail Servers:**
  - Disabled the status change switch for system mail servers to prevent unauthorized configuration changes.
- **Departments Table:**
  - Fixed alignment styling issues to ensure visual consistency.

#### 📁 Files Modified
- `components/admin/mail-servers/MailServerClient.tsx`
- `components/organization/departments-table/DepartmentsTableList.tsx`

---

## [1.6.5] - 2026-02-13

### Detail Versi 1.6.5

#### 🛡️ Global Error Handling & Stability

- **Unified Error Handling:**
  - Integrated `handleError` utility across **Roles**, **Departments**, **Contacts**, and **Notes** modules.
  - Replaced generic error messages with specific feedback from the backend, ensuring users understand why an action failed (e.g., validation errors, duplication).

#### 👥 Role & Contact Management

- **Role Protection:**
  - Disabled **Edit** and **Delete** permissions for default system roles (**Admin**, **Manager**, **Staff**) to prevent accidental system lockouts.
  - Visual feedback added to disabled buttons with custom tooltips.
- **Data Safety:**
  - Implemented `ConfirmationPopup` for **Add Contact** and **Import Contact** modals.
  - Prevents accidental loss of filled data when closing the modal or clicking cancel.

#### 📁 Files Modified

- `components/roles/RolesClient.tsx`
- `components/roles/roles-modal/AddRoleModal.tsx`
- `components/roles/roles-table/RolesTable.tsx`
- `components/organization/OrganizationClient.tsx`
- `components/modal/AddContact.tsx`
- `components/modal/EditContact.tsx`
- `components/modal/ImportContactModal.tsx`
- `app/notes/page.tsx`

---

## [1.6.4] - 2026-02-13

### Detail Versi 1.6.4

#### 🔒 Profile Security & Account Management

- **Recent Devices Section:**
  - Integrated `/profile-security/profile/security/devices` endpoint to display active session information.
  - Added a responsive table showing Browser (with dynamic icons), Device, Location, and Recent Activity.
- **Account Deactivation Flow:**
  - Added a confirmation checkbox requirement to the account deactivation process for safety.
  - Standardized the "Deactivate Account" button styling in the "Delete Account" card.

#### 🏢 Organization Structure Enhancements

- **Manager Information:**
  - Updated `DepartmentsType` to include full manager profile data (`fullname`, `avatar_url`, `avatar_initial`).
  - Enhanced the Organization Structure table to display manager avatars and full names for better visual identification.
- **Search Optimization:**
  - Updated search functionality to prioritize Manager Name and ID, improving administrative efficiency.

#### 🎨 UI/UX & Technical Fixes

- **Spacing Refinement:**
  - Added consistent bottom padding to the Profile Settings container to improve page rhythm and prevent content overlap with footer elements.
- **Build Stability:**
  - Resolved "Unexpected token `div`" JSX syntax errors in `ProfileClient.tsx` and `ProfileUserSettingClient.tsx` by correcting return statements and React imports.

#### 📁 Files Modified

- `CHANGELOG.md`
- `components/organization/departments-table/DepartmentsTableList.tsx`
- `components/organization/OrganizationClient.tsx`
- `components/profile/ProfileClient.tsx`
- `components/profile-user-setting/ProfileUserSettingClient.tsx`
- `lib/types/Departments.ts`

---

## [1.6.3] - 2026-02-13

### Detail Versi 1.6.3

#### 🖨️ Print Functionality Refactor

- **Reusable Print Infrastructure:**
  - Introduced `PrintableTable` component to layout print views consistently.
  - Migrated from manual `window.open` + `document.write` to `react-to-print` for reliability.
  - Fixed issues where zero values were incorrectly displayed as dashes.

- **Module Updates:**
  - Standardized print functionality across **Contacts**, **Support Tickets**, **Company Intelligence**, **Organization**, and **User Management** modules.

#### 📁 Files Created

- `components/ui/printable-table.tsx`

#### 📁 Files Modified

- `app/contact/page.tsx`
- `app/support/tickets/page.tsx`
- `components/omnichannel/CompanyIntelligenceClient.tsx`
- `components/organization/OrganizationClient.tsx`
- `components/users/UsersClient.tsx`

---

## [1.6.2] - 2026-02-13

### Detail Versi 1.6.2

#### ✨ Universal Export Functionality

- **Module-wide Export:**
  - Implemented `ExportPopover` component across key system modules: **Support Tickets**, **Omnichannel**, **Organization (Departments)**, and **User Management**.
  - Users can now export table data directly from these pages for better data portability and reporting.

#### 🏢 Organization & Department Management

- **Enhanced Structure:**
  - Refactored Department management into dedicated sub-components (`DepartmentsTableList`, `DepartmentsTableFilter`) for better maintainability and performance.
  - Improved "Add Department" and "Department Info" modals for a smoother user experience.
  - Updated API (`lib/api/departments.ts`) and hooks (`useDepartments`) to support these UI improvements.

#### 👥 User & Role Management

- **User Management Enhancements:**
  - Refined User Management UI with updated `TableListUsers` and `UsersClient`.
  - Upgraded "Add User" and "User Detail" modals.
  - Improved User interaction statistics with `card-stat-user` updates.
- **Role Permissions:**
  - Enhanced UX for editing and deleting role permissions (`EditPermissionsButton`, `DeleteRolesPermissionsButton`).

#### ♻️ UI Standardization & Refactor

- **Table Consistency:**
  - Standardized table implementations in **Email Marketing** (Campaigns, Mailing Lists, Subscribers), **Products**, and **Support Tickets**.
- **Component Updates:**
  - Updated `card-stat` and `app-action-buttons-table` for consistent styling and behavior across the application.

#### 📁 Files Created

- `app/support/tickets/ExportPopover.tsx`
- `components/omnichannel/ExportPopover.tsx`
- `components/organization/ExportPopover.tsx`
- `components/users/ExportPopover.tsx`
- `components/ui/app-action-buttons-table.tsx`

#### 📁 Highlights of Modified Files

- `components/users/UsersClient.tsx`
- `components/organization/OrganizationClient.tsx`
- `lib/api/departments.ts`

---

## [1.6.1] - 2026-02-12

### Detail Versi 1.6.1

#### ✨ Notification System & Profile Enhancements

- **Integrated Notification System:**
  - **Real-time Data:** Replaced mock notifications with real backend data using `/notifications` and `/notifications/unread-count` endpoints.
  - **Read Status Management:** Implemented "Mark as Read" (individual) and "Mark All as Read" functionalities hitting backend `PATCH` endpoints.
  - **Dynamic UI:** Added a live unread count badge to the Topbar and unread highlights (bold text/blue background) in both the modal and main page.
  - **Filtering:** Added an "Only show unread" toggle on the `/notifications` page for better user focus.

- **Profile & Avatar Management:**
  - **Binary Avatar Upload:** Implemented new `uploadAvatar` API to support binary image uploads to `/user-profile/avatar`.
  - **Unified Save Flow:** Integrated avatar upload directly into the "Save Changes" workflow in Profile Settings.
  - **Premium Notifications:** Migrated all profile-related success and error messages to use the standard `notify` utility for a consistent, premium UI experience.

- **Technical Fixes:**
  - **Proxy Configuration:** Updated `BACKEND_URL` environment variable usage in `route.ts` and `next.config.mjs` for better Vercel compatibility.
  - **Robust API Parsing:** Enhanced API layers to handle nested `data.notifications` structures and various unread count field names.
  - **Bug Fix:** Resolved a `ReferenceError` in `NotificationItem` caused by missing prop destructuring.

#### 📁 Files Modified

- `lib/api/notifications.ts` - New read status API functions & response standardization.
- `lib/api/users.ts` - New avatar upload API and profile update refinements.
- `components/modal/Notification.tsx` - Backend integration & UI fixes.
- `app/notifications/page.tsx` - Full backend sync & filtering logic.
- `components/profile-user-setting/ProfileUserSettingClient.tsx` - Avatar upload & notify integration.
- `components/layout/Topbar.tsx` - Dynamic unread count fetching.
- `app/api/proxy/[...path]/route.ts` - Env variable alignment.
- `next.config.mjs` - Proxy rewrite stability fix.
## [1.6.0] - 2026-02-12

### Detail Versi 1.6.0

#### ✨ Mail Server Management Overhaul

- **Updated Status Management:**
  - **Status Switch:** Replaced the "Priority" column with an interactive "Status" switch. Users can now toggle mail servers between `Active` and `Inactive` directly from the list, with immediate visual feedback and API synchronization.
  - **Refined Loading State:** Status toggle loading indicator is now scoped to the specific row being updated, ensuring other rows remain interactive.

- **Enhanced CRUD Operations:**
  - **Delete Functionality:** Implemented a dedicated delete confirmation modal with robust error handling to prevent accidental data loss and inform users of dependency constraints.
  - **Refined Edit Modal:** Standardized the `EditMailServerModal` to match the "Add New" experience, including making the password field optional during updates.
  - **Connection Testing:** Added a "Test Connection" feature directly in the mail server list, allowing users to verify SMTP configurations without sending actual emails.
  - **Connection Logs:** Implemented a log viewer modal to display detailed results of connection tests, including error codes and timestamps.

- **Robust Error Handling:**
  - **Structured Error Support:** Improved the API client to correctly parse and display structured error messages from the backend, providing users with clear, actionable feedback instead of generic error alerts.

#### 📁 Files Modified

- `app/admin/mail-servers/page.tsx`
- `lib/api/mail-servers.ts`
- `lib/hooks/useMailServers.ts`
- `components/admin/mail-servers/AddMailServerModal.tsx`
- `components/admin/mail-servers/EditMailServerModal.tsx`
- `components/admin/mail-servers/DeleteMailServerModal.tsx`
- `components/admin/mail-servers/ConnectionStatusModal.tsx`
- `package.json`

---

## [1.5.2] - 2026-02-11

### Detail Versi 1.5.2

#### ✨ General Enhancements & Bug Fixes

- **Contact Management:**
  - **CSV Export:** Fixed `phone` and `position` column mapping in Contact CSV export to ensure accurate data validation.
  - **Import Validation:** Improved error handling in `ImportContactModal` to display specific validation messages from the backend (e.g., duplicate emails).
  - **Phone Validation:** Implemented strict numeric input, length validation (10-15 digits), and real-time error feedback in `AddContact` and `EditContact` modals.
  - **Print Layout:** Refined the "Print Contact List" feature with a clean HTML table layout, branding header, and improved readability.

- **Note & Task Management:**
  - **Time Picker Upgrade:** Replaced legacy time pickers with `StaticTimePicker` in `AddNote`, `EditNote`, and `AddTaskModal` for a consistent 24-hour format and better user experience.
  - **Legacy Support:** Added fallback parsing for legacy time formats (e.g., "09:30 AM") in `EditNote` to prevent errors when editing older notes.

- **Technical Fixes:**
  - **Date Adapter:** Resolved version mismatch between `@mui/x-date-pickers` and `date-fns` v3 by switching to `AdapterDateFnsV3`.
  - **Type Safety:** Enhanced type definitions for contact export and import structures.

#### 📁 Files Modified

- `app/contact/page.tsx`
- `components/modal/ImportContactModal.tsx`
- `components/modal/AddContact.tsx`
- `components/modal/EditContact.tsx`
- `components/modal/AddNote.tsx`
- `components/modal/EditNote.tsx`
- `components/modal/AddTaskModal.tsx`
- `package.json`

---

## [1.5.2] - 2026-02-11

### Detail Versi 1.5.2

#### ✨ Analytics Dashboard Enhancements

- **Universal Date Filter:**
  - Added comprehensive filtering system with Date Range Picker, Format Selection (CSV/Excel), and Quick Filters (Last 30 Days / This Month).
  - Integrated filter logic with all analytics charts and summaries.

- **Team Performance Overview:**
  - Restored "Team Performance" section with its own independent date range picker.
  - Replaced the temporary "Product Performance" view in this section to align with user requirements.

- **Sales Trend Insights:**
  - Added per-person total sales summary above the chart for quick comparison.
  - Applied consistent "Rupiah" formatting to Y-axis (compact) and Tooltips (full currency) for better readability.

- **UX Improvements:**
  - Implemented `maxDate={new Date()}` on all date pickers (Dashboard & Analytics) to prevent future date selection.
  - Improved chart legends and visual hierarchy.

#### 📁 Files Modified

- `components/analytics/AnalyticsDashboardClient.tsx`
- `components/dashboard/DashboardClient.tsx`
- `components/ui/app-datepicker.tsx`

---
## [1.5.1] - 2026-02-10


### Detail Versi 1.5.1

#### ✨ Feature Enhancements & Bug Fixes

- **Confirmation Dialogs:**
  - Standardized all destructive actions (like lead deletion) and form discards to use the new red danger-themed `ConfirmationPopup`.
  - Replaced browser-native `confirm()` and generic warning modals in Lead Detail, Add Lead, and Pipeline Detail for a premium, consistent feel.

- **Quotation Builder:**
  - Improved the discount field: switched to a text input with an automatic "%" symbol for better precision and alignment.
  - Aligned the "Notes" and "Discount" fields perfectly within the product table rows.
  - Simplified the interface by removing the "Include All Products" toggle and automatically merging lead items with the global product list.

- **Pipeline & Type Safety:**
  - Fixed a TypeScript error where `avatar_initial` was required in `DealCardProps` but could be undefined.
  - Globalized absolute imports for `ConfirmationPopup` to prevent build issues.

#### 📁 Files Modified

- `components/lead-management/lead-management-table/kanban-view.tsx`
- `components/pipeline/AddDealModal.tsx`
- `components/quotation/ProductsServicesTable.tsx`
- `components/quotation/QuotationFormClient.tsx`
- `lib/types/Pipeline.ts`

---

## [1.5.0] - 2026-02-10

### Detail Versi 1.5.0

#### ✨ Feature Enhancements & Bug Fixes

- **Authentication & Core UI:**
  - Fixed Auth response parsing to correctly handle nested `role` and `company` fields.
  - Improved profile dropdown to display real-time user role from auth context.
  - Persisted user role and company in `localStorage` for UI consistency and faster loading.

- **Product Management:**
  - Implemented smart SKU generation logic: abbreviations for single-word companies (e.g., SOL) and acronyms for multi-word companies (e.g., SGT).
  - Integrated `notify` system for all Product CRUD actions (Create, Update, Delete).

- **Support Tickets:**
  - Upgraded agent selection and filtering to use `AppAutocomplete` for a smoother research/selection experience.
  - Integrated dynamic agent fetching from the new `/tickets/assignable-agents` endpoint.
  - Fixed "Unassigned" agent display by correctly mapping nested `assigned_agent` objects.

- **Quotation Module:**
  - Added "Include All Products" toggle in product selection for better flexibility.
  - Refined product selection to prioritize lead-specific items by default, reducing manual search time.
  - Added support for `item_others` to allow custom entries in quotations.
  - Implemented Quotation Success Modal with Copy Link, View Quotation, and PDF download features.
  - Standardized Quotation status filters for consistent search performance.

- **Lead & Contact Management:**
  - Implemented dynamic, debounced search for Lead Name field in "Add Lead" form, fetching results directly from the contacts API.
  - Added safety client-side filtering for Contact search results to ensure high-relevance matches (e.g., filtering out "Contoh Nama" for specific searches like "afif").
  - Standardized Pipeline/Lead/Ticket filters to use consistent `AppAutocomplete` and `AppSelect` components.
  - Fixed Contact table search logic to correctly filter by name, email, and company.

- **Unified Inbox & Routing:**
  - Fixed Omnichannel routing logic to ensure unified inbox correctly handles incoming messages from different sources.

#### ♻️ Refactor

- **State Management:** Consolidated fetching logic in various modules to reduce redundant API calls.
- **UI Components:** Standardized buttons to `AppButton` and selects to `AppSelect/AppAutocomplete` across major modules for a premium look and feel.

#### 📁 Highlights of Modified Files

- `lib/context/AuthContext.tsx` - Auth response fix and localStorage persistence
- `components/lead-management/add-lead-form.tsx` - Dynamic contact search integration
- `components/quotation/QuotationFormClient.tsx` - Lead-aware product selection
- `components/quotation/ProductsServicesTable.tsx` - "Include All Products" toggle
- `components/support/tickets/TicketForm.tsx` - Dynamic agent autocomplete
- `components/product/AddProductModal.tsx` - Smart SKU generation logic
- `lib/hooks/useContacts.ts` - Search parameter support
- `lib/hooks/useAssignableAgents.ts` - New hook for dynamic agent fetching

### Added

- Initial project setup placeholder

---

## [1.5.0] - 2026-02-10

### Detail Versi 1.5.0

#### ✨ Fitur Baru: Sales Dashboard

- **Deskripsi:**
  - **Sales Dashboard Page:** Implementasi halaman Sales Dashboard (`/dashboard`) dengan integrasi penuh ke backend API (`/api/v1/sales/dashboard/*`).
  - **Stat Cards:** Menampilkan Total Sales Value, Top Deals Value, dan Average Deal Size dengan growth indicator (trend up/down) dan formatting Rupiah.
  - **Sales Funnel Chart:** Bar chart distribusi pipeline per stage (Prospect, Qualified, Negotiation, Proposal, Closed-Won, Closed-Lost) dengan toggle **Weekly/Monthly** yang memanfaatkan parameter `group_by` dari backend API.
  - **Product Performance Chart:** Horizontal bar chart menampilkan top 10 produk berdasarkan value, dengan **independent date range filter** menggunakan `AppDatePicker` component.
  - **Top Deals Table:** Tabel 5 deal terbesar dengan kolom Date, Salesperson, Customer, Deal Value, dan Status badge berwarna.
  - **Global Filters:** Date range picker dan quick filter (Last 30 Days / This Month) untuk filtering data dashboard secara keseluruhan.
  - **Export Feature:** Export data dashboard ke CSV atau Excel (client-side conversion menggunakan `xlsx` library).
  - **API Service:** `lib/api/sales-dashboard.ts` baru dengan type definitions (`DashboardSummary`, `FunnelPeriodData`, `ProductItem`, `TopDealItem`) dan fungsi API (`fetchDashboardSummary`, `fetchSalesFunnel`, `fetchProductPerformance`, `fetchTopDeals`, `exportDashboard`).
  - **Impact:** Memberikan overview performa sales secara visual dan interaktif untuk Supervisor dan Manager.

#### 🎨 UI/UX Enhancement

- **Deskripsi:**
  - **AppDatePicker Fix:** Memperbaiki TypeScript error pada `CustomPickersDay` component dengan proper type casting.
  - **Card Stat Icons:** Update icon stat cards menggunakan Lucide React icons (`UsersRound`, `UserRoundCheck`, `UserRoundSearch`).
  - **Responsive Layout:** Dashboard layout yang responsif dengan Material UI Grid system.
  - **Number Formatting:** Compact notation untuk angka besar dengan tooltip untuk detail lengkap.

#### 📁 Files Created

- `lib/api/sales-dashboard.ts` - API service dan type definitions untuk Sales Dashboard

#### 📁 Files Modified

- `components/dashboard/DashboardClient.tsx` - Implementasi lengkap Sales Dashboard client component
- `components/ui/app-datepicker.tsx` - Fix TypeScript error pada CustomPickersDay
- `components/ui/card-stat.tsx` - Penyesuaian untuk icon baru
- `app/dashboard/page.tsx` - Halaman dashboard dengan banner

---

## [1.4.3] - 2026-02-11

### Detail Versi 1.4.3

#### ✨ Peningkatan UI

- **Notification System:**
  - **Halaman Notifikasi:** Menambahkan halaman baru `/notifications` untuk melihat semua notifikasi dengan filter "Only show unread" dan pengelompokan tanggal (Today, Yesterday).
  - **Overlay Fix:** Memperbaiki masalah overlay notifikasi sidebar dengan menggunakan `React Portal` dan `z-index: 1300`, memastikan modal tampil di atas semua elemen UI.

- **User Profile & Settings:**
  - **UI Refinement:** Mengganti header manual dengan komponen `PageHeader` yang standar pada halaman Profile dan Profile Settings.
  - **Component Standardization:** Mengganti input native/lama dengan `AppInput` dan `AppSelect` yang memiliki prop `isBgWhite` untuk konsistensi visual.
  - **Action Buttons:** Memperbarui tombol aksi menggunakan `AppButton` standar.

#### 📁 Files Modified

- `components/modal/Notification.tsx` - Implementasi React Portal dan fix z-index.
- `app/notifications/page.tsx` - Halaman baru notifikasi.
- `components/profile/ProfileClient.tsx` - Implementasi PageHeader & AppButton.
- `components/profile-user-setting/ProfileUserSettingClient.tsx` - Implementasi PageHeader & AppInput standardization.

---

## [1.4.2] - 2026-02-09

### Detail Versi 1.4.2

#### ✨ Quotation Leads API Integration & UX Enhancements

- **Quotation Leads API:**
  - Implemented unified `/api/v1/quotations/lead` endpoint for combined lead, contact, and product data.
  - Created new TypeScript interfaces: `QuotationLeadItem`, `QuotationLead`, and `QuotationLeadsResponse` in `lib/api/quotations.ts`.
  - Implemented `fetchQuotationLeads()` API function with search parameter support.
  - Created `useQuotationLeads` React Query hook with server-side search functionality.
  - Replaced separate API calls (`/leads`, `/contacts`, `/products`) with single unified endpoint, reducing network requests by 66%.

- **Client Name Field:**
  - Replaced `AppSelect` with `AppAutocomplete` for searchable client name selection.
  - Implemented server-side search with 300ms debounce to prevent excessive API calls.
  - Added `filterOptions` to disable client-side filtering and use server-filtered results.
  - Added `getOptionKey` to use unique lead IDs as keys, fixing duplicate key warnings for leads with same contact names.

- **SKU Dropdown:**
  - Implemented contextual placeholder messages based on application state:
    - "Please select client name first" when no client is selected.
    - "No Products" when client has no products.
    - "Select SKU" when products are available.
  - Disabled SKU dropdown until a client is selected.
  - Products now derived directly from selected lead's items instead of separate product store.

- **Salesperson Field:**
  - Changed from hardcoded value to auto-populated from selected lead's `user.fullname`.
  - Made field read-only (disabled) to prevent manual editing.
  - Updated placeholder to "Select client to view salesperson".

- **Data Intelligence - Target Customer:**
  - Renamed "Industry Leader" to "Target Customer" in sidebar navigation.
  - Moved Target Customer to the top of Data Intelligence section for better visibility.
  - Updated page headers in `/data-intelligence/industry-leaders` to use `PageHeader` component.
  - Updated page headers in `/data-intelligence/industry-leaders/results` to use `PageHeader` component.

#### ♻️ Refactor

- **Quotation Form State Management:**
  - Removed `useGetProductStore` hook and separate product fetching logic.
  - Consolidated salesperson into `clientData` state object.
  - Improved state initialization and data flow in `QuotationFormClient`.

#### 📁 Files Modified

- `lib/api/quotations.ts` - Added quotation leads types and API function
- `lib/hooks/useQuotationLeads.ts` - New hook for quotation leads
- `components/quotation/QuotationFormClient.tsx` - Integrated new API and removed product store
- `components/quotation/ClientDetailForm.tsx` - Added autocomplete with search
- `components/quotation/ProductsServicesTable.tsx` - Added contextual empty states

---

## [1.4.1] - 2026-02-09

### Detail Versi 1.4.1

#### Revert

- **InboxClient:**
  - Revert InboxClient to state before post-deploy modifications.

---

## [1.4.0] - 2026-02-06

### Detail Versi 1.4.0

#### ✨ Fitur Baru

- **Inbox & Chat Client:**
  - Implementasi inbox dan chat client lengkap dengan fitur real-time messaging, voice notes, dan integrasi API.

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
