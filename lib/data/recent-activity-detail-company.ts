import { RecentActivityItem } from "../type/Company";

export const RECENT_ACTIVITY_DETAIL_COMPANY: RecentActivityItem[] = [
  {
    id: "1",
    source: "linkedin",
    companyName: "Acme Corp",
    meta: "Posted on LinkedIn • 2 hours ago",
    content: "We are thrilled to announce our Series B funding round led by Sequoia Capital! This milestone...",
    badge: {
      label: "High Engagement",
      tone: "green",
    },
  },
  {
    id: "2",
    source: "x",
    companyName: "Acme Corp",
    meta: "Posted on X • 5 hours ago",
    content: "Join us tomorrow for a live webinar on the future of generative AI in enterprise solutions. Regi...",
  },
  {
    id: "3",
    source: "website",
    companyName: "Corporate Website",
    meta: "Update Detected • 1 day ago",
    content: "Change Detected: New job listings added.",
    badge: {
      label: "Careers Page",
      tone: "indigo",
    },
  },
];
