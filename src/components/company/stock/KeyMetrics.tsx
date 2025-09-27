import React from 'react';
import { Building2, DollarSign, Percent, Scale, Coins } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../../../utils/format';

interface KeyMetricsProps {
  data?: {
    marketCap: number;
    peRatio: number;
    eps: number;
    pbRatio: number;
    debtToEquity: number;
    dividendYield: number;
    revenue: number;
    netIncome: number;
  };
  isLoading: boolean;
}

export default function KeyMetrics({ data, isLoading }: KeyMetricsProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-100 shadow rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-dark-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-dark-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const metrics = [
    {
      label: 'Market Cap',
      value: formatCurrency(data.marketCap),
      icon: Building2,
      tooltip: 'Total market value of the company\'s shares'
    },
    {
      label: 'P/E Ratio',
      value: data.peRatio.toFixed(2),
      icon: Scale,
      tooltip: 'Price to Earnings ratio'
    },
    {
      label: 'EPS',
      value: formatCurrency(data.eps),
      icon: DollarSign,
      tooltip: 'Earnings Per Share'
    },
    {
      label: 'P/B Ratio',
      value: data.pbRatio.toFixed(2),
      icon: Scale,
      tooltip: 'Price to Book ratio'
    },
    {
      label: 'Debt/Equity',
      value: data.debtToEquity.toFixed(2),
      icon: Scale,
      tooltip: 'Debt to Equity ratio'
    },
    {
      label: 'Dividend Yield',
      value: formatPercent(data.dividendYield),
      icon: Percent,
      tooltip: 'Annual dividend yield'
    },
    {
      label: 'Revenue',
      value: formatCurrency(data.revenue),
      icon: DollarSign,
      tooltip: 'Annual revenue'
    },
    {
      label: 'Net Income',
      value: formatCurrency(data.netIncome),
      icon: Coins,
      tooltip: 'Annual net income'
    }
  ];

  return (
    <div className="bg-white dark:bg-dark-100 shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Key Financial Metrics</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div 
              key={index}
              className="p-4 bg-gray-50 dark:bg-dark-200 rounded-lg"
              title={metric.tooltip}
            >
              <div className="flex items-center text-gray-500 dark:text-gray-400 mb-1">
                <Icon className="h-4 w-4 mr-2" />
                <span className="text-sm">{metric.label}</span>
              </div>
              <div className="text-lg font-medium text-gray-900 dark:text-white">
                {metric.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}