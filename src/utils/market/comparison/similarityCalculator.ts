import { CompanyProfile } from '../../../types/company';
import { API_CONFIG } from '../../../config/api';
import { scrapeCompanyData } from './webScraper';

interface MetricSet {
  peRatio: number;
  priceToSalesRatio: number;
  priceToBookRatio: number;
  enterpriseValueMultiple: number;
  evToSales: number;
  debtToEquity: number;
  revenueGrowth: number;
  grossProfitMargin: number;
  operatingProfitMargin: number;
  netProfitMargin: number;
  roic: number;
  roe: number;
  roa: number;
  freeCashFlowYield: number;
  dividendYield: number;
  payoutRatio: number;
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  beta: number;
  marketCap?: number;
  revenue?: number;
  employees?: number;
}

export async function findSimilarCompanies(symbol: string): Promise<string[]> {
  try {
    // Get initial peer companies from FMP API
    const peersResponse = await fetch(
      `https://financialmodelingprep.com/api/v4/stock_peers?symbol=${symbol}&apikey=${API_CONFIG.FMP_API_KEY}`
    );
    
    if (!peersResponse.ok) {
      throw new Error(`FMP API error: ${peersResponse.status}`);
    }
    
    const peersData = await peersResponse.json();
    let peerSymbols: string[] = [];
    
    if (Array.isArray(peersData) && peersData.length > 0 && peersData[0].peersList) {
      peerSymbols = peersData[0].peersList;
    }

    // Enhance peer list with web-scraped competitors
    const scrapedData = await scrapeCompanyData(symbol);
    if (scrapedData?.competitors) {
      peerSymbols = Array.from(new Set([...peerSymbols, ...scrapedData.competitors]));
    }

    // Get metrics for target company and peers
    const [targetMetrics, targetScraped, ...peerPromises] = await Promise.all([
      fetchCompanyMetrics(symbol),
      scrapeCompanyData(symbol),
      ...peerSymbols.map(async (peer) => {
        const [metrics, scraped] = await Promise.all([
          fetchCompanyMetrics(peer),
          scrapeCompanyData(peer)
        ]);
        return { metrics, scraped };
      })
    ]);

    if (!targetMetrics) {
      console.warn('Unable to fetch metrics for target company', symbol);
      return [];
    }

    // Combine API and scraped metrics for target company
    const enhancedTargetMetrics = {
      ...targetMetrics,
      marketCap: targetScraped?.marketCap,
      revenue: targetScraped?.revenue,
      employees: targetScraped?.employees
    };

    // Calculate similarity scores with enhanced metrics
    const similarities = peerPromises
      .map((promise, index) => {
        const peer = promise.metrics;
        const scraped = promise.scraped;
        if (!peer) return null;

        const enhancedPeerMetrics = {
          ...peer,
          marketCap: scraped?.marketCap,
          revenue: scraped?.revenue,
          employees: scraped?.employees
        };

        return {
          symbol: peerSymbols[index],
          score: calculateSimilarityScore(enhancedTargetMetrics, enhancedPeerMetrics)
        };
      })
      .filter((item): item is { symbol: string; score: number } => 
        item !== null && item.score !== null && item.symbol !== symbol
      )
      .sort((a, b) => b.score - a.score);

    // Return top 5 most similar companies
    return similarities.slice(0, 5).map(item => item.symbol);
  } catch (error) {
    console.error('Error finding similar companies:', error);
    return [];
  }
}

async function fetchCompanyMetrics(symbol: string): Promise<MetricSet | null> {
  try {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/key-metrics-ttm/${symbol}?apikey=${API_CONFIG.FMP_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('No metrics data available for', symbol);
      return null;
    }

    const metrics = data[0];
    return {
      peRatio: metrics.peRatioTTM || 0,
      priceToSalesRatio: metrics.priceToSalesRatioTTM || 0,
      priceToBookRatio: metrics.pbRatioTTM || 0,
      enterpriseValueMultiple: metrics.evToEBITDATTM || 0,
      evToSales: metrics.evToSalesTTM || 0,
      debtToEquity: metrics.debtToEquityTTM || 0,
      revenueGrowth: metrics.revenueGrowthTTM || 0,
      grossProfitMargin: metrics.grossProfitMarginTTM || 0,
      operatingProfitMargin: metrics.operatingProfitMarginTTM || 0,
      netProfitMargin: metrics.netProfitMarginTTM || 0,
      roic: metrics.roicTTM || 0,
      roe: metrics.roeTTM || 0,
      roa: metrics.roaTTM || 0,
      freeCashFlowYield: metrics.freeCashFlowYieldTTM || 0,
      dividendYield: metrics.dividendYieldTTM || 0,
      payoutRatio: metrics.payoutRatioTTM || 0,
      currentRatio: metrics.currentRatioTTM || 0,
      quickRatio: metrics.quickRatioTTM || 0,
      cashRatio: metrics.cashRatioTTM || 0,
      beta: metrics.betaTTM || 1
    };
  } catch (error) {
    console.error('Error fetching company metrics:', error);
    return null;
  }
}

function calculateSimilarityScore(target: MetricSet, peer: MetricSet | null): number | null {
  if (!peer) return null;

  // Enhanced weights including real-time metrics
  const weights = {
    valuation: {
      peRatio: 0.12,
      priceToSalesRatio: 0.08,
      priceToBookRatio: 0.08,
      enterpriseValueMultiple: 0.08,
      evToSales: 0.08
    },
    profitability: {
      grossProfitMargin: 0.05,
      operatingProfitMargin: 0.05,
      netProfitMargin: 0.05
    },
    efficiency: {
      roic: 0.05,
      roe: 0.05,
      roa: 0.05
    },
    liquidity: {
      currentRatio: 0.03,
      quickRatio: 0.03,
      cashRatio: 0.02
    },
    growth: {
      revenueGrowth: 0.07
    },
    risk: {
      debtToEquity: 0.03,
      beta: 0.02
    },
    size: {
      marketCap: 0.04,
      revenue: 0.04,
      employees: 0.03
    }
  };

  let totalDistance = 0;
  let totalWeight = 0;

  // Calculate weighted Euclidean distance for each metric category
  for (const [category, categoryWeights] of Object.entries(weights)) {
    for (const [metric, weight] of Object.entries(categoryWeights)) {
      const targetVal = normalize(target[metric as keyof MetricSet]);
      const peerVal = normalize(peer[metric as keyof MetricSet]);
      
      if (!isNaN(targetVal) && !isNaN(peerVal)) {
        totalDistance += weight * Math.pow(targetVal - peerVal, 2);
        totalWeight += weight;
      }
    }
  }

  if (totalWeight === 0) return null;

  // Convert distance to similarity score (0-1)
  return 1 / (1 + Math.sqrt(totalDistance / totalWeight));
}

function normalize(value: number | undefined): number {
  if (value === undefined || isNaN(value) || !isFinite(value)) return 0;
  // Log transform for large values
  if (Math.abs(value) > 1000) return Math.log10(Math.abs(value)) * Math.sign(value);
  return value;
}