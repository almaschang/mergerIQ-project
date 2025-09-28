import React, { useState } from 'react';
import { Search, BarChart2, Building2, LineChart, ScanLine, Calendar, Grid } from 'lucide-react';
import { useCompanySearch } from '../hooks/useCompanySearch';
import SearchResults from './search/SearchResults';
import { useTheme } from '../contexts/ThemeContext';

interface NavbarProps {
  onCompanySelect: (symbol: string) => void;
  onNavigate: (page: 'dashboard' | 'market-data' | 'screener' | 'calendar' | 'heatmaps') => void;
  currentPage: 'dashboard' | 'market-data' | 'screener' | 'calendar' | 'heatmaps';
}

export default function Navbar({ onCompanySelect, onNavigate, currentPage }: NavbarProps) {
  const { results, isLoading, setQuery } = useCompanySearch();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleCompanySelect = (symbol: string) => {
    onCompanySelect(symbol);
    setIsSearchFocused(false);
  };

  return (
    <nav className="bg-white dark:bg-dark-50 border-b border-gray-200 dark:border-dark-200">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <BarChart2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">MergerIQ</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  currentPage === 'dashboard' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Building2 className="h-5 w-5 mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('market-data')}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  currentPage === 'market-data' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <LineChart className="h-5 w-5 mr-2" />
                Market Data
              </button>
              <button
                onClick={() => onNavigate('screener')}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  currentPage === 'screener' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <ScanLine className="h-5 w-5 mr-2" />
                Stock Screener
              </button>
              <button
                onClick={() => onNavigate('calendar')}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  currentPage === 'calendar' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Calendar
              </button>
              <button
                onClick={() => onNavigate('heatmaps')}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  currentPage === 'heatmaps' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Grid className="h-5 w-5 mr-2" />
                Heatmaps
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-100 text-gray-900 dark:text-white"
                  placeholder="Search companies..."
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                />
                {isSearchFocused && (
                  <SearchResults
                    results={results}
                    isLoading={isLoading}
                    onSelect={handleCompanySelect}
                  />
                )}
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-dark-200 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
