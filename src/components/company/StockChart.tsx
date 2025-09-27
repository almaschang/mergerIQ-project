import React from 'react';
import { useStockQuote } from '../../hooks/useStockQuote';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StockChartProps {
  symbol: string;
}

export default function StockChart({ symbol }: StockChartProps) {
  const { quote, isLoading } = useStockQuote(symbol);

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!quote) return null;

  const isPositive = quote.d >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const Arrow = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Stock Price</h2>
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold">${quote.c.toFixed(2)}</div>
          <div className={`flex items-center ${changeColor}`}>
            <Arrow className="h-5 w-5 mr-1" />
            <span className="font-medium">{Math.abs(quote.dp).toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Open</div>
          <div className="text-lg font-medium">${quote.o.toFixed(2)}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Previous Close</div>
          <div className="text-lg font-medium">${quote.pc.toFixed(2)}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">High</div>
          <div className="text-lg font-medium">${quote.h.toFixed(2)}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Low</div>
          <div className="text-lg font-medium">${quote.l.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}