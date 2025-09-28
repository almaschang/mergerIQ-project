import React from 'react';
import TradingViewMarketQuotes from '../components/market/TradingViewMarketQuotes';

export default function MarketData() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-10 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Market Data</h1>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="h-[calc(100vh-12rem)]">
            <TradingViewMarketQuotes />
          </div>
        </div>
      </div>
    </div>
  );
}
