import React from 'react';
import TechnicalAnalysis from './widgets/TechnicalAnalysis';
import FinancialsWidget from './widgets/FinancialsWidget';

interface CompanyFinancialsProps {
  symbol: string;
}

export default function CompanyFinancials({ symbol }: CompanyFinancialsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-100 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Technical Analysis</h3>
          <TechnicalAnalysis symbol={symbol} />
        </div>
        <div className="bg-white dark:bg-dark-100 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Financial Data</h3>
          <FinancialsWidget symbol={symbol} />
        </div>
      </div>
    </div>
  );
}