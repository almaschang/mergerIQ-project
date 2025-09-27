import React, { useEffect, useState, useCallback } from 'react';
import { Brain, TrendingUp, AlertTriangle, Target, Loader2 } from 'lucide-react';
import { MarketNews } from '../../types/market';
import { CompanyProfile } from '../../types/company';
import { SentimentAnalysis, MarketInsight } from '../../types/ai';
import { analyzeNewsSentimentWithAI } from '../../utils/ai/analysis/sentimentAnalyzer';
import { generateMarketInsightsWithAI } from '../../utils/ai/analysis/marketAnalyzer';

interface AIInsightsProps {
  profile: CompanyProfile;
  news?: MarketNews[];
}

export default function AIInsights({ profile, news = [] }: AIInsightsProps) {
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null);
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzed, setAnalyzed] = useState(false);

  const performAnalysis = useCallback(async () => {
    if (!profile || analyzed) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const sentimentAnalysis = await analyzeNewsSentimentWithAI(news);
      setSentiment(sentimentAnalysis);
      
      const marketInsights = await generateMarketInsightsWithAI(
        profile,
        news,
        sentimentAnalysis
      );
      setInsights(marketInsights);
      setAnalyzed(true);
    } catch (error) {
      setError('Failed to analyze market data');
      console.error('AI analysis error:', error);
    } finally {
      setLoading(false);
    }
  }, [profile?.name, news.length, analyzed]);

  useEffect(() => {
    setAnalyzed(false); // Reset analyzed state when dependencies change
  }, [profile?.name, news.length]);

  useEffect(() => {
    if (!analyzed && !loading) {
      performAnalysis();
    }
  }, [performAnalysis, analyzed, loading]);

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-gray-500">{error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col items-center justify-center space-y-2">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-500">Analyzing market data...</p>
        </div>
      </div>
    );
  }

  if (!sentiment || insights.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Brain className="h-6 w-6 text-purple-600" />
        <h2 className="text-lg font-medium text-gray-900">AI Market Insights</h2>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Market Sentiment</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div 
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                  sentiment.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                  sentiment.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                {sentiment.sentiment.charAt(0).toUpperCase() + sentiment.sentiment.slice(1)}
              </div>
              <span className="text-sm text-gray-500">
                {(sentiment.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
            <p className="text-sm text-gray-600">{sentiment.reasoning}</p>
          </div>
        </div>

        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg flex items-start space-x-3 ${
                insight.type === 'trend' ? 'bg-blue-50 text-blue-600' :
                insight.type === 'risk' ? 'bg-amber-50 text-amber-600' :
                'bg-green-50 text-green-600'
              }`}
            >
              {insight.type === 'trend' ? <TrendingUp className="h-5 w-5" /> :
               insight.type === 'risk' ? <AlertTriangle className="h-5 w-5" /> :
               <Target className="h-5 w-5" />}
              <div>
                <p className="text-sm">{insight.description}</p>
                <p className="text-xs mt-1 opacity-75">
                  {(insight.confidence * 100).toFixed(0)}% confidence
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}