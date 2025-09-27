import React, { useState, useEffect } from 'react';
import { FileText, ExternalLink, Loader2, Calendar } from 'lucide-react';
import { getEarningsCalls } from '../../services/seekingAlphaService';

interface EarningsCall {
  id: string;
  title: string;
  date: string;
  quarter: string;
  year: string;
  url: string;
  description?: string;
}

interface EarningsCallsTabProps {
  symbol: string;
}

export default function EarningsCallsTab({ symbol }: EarningsCallsTabProps) {
  const [calls, setCalls] = useState<EarningsCall[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCalls() {
      if (!symbol) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getEarningsCalls(symbol);
        setCalls(data);
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to load earnings calls. Please try again later.';
        setError(errorMessage);
        console.error('Error loading earnings calls:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCalls();
  }, [symbol]);

  return (
    <div className="bg-white dark:bg-dark rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 dark:border-dark-200">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Earnings Calls for {symbol}
        </h2>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-dark-200">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="p-4 text-red-400 text-center">
            {error}
          </div>
        ) : calls.length === 0 ? (
          <div className="p-4 text-gray-400 text-center">
            No earnings calls found for {symbol}
          </div>
        ) : (
          calls.map((call) => (
            <div key={call.id} className="p-4 hover:bg-gray-50 dark:hover:bg-dark-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-medium">{call.quarter} {call.year} Earnings Call</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{call.title}</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Published on {call.date}</p>
                  </div>
                </div>
                <a
                  href={call.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-500 hover:text-blue-400"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}