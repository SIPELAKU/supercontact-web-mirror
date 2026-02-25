# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
## [1.8.2] - 2026-02-26

### Detail Versi 1.8.2

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
