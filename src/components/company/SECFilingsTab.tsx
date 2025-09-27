import React, { useState, useEffect } from 'react';
import { FileText, ExternalLink, Loader2 } from 'lucide-react';
import { getSecFilings } from '../../services/secService';

interface SECFiling {
  id: string;
  type: string;
  title: string;
  fileDate: string;
  filingUrl: string;
  description?: string;
}

interface SECFilingsTabProps {
  symbol: string;
}

export default function SECFilingsTab({ symbol }: SECFilingsTabProps) {
  const [filings, setFilings] = useState<SECFiling[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFilings() {
      if (!symbol) return;
      
      console.log('Fetching filings for:', symbol);
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getSecFilings(symbol);
        console.log('Received filings:', data);
        setFilings(data);
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to load SEC filings. Please try again later.';
        setError(errorMessage);
        console.error('Error loading SEC filings:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFilings();
  }, [symbol]);

  return (
    <div className="bg-[#1a1b26] text-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          SEC Filings for {symbol}
        </h2>
      </div>
      
      <div className="divide-y divide-gray-700">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="p-4 text-red-400 text-center">
            {error}
          </div>
        ) : filings.length === 0 ? (
          <div className="p-4 text-gray-400 text-center">
            No SEC filings found for {symbol}. This could be because:
            <ul className="mt-2 list-disc list-inside">
              <li>The company is not publicly traded</li>
              <li>The symbol may be incorrect</li>
              <li>Recent filings are still being processed</li>
            </ul>
          </div>
        ) : (
          filings.map((filing) => (
            <div key={filing.id} className="p-4 hover:bg-gray-800 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-medium">{filing.type}</h3>
                    <p className="text-sm text-gray-400">{filing.description}</p>
                    <p className="text-sm text-gray-500 mt-1">Filed on {filing.fileDate}</p>
                  </div>
                </div>
                <a
                  href={filing.filingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-400 hover:text-blue-300"
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