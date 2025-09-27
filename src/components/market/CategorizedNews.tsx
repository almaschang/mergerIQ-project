import React from 'react';
import { useMarketNews } from '../../hooks/useMarketNews';
import NewsCard from './NewsCard';
import { NewsCategory } from './NewsCategoryToolbar';

interface CategorizedNewsProps {
  category: NewsCategory;
}

export default function CategorizedNews({ category }: CategorizedNewsProps) {
  const { news, isLoading } = useMarketNews(category);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No news available for this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {news.map((item) => (
        <NewsCard key={item.id} news={item} />
      ))}
    </div>
  );
}