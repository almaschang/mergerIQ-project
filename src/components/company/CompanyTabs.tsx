import React from 'react';
import {
  LineChart,
  Share2,
  Activity,
  ShieldAlert,
  CandlestickChart,
  BarChart2,
  Newspaper,
  Calendar,
  FileSearch,
  GitCompare
} from 'lucide-react';

export type CompanyTab =
  | 'overview'
  | 'evidence'
  | 'stress'
  | 'risk'
  | 'stock'
  | 'financials'
  | 'news'
  | 'earnings'
  | 'filings'
  | 'compare';

interface CompanyTabsProps {
  activeTab: CompanyTab;
  onTabChange: (tab: CompanyTab) => void;
}

const TABS: Array<{ id: CompanyTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'overview', label: 'Overview', icon: LineChart },
  { id: 'evidence', label: 'Evidence Lane', icon: Share2 },
  { id: 'stress', label: 'Stress Copilot', icon: Activity },
  { id: 'risk', label: 'Risk Radar', icon: ShieldAlert },
  { id: 'stock', label: 'Stock', icon: CandlestickChart },
  { id: 'financials', label: 'Financials & Analysis', icon: BarChart2 },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'earnings', label: 'Earnings Calls', icon: Calendar },
  { id: 'filings', label: 'SEC Filings', icon: FileSearch },
  { id: 'compare', label: 'Compare', icon: GitCompare }
];

export default function CompanyTabs({ activeTab, onTabChange }: CompanyTabsProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
      <nav className="-mb-px flex space-x-6 min-w-max">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`
              flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === id
                ? 'border-blue-500 text-blue-600 dark:text-blue-300'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}
            `}
          >
            <Icon className="h-5 w-5 mr-2" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}


