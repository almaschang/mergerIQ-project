import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useStockQuote } from '../../hooks/useStockQuote';

interface StockTickerProps {
  symbol: string;
}

export default function StockTicker({ symbol }: StockTickerProps) {
  const { quote, isLoading, isError } = useStockQuote(symbol);

  if (isError) return null;
  if (isLoading) return <div className="animate-pulse h-8 bg-gray-200 rounded w-32"></div>;

  const isPositive = quote.d >= 0;

  return (
    <div className="flex items-center space-x-2 text-sm">
      <span className="font-medium">{symbol}</span>
      <span className="font-bold">${quote.c.toFixed(2)}</span>
      <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        {Math.abs(quote.dp).toFixed(2)}%
      </span>
    </div>
  );
}