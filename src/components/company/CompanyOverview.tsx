import React from 'react';
import CompanyProfile from './CompanyProfile';
import TradingViewProfile from './TradingViewProfile';
import { CompanyProfile as ICompanyProfile } from '../../types/company';
import { MarketNews } from '../../types/market';

interface CompanyOverviewProps {
  profile: ICompanyProfile;
  symbol: string;
  news: MarketNews[];
}

export default function CompanyOverview({ profile, symbol }: CompanyOverviewProps) {
  return (
    <div className="space-y-6">
      <CompanyProfile profile={profile} />

      <div className="bg-white dark:bg-dark-100 shadow rounded-lg overflow-hidden">
        <TradingViewProfile symbol={symbol} />
      </div>
    </div>
  );
}