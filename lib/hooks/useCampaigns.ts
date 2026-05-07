// lib/hooks/useCampaigns.ts
"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCampaign,
  deleteCampaign,
  fetchCampaignDetail,
  fetchCampaigns,
  fetchCampaignSubscribers,
  updateCampaign,
  duplicateCampaigns
} from '../api';
import type { CreateCampaignData, UpdateCampaignData } from '../types/email-marketing';
import Cookies from 'js-cookie';

// Fetch all campaigns
export function useCampaigns(page: number = 1, limit: number = 10, search?: string) {
  return useQuery({
    queryKey: ['campaigns', page, limit, search],
    queryFn: async () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchCampaigns(token, page, limit, search);
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
export function useCampaignSubscribers(campaignId: string, page: number = 1, limit: number = 10, search?: string) {
  return useQuery({
    queryKey: ['campaign-subscribers', campaignId, page, limit, search],
    queryFn: async () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchCampaignSubscribers(token, campaignId, page, limit, search);
    },
    enabled: !!campaignId,
  });
}
