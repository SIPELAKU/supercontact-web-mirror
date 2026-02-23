# Design Document: Omnichannel Communication System

## Overview

The Omnichannel Communication System is a React-based web application that provides a unified interface for managing WhatsApp and Email communications. The system integrates with backend APIs to handle account connections, message synchronization, and conversation management across multiple channels.

The architecture follows a component-based approach using React with TypeScript, leveraging React Query for efficient data fetching and state management. The UI follows existing patterns from the mail-servers and admin pages to ensure consistency across the application.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + TypeScript)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Account    │  │   Unified    │  │ Conversation │      │
│  │  Management  │  │    Inbox     │  │  Management  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  React Query    │                        │
│                   │  (API Layer)    │                        │
│                   └────────┬────────┘                        │
└────────────────────────────┼──────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Backend API   │
                    │  /omnichannels  │
                    └─────────────────┘
```

### Component Structure

```
app/
├── omnichannel/
│   ├── page.tsx                    # Main omnichannel page (inbox view)
│   ├── settings/
│   │   └── page.tsx                # Account management settings
│   └── conversations/
│       └── [id]/
│           └── page.tsx            # Individual conversation view
│
components/
├── omnichannel/
│   ├── AccountList.tsx             # Display connected accounts
│   ├── ConnectWhatsAppForm.tsx     # WhatsApp connection form
│   ├── ConnectEmailForm.tsx        # Email connection form
│   ├── InboxList.tsx               # Unified inbox conversation list
│   ├── ConversationView.tsx        # Conversation detail view
│   ├── MessageList.tsx             # Display messages in conversation
│   ├── MessageInput.tsx            # Send message input
│   ├── NewConversationModal.tsx    # Create new conversation
│   └── MediaUpload.tsx             # Upload media files
│
lib/
├── api/
│   └── omnichannel.ts              # API client functions
└── hooks/
    └── useOmnichannel.ts           # React Query hooks
