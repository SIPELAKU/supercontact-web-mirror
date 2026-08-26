"use client";

import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';

import {
  fetchEmailMarketingOverview,
  type EmailMarketingOverviewResponse,
} from '@/lib/api/email-marketing/overview';

export function useEmailMarketingOverview() {
  return useQuery<EmailMarketingOverviewResponse>({
    queryKey: ['email-marketing-overview'],
    queryFn: () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchEmailMarketingOverview(token);
    },
    // Counters over the whole tenant; a minute of staleness is fine and keeps
    // the landing page from re-querying on every back-navigation.
    staleTime: 60_000,
  });
}
