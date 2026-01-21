// lib/hooks/useCampaigns.ts
"use client";

import { useAuth } from '@/lib/context/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createCampaign,
    deleteCampaign,
    fetchCampaignDetail,
    fetchCampaigns,
    updateCampaign
} from '../api';
import type { CreateCampaignData, UpdateCampaignData } from '../types/email-marketing';

// Fetch all campaigns
export function useCampaigns() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      if (!token) throw new Error('No authentication token');
      return fetchCampaigns(token);
    },
    enabled: !!token,
  });
}

// Fetch campaign detail
export function useCampaignDetail(campaignId: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['campaigns', campaignId],
    queryFn: async () => {
      if (!token) throw new Error('No authentication token');
      return fetchCampaignDetail(token, campaignId);
    },
    enabled: !!token && !!campaignId,
  });
}

// Create campaign
export function useCreateCampaign() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCampaignData) => {
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
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, data }: { campaignId: string; data: UpdateCampaignData }) => {
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
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      if (!token) throw new Error('No authentication token');
      return deleteCampaign(token, campaignId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}
