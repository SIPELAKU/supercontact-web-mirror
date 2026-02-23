# Implementation Tasks: Omnichannel Communication System

## 1. Setup and Infrastructure

- [x] 1.1 Create API client module (lib/api/omnichannel.ts)
  - Implement all API client functions for accounts, inbox, conversations, and messages
  - Add proper TypeScript types for requests and responses
  - Include error handling for all API calls

- [x] 1.2 Create React Query hooks (lib/hooks/useOmnichannel.ts)
  - Implement hooks for account management (useAccounts, useConnectWhatsApp, useConnectEmail, useDeleteAccount)
  - Implement hooks for inbox (useInbox, useCreateConversation)
  - Implement hooks for conversations (useConversation, useDeleteConversation, useMarkAsRead)
  - Implement hooks for messages (useSendMessage, useUploadMedia)
  - Implement hook for email refresh (useRefreshEmail)
  - Configure proper cache invalidation for all mutations

- [x] 1.3 Create TypeScript type definitions
  - Define Account, Conversation, Message interfaces
  - Define all request/response types
  - Add types to lib/types/ directory

## 2. Account Management Pages

- [x] 2.1 Create account settings page (app/omnichannel/settings/page.tsx)
  - Create page layout with tabs for WhatsApp and Email
  - Display AccountList component
  - Add navigation back to inbox
  - Include loading and error states

- [x] 2.2 Create ConnectWhatsAppForm component
  - Build form with phone_number, twilio_account_sid, twilio_auth_token fields
  - Add form validation for required fields
  - Implement submission with useConnectWhatsApp hook
  - Show success/error notifications
  - Reset form on success

- [x] 2.3 Create ConnectEmailForm component
  - Build form with email, app_password, display_name fields
  - Add link to Google App Password setup page
  - Check for existing email account and disable form if limit reached
  - Add form validation for required fields
  - Implement submission with useConnectEmail hook (include hardcoded IMAP/SMTP settings)
  - Show success/error notifications
  - Reset form on success

- [x] 2.4 Create AccountList component
  - Fetch accounts using useAccounts hook
  - Display account cards with channel icon, identifier, display name, and status
  - Add delete button for each account with confirmation dialog
  - Implement delete functionality with useDeleteAccount hook
  - Show loading skeleton while fetching
  - Handle empty state (no accounts connected)

## 3. Unified Inbox

- [x] 3.1 Create main omnichannel inbox page (app/omnichannel/page.tsx)
  - Create page layout with header and filters
  - Add "New Conversation" button
  - Add "Settings" button to navigate to account management
  - Add "Refresh Email" button for email sync
  - Display InboxList component
  - Include loading and error states

- [x] 3.2 Create InboxList component
  - Fetch conversations using useInbox hook
  - Add filter controls for channel type (All, WhatsApp, Email)
  - Add filter controls for status (All, Open, Closed, Archived)
  - Display conversation cards with contact name, last message preview, unread badge, timestamp, and channel icon
  - Implement click navigation to conversation detail
  - Show empty state when no conversations exist
  - Show loading skeleton while fetching

- [x] 3.3 Create NewConversationModal component
  - Build modal with account selector dropdown
  - Add fields: to (phone/email), name, subject (email only), message (optional)
  - Show/hide subject field based on selected account channel type
  - Add form validation (require subject for email conversations)
  - Implement submission with useCreateConversation hook
  - Navigate to new conversation on success
  - Show error notification on failure

## 4. Conversation Management

- [ ] 4.1 Create conversation detail page (app/omnichannel/conversations/[id]/page.tsx)
  - Create page layout with conversation header
  - Display contact name and channel type
  - Add "Mark as Read" button
  - Add "Delete Conversation" button with confirmation
  - Display MessageList component
  - Display MessageInput component
  - Auto-mark as read when page loads
  - Include loading and error states

- [x] 4.2 Create ConversationView component
  - Fetch conversation using useConversation hook
  - Display conversation metadata (contact info, status)
  - Render MessageList with conversation messages
  - Render MessageInput for sending messages
  - Implement mark as read with useMarkAsRead hook
  - Implement delete conversation with useDeleteConversation hook
  - Handle navigation back to inbox after deletion

- [x] 4.3 Create MessageList component
  - Display messages in chronological order
  - Differentiate sent vs received messages (alignment, colors)
  - Show timestamp for each message
  - Display media attachments (images, documents)
  - Auto-scroll to latest message on load and new messages
  - Show message status indicators (sent, delivered, read, failed)
  - Handle empty state (no messages yet)

- [x] 4.4 Create MessageInput component
  - Build text input for message content
  - Add file upload button for media
  - Validate message is not empty before sending
  - Implement send message with useSendMessage hook
  - Implement media upload with useUploadMedia hook
  - Clear input after successful send
  - Disable input while submitting
  - Show error notification on failure

