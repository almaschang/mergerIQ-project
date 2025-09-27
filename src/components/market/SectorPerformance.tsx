import React from 'react';
import { useSectorPerformance } from '../../hooks/useSectorPerformance';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function SectorPerformance() {
  const { sectors, isLoading } = useSectorPerformance();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Sector Performance</h3>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectors.map((sector) => {
            const isPositive = sector.change > 0;
            const isFlat = sector.change === 0;
            const Icon = isFlat ? Minus : isPositive ? TrendingUp : TrendingDown;
            const colorClass = isFlat ? 'text-gray-500' : isPositive ? 'text-green-600' : 'text-red-600';

            return (
              <div key={sector.symbol} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{sector.name}</span>
                  <span className={`flex items-center ${colorClass}`}>
                    <Icon className="h-4 w-4 mr-1" />
                    {sector.change.toFixed(2)}%
                  </span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.abs(sector.change)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}