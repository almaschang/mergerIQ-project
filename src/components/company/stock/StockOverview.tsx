import React from 'react';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../../../utils/format';

interface StockOverviewProps {
  data?: {
    currentPrice: number;
    dayChange: number;
    dayChangePercent: number;
    dayHigh: number;
    dayLow: number;
    openPrice: number;
    prevClose: number;
    weekHigh52: number;
    weekLow52: number;
    preMarket?: {
      price: number;
      change: number;
      changePercent: number;
    };
    afterHours?: {
      price: number;
      change: number;
      changePercent: number;
    };
  };
  isLoading: boolean;
}

export default function StockOverview({ data, isLoading }: StockOverviewProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-100 shadow rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-dark-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-dark-200 rounded"></div>
          <div className="h-6 bg-gray-200 dark:bg-dark-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isPositive = data.dayChangePercent >= 0;
  const Arrow = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="bg-white dark:bg-dark-100 shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Market Data</h2>
      
      {/* Current Price and Change */}
      <div className="mb-6">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(data.currentPrice)}
        </div>
        <div className="flex items-center mt-2">
          <Arrow className={`h-5 w-5 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
          <span className={`text-lg font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(data.dayChange))} ({formatPercent(data.dayChangePercent)})
          </span>
        </div>
      </div>

      {/* Trading Hours Data */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Open</div>
          <div className="font-medium">{formatCurrency(data.openPrice)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Previous Close</div>
          <div className="font-medium">{formatCurrency(data.prevClose)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Day High</div>
          <div className="font-medium">{formatCurrency(data.dayHigh)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Day Low</div>
          <div className="font-medium">{formatCurrency(data.dayLow)}</div>
        </div>
      </div>

      {/* 52 Week Range */}
      <div className="mb-6">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">52 Week Range</div>
        <div className="flex items-center space-x-2">
          <span className="font-medium">{formatCurrency(data.weekLow52)}</span>
          <div className="flex-1 h-1 bg-gray-200 dark:bg-dark-200 rounded">
            <div 
              className="h-1 bg-blue-600 rounded"
              style={{
                width: `${((data.currentPrice - data.weekLow52) / (data.weekHigh52 - data.weekLow52)) * 100}%`
              }}
            ></div>
          </div>
          <span className="font-medium">{formatCurrency(data.weekHigh52)}</span>
        </div>
      </div>

      {/* Extended Hours Trading */}
      {(data.preMarket || data.afterHours) && (
        <div className="border-t dark:border-dark-200 pt-4">
          {data.preMarket && (
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Pre-Market</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">{formatCurrency(data.preMarket.price)}</span>
                <span className={`ml-2 ${data.preMarket.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(data.preMarket.changePercent)}
                </span>
              </div>
            </div>
          )}
          {data.afterHours && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500 dark:text-gray-400">After Hours</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">{formatCurrency(data.afterHours.price)}</span>
                <span className={`ml-2 ${data.afterHours.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(data.afterHours.changePercent)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}