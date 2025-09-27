import React from 'react';
import { TrendingUp, TrendingDown, Activity, Users, Target } from 'lucide-react';
import { formatPercent } from '../../../utils/format';

interface PerformanceInsightsProps {
  data?: {
    historicalPerformance: {
      period: string;
      change: number;
    }[];
    volatility: number;
    beta: number;
    shortInterest: number;
    institutionalHoldings: number;
    analystRatings: {
      buy: number;
      hold: number;
      sell: number;
      targetPrice: number;
    };
  };
  isLoading: boolean;
}

export default function PerformanceInsights({ data, isLoading }: PerformanceInsightsProps) {
  if (isLoading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-dark-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-dark-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Performance Insights</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historical Performance */}
        <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Historical Performance
          </h3>
          <div className="space-y-3">
            {data.historicalPerformance.map((period, index) => {
              const isPositive = period.change >= 0;
              const Icon = isPositive ? TrendingUp : TrendingDown;
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{period.period}</span>
                  <div className="flex items-center">
                    <Icon className={`h-4 w-4 mr-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(period.change)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Risk Metrics
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Volatility</div>
              <div className="text-lg font-medium">{formatPercent(data.volatility)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Beta</div>
              <div className="text-lg font-medium">{data.beta.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Short Interest</div>
              <div className="text-lg font-medium">{formatPercent(data.shortInterest)}</div>
            </div>
          </div>
        </div>

        {/* Institutional & Analyst Insights */}
        <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Analyst Coverage
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Institutional Holdings</div>
              <div className="text-lg font-medium">{formatPercent(data.institutionalHoldings)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Analyst Ratings</div>
              <div className="flex space-x-4">
                <div className="text-green-600">Buy: {data.analystRatings.buy}</div>
                <div className="text-yellow-600">Hold: {data.analystRatings.hold}</div>
                <div className="text-red-600">Sell: {data.analystRatings.sell}</div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Price Target</div>
              <div className="flex items-center">
                <Target className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-lg font-medium">${data.analystRatings.targetPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}