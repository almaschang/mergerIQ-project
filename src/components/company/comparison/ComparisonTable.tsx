import React from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../../../utils/format';
import { ComparisonData } from '../../../types/comparison';

interface ComparisonTableProps {
  data: ComparisonData[];
  isLoading: boolean;
  mainSymbol: string;
  onRemoveCompany: (symbol: string) => void;
  financialMetrics: {
    [key: string]: {
      peRatio: number;
      priceToSalesRatio: number;
      priceToBookRatio: number;
      evToEBITDA: number;
      debtToEquity: number;
      grossProfitMargin: number;
      operatingMargin: number;
      netProfitMargin: number;
      returnOnEquity: number;
      returnOnAssets: number;
    };
  };
}

export default function ComparisonTable({ 
  data, 
  isLoading, 
  mainSymbol,
  onRemoveCompany,
  financialMetrics
}: ComparisonTableProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse p-6">
        <div className="h-8 bg-gray-200 dark:bg-dark-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-6 bg-gray-200 dark:bg-dark-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const metrics = [
    { key: 'name' as const, label: 'Company Name' },
    { key: 'sector' as const, label: 'Sector' },
    { key: 'industry' as const, label: 'Industry' },
    { key: 'marketCap' as const, label: 'Market Cap', format: formatCurrency },
    { key: 'enterpriseValue' as const, label: 'Enterprise Value', format: formatCurrency },
    { key: 'currentPrice' as const, label: 'Current Price', format: formatCurrency },
    { key: 'dayChange' as const, label: 'Day Change %', format: formatPercent },
    { key: 'volume' as const, label: 'Volume', format: formatNumber },
    { label: 'P/E Ratio', getValue: (item: ComparisonData) => financialMetrics[item.symbol]?.peRatio ?? item.peRatio, format: (v: number) => v.toFixed(2) },
    { label: 'P/S Ratio', getValue: (item: ComparisonData) => financialMetrics[item.symbol]?.priceToSalesRatio ?? item.priceToSales, format: (v: number) => v.toFixed(2) },
    { label: 'P/B Ratio', getValue: (item: ComparisonData) => financialMetrics[item.symbol]?.priceToBookRatio ?? item.priceToBook, format: (v: number) => v.toFixed(2) },
    { label: 'EV/EBITDA', getValue: (item: ComparisonData) => financialMetrics[item.symbol]?.evToEBITDA, format: (v: number) => v.toFixed(2) },
    { label: 'Debt/Equity', getValue: (item: ComparisonData) => financialMetrics[item.symbol]?.debtToEquity, format: (v: number) => v.toFixed(2) },
    { label: 'Gross Margin', getValue: (item: ComparisonData) => financialMetrics[item.symbol]?.grossProfitMargin, format: (v: number) => formatPercent(v * 100) },
    { label: 'Operating Margin', getValue: (item: ComparisonData) => financialMetrics[item.symbol]?.operatingMargin, format: (v: number) => formatPercent(v * 100) },
    { label: 'Net Margin', getValue: (item: ComparisonData) => financialMetrics[item.symbol]?.netProfitMargin, format: (v: number) => formatPercent(v * 100) },
    { label: 'ROE', getValue: (item: ComparisonData) => financialMetrics[item.symbol]?.returnOnEquity, format: (v: number) => formatPercent(v * 100) },
    { label: 'ROA', getValue: (item: ComparisonData) => financialMetrics[item.symbol]?.returnOnAssets, format: (v: number) => formatPercent(v * 100) }
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 dark:bg-dark-50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Metric
            </th>
            {data.map(item => (
              <th key={item.symbol} className="px-6 py-3 bg-gray-50 dark:bg-dark-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className={`font-medium ${item.symbol === mainSymbol ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                      {item.symbol}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.name}</div>
                  </div>
                  {item.symbol !== mainSymbol && (
                    <button
                      onClick={() => onRemoveCompany(item.symbol)}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
          {metrics.map((metric) => (
            <tr key={metric.label} className="hover:bg-gray-50 dark:hover:bg-dark-200">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {metric.label}
              </td>
              {data.map(item => {
                let value;
                let formattedValue;

                if ('key' in metric) {
                  value = item[metric.key];
                  formattedValue = metric.format ? metric.format(value) : value;
                } else if (metric.getValue) {
                  value = metric.getValue(item);
                  formattedValue = value !== undefined ? metric.format(value) : 'N/A';
                }

                const isChangeMetric = metric.label.includes('Change') || metric.label.includes('Margin') || metric.label.includes('ROE') || metric.label.includes('ROA');
                const isPositive = isChangeMetric && value > 0;
                const isNegative = isChangeMetric && value < 0;

                return (
                  <td key={item.symbol} className={`px-6 py-4 whitespace-nowrap text-sm ${
                    item.symbol === mainSymbol ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}>
                    <div className={`flex items-center justify-center ${
                      isPositive ? 'text-green-600 dark:text-green-400' :
                      isNegative ? 'text-red-600 dark:text-red-400' :
                      'text-gray-500 dark:text-gray-400'
                    }`}>
                      {isChangeMetric && value !== 0 && (
                        value > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {formattedValue}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
