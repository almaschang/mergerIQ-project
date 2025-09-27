import React from 'react';
import useSWR from 'swr';
import { fetchTopStocks } from '../../utils/api';
import StockTicker from './StockTicker';

export default function TopStocks() {
  const { data: symbols } = useSWR('top-stocks', fetchTopStocks);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900">Market Overview</h2>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {!symbols ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse h-8 bg-gray-200 rounded"></div>
          ))
        ) : (
          symbols.map((symbol) => (
            <StockTicker key={symbol} symbol={symbol} />
          ))
        )}
      </div>
    </div>
  );
}