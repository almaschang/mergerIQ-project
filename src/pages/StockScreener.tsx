import React, { useState } from 'react';
import TradingViewScreener from '../components/market/TradingViewScreener';
import ScreenerControls from '../components/market/ScreenerControls';
import { ExchangeType } from '../types/market';

export default function StockScreener() {
  const [selectedExchanges, setSelectedExchanges] = useState<ExchangeType[]>(['usa']);

  const handleExchangeToggle = (exchange: ExchangeType) => {
    setSelectedExchanges(prev => {
      if (prev.includes(exchange)) {
        // Don't allow deselecting if it's the last exchange
        if (prev.length === 1) return prev;
        return prev.filter(e => e !== exchange);
      }
      return [...prev, exchange];
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Stock Screener</h1>
        
        <div className="bg-white shadow rounded-lg overflow-hidden p-6">
          <ScreenerControls
            selectedExchanges={selectedExchanges}
            onExchangeToggle={handleExchangeToggle}
          />
          
          <div className="h-[calc(100vh-16rem)]">
            <TradingViewScreener selectedExchanges={selectedExchanges} />
          </div>
        </div>
      </div>
    </div>
  );
}