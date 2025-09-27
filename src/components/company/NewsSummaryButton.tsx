import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FileText, X } from 'lucide-react';

const genAI = new GoogleGenerativeAI('AIzaSyAd6eWn1kK4_tGDhiDuT4f_SUXKXVR2nOc');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

interface Article {
  headline: string;
  summary: string;
  source: string;
}

interface NewsSummaryButtonProps {
  articles: Article[];
  type: 'news' | 'analysis';
}

export default function NewsSummaryButton({ articles, type }: NewsSummaryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      const articlesText = articles.map(article => 
        `Title: ${article.headline}\nSummary: ${article.summary}\nSource: ${article.source}`
      ).join('\n\n');

      const prompt = `As an investment analyst, provide a concise summary of these ${type} articles about the company. Focus on key points that would be relevant for investors. Include major developments, market impacts, and potential implications:\n\n${articlesText}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setSummary(response.text());
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Error generating summary. Please try again.');
    } finally {
      setIsLoading(false);
      setIsOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={generateSummary}
        disabled={isLoading || articles.length === 0}
        className="fixed right-8 top-1/3 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-blue-700 
          transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        <span>{isLoading ? 'Analyzing...' : `Summarize ${type}`}</span>
      </button>

      {/* Summary Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                {type === 'news' ? 'News Summary' : 'Analysis Summary'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="prose max-w-none">
                {summary.split('\n').map((line, i) => (
                  <p key={i} className="mb-4">{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 