- [ ] 4.5 Create MediaUpload component
  - Accept file selection via input or drag-and-drop
  - Validate file type and size
  - Show upload progress indicator
  - Call useUploadMedia hook with multipart/form-data
  - Return media URL on success
  - Show error notification on failure

## 5. Testing

- [ ] 5.1 Write unit tests for API client functions
  - Test all API functions with mocked responses
  - Test error handling for different HTTP status codes
  - Test request payload structure

- [ ] 5.2 Write unit tests for React Query hooks
  - Test query hooks with mocked data
  - Test mutation hooks with success/error scenarios
  - Test cache invalidation after mutations

- [ ] 5.3 Write unit tests for form components
  - Test ConnectWhatsAppForm validation and submission
  - Test ConnectEmailForm validation and submission
  - Test NewConversationModal validation and submission
  - Test MessageInput validation and submission

- [ ] 5.4 Write unit tests for display components
  - Test AccountList rendering and interactions
  - Test InboxList rendering and filtering
  - Test ConversationView rendering
  - Test MessageList rendering

- [ ] 5.5 Write property-based tests for form validation (Property 1)
  - Generate random form states with missing fields
  - Verify validation errors appear for all missing required fields
  - Test across all forms (WhatsApp, Email, Conversation)

- [ ] 5.6 Write property-based tests for API payload structure (Properties 2-3)
  - Generate random WhatsApp credentials
  - Verify API payload includes all required fields
  - Generate random Email credentials
  - Verify API payload includes hardcoded IMAP/SMTP settings

- [ ] 5.7 Write property-based tests for API responses (Property 4)
  - Generate random API responses
  - Verify all required fields are present in responses
  - Test across all API endpoints

- [ ] 5.8 Write property-based tests for email account limit (Property 5)
  - Test multiple email account creation attempts
  - Verify second attempt is rejected

- [ ] 5.9 Write property-based tests for filtering (Properties 6, 9)
  - Generate random account lists
  - Verify channel type filtering works correctly
  - Generate random conversation lists
  - Verify channel type and status filtering work correctly

- [ ] 5.10 Write property-based tests for CRUD operations (Properties 7, 13, 14, 15)
  - Test account deletion removes account from list
  - Test conversation retrieval includes all data
  - Test mark as read updates unread count
  - Test message sending adds message to conversation

- [ ] 5.11 Write property-based tests for UI states (Properties 18-20)
  - Verify loading states appear during operations
  - Verify success notifications appear after successful operations
  - Verify error notifications appear after failed operations

- [ ] 5.12 Write property-based tests for cache behavior (Properties 21-22)
  - Verify cache invalidation after mutations
  - Verify cache reuse for repeated queries

## 6. Integration and Polish

- [ ] 6.1 Add navigation menu item for Omnichannel
  - Update sidebar navigation to include Omnichannel link
  - Add appropriate icon for Omnichannel

- [ ] 6.2 Implement error boundary for omnichannel pages
  - Add error boundary component
  - Display user-friendly error messages
  - Provide retry functionality

- [ ] 6.3 Add loading skeletons for all components
  - Create skeleton components for account cards
  - Create skeleton components for conversation cards
  - Create skeleton components for messages

- [ ] 6.4 Implement responsive design
  - Ensure all components work on mobile devices
  - Test tablet and desktop layouts
  - Adjust spacing and sizing for different screen sizes

- [ ] 6.5 Add accessibility features
  - Add ARIA labels to all interactive elements
  - Ensure keyboard navigation works
  - Test with screen readers
  - Add focus indicators

- [ ] 6.6 Manual testing
  - Test complete user flow: connect accounts → view inbox → send messages
  - Test WhatsApp account connection with valid credentials
  - Test Gmail account connection with app password
  - Verify email account limit enforcement
  - Test conversation creation for both channels
  - Test message sending and media upload
  - Test conversation management (mark as read, delete)
  - Test account deletion
  - Test email refresh (full sync and incremental)
  - Verify all error scenarios display appropriate messages
  - Verify all loading states work correctly

- [ ] 6.7 Update changelog and version
  - Document all new features in CHANGELOG.md
  - Update version in package.json and package-lock.json
  - Tag release with appropriate version number

## Notes

- Use existing UI components (AppInput, AppSelect, AppButton, AppAutocomplete, etc.) for consistency
- Follow patterns from mail-servers and admin pages
- Use React Query for all API calls
- Show success/error notifications using the notify utility
- Implement proper loading states for all async operations
- Handle all error cases gracefully with user-friendly messages
- Ensure responsive design works on all screen sizes
- Add proper TypeScript types for all data structures
- Write comprehensive tests (unit and property-based)
- Follow existing code style and conventions
