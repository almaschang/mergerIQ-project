import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface CurrencySelectorProps {
  availableCurrencies: { code: string; name: string; }[];
  selectedCurrencies: string[];
  onChange: (currencies: string[]) => void;
}

export default function CurrencySelector({
  availableCurrencies,
  selectedCurrencies,
  onChange
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleCurrency = (currencyCode: string) => {
    if (selectedCurrencies.includes(currencyCode)) {
      // Don't allow less than 2 currencies
      if (selectedCurrencies.length <= 2) return;
      onChange(selectedCurrencies.filter(code => code !== currencyCode));
    } else {
      // Don't allow more than 12 currencies
      if (selectedCurrencies.length >= 12) return;
      onChange([...selectedCurrencies, currencyCode]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <span>Selected Currencies: {selectedCurrencies.length}</span>
        <ChevronDown className="ml-2 -mr-1 h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-96 bg-white rounded-md shadow-lg">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Select Currencies</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-sm text-gray-500 mb-4">
              Select 2-12 currencies to display in the heatmap
            </div>

            <div className="grid grid-cols-2 gap-2">
              {availableCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleToggleCurrency(currency.code)}
                  className={`
                    flex items-center px-3 py-2 rounded-md text-sm
                    ${selectedCurrencies.includes(currency.code)
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedCurrencies.includes(currency.code)}
                    onChange={() => {}}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="ml-2">{currency.code}</span>
                  <span className="ml-1 text-gray-500">- {currency.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}