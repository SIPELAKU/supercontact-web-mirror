import { Metadata } from 'next';
import FinanceClient from '@/components/solution-finance/FinanceClient';

export const metadata: Metadata = {
    title: 'Finance Industry Solution - SuperContact',
    description: 'Increase Credit Disbursement & Customer Service. SmartSales helps banks, cooperatives, and multifinance companies manage credit prospects.',
};

export default function SolusiKeuanganPage() {
    return <FinanceClient />;
}
