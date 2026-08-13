/**
 * CAMPAIGN MOCK DATA GENERATOR
 * 
 * Provides high-volume mock data for stress testing the Campaign Table,
 * pagination logic, and search performance.
 */

import { Campaign } from "../types/email-marketing";

const SUBJECTS = [
  "Exclusive Offer: 50% Off Everything!",
  "Your Weekly Digest is Here 📚",
  "Don't Miss Out! Final Call for Registration",
  "Welcome to the Family! Start Your Journey",
  "Special Invitation: VIP Launch Event",
  "Update Regarding Your Account Status",
  "How to Scale Your Business in 2026",
  "The Future of AI is Now - Join the Webinar",
  "Flash Sale: 24 Hours Only!",
  "Thank You for Being a Loyal Customer"
];

const USERS = [
  "John Doe", "Jane Smith", "Budi Santoso", "Siti Aminah", 
  "Michael Chen", "Sarah Williams", "Andi Wijaya", "Rani Permata"
];

const STATUSES = ["draft", "sent", "in_queue", "failed", "processing"];

const RECIPIENT_SOURCES = ["mailing_list", "subscriber"];

/**
 * Generate a single mock campaign
 */
export const generateMockCampaign = (id: number): Campaign => {
  const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
  const isSent = status === "sent";
  
  return {
    id: `campaign-${id}`,
    user_fullname: USERS[Math.floor(Math.random() * USERS.length)],
    subject: SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)],
    html_content: `<div><h1>Hello!</h1><p>This is a mock campaign content for ID ${id}.</p></div>`,
    status: status,
    total_target: Math.floor(Math.random() * 5000) + 100,
    recipient_source: RECIPIENT_SOURCES[Math.floor(Math.random() * RECIPIENT_SOURCES.length)],
    editor_type: Math.random() > 0.5 ? 'visual_builder' : 'simple_editor',
    mail_sender_id: `sender-${Math.floor(Math.random() * 5) + 1}`,
    sent_at: isSent ? new Date(Date.now() - Math.random() * 1000000000).toISOString() : null,
    stats: {
      delivered: isSent ? Math.floor(Math.random() * 1000) : 0,
      opened: isSent ? Math.floor(Math.random() * 500) : 0,
      clicked: isSent ? Math.floor(Math.random() * 100) : 0,
      bounced: isSent ? Math.floor(Math.random() * 20) : 0,
      simulated: 0,
    },
    created_at: new Date(Date.now() - 2000000000).toISOString(),
    updated_at: new Date().toISOString()
  };
};

/**
 * A collection of 500 pre-generated mock campaigns for performance testing.
 * This large dataset helps in validating the virtual scrolling and pagination
 * components under heavy load.
 */
export const MOCK_CAMPAIGNS_LARGE: Campaign[] = Array.from({ length: 500 }, (_, i) => generateMockCampaign(i + 1));

/**
 * Filter helpers for mock data
 */
export const getMockCampaignsByStatus = (status: string) => 
  MOCK_CAMPAIGNS_LARGE.filter(c => c.status === status);

export const searchMockCampaigns = (query: string) => 
  MOCK_CAMPAIGNS_LARGE.filter(c => 
    c.subject.toLowerCase().includes(query.toLowerCase()) || 
    c.user_fullname.toLowerCase().includes(query.toLowerCase())
  );
