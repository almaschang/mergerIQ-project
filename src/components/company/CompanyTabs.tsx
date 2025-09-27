import React from 'react';
import { LineChart, FileText, BarChart2, Newspaper, FileSearch, GitCompare, Calendar, CandlestickChart } from 'lucide-react';

interface CompanyTabsProps {
  activeTab: 'overview' | 'stock' | 'transcripts' | 'financials' | 'news' | 'filings' | 'compare' | 'earnings';
  onTabChange: (tab: 'overview' | 'stock' | 'transcripts' | 'financials' | 'news' | 'filings' | 'compare' | 'earnings') => void;
}

export default function CompanyTabs({ activeTab, onTabChange }: CompanyTabsProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => onTabChange('overview')}
          className={`
            flex items-center py-4 px-1 border-b-2 font-medium text-sm
            ${activeTab === 'overview'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }
          `}
        >
          <LineChart className="h-5 w-5 mr-2" />
          Overview
        </button>
        <button
          onClick={() => onTabChange('stock')}
          className={`
            flex items-center py-4 px-1 border-b-2 font-medium text-sm
            ${activeTab === 'stock'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }
          `}
        >
          <CandlestickChart className="h-5 w-5 mr-2" />
          Stock
        </button>
        <button
          onClick={() => onTabChange('financials')}
          className={`
            flex items-center py-4 px-1 border-b-2 font-medium text-sm
            ${activeTab === 'financials'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }
          `}
        >
          <BarChart2 className="h-5 w-5 mr-2" />
          Financials & Analysis
        </button>
        <button
          onClick={() => onTabChange('news')}
          className={`
            flex items-center py-4 px-1 border-b-2 font-medium text-sm
            ${activeTab === 'news'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }
          `}
        >
          <Newspaper className="h-5 w-5 mr-2" />
          News
        </button>
        <button
          onClick={() => onTabChange('earnings')}
          className={`
            flex items-center py-4 px-1 border-b-2 font-medium text-sm
            ${activeTab === 'earnings'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }
          `}
        >
          <Calendar className="h-5 w-5 mr-2" />
          Earnings Calls
        </button>
        <button
          onClick={() => onTabChange('filings')}
          className={`
            flex items-center py-4 px-1 border-b-2 font-medium text-sm
            ${activeTab === 'filings'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }
          `}
        >
          <FileSearch className="h-5 w-5 mr-2" />
          SEC Filings
        </button>
        <button
          onClick={() => onTabChange('compare')}
          className={`
            flex items-center py-4 px-1 border-b-2 font-medium text-sm
            ${activeTab === 'compare'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }
          `}
        >
          <GitCompare className="h-5 w-5 mr-2" />
          Compare
        </button>
      </nav>
    </div>
  );
}