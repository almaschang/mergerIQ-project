import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { generateDeepseekResponse } from '../../services/deepseekService';

interface CompanyData {
  profile?: {
    description?: string;
    industry?: string;
    sector?: string;
    employees?: number;
    marketCap?: number;
    price?: number;
  };
  financials?: {
    revenue?: number;
    netIncome?: number;
    eps?: number;
    peRatio?: number;
  };
  news?: Array<{
    headline: string;
    summary: string;
  }>;
}

interface AISummaryTabProps {
  companyData: CompanyData;
  symbol: string;
}

export default function AISummaryTab({ companyData, symbol }: AISummaryTabProps) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      const { profile, financials, news } = companyData;

      const companyContext = `
Company: ${symbol}
Profile:
- Industry: ${profile?.industry || 'N/A'}
- Sector: ${profile?.sector || 'N/A'}
- Employees: ${profile?.employees || 'N/A'}
- Market Cap: ${profile?.marketCap ? `$${(profile.marketCap / 1e9).toFixed(2)}B` : 'N/A'}
- Current Price: ${profile?.price ? `$${profile.price}` : 'N/A'}

Description:
${profile?.description || 'N/A'}

Financial Metrics:
- Revenue: ${financials?.revenue ? `$${(financials.revenue / 1e9).toFixed(2)}B` : 'N/A'}
- Net Income: ${financials?.netIncome ? `$${(financials.netIncome / 1e9).toFixed(2)}B` : 'N/A'}
- EPS: ${financials?.eps ? `$${financials.eps}` : 'N/A'}
- P/E Ratio: ${financials?.peRatio || 'N/A'}

Recent News Headlines:
${news?.slice(0, 3).map(item => `- ${item.headline}`).join('\n') || 'No recent news'}
`;

      const prompt = `As an investment analyst, analyze this company information and provide a comprehensive summary focusing on key metrics, market position, and investment considerations.`;
      
      const response = await generateDeepseekResponse(prompt + '\n\n' + companyContext);
      setSummary(response || 'No summary generated');
    } catch (error) {
      console.error('Error:', error);
      setSummary('Error generating summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#1a1b26] text-white p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-purple-400" />
        <span className="font-medium">AI Assistant (Deepseek R1)</span>
      </div>
      
      {!summary ? (
        <div className="text-gray-400 text-sm">
          Click generate to create an AI-powered analysis using Deepseek R1.
        </div>
      ) : (
        <div className="text-sm leading-relaxed">
          {summary}
        </div>
      )}

      {!summary && (
        <button
          onClick={generateSummary}
          disabled={isLoading}
          className="mt-4 w-full text-sm bg-purple-500 hover:bg-purple-600 px-3 py-2 rounded transition-colors disabled:bg-purple-800"
        >
          {isLoading ? 'Analyzing...' : 'Generate Analysis'}
        </button>
      )}
    </div>
  );
} 