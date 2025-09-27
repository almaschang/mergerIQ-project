import React, { useState } from 'react';
import { useMarketNews } from '../../hooks/useMarketNews';
import { Newspaper, TrendingUp, Coffee, Bell, FileText } from 'lucide-react';
import NewsCard from './NewsCard';

const NEWS_CATEGORIES = [
  { id: 'latest', label: 'Latest News', icon: Newspaper },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'morning-brief', label: 'Wall St. Breakfast', icon: Coffee },
  { id: 'press-releases', label: 'Press Releases', icon: Bell },
  { id: 'transcripts', label: 'Transcripts', icon: FileText }
];

export default function MarketNewsSection() {
  const [activeCategory, setActiveCategory] = useState('latest');
  const { news, isLoading } = useMarketNews(activeCategory);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px overflow-x-auto">
          {NEWS_CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={`
                whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm
                ${activeCategory === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center space-x-2">
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {news.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}