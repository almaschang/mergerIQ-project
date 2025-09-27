import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MarketNews } from '../../types/market';
import { ExternalLink } from 'lucide-react';

interface NewsCardProps {
  news: MarketNews;
}

export default function NewsCard({ news }: NewsCardProps) {
  return (
    <a
      href={news.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block hover:bg-gray-50 dark:hover:bg-dark-200 rounded-lg transition-colors"
    >
      <div className="flex items-start space-x-4">
        {news.image && (
          <img
            src={news.image}
            alt={news.headline}
            className="w-24 h-24 object-cover rounded-lg"
          />
        )}
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600">
            {news.headline}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{news.summary}</p>
          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span>{news.source}</span>
            <span className="mx-2">•</span>
            <span>{formatDistanceToNow(new Date(news.datetime * 1000))} ago</span>
            <ExternalLink className="ml-2 h-4 w-4" />
          </div>
        </div>
      </div>
    </a>
  );
}