```

## Components and Interfaces

### 1. Account Management Components

#### ConnectWhatsAppForm
Handles WhatsApp account connection via Twilio.

**Props:**
```typescript
interface ConnectWhatsAppFormProps {
  onSuccess?: () => void;
}
```

**State:**
- phone_number: string
- twilio_account_sid: string
- twilio_auth_token: string
- isSubmitting: boolean

**Behavior:**
- Validates all required fields are filled
- Calls POST /omnichannels/accounts/whatsapp
- Shows success notification on completion
- Shows error notification on failure
- Resets form on success

#### ConnectEmailForm
Handles Gmail account connection.

**Props:**
```typescript
interface ConnectEmailFormProps {
  onSuccess?: () => void;
  hasExistingEmail: boolean;
}
```

**State:**
- email: string
- app_password: string
- display_name: string
- isSubmitting: boolean

**Behavior:**
- Validates all required fields are filled
- Displays link to https://myaccount.google.com/apppassword
- Prevents submission if hasExistingEmail is true
- Calls POST /omnichannels/accounts/email with hardcoded IMAP/SMTP settings
- Shows success notification on completion
- Shows error notification on failure
- Resets form on success

#### AccountList
Displays all connected accounts with management options.

**Props:**
```typescript
interface AccountListProps {
  channelType?: 'whatsapp' | 'email';
}
```

**State:**
- accounts: Account[]
- isLoading: boolean
- selectedAccount: string | null

**Behavior:**
- Fetches accounts via GET /omnichannels/accounts
- Filters by channelType if provided
- Displays account cards with channel icon, identifier, and status
- Provides delete button for each account
- Confirms deletion before calling DELETE /omnichannels/accounts/{account_id}
- Refreshes list after deletion

### 2. Inbox Components

#### InboxList
Displays unified inbox with conversation filtering.

**Props:**
```typescript
interface InboxListProps {
  channelType?: 'whatsapp' | 'email';
  status?: 'open' | 'closed' | 'archived';
}
```

**State:**
- conversations: Conversation[]
- isLoading: boolean
- filters: { channelType?: string; status?: string }

**Behavior:**
- Fetches conversations via GET /omnichannels/inbox
- Applies channel and status filters
- Displays conversation cards with:
  - Contact name
  - Last message preview (truncated)
  - Unread count badge
  - Timestamp (relative format)
  - Channel icon
- Navigates to conversation detail on click
- Shows empty state when no conversations exist
- Provides "New Conversation" button

#### NewConversationModal
Modal for creating new conversations.

**Props:**
```typescript
interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
}
```

**State:**
- account_id: string
- to: string
- name: string
- subject: string (email only)
- message: string (optional)
- isSubmitting: boolean

**Behavior:**
- Displays account selector dropdown
- Shows subject field only when email account selected
- Validates required fields based on channel type
- Calls POST /omnichannels/conversations
- Navigates to new conversation on success
- Shows error notification on failure

### 3. Conversation Components

#### ConversationView
Main conversation detail view.

**Props:**
```typescript
interface ConversationViewProps {
  conversationId: string;
}
```

**State:**
- conversation: Conversation | null
- isLoading: boolean

**Behavior:**
- Fetches conversation via GET /omnichannels/conversations/{conversation_id}
- Displays conversation header with contact info and actions
- Renders MessageList component
- Renders MessageInput component
- Provides mark as read button
- Provides delete conversation button
- Auto-marks as read when opened

#### MessageList
Displays messages in a conversation.

**Props:**
```typescript
interface MessageListProps {
  messages: Message[];
  channelType: 'whatsapp' | 'email';
}
```

**Behavior:**
- Displays messages in chronological order
- Differentiates sent vs received messages
- Shows timestamp for each message
- Displays media attachments (images, documents)
- Auto-scrolls to latest message
- Shows message status indicators

#### MessageInput
Input component for sending messages.

**Props:**
```typescript
interface MessageInputProps {
  conversationId: string;
  channelType: 'whatsapp' | 'email';
  onMessageSent?: () => void;
}
```

**State:**
- message: string
- isSubmitting: boolean
- attachments: File[]

**Behavior:**
- Provides text input for message
- Provides file upload button for media
- Validates message is not empty
- Calls POST /omnichannels/conversations/{conversation_id}/messages
- Uploads media via POST /omnichannels/conversations/{conversation_id}/messages/upload
- Clears input on success
- Shows error notification on failure
- Disables input while submitting

#### MediaUpload
Component for uploading media files.

**Props:**
```typescript
interface MediaUploadProps {
  conversationId: string;
  onUploadComplete: (mediaUrl: string) => void;
}
```

**State:**
- selectedFile: File | null
- isUploading: boolean
- uploadProgress: number

**Behavior:**
- Accepts file selection via input or drag-and-drop
- Validates file type and size
- Shows upload progress
- Calls POST /omnichannels/conversations/{conversation_id}/messages/upload with multipart/form-data
- Returns media URL on success
- Shows error notification on failure

## Data Models

### Account
```typescript
interface Account {
  id: string;
  channel_type: 'whatsapp' | 'email';
  channel_identifier: string; // Phone number or email address
  display_name: string;
  is_active: boolean;
  metadata: {
    twilio_account_sid?: string;
    imap_host?: string;
    imap_port?: number;
    smtp_host?: string;
    smtp_port?: number;
  };
  created_at: string;
  updated_at: string;
}
```

### Conversation
```typescript
interface Conversation {
  id: string;
  account_id: string;
  channel_type: 'whatsapp' | 'email';
  contact_name: string;
  contact_identifier: string; // Phone number or email
  subject?: string; // Email only
  status: 'open' | 'closed' | 'archived';
  unread_count: number;
  last_message_preview: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}
```

### Message
```typescript
interface Message {
  id: string;
  conversation_id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  media_url?: string;
  media_type?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sent_at: string;
  created_at: string;
}
```

### API Request/Response Types

```typescript
// WhatsApp Connection
interface ConnectWhatsAppRequest {
  phone_number: string;
  twilio_account_sid: string;
  twilio_auth_token: string;
}

// Email Connection
interface ConnectEmailRequest {
  email: string;
  app_password: string;
  display_name: string;
  imap_host: 'imap.gmail.com';
  imap_port: 993;
  smtp_host: 'smtp.gmail.com';
  smtp_port: 587;
}

// Create Conversation
interface CreateConversationRequest {
  account_id: string;
  to: string;
  name: string;
  subject?: string; // Required for email
  message?: string;
}

