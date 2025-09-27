import React from 'react';
import TradingViewChart from './TradingViewChart';
import StockOverview from './stock/StockOverview';
import KeyMetrics from './stock/KeyMetrics';
import PerformanceInsights from './stock/PerformanceInsights';
import { useStockData } from '../../hooks/useStockData';

interface CompanyStockProps {
  symbol: string;
}

export default function CompanyStock({ symbol }: CompanyStockProps) {
  const { data, isLoading, error } = useStockData(symbol);

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <p className="text-red-600 dark:text-red-400">Error loading stock data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Chart */}
      <div className="bg-white dark:bg-dark-100 shadow rounded-lg overflow-hidden">
        <TradingViewChart symbol={symbol} />
      </div>

      {/* Market Data Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockOverview 
          data={data?.overview} 
          isLoading={isLoading} 
        />
        <KeyMetrics 
          data={data?.metrics} 
          isLoading={isLoading} 
        />
      </div>

      {/* Performance Insights */}
      <div className="bg-white dark:bg-dark-100 shadow rounded-lg">
        <PerformanceInsights 
          data={data?.performance} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
}