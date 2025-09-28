import useSWR from 'swr';
import { analyzeRegulatoryRisk } from '../utils/intelligence/riskAnalyzer';
import { getCompanyNews } from '../utils/market/companyNews';
import { getCompanyFilings } from '../utils/market/secService';
import { RegulatoryRiskReport } from '../types/risk';
import { generateDeepseekResponse } from '../services/deepseekService';

interface RegulatoryRiskResult {
  report: RegulatoryRiskReport | null;
  isLoading: boolean;
  isValidating: boolean;
  isError: any;
  generateAdvisory: () => Promise<string>;
}

export function useRegulatoryRisk(symbol: string | null): RegulatoryRiskResult {
  const { data, error, isValidating } = useSWR(
    symbol ? ['regulatory-risk', symbol] : null,
    async () => {
      if (!symbol) return null;
      const [news, filings] = await Promise.all([
        getCompanyNews(symbol),
        getCompanyFilings(symbol, 'ALL', 12)
      ]);

      return analyzeRegulatoryRisk(symbol, news || [], filings || []);
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 20 * 60 * 1000
    }
  );

  const generateAdvisory = async () => {
    if (!symbol || !data) {
      return 'Risk posture not ready yet.';
    }

    const topAlert = data.alerts[0];
    const topTheme = data.themes.sort((a, b) => b.delta - a.delta)[0];

    const prompt = `You are a regulatory risk advisor. Draft a disclosure advisory for ${symbol}.
Overall risk index: ${data.overallRiskIndex}.
Disclosure gap index: ${data.disclosureGapIndex}.
Top theme: ${topTheme ? `${topTheme.theme} with delta ${topTheme.delta}` : 'None'}.
Alert: ${topAlert ? `${topAlert.theme} - ${topAlert.message}` : 'No critical alerts'}.
Provide:
- What should be acknowledged in the next SEC filing or earnings call.
- Recommended remediation owner.
- Investor communication bullet.
Keep it tight (under 160 words).`;

    try {
      const response = await generateDeepseekResponse(prompt);
      return response || 'No advisory generated.';
    } catch (err) {
      console.error('Regulatory advisory generation failed', err);
      return 'Unable to generate advisory right now.';
    }
  };

  return {
    report: data ?? null,
    isLoading: !error && !data,
    isValidating,
    isError: error,
    generateAdvisory
  };
}