// Send Message
interface SendMessageRequest {
  content: string;
}

// Email Refresh
interface EmailRefreshRequest {
  full_sync: boolean;
}
```

## API Integration Layer

### React Query Hooks

```typescript
// Account Management
export const useAccounts = (channelType?: string) => {
  return useQuery({
    queryKey: ['omnichannels', 'accounts', channelType],
    queryFn: () => fetchAccounts(channelType),
  });
};

export const useConnectWhatsApp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ConnectWhatsAppRequest) => connectWhatsApp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'accounts'] });
    },
  });
};

export const useConnectEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ConnectEmailRequest) => connectEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'accounts'] });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountId: string) => deleteAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'accounts'] });
    },
  });
};

export const useRefreshEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fullSync: boolean) => refreshEmail(fullSync),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'inbox'] });
    },
  });
};

// Inbox
export const useInbox = (channelType?: string, status?: string) => {
  return useQuery({
    queryKey: ['omnichannels', 'inbox', channelType, status],
    queryFn: () => fetchInbox(channelType, status),
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateConversationRequest) => createConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'inbox'] });
    },
  });
};

// Conversations
export const useConversation = (conversationId: string) => {
  return useQuery({
    queryKey: ['omnichannels', 'conversations', conversationId],
    queryFn: () => fetchConversation(conversationId),
    enabled: !!conversationId,
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'inbox'] });
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => markAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'conversations', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'inbox'] });
    },
  });
};

// Messages
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      sendMessage(conversationId, content),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'conversations', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'inbox'] });
    },
  });
};

export const useUploadMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, file }: { conversationId: string; file: File }) =>
      uploadMedia(conversationId, file),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'conversations', conversationId] });
    },
  });
};
```

### API Client Functions

```typescript
// lib/api/omnichannel.ts

const API_BASE = '/omnichannels';

export async function fetchAccounts(channelType?: string): Promise<Account[]> {
  const params = new URLSearchParams();
  if (channelType) params.append('channel_type', channelType);
  
  const response = await fetch(`${API_BASE}/accounts?${params}`);
  if (!response.ok) throw new Error('Failed to fetch accounts');
  return response.json();
}

export async function connectWhatsApp(data: ConnectWhatsAppRequest): Promise<Account> {
  const response = await fetch(`${API_BASE}/accounts/whatsapp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to connect WhatsApp account');
  return response.json();
}

export async function connectEmail(data: ConnectEmailRequest): Promise<Account> {
  const response = await fetch(`${API_BASE}/accounts/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to connect email account');
  }
  return response.json();
}

