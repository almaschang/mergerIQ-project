import React, { useState, useEffect } from 'react';
import { useCompareStocks } from '../../hooks/useCompareStocks';
import ComparisonTable from './comparison/ComparisonTable';
import ComparisonCharts from './comparison/ComparisonCharts';
import { Search, X } from 'lucide-react';
import { API_CONFIG } from '../../config/api';
import { fetchWithFmpApiKey } from '../../utils/market/fmpApiKeys';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([mainSymbol]);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics>({});
  const { comparisons, isLoading: isLoadingComparisons } = useCompareStocks(selectedSymbols);

  useEffect(() => {
    // Fetch similar companies when component mounts
    const fetchSimilarCompanies = async () => {
      try {
        // First try to get peer companies
        const peersResponse = await fetchWithFmpApiKey(
          `${API_CONFIG.FMP_BASE_URL}/stock_peers?symbol=${mainSymbol}`
        );
        
        if (!peersResponse.ok) {
          throw new Error(`Error fetching peers: ${peersResponse.status}`);
        }
        
        const peersData = await peersResponse.json();
        
        if (Array.isArray(peersData) && peersData.length > 0 && peersData[0].peersList) {
          // Get top 3 peers and add them to selected symbols
          const peers = peersData[0].peersList.slice(0, 3);
          setSelectedSymbols(prevSymbols => {
            const newSymbols = [...new Set([mainSymbol, ...peers])];
            return newSymbols.slice(0, 6); // Limit to 6 companies
          });
        } else {
          // If no peers found, try to get companies in the same sector
          const profileResponse = await fetchWithFmpApiKey(
            `${API_CONFIG.FMP_BASE_URL}/profile/${mainSymbol}`
          );
          
          if (!profileResponse.ok) {
            throw new Error(`Error fetching profile: ${profileResponse.status}`);
          }
          
          const profileData = await profileResponse.json();
          if (profileData && profileData[0]?.sector) {
            const sectorResponse = await fetchWithFmpApiKey(
              `${API_CONFIG.FMP_BASE_URL}/stock-screener?sector=${encodeURIComponent(profileData[0].sector)}&limit=5`
            );
            
            if (!sectorResponse.ok) {
              throw new Error(`Error fetching sector companies: ${sectorResponse.status}`);
            }
            
            const sectorData = await sectorResponse.json();
            if (Array.isArray(sectorData)) {
              const sectorPeers = sectorData
                .filter(company => company.symbol !== mainSymbol)
                .slice(0, 3)
                .map(company => company.symbol);
              
              setSelectedSymbols(prevSymbols => {
                const newSymbols = [...new Set([mainSymbol, ...sectorPeers])];
                return newSymbols.slice(0, 6);
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching similar companies:', error);
      }
    };

    fetchSimilarCompanies();
  }, [mainSymbol]);

  useEffect(() => {
    // Fetch financial metrics for selected symbols
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
    if (!searchQuery.trim() || selectedSymbols.includes(searchQuery.toUpperCase())) return;
    if (selectedSymbols.length >= 6) return; // Limit to 6 companies

    try {
      const response = await fetchWithFmpApiKey(
        `${API_CONFIG.FMP_BASE_URL}/profile/${searchQuery}`
      );
      
      if (!response.ok) {
        throw new Error(`Error validating symbol: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setSelectedSymbols(prev => [...prev, searchQuery.toUpperCase()]);
        setSearchQuery('');
      }
    } catch (error) {
      console.error('Error validating symbol:', error);
    }
  };

  const handleRemoveCompany = (symbol: string) => {
    if (symbol !== mainSymbol) {
      setSelectedSymbols(prev => prev.filter(s => s !== symbol));
    }
  };

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
                  ${symbol === mainSymbol
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }
                `}
              >
                {symbol}
                {symbol !== mainSymbol && (
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
          data={comparisons}
          isLoading={isLoadingComparisons}
          mainSymbol={mainSymbol}
          onRemoveCompany={handleRemoveCompany}
          financialMetrics={financialMetrics}
        />
      </div>

      <ComparisonCharts symbols={selectedSymbols} mainSymbol={mainSymbol} />
    </div>
  );
}