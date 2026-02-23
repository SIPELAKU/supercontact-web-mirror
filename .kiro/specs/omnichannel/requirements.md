# Requirements Document: Omnichannel Communication System

## Introduction

The Omnichannel Communication System enables users to connect and manage multiple communication channels (WhatsApp and Email) through a unified interface. Users can view all conversations in a single inbox, manage account connections, and send/receive messages across different channels seamlessly.

## Glossary

- **System**: The Omnichannel Communication System
- **User**: A person using the system to manage communications
- **Account**: A connected communication channel (WhatsApp or Email)
- **Conversation**: A thread of messages with a contact
- **Channel**: A communication medium (WhatsApp or Email)
- **Contact**: A person or entity communicating through a channel
- **Inbox**: The unified view of all conversations across channels
- **Company**: The organization using the system
- **Message**: A single communication unit within a conversation
- **Full_Sync**: Complete retrieval of all historical emails
- **Incremental_Sync**: Retrieval of emails from the last 24 hours only

## Requirements

### Requirement 1: WhatsApp Account Connection

**User Story:** As a user, I want to connect my WhatsApp account via Twilio, so that I can manage WhatsApp conversations through the unified inbox.

#### Acceptance Criteria

1. WHEN a user submits WhatsApp connection details, THE System SHALL validate that phone_number, twilio_account_sid, and twilio_auth_token are provided
2. WHEN valid WhatsApp credentials are submitted, THE System SHALL create a new WhatsApp account connection via POST /omnichannels/accounts/whatsapp
3. WHEN WhatsApp account creation succeeds, THE System SHALL return the account details including id, channel_type, channel_identifier, display_name, and is_active
4. WHEN WhatsApp account creation fails, THE System SHALL return a descriptive error message
5. WHEN a user connects multiple WhatsApp accounts, THE System SHALL allow unlimited WhatsApp accounts per company

### Requirement 2: Email Account Connection

**User Story:** As a user, I want to connect my Gmail account, so that I can manage email conversations through the unified inbox.

#### Acceptance Criteria

1. WHEN a user submits email connection details, THE System SHALL validate that email_address, app_password, and display_name are provided
2. WHEN valid email credentials are submitted, THE System SHALL create a new email account connection via POST /omnichannels/accounts/email with hardcoded IMAP/SMTP settings (imap_host: imap.gmail.com, imap_port: 993, smtp_host: smtp.gmail.com, smtp_port: 587)
3. WHEN email account creation succeeds, THE System SHALL return the account details including id, channel_type, channel_identifier, display_name, and is_active
4. WHEN a company already has one email account connected, THE System SHALL prevent additional email account connections and return an error
5. WHEN email account creation fails, THE System SHALL return a descriptive error message

### Requirement 3: Account Listing and Retrieval

**User Story:** As a user, I want to view all my connected accounts, so that I can see which communication channels are active.

#### Acceptance Criteria

1. WHEN a user requests account listing, THE System SHALL retrieve accounts via GET /omnichannels/accounts
2. WHEN a channel_type parameter is provided, THE System SHALL filter accounts by the specified channel type
3. WHEN accounts are retrieved, THE System SHALL return id, channel_type, channel_identifier, display_name, is_active, and metadata for each account
4. WHEN no accounts exist, THE System SHALL return an empty list
5. WHEN the request fails, THE System SHALL return a descriptive error message

### Requirement 4: Account Deletion

**User Story:** As a user, I want to delete connected accounts, so that I can remove channels I no longer use.

#### Acceptance Criteria

1. WHEN a user requests account deletion, THE System SHALL remove the account via DELETE /omnichannels/accounts/{account_id}
2. WHEN account deletion succeeds, THE System SHALL return a success confirmation
3. WHEN the account_id does not exist, THE System SHALL return an error message
4. WHEN account deletion fails, THE System SHALL return a descriptive error message

### Requirement 5: Email Synchronization

**User Story:** As a user, I want to refresh my email inbox, so that I can see the latest messages.

#### Acceptance Criteria

1. WHEN a user requests email refresh with full_sync true, THE System SHALL retrieve all historical emails via POST /omnichannels/emails/refresh
2. WHEN a user requests email refresh with full_sync false, THE System SHALL retrieve only emails from the last 24 hours via POST /omnichannels/emails/refresh
3. WHEN email refresh succeeds, THE System SHALL return a success confirmation
4. WHEN email refresh fails, THE System SHALL return a descriptive error message

