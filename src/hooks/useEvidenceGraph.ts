import useSWR from 'swr';
import { buildEvidenceGraph } from '../utils/intelligence/evidenceGraph';
import { getCompanyNews } from '../utils/market/companyNews';
import { getCompanyFilings } from '../utils/market/secService';
import { getCompanyTranscripts, getTranscriptDetails } from '../utils/market/transcriptService';
import { analyzeNewsSentimentWithAI } from '../utils/ai/analysis/sentimentAnalyzer';
import { generateMarketInsightsWithAI } from '../utils/ai/analysis/marketAnalyzer';
import { getCompanyProfile } from '../utils/market/companyProfile';
import { MarketInsight } from '../types/ai';
import { EvidenceGraph } from '../types/evidence';

interface EvidenceGraphResult {
  graph: EvidenceGraph | null;
  isLoading: boolean;
  isValidating: boolean;
  isError: any;
}

function createFallbackInsight(symbol: string, sentimentText: string, confidence: number): MarketInsight {
  const tone = sentimentText.toLowerCase();
  const isNegative = tone.includes('negative');
  const isPositive = tone.includes('positive');

  const type: MarketInsight['type'] = isNegative ? 'risk' : isPositive ? 'opportunity' : 'trend';

  return {
    type,
    description: `${symbol} coverage leans ${isNegative ? 'cautious' : isPositive ? 'constructive' : 'mixed'} per recent headlines`,
    confidence: confidence || 0.45
  } satisfies MarketInsight;
}

export function useEvidenceGraph(symbol: string | null): EvidenceGraphResult {
  const { data, error, isValidating } = useSWR(
    symbol ? ['evidence-graph', symbol] : null,
    async () => {
      if (!symbol) return null;

      const [profile, news, filings, transcriptSummaries] = await Promise.all([
        getCompanyProfile(symbol),
        getCompanyNews(symbol),
        getCompanyFilings(symbol, 'ALL', 12),
        getCompanyTranscripts(symbol)
      ]);

      const trimmedNews = (news || []).slice(0, 20);
      const transcriptDetails = await Promise.all(
        (transcriptSummaries || [])
          .slice(0, 2)
          .map(async (transcript) => {
            const detail = await getTranscriptDetails(transcript.id);
            return detail || undefined;
          })
      );

      const cleanTranscripts = transcriptDetails.filter((item): item is NonNullable<typeof item> => Boolean(item));

      const sentiment = await analyzeNewsSentimentWithAI(trimmedNews);

      let insights: MarketInsight[] = [];
      if (profile) {
        insights = await generateMarketInsightsWithAI(profile, trimmedNews, sentiment);
      }

      if (!insights.length) {
        insights = [createFallbackInsight(symbol, sentiment.reasoning, sentiment.confidence)];
      }

      return buildEvidenceGraph({
        insights,
        news: trimmedNews,
        filings,
        transcripts: cleanTranscripts
      });
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 15 * 60 * 1000
    }
  );

  return {
    graph: data ?? null,
    isLoading: !error && !data,
    isValidating,
    isError: error
  };
}