export async function deleteAccount(accountId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/accounts/${accountId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete account');
}

export async function refreshEmail(fullSync: boolean): Promise<void> {
  const response = await fetch(`${API_BASE}/emails/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_sync: fullSync }),
  });
  if (!response.ok) throw new Error('Failed to refresh emails');
}

export async function fetchInbox(channelType?: string, status?: string): Promise<Conversation[]> {
  const params = new URLSearchParams();
  if (channelType) params.append('channel_type', channelType);
  if (status) params.append('status', status);
  
  const response = await fetch(`${API_BASE}/inbox?${params}`);
  if (!response.ok) throw new Error('Failed to fetch inbox');
  return response.json();
}

export async function createConversation(data: CreateConversationRequest): Promise<Conversation> {
  const response = await fetch(`${API_BASE}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create conversation');
  return response.json();
}

export async function fetchConversation(conversationId: string): Promise<Conversation & { messages: Message[] }> {
  const response = await fetch(`${API_BASE}/conversations/${conversationId}`);
  if (!response.ok) throw new Error('Failed to fetch conversation');
  return response.json();
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/conversations/${conversationId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete conversation');
}

export async function markAsRead(conversationId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/conversations/${conversationId}/read`, {
    method: 'PATCH',
  });
  if (!response.ok) throw new Error('Failed to mark as read');
}

export async function sendMessage(conversationId: string, content: string): Promise<Message> {
  const response = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
}

export async function uploadMedia(conversationId: string, file: File): Promise<{ media_url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/conversations/${conversationId}/messages/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to upload media');
  return response.json();
}
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Form validation completeness
*For any* account connection form (WhatsApp or Email) or conversation creation form, submitting with missing required fields should prevent submission and display validation errors for all missing fields.
**Validates: Requirements 1.1, 2.1, 7.1**

### Property 2: WhatsApp account creation includes hardcoded credentials
*For any* valid WhatsApp connection request, the API call should include phone_number, twilio_account_sid, and twilio_auth_token in the request payload.
**Validates: Requirements 1.2**

### Property 3: Email account creation includes hardcoded IMAP/SMTP settings
*For any* valid email connection request, the API call should include the hardcoded values: imap_host='imap.gmail.com', imap_port=993, smtp_host='smtp.gmail.com', smtp_port=587.
**Validates: Requirements 2.2**

### Property 4: Account response completeness
*For any* successful account creation or retrieval, the response should contain all required fields: id, channel_type, channel_identifier, display_name, is_active, and metadata.
**Validates: Requirements 1.3, 2.3, 3.3**

### Property 5: Email account limit enforcement
*For any* company that already has one email account, attempting to connect a second email account should be rejected with an error.
**Validates: Requirements 2.4**

### Property 6: Account filtering by channel type
*For any* list of accounts and any channel_type filter (whatsapp or email), all returned accounts should match the specified channel type.
**Validates: Requirements 3.2**

### Property 7: Account deletion removes account
*For any* valid account_id, calling the delete endpoint should result in that account no longer appearing in the account list.
**Validates: Requirements 4.1**

### Property 8: Email refresh sync parameter
*For any* email refresh request, the full_sync parameter should be correctly passed to the API (true for all emails, false for 24-hour sync).
**Validates: Requirements 5.1, 5.2**

### Property 9: Inbox filtering by channel and status
*For any* list of conversations and any combination of channel_type and status filters, all returned conversations should match the specified filters.
**Validates: Requirements 6.2, 6.3**

### Property 10: Conversation display completeness
*For any* conversation in the inbox, the displayed information should include contact_name, last_message_preview, unread_count, and timestamp.
**Validates: Requirements 6.4**

### Property 11: Email conversation requires subject
*For any* conversation creation request where the selected account has channel_type='email', the subject field should be required and validated.
**Validates: Requirements 7.2**

### Property 12: Optional message inclusion
*For any* conversation creation request that includes an optional message, the created conversation should contain that message as the first message.
**Validates: Requirements 7.3**

### Property 13: Conversation retrieval completeness
*For any* valid conversation_id, the retrieved conversation should include all messages and complete metadata.
**Validates: Requirements 8.2**

### Property 14: Mark as read updates status
*For any* conversation with unread messages, calling the mark-as-read endpoint should result in unread_count becoming 0.
**Validates: Requirements 9.2**

### Property 15: Message sending creates message
*For any* valid conversation_id and message content, sending a message should result in that message appearing in the conversation's message list.
**Validates: Requirements 10.1, 10.2**

### Property 16: Media upload with multipart form data
*For any* media file upload, the request should use multipart/form-data content type and include the file in the request body.
**Validates: Requirements 11.1**

### Property 17: Media upload returns URL
*For any* successful media upload, the response should include a media_url field containing the uploaded file's URL.
**Validates: Requirements 11.2**

### Property 18: Loading states during operations
*For any* asynchronous operation (API call), the UI should display a loading indicator while the operation is in progress.
**Validates: Requirements 12.3**

### Property 19: Success notifications on completion
*For any* successful mutation operation (create, update, delete), the UI should display a success notification.
**Validates: Requirements 12.4**

### Property 20: Error notifications on failure
*For any* failed operation, the UI should display an error notification with a descriptive message.
**Validates: Requirements 12.5**

### Property 21: Query cache invalidation after mutations
*For any* mutation that modifies data (create account, delete account, send message, etc.), the related queries should be invalidated and refetched to reflect the updated state.
**Validates: Requirements 13.4**

### Property 22: Response caching for repeated requests
*For any* query that is executed multiple times with the same parameters within the cache window, only the first request should hit the API, and subsequent requests should use cached data.
**Validates: Requirements 13.3**

## Error Handling

### Validation Errors
- All form inputs are validated before submission
- Required fields are marked and validated
- Email format validation for email addresses
- Phone number format validation for WhatsApp
- Display inline error messages for invalid fields
- Prevent form submission until all validations pass

### API Errors
- Network errors: Display "Connection failed" message with retry option
- 400 Bad Request: Display validation errors from server
- 401 Unauthorized: Redirect to login
- 403 Forbidden: Display "Permission denied" message
- 404 Not Found: Display "Resource not found" message
- 409 Conflict: Display specific conflict message (e.g., "Email account limit reached")
- 500 Server Error: Display "Server error, please try again" message
- Timeout errors: Display "Request timed out" with retry option

### Error Recovery
- Provide retry buttons for failed operations
- Preserve form data when errors occur
- Clear error messages when user corrects input
- Log errors to console for debugging
- Show user-friendly error messages (hide technical details)

### Edge Cases
- Empty states: Show helpful messages when no data exists
- No accounts connected: Prompt user to connect an account
- No conversations: Show "No conversations yet" with "New Conversation" button
- No messages: Show "No messages yet" in conversation view
- Deleted resources: Handle gracefully when viewing deleted conversations
- Concurrent modifications: Refresh data when conflicts detected

## Testing Strategy

### Unit Testing
Unit tests will focus on specific examples, edge cases, and error conditions:

- Form validation logic with specific invalid inputs
- API client functions with mocked responses
- Component rendering with specific props
- Error handling with specific error scenarios
- Edge cases like empty states and missing data
- Integration between components

### Property-Based Testing
Property-based tests will verify universal properties across all inputs using a JavaScript property-based testing library (fast-check):

- Each property test will run a minimum of 100 iterations
- Tests will generate random valid and invalid inputs
- Each test will reference its design document property
- Tag format: **Feature: omnichannel, Property {number}: {property_text}**

**Property Test Coverage:**
- Property 1: Generate random form states, verify validation
- Property 2-3: Generate random credentials, verify API payload structure
- Property 4: Generate random API responses, verify field presence
- Property 5: Test email account limit with multiple creation attempts
- Property 6: Generate random account lists, verify filtering
- Property 7: Generate random accounts, verify deletion
- Property 8: Generate random sync requests, verify parameter passing
- Property 9: Generate random conversation lists, verify filtering
- Property 10: Generate random conversations, verify display fields
- Property 11: Generate random conversation forms, verify email subject requirement
- Property 12: Generate random conversation requests, verify message inclusion
- Property 13: Generate random conversations, verify retrieval completeness
- Property 14: Generate random conversations, verify read status update
- Property 15: Generate random messages, verify message creation
- Property 16-17: Generate random files, verify upload format and response
- Property 18-20: Verify UI state changes across all operations
- Property 21-22: Verify cache behavior across all queries and mutations

**Testing Tools:**
- Jest for unit testing
- React Testing Library for component testing
- fast-check for property-based testing
- MSW (Mock Service Worker) for API mocking

**Test Organization:**
```
__tests__/
├── components/
│   ├── ConnectWhatsAppForm.test.tsx
│   ├── ConnectEmailForm.test.tsx
│   ├── AccountList.test.tsx
│   ├── InboxList.test.tsx
│   ├── ConversationView.test.tsx
│   └── MessageInput.test.tsx
├── api/
│   └── omnichannel.test.ts
├── hooks/
│   └── useOmnichannel.test.ts
└── properties/
    ├── form-validation.property.test.ts
    ├── api-integration.property.test.ts
    ├── filtering.property.test.ts
    ├── cache-behavior.property.test.ts
    └── ui-states.property.test.ts
```

### Integration Testing
- Test complete user flows (connect account → view inbox → send message)
- Test navigation between pages
- Test data persistence across page refreshes
- Test real-time updates when new messages arrive

### Manual Testing Checklist
- Connect WhatsApp account with valid Twilio credentials
- Connect Gmail account with app password
- Verify email account limit (cannot add second email)
- View unified inbox with mixed WhatsApp and Email conversations
- Filter inbox by channel type and status
- Create new WhatsApp conversation
- Create new Email conversation with subject
- Send text messages in both channels
- Upload and send media files
- Mark conversations as read
- Delete conversations
- Delete accounts
- Refresh email inbox (full sync and incremental)
- Verify error handling for invalid inputs
- Verify loading states during operations
- Verify success/error notifications
