"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { fetchSmartCaptureById } from '@/lib/api/smart-captures';
import { SmartCapture } from '@/lib/models/types';
import CreateSmartCaptureClient from '../create/CreateSmartCaptureClient';
import { CircularProgress } from '@mui/material';
import { notify } from '@/lib/notifications';

interface EditSmartCaptureClientProps {
  id: string;
}

export default function EditSmartCaptureClient({ id }: EditSmartCaptureClientProps) {
  const [data, setData] = useState<SmartCapture | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = Cookies.get('access_token');
        if (!token) {
          router.push('/login');
          return;
        }
        const response = await fetchSmartCaptureById(token, id);
        if (response.success) {
          setData(response.data);
        } else {
          notify.error("Failed to load campaign data");
          router.push('/smart-capture');
        }
      } catch (error: any) {
        notify.error(error.message || "Error loading campaign");
        router.push('/smart-capture');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <CircularProgress size={40} sx={{ color: '#5479EE' }} />
        <p className="text-gray-500 font-medium animate-pulse">Loading campaign data...</p>
      </div>
    );
  }

  if (!data) return null;

  return <CreateSmartCaptureClient initialData={data} mode="edit" />;
}