### Requirement 6: Unified Inbox Display

**User Story:** As a user, I want to view all conversations in a unified inbox, so that I can manage communications from different channels in one place.

#### Acceptance Criteria

1. WHEN a user requests the inbox, THE System SHALL retrieve conversations via GET /omnichannels/inbox
2. WHEN a channel_type parameter is provided, THE System SHALL filter conversations by the specified channel type (whatsapp or email)
3. WHEN a status parameter is provided, THE System SHALL filter conversations by the specified status (open, closed, or archived)
4. WHEN conversations are retrieved, THE System SHALL display contact_name, last_message_preview, unread_count, and timestamp for each conversation
5. WHEN no conversations exist, THE System SHALL display an empty inbox state

### Requirement 7: Conversation Creation

**User Story:** As a user, I want to create new conversations, so that I can initiate communication with contacts.

#### Acceptance Criteria

1. WHEN a user creates a conversation, THE System SHALL validate that account_id, to, and name are provided
2. WHEN creating an email conversation, THE System SHALL require a subject field
3. WHEN creating a conversation with an optional message, THE System SHALL include the message in the initial conversation
4. WHEN conversation creation succeeds, THE System SHALL create the conversation via POST /omnichannels/conversations and return the conversation details
5. WHEN conversation creation fails, THE System SHALL return a descriptive error message

### Requirement 8: Conversation Retrieval

**User Story:** As a user, I want to view conversation details, so that I can read the message history with a contact.

#### Acceptance Criteria

1. WHEN a user requests conversation details, THE System SHALL retrieve the conversation via GET /omnichannels/conversations/{conversation_id}
2. WHEN the conversation exists, THE System SHALL return all messages and metadata
3. WHEN the conversation_id does not exist, THE System SHALL return an error message
4. WHEN the request fails, THE System SHALL return a descriptive error message

### Requirement 9: Conversation Management

**User Story:** As a user, I want to manage conversations, so that I can organize and maintain my inbox.

#### Acceptance Criteria

1. WHEN a user deletes a conversation, THE System SHALL remove it via DELETE /omnichannels/conversations/{conversation_id}
2. WHEN a user marks a conversation as read, THE System SHALL update the read status via PATCH /omnichannels/conversations/{conversation_id}/read
3. WHEN conversation management operations succeed, THE System SHALL return success confirmations
4. WHEN the conversation_id does not exist, THE System SHALL return an error message
5. WHEN operations fail, THE System SHALL return descriptive error messages

### Requirement 10: Message Sending

**User Story:** As a user, I want to send messages in conversations, so that I can communicate with contacts.

#### Acceptance Criteria

1. WHEN a user sends a message, THE System SHALL create the message via POST /omnichannels/conversations/{conversation_id}/messages
2. WHEN message sending succeeds, THE System SHALL return the message details
3. WHEN the conversation_id does not exist, THE System SHALL return an error message
4. WHEN message sending fails, THE System SHALL return a descriptive error message

### Requirement 11: Media Upload

**User Story:** As a user, I want to upload media files in conversations, so that I can share images and documents with contacts.

#### Acceptance Criteria

1. WHEN a user uploads media, THE System SHALL accept multipart/form-data via POST /omnichannels/conversations/{conversation_id}/messages/upload
2. WHEN media upload succeeds, THE System SHALL return the uploaded media details
3. WHEN the conversation_id does not exist, THE System SHALL return an error message
4. WHEN media upload fails, THE System SHALL return a descriptive error message

### Requirement 12: User Interface and Experience

**User Story:** As a user, I want a responsive and intuitive interface, so that I can efficiently manage my communications.

#### Acceptance Criteria

1. THE System SHALL use existing UI components for consistency
2. THE System SHALL follow existing patterns from mail-servers and admin pages
3. WHEN operations are in progress, THE System SHALL display loading states
4. WHEN operations succeed, THE System SHALL display success notifications
5. WHEN operations fail, THE System SHALL display error notifications with descriptive messages

### Requirement 13: API Integration

**User Story:** As a developer, I want to use React Query for API calls, so that the application has efficient data fetching and caching.

#### Acceptance Criteria

1. THE System SHALL use React Query for all API calls
2. WHEN API calls are made, THE System SHALL handle loading, success, and error states
3. WHEN data is fetched, THE System SHALL cache responses appropriately
4. WHEN mutations occur, THE System SHALL invalidate relevant cached queries
