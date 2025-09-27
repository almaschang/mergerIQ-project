import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useCompanySearch } from '../../hooks/useCompanySearch';

interface StockSelectorProps {
  onSelect: (symbol: string) => void;
  disabled?: boolean;
}

export default function StockSelector({ onSelect, disabled }: StockSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { results, isLoading, setQuery } = useCompanySearch();

  const handleSelect = (symbol: string) => {
    onSelect(symbol);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder={disabled ? "Max 6 stocks reached" : "Add stock to compare..."}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            disabled={disabled}
          />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg">
          <div className="py-1">
            {isLoading ? (
              <div className="px-4 py-2">
                <div className="animate-pulse space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-5 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">
                No results found
              </div>
            ) : (
              results.map((result) => (
                <button
                  key={result.symbol}
                  onClick={() => handleSelect(result.symbol)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <div className="font-medium">{result.symbol}</div>
                  <div className="text-gray-500 text-xs">{result.description}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}