// app/whatsapp-marketing/broadcasting-wa/page.tsx
import BroadcastingWAClient from '@/components/whatsapp-marketing/broadcasting-wa/BroadcastingWAClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WhatsApp Broadcasts | SuperContact',
  description: 'Manage your WhatsApp marketing broadcasts and track delivery statistics.',
};

export default function BroadcastingWAPage() {
  return <BroadcastingWAClient />;
}
