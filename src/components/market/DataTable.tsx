import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MarketDataItem } from '../../utils/market/marketDataService';

interface DataTableProps {
  data: MarketDataItem[];
}

export default function DataTable({ data }: DataTableProps) {
  const timeRanges = [
    { key: 'changeToday', label: 'Today' },
    { key: 'change5Day', label: '5 Days' },
    { key: 'change1Month', label: '1 Month' },
    { key: 'changeYTD', label: 'YTD' },
    { key: 'change1Year', label: '1 Year' },
    { key: 'change3Year', label: '3 Years' }
  ] as const;

  const renderChangeValue = (value: number) => {
    const isPositive = value > 0;
    const isFlat = value === 0;
    const Icon = isFlat ? Minus : isPositive ? TrendingUp : TrendingDown;
    const colorClass = isFlat ? 'text-gray-500' : isPositive ? 'text-green-600' : 'text-red-600';

    return (
      <div className={`flex items-center justify-end ${colorClass}`}>
        <Icon className="h-4 w-4 mr-1" />
        {Math.abs(value).toFixed(2)}%
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name/Symbol
            </th>
            {timeRanges.map(({ label }) => (
              <th key={label} className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.symbol} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.symbol}</div>
                </div>
              </td>
              {timeRanges.map(({ key, label }) => (
                <td key={label} className="px-6 py-4 whitespace-nowrap text-right">
                  {renderChangeValue(item[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}