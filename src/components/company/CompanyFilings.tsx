import React, { useState } from 'react';
import { FileText, Download, Calendar, FileSearch } from 'lucide-react';
import { useCompanyFilings } from '../../hooks/useCompanyFilings';
import { FilingType } from '../../types/secFilings';

interface CompanyFilingsProps {
  symbol: string;
}

const FILING_TYPES: { value: FilingType; label: string }[] = [
  { value: 'ALL', label: 'All Filings' },
  { value: '10-K', label: 'Annual Reports (10-K)' },
  { value: '10-Q', label: 'Quarterly Reports (10-Q)' },
  { value: '8-K', label: 'Current Reports (8-K)' },
  { value: '4', label: 'Form 4 (Insider Trading)' },
  { value: '13F', label: 'Form 13F (Holdings)' }
];

export default function CompanyFilings({ symbol }: CompanyFilingsProps) {
  const [selectedType, setSelectedType] = useState<FilingType>('ALL');
  const { filings, isLoading } = useCompanyFilings(symbol, selectedType);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <FileSearch className="h-5 w-5 text-gray-400" />
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as FilingType)}
          className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          {FILING_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {filings.length === 0 ? (
          <p className="text-gray-500 text-sm">No filings available.</p>
        ) : (
          filings.map((filing) => (
            <div
              key={filing.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">{filing.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {filing.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Filed: {new Date(filing.filingDate).toLocaleDateString()}
                      </span>
                      {filing.reportDate && (
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Report Date: {new Date(filing.reportDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <a
                  href={filing.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <Download className="h-5 w-5" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}