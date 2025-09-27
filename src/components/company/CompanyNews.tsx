import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import { MarketNews } from '../../types/market';
import NewsCard from './NewsCard';

interface CompanyNewsProps {
  news: MarketNews[];
}

type NewsTab = 'news' | 'analysis';

export default function CompanyNews({ news }: CompanyNewsProps) {
  const [activeTab, setActiveTab] = useState<NewsTab>('news');

  // Split news into regular news and analysis articles
  const newsArticles = news.filter(article => !article.isAnalysis);
  const analysisArticles = news.filter(article => article.isAnalysis);

  const displayArticles = activeTab === 'news' ? newsArticles : analysisArticles;

  return (
    <div className="space-y-6">
      {/* News Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('news')}
            className={`
              flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'news'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
          >
            News Articles
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`
              flex items-center py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'analysis'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
          >
            Analysis Articles
          </button>
        </nav>
      </div>

      {/* Articles List */}
      <div className="space-y-6">
        {displayArticles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No {activeTab === 'news' ? 'news articles' : 'analysis articles'} available.
            </p>
          </div>
        ) : (
          displayArticles.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:bg-gray-50 dark:hover:bg-dark-200 rounded-lg transition-colors"
            >
              <div className="flex items-start space-x-4">
                {article.image && (
                  <img
                    src={article.image}
                    alt={article.headline}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600">
                      {article.headline}
                    </h3>
                    {article.analysisType && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        article.analysisType === 'professional' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : article.analysisType === 'retail'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}>
                        {article.analysisType.charAt(0).toUpperCase() + article.analysisType.slice(1)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {article.summary}
                  </p>
                  <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>{article.source}</span>
                    {article.author && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{article.author}</span>
                      </>
                    )}
                    <span className="mx-2">•</span>
                    <span>{formatDistanceToNow(new Date(article.datetime * 1000))} ago</span>
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}