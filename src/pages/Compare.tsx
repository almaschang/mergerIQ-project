import React, { useState } from 'react';
import ComparisonTable from '../components/compare/ComparisonTable';
import StockSelector from '../components/compare/StockSelector';
import { useCompareStocks } from '../hooks/useCompareStocks';

export default function Compare() {
  const [selectedStocks, setSelectedStocks] = useState<string[]>(['AAPL']);
  const { comparisons, isLoading } = useCompareStocks(selectedStocks);

  const handleAddStock = (symbol: string) => {
    if (selectedStocks.length < 6 && !selectedStocks.includes(symbol)) {
      setSelectedStocks([...selectedStocks, symbol]);
    }
  };

  const handleRemoveStock = (symbol: string) => {
    setSelectedStocks(selectedStocks.filter(s => s !== symbol));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Stock Comparison</h1>
          <StockSelector 
            onSelect={handleAddStock}
            disabled={selectedStocks.length >= 6}
          />
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ComparisonTable 
            data={comparisons}
            isLoading={isLoading}
            onRemoveStock={handleRemoveStock}
          />
        </div>
      </div>
    </div>
  );
}