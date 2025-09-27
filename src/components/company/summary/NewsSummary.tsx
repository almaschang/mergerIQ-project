import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Newspaper } from 'lucide-react';
import { MarketNews } from '../../../types/market';
import { summarizeNews } from '../../../utils/market/news/newsAnalysis';
import SummaryContent from './SummaryContent';

interface NewsSummaryProps {
  news: MarketNews[];
}

export default function NewsSummary({ news }: NewsSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleToggle = async () => {
    if (!summary && !isExpanded) {
      const generatedSummary = await summarizeNews(news);
      setSummary(generatedSummary);
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center">
          <Newspaper className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">News Summary</h2>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <SummaryContent summary={summary} isLoading={!summary} />
      )}
    </div>
  );
}