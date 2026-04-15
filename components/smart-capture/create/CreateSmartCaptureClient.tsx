"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Layers, MessageSquare, Code } from 'lucide-react';

import { AppButton } from '@/components/ui/app-button';
import RewardSetupTab from './RewardSetupTab';
import DynamicFormTab from './DynamicFormTab';
import OutreachHookTab from './OutreachHookTab';
import EmbedShareTab from './EmbedShareTab';

export default function CreateSmartCaptureClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(1);

  const TABS = [
    { id: 1, label: '1. Reward Setup', icon: FileText },
    { id: 2, label: '2. Dynamic Form', icon: Layers },
    { id: 3, label: '3. Outreach Hook', icon: MessageSquare },
    { id: 4, label: '4. Embed & Share', icon: Code },
  ];

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6 pb-20">

      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <AppButton
            variantStyle="outline"
            startIcon={<ArrowLeft size={16} />}
            onClick={() => router.push('/smart-capture')}
            className="rounded-lg shadow-sm"
          >
            Back
          </AppButton>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Create New Lead Magnet
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Lead Magnets
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AppButton
            variantStyle="outline"
            color="primary"
            className="rounded-lg"
          >
            Save As Draft
          </AppButton>
          <AppButton
            variantStyle="primary"
            className="rounded-lg"
          >
            Publish And Finish
          </AppButton>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col md:flex-row gap-6 items-start">

        {/* Left Sidebar Tabs */}
        <div className="w-full md:w-64 bg-white rounded-xl border border-gray-200 p-4 shrink-0 shadow-sm flex flex-col gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${isActive
                    ? 'bg-blue-100/50 text-[#5479EE]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
              >
                <Icon size={18} className={isActive ? 'text-[#5479EE]' : 'text-gray-400'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 w-full">
          {activeTab === 1 && <RewardSetupTab />}
          {activeTab === 2 && <DynamicFormTab />}
          {activeTab === 3 && <OutreachHookTab />}
          {activeTab === 4 && <EmbedShareTab />}
        </div>

      </div>

    </div>
  );
}
