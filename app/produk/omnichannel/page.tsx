import { Metadata } from 'next';
import OmniPublicClient from '@/components/public-omnichannel/OmniPublicClient';

export const metadata: Metadata = {
    title: 'Omnichannel - SuperContact',
    description: 'One Inbox for All Customer Messages. Manage WhatsApp, Instagram DM, and other channels in one unified platform.',
};

export default function OmnichannelAppPage() {
    return <OmniPublicClient />;
}
