import React, { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useCompareStocks } from '../../hooks/useCompareStocks';
import { buildPeerUniverse } from '../../hooks/useScenarioCopilot';
import ComparisonTable from './comparison/ComparisonTable';
import ComparisonCharts from './comparison/ComparisonCharts';
import { API_CONFIG } from '../../config/api';
import { fetchWithFmpApiKey } from '../../utils/market/fmpApiKeys';
import { ComparisonData } from '../../types/comparison';

interface CompanyComparisonProps {
  mainSymbol: string;
}

interface FinancialMetrics {
  [key: string]: {
    peRatio: number;
    priceToSalesRatio: number;
    priceToBookRatio: number;
    evToEBITDA: number;
    debtToEquity: number;
    grossProfitMargin: number;
    operatingMargin: number;
    netProfitMargin: number;
    returnOnEquity: number;
    returnOnAssets: number;
  };
}

export default function CompanyComparison({ mainSymbol }: CompanyComparisonProps) {
  const normalizedMain = mainSymbol.toUpperCase();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([normalizedMain]);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics>({});

  const { comparisons, isLoading: isLoadingComparisons } = useCompareStocks(selectedSymbols);

  useEffect(() => {
    setSelectedSymbols([normalizedMain]);
  }, [normalizedMain]);

  useEffect(() => {
    let cancelled = false;

    const hydratePeers = async () => {
      const universe = await buildPeerUniverse(normalizedMain);
      if (cancelled || !universe.length) {
        return;
      }

      const normalized = universe.map((symbol) => symbol.toUpperCase()).slice(0, 6);

      setSelectedSymbols((prev) => {
        const isSame = prev.length === normalized.length && prev.every((sym, index) => sym === normalized[index]);
        return isSame ? prev : normalized;
      });
    };

    hydratePeers();

    return () => {
      cancelled = true;
    };
  }, [normalizedMain]);

  useEffect(() => {
    const fetchFinancialMetrics = async () => {
      const metrics: FinancialMetrics = {};

      await Promise.all(
        selectedSymbols.map(async (symbol) => {
          try {
            const response = await fetchWithFmpApiKey(
              `${API_CONFIG.FMP_BASE_URL}/key-metrics-ttm/${symbol}`
            );

            if (!response.ok) {
              throw new Error(`Error fetching metrics: ${response.status}`);
            }

            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
              metrics[symbol] = {
                peRatio: data[0].peRatioTTM || 0,
                priceToSalesRatio: data[0].priceToSalesRatioTTM || 0,
                priceToBookRatio: data[0].pbRatioTTM || 0,
                evToEBITDA: data[0].enterpriseValueOverEBITDATTM || 0,
                debtToEquity: data[0].debtToEquityTTM || 0,
                grossProfitMargin: data[0].grossProfitMarginTTM || 0,
                operatingMargin: data[0].operatingProfitMarginTTM || 0,
                netProfitMargin: data[0].netProfitMarginTTM || 0,
                returnOnEquity: data[0].roeTTM || 0,
                returnOnAssets: data[0].roaTTM || 0
              };
            }
          } catch (error) {
            console.error(`Error fetching metrics for ${symbol}:`, error);
          }
        })
      );

      setFinancialMetrics(metrics);
    };

    if (selectedSymbols.length > 0) {
      fetchFinancialMetrics();
    }
  }, [selectedSymbols]);

  const handleAddCompany = async () => {
    const normalizedQuery = searchQuery.trim().toUpperCase();
    if (!normalizedQuery || selectedSymbols.includes(normalizedQuery) || selectedSymbols.length >= 6) return;

    try {
      const response = await fetchWithFmpApiKey(
        `${API_CONFIG.FMP_BASE_URL}/profile/${normalizedQuery}`
      );

      if (!response.ok) {
        throw new Error(`Error validating symbol: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setSelectedSymbols(prev => [...prev, normalizedQuery]);
        setSearchQuery('');
      }
    } catch (error) {
      console.error('Error validating symbol:', error);
    }
  };

  const handleRemoveCompany = (symbol: string) => {
    if (symbol !== normalizedMain) {
      setSelectedSymbols(prev => prev.filter(s => s !== symbol));
    }
  };

  const orderedComparisons = useMemo<ComparisonData[]>(() => {
    if (!comparisons.length) {
      return [];
    }

    const map = new Map(comparisons.map((item) => [item.symbol, item]));
    const ordered = selectedSymbols
      .map((symbol) => map.get(symbol))
      .filter((item): item is ComparisonData => Boolean(item));

    if (!ordered.length) {
      return comparisons;
    }

    return ordered;
  }, [comparisons, selectedSymbols]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-dark-100 shadow rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Compare Companies</h2>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCompany()}
                placeholder="Add company symbol..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-100"
                disabled={selectedSymbols.length >= 6}
              />
            </div>
            <button
              onClick={handleAddCompany}
              disabled={!searchQuery.trim() || selectedSymbols.length >= 6}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedSymbols.map(symbol => (
              <div
                key={symbol}
                className={`
                  inline-flex items-center px-3 py-1 rounded-full text-sm
                  ${symbol === normalizedMain
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }
                `}
              >
                {symbol}
                {symbol !== normalizedMain && (
                  <X 
                    className="h-4 w-4 ml-2 cursor-pointer" 
                    onClick={() => handleRemoveCompany(symbol)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <ComparisonTable 
          data={orderedComparisons.length ? orderedComparisons : comparisons}
          isLoading={isLoadingComparisons}
          mainSymbol={normalizedMain}
          onRemoveCompany={handleRemoveCompany}
          financialMetrics={financialMetrics}
        />
      </div>

      <ComparisonCharts companies={orderedComparisons.length ? orderedComparisons : comparisons} mainSymbol={normalizedMain} />
    </div>
  );
}

