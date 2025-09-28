import React, { useState } from 'react';
import StockHeatmap from '../components/heatmap/StockHeatmap';
import ForexHeatmap from '../components/heatmap/ForexHeatmap';
import CurrencySelector from '../components/heatmap/CurrencySelector';
import { AVAILABLE_CURRENCIES } from '../utils/market/currencyOptions';

export default function Heatmaps() {
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([
    'EUR', 'USD', 'JPY', 'GBP', 'CHF', 'AUD', 'CAD', 'NZD'
  ]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-10 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Market Heatmaps</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Stock Market Heatmap</h2>
              <p className="text-sm text-gray-500 mt-1">S&P 500 stocks grouped by sector</p>
            </div>
            <div className="p-4">
              <StockHeatmap />
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Forex Heatmap</h2>
              <div className="mt-2">
                <CurrencySelector 
                  availableCurrencies={AVAILABLE_CURRENCIES}
                  selectedCurrencies={selectedCurrencies}
                  onChange={setSelectedCurrencies}
                />
              </div>
            </div>
            <div className="p-4">
              <ForexHeatmap selectedCurrencies={selectedCurrencies} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
