// lib/hooks/useCampaigns.ts
"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCampaign,
  deleteCampaign,
  fetchCampaignDetail,
  fetchCampaigns,
  fetchCampaignSubscribers,
  fetchAllCampaignSubscribers,
  updateCampaign,
  duplicateCampaigns
} from '../api';
import type { CampaignSubscribersQuery, CreateCampaignData, UpdateCampaignData } from '../types/email-marketing';
import Cookies from 'js-cookie';

// Fetch all campaigns
export function useCampaigns(
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
) {
  return useQuery({
    queryKey: ['campaigns', page, limit, search, status, sortBy, sortOrder],
    queryFn: async () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchCampaigns(token, page, limit, search, status, sortBy, sortOrder);
    },
    // Keep the current page rendered while the next one loads; see
    // useSubscribers for why every server-driven list here needs this.
    placeholderData: keepPreviousData,
  });
}

// Fetch campaign detail
export function useCampaignDetail(campaignId: string) {
  return useQuery({
    queryKey: ['campaigns', campaignId],
    queryFn: async () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchCampaignDetail(token, campaignId);
    },
    enabled: !!campaignId,
  });
}

// Create campaign
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCampaignData) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return createCampaign(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

// Update campaign
export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, data }: { campaignId: string; data: UpdateCampaignData }) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return updateCampaign(token, campaignId, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.campaignId] });
    },
  });
}

// Delete campaign
export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return deleteCampaign(token, campaignId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

// Duplicate campaigns
export function useDuplicateCampaigns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignIds: string[]) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return duplicateCampaigns(token, campaignIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

// Fetch campaign subscribers with status
// One page of the campaign's subscribers; every filter and the sort travel in `query`.
export function useCampaignSubscribers(campaignId: string, query: CampaignSubscribersQuery = {}) {
  return useQuery({
    queryKey: ['campaign-subscribers', campaignId, query],
    queryFn: async () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchCampaignSubscribers(token, campaignId, query);
    },
    enabled: !!campaignId,
  });
}

// Every subscriber a stats card counts, for its CSV/Excel export.
export function useExportCampaignSubscribers() {
  return useMutation({
    mutationFn: async ({ campaignId, status }: { campaignId: string; status: string }) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchAllCampaignSubscribers(token, campaignId, status);
    },
  });
}
