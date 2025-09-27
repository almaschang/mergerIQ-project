import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useMarketNews } from '../../hooks/useMarketNews';
import NewsItem from './NewsItem';
import NewsItemSkeleton from './NewsItemSkeleton';

export default function MarketNews() {
  const { news, isLoading, isError } = useMarketNews();

  if (isError) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900">Market News</h2>
        <p className="text-sm text-gray-500 mt-4">Unable to load market news at this time.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900">Market News</h2>
      <div className="mt-4 space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <NewsItemSkeleton key={i} />)
        ) : news.length === 0 ? (
          <p className="text-sm text-gray-500">No news available at this time.</p>
        ) : (
          news.slice(0, 5).map((item) => (
            <NewsItem
              key={item.id}
              headline={item.headline}
              url={item.url}
              datetime={item.datetime}
              source={item.source}
            />
          ))
        )}
      </div>
    </div>
  );
}