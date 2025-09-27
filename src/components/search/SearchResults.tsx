import React from 'react';
import { Building2 } from 'lucide-react';

interface SearchResultsProps {
  results: any[];
  isLoading: boolean;
  onSelect: (symbol: string) => void;
}

export default function SearchResults({ results, isLoading, onSelect }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="absolute top-full mt-1 w-full bg-white dark:bg-dark-100 rounded-md shadow-lg py-1 z-50">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="px-4 py-2">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-dark-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-dark-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!results.length) return null;

  return (
    <div className="absolute top-full mt-1 w-full bg-white dark:bg-dark-100 rounded-md shadow-lg py-1 z-50">
      {results.map((result) => (
        <button
          key={result.symbol}
          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-200 flex items-center"
          onClick={() => onSelect(result.symbol)}
        >
          <Building2 className="h-5 w-5 text-gray-400 mr-3" />
          <div>
            <div className="font-medium text-sm text-gray-900 dark:text-white">{result.symbol}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{result.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}