import useSWR from 'swr';
import { ScenarioCompanyBaseline, ScenarioResult, ScenarioArbitrationResult } from '../types/scenario';
import { simulateScenario, SCENARIO_DEFINITIONS } from '../utils/intelligence/scenarioSimulator';
import { arbitrateScenario } from '../utils/intelligence/scenarioArbitration';
import { recordScenarioSnapshot } from '../utils/market/historyStore';
import { fetchWithFmpApiKey } from '../utils/market/fmpApiKeys';
import { generateDeepseekResponse } from '../services/deepseekService';
import { API_CONFIG } from '../config/api';

interface ScenarioCopilotResult {
  baselines: ScenarioCompanyBaseline[];
  isLoading: boolean;
  isValidating: boolean;
  isError: any;
  runScenario: (scenarioId: string) => Promise<{ result: ScenarioResult; arbitration: ScenarioArbitrationResult } | null>;
  generatePlaybook: (scenarioId: string, result: ScenarioResult) => Promise<string>;
}

const MAX_PEERS = 6;
const MIN_TARGET = 4;

function normalizeSymbol(value?: string): string | null {
  if (!value) return null;
  const cleaned = value.trim().toUpperCase();
  if (!cleaned || /[^A-Z0-9.\-]/.test(cleaned)) return null;
  return cleaned;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetchWithFmpApiKey(url);
    if (!response.ok) return null;
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.warn('Request failed', url, error);
    return null;
  }
}

export async function buildPeerUniverse(symbol: string): Promise<string[]> {
  const primary = normalizeSymbol(symbol) || symbol.toUpperCase();
  const candidates = new Set<string>([primary]);

  const addSymbols = (symbols: Array<string | undefined>) => {
    for (const entry of symbols) {
      const normalized = normalizeSymbol(entry);
      if (!normalized || normalized === primary) continue;
      candidates.add(normalized);
      if (candidates.size >= MAX_PEERS) break;
    }
  };

  const peerData = await fetchJson<Array<{ peersList?: string[] }>>(
    `${API_CONFIG.FMP_BASE_URL}/stock_peers?symbol=${primary}`
  );
  if (Array.isArray(peerData) && peerData[0]?.peersList) {
    addSymbols(peerData[0].peersList);
  }

  const profileData = await fetchJson<Array<any>>(
    `${API_CONFIG.FMP_BASE_URL}/profile/${primary}`
  );
  const profile = profileData?.[0] ?? null;
  const sector: string | undefined = profile?.sector;
  const industry: string | undefined = profile?.industry;
  const exchange: string | undefined = profile?.exchangeShortName || profile?.exchange;
  const targetCap = Number(profile?.mktCap || profile?.marketCap || profile?.marketCapitalization || 0) || undefined;

  const gatherFromScreener = async (params: Record<string, string | undefined>) => {
    if (candidates.size >= MAX_PEERS) return;

    const query = new URLSearchParams({ limit: '50' });
    Object.entries(params).forEach(([key, value]) => {
      if (value && value.trim()) {
        query.set(key, value);
      }
    });

    const data = await fetchJson<Array<any>>(
      `${API_CONFIG.FMP_BASE_URL}/stock-screener?${query.toString()}`
    );

    if (!Array.isArray(data)) return;

    const scored = data
      .map((item) => {
        const ticker = normalizeSymbol(item.symbol || item.ticker);
        const cap = Number(item.marketCap || item.mktCap || item.marketCapitalization || 0);
        return ticker && ticker !== primary
          ? { ticker, cap: Number.isFinite(cap) && cap > 0 ? cap : undefined }
          : null;
      })
      .filter((entry): entry is { ticker: string; cap?: number } => Boolean(entry));

    scored.sort((a, b) => {
      if (!targetCap) {
        return (b.cap || 0) - (a.cap || 0);
      }
      const diffA = a.cap ? Math.abs(a.cap - targetCap) : Number.POSITIVE_INFINITY;
      const diffB = b.cap ? Math.abs(b.cap - targetCap) : Number.POSITIVE_INFINITY;
      return diffA - diffB;
    });

    addSymbols(scored.map((entry) => entry.ticker));
  };

  if (candidates.size < MIN_TARGET && sector) {
    await gatherFromScreener({ sector, exchange });
  }

  if (candidates.size < MIN_TARGET && industry) {
    await gatherFromScreener({ industry, exchange });
  }

  if (candidates.size < MIN_TARGET && sector) {
    const moreThan = targetCap ? Math.floor(targetCap * 0.25).toString() : undefined;
    const lessThan = targetCap ? Math.floor(targetCap * 4).toString() : undefined;
    await gatherFromScreener({ sector, marketCapMoreThan: moreThan, marketCapLowerThan: lessThan });
  }

  return Array.from(candidates).slice(0, MAX_PEERS);
}

