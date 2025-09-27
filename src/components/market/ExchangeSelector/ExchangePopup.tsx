import React from 'react';
import { X } from 'lucide-react';
import { Exchange, ExchangeType } from '../../../types/market';

interface ExchangePopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedExchanges: ExchangeType[];
  onExchangeToggle: (exchange: ExchangeType) => void;
  exchanges: Exchange[];
}

export default function ExchangePopup({
  isOpen,
  onClose,
  selectedExchanges,
  onExchangeToggle,
  exchanges
}: ExchangePopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Select Exchanges</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                {exchanges.map((exchange) => (
                  <button
                    key={exchange.id}
                    onClick={() => onExchangeToggle(exchange.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedExchanges.includes(exchange.id)
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedExchanges.includes(exchange.id)}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{exchange.name}</div>
                        <div className="text-sm text-gray-500">{exchange.exchanges.join(', ')}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}