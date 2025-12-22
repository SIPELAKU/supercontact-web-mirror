// lib/dummy/dummy-activity.ts
export type ActivityItem = {
  id: string;
  platform: "linkedin" | "x" | "website";
  companyName: string;
  postedText: string;
  time: string;
  badge?: {
    label: string;
    color: string;
    bg: string;
  };
  content: string;
  stats?: {
    likes?: number;
    comments?: number;
    shares?: number;
  };
  attachment?: {
    name: string;
    size: string;
  };
  jobs?: string[];
};

export const DUMMY_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    platform: "linkedin",
    companyName: "Acme Corp",
    postedText: "Posted on LinkedIn",
    time: "2 hours ago",
    badge: {
      label: "High Engagement",
      color: "text-green-700",
      bg: "bg-green-100",
    },
    content:
      "We are thrilled to announce our Series B funding round led by Sequoia Capital! This milestone marks a new chapter in our journey to revolutionize the AI landscape.",
    stats: {
      likes: 1200,
      comments: 84,
      shares: 156,
    },
  },
  {
    id: "2",
    platform: "x",
    companyName: "Acme Corp",
    postedText: "Posted on X",
    time: "5 hours ago",
    content:
      "Join us tomorrow for a live webinar on the future of generative AI in enterprise solutions. Register now 🔥",
    attachment: {
      name: "Webinar Promo.png",
      size: "450kb",
    },
    stats: {
      likes: 342,
      comments: 89,
    },
  },
  {
    id: "3",
    platform: "website",
    companyName: "Corporate Website",
    postedText: "Update Detected",
    time: "1 day ago",
    badge: {
      label: "Careers Page",
      color: "text-indigo-700",
      bg: "bg-indigo-100",
    },
    content: "Change Detected: New job listings added.",
    jobs: [
      "Senior Product Manager (San Francisco)",
      "Lead Frontend Engineer (Remote)",
      "Enterprise Sales Director (London)",
    ],
  },
];
