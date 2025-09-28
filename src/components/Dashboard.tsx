import React, { useState } from 'react';
import TickerTape from './market/TickerTape';
import MarketOverview from './market/MarketOverview';
import NewsCategoryToolbar, { NewsCategory } from './market/NewsCategoryToolbar';
import CategorizedNews from './market/CategorizedNews';
import ActionMarketplace from './market/ActionMarketplace';
import IntelligenceHistory from './dashboard/IntelligenceHistory';

export default function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('trending');

  return (
    <div className="py-6">
      <TickerTape />
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mt-6">Market Intelligence Dashboard</h1>
        
        <div className="mt-8 grid grid-cols-12 gap-6">
          {/* News Categories Toolbar */}
          <div className="col-span-12 lg:col-span-3">
            <NewsCategoryToolbar
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {selectedCategory === 'trending' && <MarketOverview />}
              <div className="bg-white dark:bg-dark-100 shadow rounded-lg p-6">
                <CategorizedNews category={selectedCategory} />
              </div>
            </div>
            <ActionMarketplace />
            <IntelligenceHistory />
          </div>
        </div>
      </div>
    </div>
  );
}

