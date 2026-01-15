// Mock data for email marketing module (for testing without backend)

import { Campaign, Contact, MailingList, Subscriber } from '@/lib/types/email-marketing';

export const mockSubscribers: Subscriber[] = [
  {
    id: 1,
    email: 'john.doe@example.com',
    name: 'John Doe',
    company_name: 'Acme Corp',
    x_studio_owner_id: [1, 'Admin User'],
    list_ids: [1, 2]
  },
  {
    id: 2,
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    company_name: 'Tech Solutions Inc',
    x_studio_owner_id: [1, 'Admin User'],
    list_ids: [1]
  },
  {
    id: 3,
    email: 'bob.wilson@example.com',
    name: 'Bob Wilson',
    company_name: 'Digital Marketing Co',
    x_studio_owner_id: [2, 'Sales Manager'],
    list_ids: [2, 3]
  },
  {
    id: 4,
    email: 'alice.johnson@example.com',
    name: 'Alice Johnson',
    company_name: 'Creative Agency',
    x_studio_owner_id: [1, 'Admin User'],
    list_ids: [1, 3]
  },
  {
    id: 5,
    email: 'charlie.brown@example.com',
    name: 'Charlie Brown',
    company_name: 'Startup Ventures',
    x_studio_owner_id: [2, 'Sales Manager'],
    list_ids: [2]
  },
];

export const mockCampaigns: Campaign[] = [
  {
    id: 1,
    subject: 'Welcome to Our Newsletter',
    state: 'done',
    sent_date: '2024-01-15T10:30:00Z',
    delivered: 450,
    opened: 320,
    x_studio_owner_id: [1, 'Admin User']
  },
  {
    id: 2,
    subject: 'Special Offer - 50% Off',
    state: 'done',
    sent_date: '2024-01-20T14:00:00Z',
    delivered: 380,
    opened: 280,
    x_studio_owner_id: [1, 'Admin User']
  },
  {
    id: 3,
    subject: 'Product Launch Announcement',
    state: 'sending',
    delivered: 120,
    opened: 45,
    x_studio_owner_id: [2, 'Sales Manager']
  },
  {
    id: 4,
    subject: 'Monthly Newsletter - February',
    state: 'draft',
    delivered: 0,
    opened: 0,
    x_studio_owner_id: [1, 'Admin User']
  },
];

export const mockMailingLists: MailingList[] = [
  {
    id: 1,
    name: 'Newsletter Subscribers',
    contact_count: 450
  },
  {
    id: 2,
    name: 'Premium Customers',
    contact_count: 120
  },
  {
    id: 3,
    name: 'Trial Users',
    contact_count: 85
  },
];

export const mockContacts: Contact[] = [
  {
    id: 1,
    name: 'Michael Scott',
    email: 'michael.scott@dundermifflin.com'
  },
  {
    id: 2,
    name: 'Pam Beesly',
    email: 'pam.beesly@dundermifflin.com'
  },
  {
    id: 3,
    name: 'Jim Halpert',
    email: 'jim.halpert@dundermifflin.com'
  },
  {
    id: 4,
    name: 'Dwight Schrute',
    email: 'dwight.schrute@dundermifflin.com'
  },
];

// Helper function to simulate API delay
export const simulateApiDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate paginated response
export const getPaginatedData = <T>(
  data: T[],
  page: number,
  pageSize: number
): { items: T[]; total: number } => {
  const start = page * pageSize;
  const end = start + pageSize;
  return {
    items: data.slice(start, end),
    total: data.length
  };
};