async function fetchCompanyBaseline(symbol: string): Promise<ScenarioCompanyBaseline | null> {
  try {
    const [incomeData, balanceData, quoteData, profileData] = await Promise.all([
      fetchJson<any[]>(`${API_CONFIG.FMP_BASE_URL}/income-statement/${symbol}?limit=1`),
      fetchJson<any[]>(`${API_CONFIG.FMP_BASE_URL}/balance-sheet-statement/${symbol}?limit=1`),
      fetchJson<any[]>(`${API_CONFIG.FMP_BASE_URL}/quote/${symbol}`),
      fetchJson<any[]>(`${API_CONFIG.FMP_BASE_URL}/profile/${symbol}`)
    ]);

    const income = incomeData?.[0] ?? {};
    const balance = balanceData?.[0] ?? {};
    const quote = quoteData?.[0] ?? {};
    const profile = profileData?.[0] ?? {};

    return {
      symbol,
      name: profile.companyName || quote.name || symbol,
      revenue: income.revenue ?? 0,
      ebitda: income.ebitda ?? 0,
      netIncome: income.netIncome ?? 0,
      cash: balance.cashAndCashEquivalents ?? 0,
      debt: balance.totalDebt ?? 0,
      marketCap: quote.marketCap ?? profile.mktCap ?? 0,
      peRatio: quote.pe ?? profile.priceEarningsRatio ?? 0,
      profitMargin: income.revenue ? income.netIncome / income.revenue : 0,
      beta: quote.beta ?? profile.beta
    } satisfies ScenarioCompanyBaseline;
  } catch (error) {
    console.warn(`Baseline fetch failed for ${symbol}`, error);
    return null;
  }
}

export function useScenarioCopilot(symbol: string | null): ScenarioCopilotResult {
  const { data, error, isValidating } = useSWR(
    symbol ? ['scenario-baselines', symbol] : null,
    async () => {
      if (!symbol) return [];
      const universe = await buildPeerUniverse(symbol.toUpperCase());
      const baselines = await Promise.all(universe.map((ticker) => fetchCompanyBaseline(ticker)));
      return baselines.filter((item): item is ScenarioCompanyBaseline => Boolean(item));
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30 * 60 * 1000
    }
  );

  const runScenario = async (scenarioId: string) => {
    if (!symbol || !data?.length) return null;
    const upperSymbol = symbol.toUpperCase();
    const result = simulateScenario(data, scenarioId, upperSymbol);
    const arbitration = await arbitrateScenario(scenarioId, result, data, upperSymbol);
    recordScenarioSnapshot(upperSymbol, result, arbitration);
    return { result, arbitration };
  };

  const generatePlaybook = async (scenarioId: string, result: ScenarioResult): Promise<string> => {
    const scenario = SCENARIO_DEFINITIONS.find((item) => item.id === scenarioId);
    if (!scenario) {
      return 'Scenario blueprint not found.';
    }

    const primary = result.impacts.find((impact) => impact.isPrimary);
    const peers = result.impacts.filter((impact) => !impact.isPrimary).slice(0, 3);

    const prompt = `You are an equity risk co-pilot. Craft a remediation playbook for ${symbol}.
Scenario: ${scenario.name} (${scenario.severity} severity, horizon ${scenario.stressHorizonDays} days).
Description: ${scenario.description}.
Primary impact: ${primary ? `${primary.priceImpact}% valuation impact, revenue delta ${primary.revenueDelta}, liquidity swing ${primary.liquidityImpact}` : 'Unknown primary impact'}.
Peer ripple: ${peers.map((peer) => `${peer.symbol}:${peer.priceImpact}%`).join(', ') || 'Minimal ripple'}.
Provide:
1. Immediate (0-7d) containment actions.
2. Near-term (8-30d) operational levers.
3. Disclosure & investor communication guidance referencing SEC obligations if applicable.
4. Metrics to monitor to exit the stress window.
Keep it concise and actionable.`;

    try {
      const response = await generateDeepseekResponse(prompt);
      return response || 'No playbook generated.';
    } catch (err) {
      console.error('Playbook generation failed', err);
      return 'Unable to generate playbook at this time.';
    }
  };

  return {
    baselines: data ?? [],
    isLoading: !error && !data,
    isValidating,
    isError: error,
    runScenario,
    generatePlaybook
  };
}

