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
    deleteContact, fetchContacts,
    type Contact,
    type ContactResponse
} from './contacts';

// Users & Profile API
export {
    fetchProfile, fetchUsers, updateProfile, type ProfileData,
    type ProfileResponse,
    type UpdateProfileData,
    type UpdateProfileResponse, type User,
    type UserResponse
} from './users';

// Notes API
export {
    createNote, fetchNotes, updateNote, type Note, type NoteData, type NotesResponse
} from './notes';

// Email Marketing API
export {
    createCampaign, createMailingList, createSubscriber, deleteCampaign, deleteMailingList,
    deleteMailingListSubscriber, deleteSubscriber, fetchCampaignDetail,
    // Campaigns
    fetchCampaigns, fetchMailingListDetail,
    // Mailing Lists
    fetchMailingLists,
    // Subscribers
    fetchSubscribers, updateCampaign, updateMailingList, updateSubscriber,
    type UpdateSubscriberData
} from './email-marketing';

