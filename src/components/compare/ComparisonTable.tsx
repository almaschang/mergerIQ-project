import React from 'react';
import { X } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/format';
import { ComparisonData } from '../../types/comparison';

interface ComparisonTableProps {
  data: ComparisonData[];
  isLoading: boolean;
  onRemoveStock: (symbol: string) => void;
}

export default function ComparisonTable({ data, isLoading, onRemoveStock }: ComparisonTableProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse p-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-6 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="p-6 text-center text-gray-500">
        No stocks selected for comparison
      </div>
    );
  }

  const metrics = [
    { key: 'name' as const, label: 'Company Name' },
    { key: 'sector' as const, label: 'Sector' },
    { key: 'industry' as const, label: 'Industry' },
    { key: 'marketCap' as const, label: 'Market Cap', format: formatCurrency },
    { key: 'enterpriseValue' as const, label: 'Enterprise Value', format: formatCurrency },
    { key: 'employees' as const, label: 'Employees', format: formatNumber },
    { key: 'analystCount' as const, label: 'SA Analysts Covering', format: formatNumber },
    { key: 'wallStreetAnalysts' as const, label: 'Wall St. Analysts', format: formatNumber }
  ] as const;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Profile
            </th>
            {data.map(item => (
              <th key={item.symbol} className="px-6 py-3 bg-gray-50 text-center">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{item.symbol}</span>
                  <button
                    onClick={() => onRemoveStock(item.symbol)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {metrics.map(({ key, label, format }) => (
            <tr key={key}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {label}
              </td>
              {data.map(item => (
                <td key={item.symbol} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {format ? format(item[key]) : item[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}