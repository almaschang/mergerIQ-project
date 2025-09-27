import React from 'react';
import { 
  Cpu, Microscope, RefreshCw, Coins, Bitcoin, 
  DollarSign, Landmark, LineChart, Car, Flame,
  Building2, Globe2, Rocket, GitMerge, Percent,
  Home, Briefcase, Monitor, TrendingUp
} from 'lucide-react';

export type NewsCategory = 
  | 'trending' | 'ai-tech' | 'biotech' | 'buybacks' | 'commodities'
  | 'crypto' | 'debt-issuance' | 'dividends' | 'earnings' | 'ev'
  | 'energy' | 'financials' | 'global-macro' | 'ipo' | 'ma'
  | 'interest-rates' | 'reits' | 'spacs' | 'tech' | 'us-economy';

const CATEGORIES = [
  { id: 'trending', label: 'Trending News', icon: TrendingUp },
  { id: 'ai-tech', label: 'AI Tech', icon: Cpu },
  { id: 'biotech', label: 'Biotech', icon: Microscope },
  { id: 'buybacks', label: 'Buybacks', icon: RefreshCw },
  { id: 'commodities', label: 'Commodities', icon: Coins },
  { id: 'crypto', label: 'Cryptocurrency', icon: Bitcoin },
  { id: 'debt-issuance', label: 'Debt/Share Issuance', icon: DollarSign },
  { id: 'dividends', label: 'Dividends', icon: Landmark },
  { id: 'earnings', label: 'Earnings', icon: LineChart },
  { id: 'ev', label: 'Electric Vehicles', icon: Car },
  { id: 'energy', label: 'Energy', icon: Flame },
  { id: 'financials', label: 'Financials', icon: Building2 },
  { id: 'global-macro', label: 'Global Macro', icon: Globe2 },
  { id: 'ipo', label: 'IPOs', icon: Rocket },
  { id: 'ma', label: 'M&A', icon: GitMerge },
  { id: 'interest-rates', label: 'Interest Rates', icon: Percent },
  { id: 'reits', label: 'REITs', icon: Home },
  { id: 'spacs', label: 'SPACs', icon: Briefcase },
  { id: 'tech', label: 'Tech', icon: Monitor },
  { id: 'us-economy', label: 'U.S. Economy', icon: Landmark }
] as const;

interface NewsCategoryToolbarProps {
  selectedCategory: NewsCategory;
  onCategorySelect: (category: NewsCategory) => void;
}

export default function NewsCategoryToolbar({ 
  selectedCategory, 
  onCategorySelect 
}: NewsCategoryToolbarProps) {
  return (
    <div className="bg-white dark:bg-dark-100 shadow rounded-lg p-4">
      <div className="space-y-2">
        {CATEGORIES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onCategorySelect(id as NewsCategory)}
            className={`
              w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm
              transition-colors duration-150 ease-in-out
              ${selectedCategory === id
                ? 'bg-blue-50 dark:bg-dark-200 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-200'
              }
            `}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}