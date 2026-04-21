// lib/api/index.ts
// Main API barrel export - re-exports all API functions for backward compatibility

// Auth API
export {
    registerUser, resendOTP,
    resetPassword, verifyOTP, type RegisterData,
    type RegisterResponse, type ResendOTPData,
    type ResendOTPResponse,
    type ResetPasswordData,
    type ResetPasswordResponse, type VerifyOTPData,
    type VerifyOTPResponse
} from './auth';

// Leads API
export {
    createLead, deleteLead, fetchLeads, updateLead, type CreateLeadData,
    type UpdateLeadData
} from './leads';

// Contacts API
export {
    fetchContacts, deleteMultipleContacts, deleteContact, deleteAllContacts, duplicateContacts,
    type Contact,
    type ContactResponse
} from './contacts';


// User/Profile API
export {
    fetchProfile, updateProfile, uploadAvatar, deactivateAccount, changePassword, fetchRecentDevices,
    type User, type UserResponse, type ProfileData, type UpdateProfileData, type ProfileResponse, type UpdateProfileResponse, type ChangePasswordData, type DeviceSession
} from './users';

// Notes API
export {
    createNote, fetchNotes, updateNote, type Note, type NoteData, type NotesResponse
} from './notes';

// Email Marketing API
export {
    createCampaign, createMailingList, createSubscriber, deleteCampaign, duplicateCampaigns, deleteMailingList,
    deleteMailingListSubscriber, bulkDeleteMailingListSubscribers, deleteAllMailingListSubscribers, deleteSubscriber, bulkDeleteSubscribers, deleteAllSubscribers, fetchCampaignDetail,
    // Campaigns
    fetchCampaigns, fetchMailingListDetail,
    // Mailing Lists
    fetchMailingLists, fetchMailingListCampaigns,
    // Subscribers
    fetchSubscribers, updateCampaign, duplicateSubscribers, updateMailingList, updateSubscriber,
    type UpdateSubscriberData
} from './email-marketing';


// Departments API
export {
    fetchDepartments,
    fetchDepartmentById,
    fetchDepartmentMembers,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    type CreateDepartmentData,
    type UpdateDepartmentData,
    fetchBranches
} from './departments';

// Quotations API
export {
    createQuotation, type CreateQuotationData, type QuotationItemData,
    sendQuotationEmail, updateQuotation
} from './quotations';

// Notifications API
export {
    fetchNotifications, fetchUnreadCount, markNotificationAsRead, markAllNotificationsAsRead, type NotificationData, type NotificationsResponse, type UnreadCountResponse
} from './notifications';

// WhatsApp Marketing API
export {
    fetchBroadcasts, createBroadcast, updateBroadcast, deleteBroadcast
} from './whatsapp-marketing';

// Billings API
export * from './billings';

// Smart Capture API
export {
    fetchSmartCaptureById,
    createSmartCapture,
    updateSmartCapture,
    uploadSmartCaptureFiles,
    deleteSmartCaptureFiles,
    fetchPublicSmartCaptureForm,
    submitPublicSmartCaptureForm,
    fetchSmartCaptureSubmissions
} from './smart-captures';
