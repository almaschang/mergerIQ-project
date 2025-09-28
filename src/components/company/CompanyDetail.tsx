import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useCompanyDetail } from '../../hooks/useCompanyDetail';
import CompanyTabs, { CompanyTab } from './CompanyTabs';
import CompanyOverview from './CompanyOverview';
import CompanyStock from './CompanyStock';
import CompanyFinancials from './CompanyFinancials';
import CompanyNews from './CompanyNews';
import CompanyFilings from './CompanyFilings';
import CompanyComparison from './CompanyComparison';
import LoadingState from '../common/LoadingState';
import AISummaryTab from './AISummaryTab';
import EarningsCallsTab from './EarningsCallsTab';
import EvidenceLane from './evidence/EvidenceLane';
import ScenarioStressCopilot from './stress/ScenarioStressCopilot';
import RegulatoryRiskRadar from './risk/RegulatoryRiskRadar';

interface CompanyDetailProps {
  symbol: string;
  onBack: () => void;
}

export default function CompanyDetail({ symbol, onBack }: CompanyDetailProps) {
  const [activeTab, setActiveTab] = useState<CompanyTab>('overview');
  const { profile, news, isLoading, isError } = useCompanyDetail(symbol);
  const containerClasses = 'w-full px-4 sm:px-6 lg:px-10 py-8';

  const companyData = {
    profile: {
      description: profile?.description,
      industry: profile?.industry,
      sector: profile?.sector,
      employees: profile?.employees,
      marketCap: profile?.marketCap,
      price: profile?.price,
    },
    financials: {
      revenue: profile?.revenue,
      netIncome: profile?.netIncome,
      eps: profile?.eps,
      peRatio: profile?.peRatio,
    },
    news: news?.slice(0, 5),
  };

  if (isError) {
    return (
      <div className={containerClasses}>
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">Unable to load company information.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (!profile) {
    return (
      <div className={containerClasses}>
        <div className="bg-yellow-50 p-4 rounded-md">
          <p className="text-yellow-700">Company not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Dashboard
      </button>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-9">
          <CompanyTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === 'overview' ? (
            <CompanyOverview profile={profile} symbol={symbol} news={news} />
          ) : activeTab === 'evidence' ? (
            <EvidenceLane symbol={symbol} />
          ) : activeTab === 'stress' ? (
            <ScenarioStressCopilot symbol={symbol} />
          ) : activeTab === 'risk' ? (
            <RegulatoryRiskRadar symbol={symbol} />
          ) : activeTab === 'stock' ? (
            <CompanyStock symbol={symbol} />
          ) : activeTab === 'financials' ? (
            <CompanyFinancials symbol={symbol} />
          ) : activeTab === 'news' ? (
            <CompanyNews news={news} />
          ) : activeTab === 'filings' ? (
            <CompanyFilings symbol={symbol} />
          ) : activeTab === 'compare' ? (
            <CompanyComparison mainSymbol={symbol} />
          ) : activeTab === 'earnings' ? (
            <EarningsCallsTab symbol={symbol} />
          ) : null}
        </div>

        <div className="col-span-12 lg:col-span-3">
          <AISummaryTab companyData={companyData} symbol={symbol} />
        </div>
      </div>
    </div>
  );
}
