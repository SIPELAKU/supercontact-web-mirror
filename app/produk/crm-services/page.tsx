import { Metadata } from 'next';
import CrmServicesClient from '@/components/crm-services/CrmServicesClient';

export const metadata: Metadata = {
    title: 'CRM Services - SuperContact',
    description: 'Provide exceptional service without friction with SuperContact CRM Services',
};

export default function CrmServicesPage() {
    return <CrmServicesClient />;
}
