// lib/hooks/useCampaigns.ts
"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createCampaign,
    deleteCampaign,
    fetchCampaignDetail,
    fetchCampaigns,
    updateCampaign
} from '../api';
import type { CreateCampaignData, UpdateCampaignData } from '../types/email-marketing';
import Cookies from 'js-cookie';

// Fetch all campaigns
export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchCampaigns(token);
    },
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
