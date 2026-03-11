/**
 * CAMPAIGN MODULE CONSTANTS
 * 
 * Centralized configuration for the Email Marketing module.
 */

export const CAMPAIGN_LIMITS = {
  MAX_SUBJECT_LENGTH: 150,
  MAX_RECIPIENTS_PER_BATCH: 1000,
  MIN_WAIT_TIME_SECONDS: 60,
  PREVIEW_CONTENT_LENGTH: 200,
  AUTOSAVE_INTERVAL_MS: 30000,
};

export const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  "draft": "Draft",
  "sent": "Sent",
  "in_queue": "In Queue",
  "processing": "Processing",
  "failed": "Failed",
  "paused": "Paused",
};

export const RECIPIENT_SOURCE_LABELS: Record<string, string> = {
  "mailing_list": "Mailing List",
  "subscriber": "Individual Contacts",
};

export const EDITOR_TYPES = {
  SIMPLE: "simple_editor",
  VISUAL: "visual_builder",
};

export const DEFAULT_CAMPAIGN_CONFIG = {
  EDITOR_TYPE: EDITOR_TYPES.SIMPLE as 'simple_editor' | 'visual_builder',
  RECIPIENT_SOURCE: "mailing_list" as 'mailing_list' | 'subscriber',
  STALE_TIME: 1000 * 60 * 5, // 5 minutes
};

export const CAMPAIGN_ERROR_MESSAGES = {
  SUBJECT_REQUIRED: "Subject is required.",
  SENDER_REQUIRED: "Please select a Mail Sender.",
  CONTENT_REQUIRED: "Email content is required.",
  MAILING_LIST_REQUIRED: "Please select at least one mailing list.",
  SUBSCRIBER_REQUIRED: "Please select at least one subscriber.",
  CREATE_FAILED: "Failed to create campaign.",
  UPDATE_FAILED: "Failed to update campaign.",
  LOAD_FAILED: "Failed to load campaign data.",
};
