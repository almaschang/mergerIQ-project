import React from 'react';
import { ChevronDown } from 'lucide-react';
import { ExchangeType } from '../../../types/market';
import { EXCHANGE_OPTIONS } from '../../../utils/market/exchangeOptions';

interface ExchangeButtonProps {
  selectedExchanges: ExchangeType[];
  onClick: () => void;
}

export default function ExchangeButton({ selectedExchanges, onClick }: ExchangeButtonProps) {
  const getDisplayText = () => {
    if (selectedExchanges.length === 0) return 'Select Exchanges';
    if (selectedExchanges.length === 1) {
      const exchange = EXCHANGE_OPTIONS.find(e => e.id === selectedExchanges[0]);
      return exchange?.name || 'Select Exchanges';
    }
    return `${selectedExchanges.length} Exchanges Selected`;
  };

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <span>{getDisplayText()}</span>
      <ChevronDown className="ml-2 -mr-1 h-5 w-5 text-gray-400" />
    </button>
  );
}