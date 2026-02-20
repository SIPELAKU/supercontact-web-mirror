import { CompanySignal } from "../types/company-profile";

export const RECENT_SIGNALS: CompanySignal[] = [
  {
    id: "1",
    signal_title: "New Chief Product Officer Hired",
    description: "Sarah Jenkins joins from Oracle as CPO.",
    time_posted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dotColor: "green",
  },
  {
    id: "2",
    signal_title: "Product Launch: Acme Cloud V2",
    description: "Major version update released with enhanced security features.",
    time_posted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    dotColor: "blue",
  },
  {
    id: "3",
    signal_title: "Expanding to European Market",
    description: "Opened new office in London, actively hiring sales team.",
    time_posted: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    dotColor: "orange",
  },
];
