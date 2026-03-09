import { Metadata } from 'next';
import TicketPublicClient from '@/components/ticket-public/TicketPublicClient';

export const metadata: Metadata = {
    title: 'Ticket Creation Integration - SuperContact',
    description: 'Turn Conversations into Concrete Actions. Create task tickets directly from the chat panel, track their resolution, and increase your team accountability.',
};

export default function PublicTicketPage() {
    return <TicketPublicClient />;
}
