import { PeerDriftReport, PeerDriftDriver, PeerDriftSeriesPoint, PeerDriftAlert } from '../../types/drift';
import { fetchHistoricalPrices } from '../market/priceHistory';
import { fetchCompanyComparable } from '../market/companyComparables';
import { getCompanyFilings } from '../market/secService';
import { clamp, roundTo } from './textMetrics';

interface ReturnResult {
  horizonReturn: number;
}

function computeReturn(prices: { close: number }[], days: number): ReturnResult {
  if (!prices.length) {
    return { horizonReturn: 0 };
  }
  const sorted = [...prices].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latest = sorted[sorted.length - 1].close;
  const horizonIndex = Math.max(sorted.length - days, 0);
  const past = sorted[horizonIndex]?.close ?? sorted[0].close;
  const horizonReturn = past ? (latest - past) / past : 0;
  return { horizonReturn };
}

function filingsInWindow(filings: { filingDate: string }[], windowDays: number): number {
  const now = Date.now();
  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  return filings.filter((filing) => {
    const date = new Date(filing.filingDate).getTime();
    return !Number.isNaN(date) && now - date <= windowMs;
  }).length;
}

function buildDriver(
  peerSymbol: string,
  priceDrift: number,
  valuationDrift: number,
  disclosureDrift: number
): PeerDriftDriver {
  const normalizedScore = clamp(
    Math.abs(priceDrift) * 2 + Math.abs(valuationDrift) * 1.5 + Math.abs(disclosureDrift),
    0,
    5
  );

  return {
    peerSymbol,
    driftScore: roundTo(normalizedScore, 3),
    priceCommentary: `30-day performance delta ${(priceDrift * 100).toFixed(1)}% vs. primary`,
    valuationCommentary: `Valuation spread ${(valuationDrift * 100).toFixed(1)}% vs. primary P/E`,
    disclosureCommentary: `Recent filings delta ${(disclosureDrift * 100).toFixed(1)}%`
  } satisfies PeerDriftDriver;
}

function determineAlerts(peerSymbol: string, driver: PeerDriftDriver): PeerDriftAlert[] {
  const alerts: PeerDriftAlert[] = [];
  const severity = driver.driftScore > 3 ? 'high' : driver.driftScore > 1.5 ? 'medium' : 'low';
  if (severity === 'low') {
    return alerts;
  }

  alerts.push({
    id: `drift-${peerSymbol}`,
    peerSymbol,
    severity,
    message: `${peerSymbol} drift score ${driver.driftScore.toFixed(2)} — investigate valuation and disclosure differences.`,
    timestamp: Date.now()
  });

  return alerts;
}

export async function analyzePeerDrift(
  primarySymbol: string,
  peerSymbols: string[],
  options: { lookbackDays?: number } = {}
): Promise<PeerDriftReport> {
  const lookbackDays = options.lookbackDays ?? 30;
  const primaryComparable = await fetchCompanyComparable(primarySymbol);
  const primaryPrices = await fetchHistoricalPrices(primarySymbol, lookbackDays * 3);
  const primaryReturn = computeReturn(primaryPrices, lookbackDays).horizonReturn;
  const primaryFilings = await getCompanyFilings(primarySymbol, 'ALL', 10);
  const primaryFilingCount = filingsInWindow(primaryFilings, 90);

  const drivers: PeerDriftDriver[] = [];
  const series: PeerDriftSeriesPoint[] = [];
  const alerts: PeerDriftAlert[] = [];

  for (const peerSymbol of peerSymbols) {
    const comparable = await fetchCompanyComparable(peerSymbol);
    if (!comparable || !primaryComparable) continue;

    const prices = await fetchHistoricalPrices(peerSymbol, lookbackDays * 3);
    const peerReturn = computeReturn(prices, lookbackDays).horizonReturn;
    const priceDrift = peerReturn - primaryReturn;

    const valuationDrift = primaryComparable.peRatio > 0
      ? (comparable.peRatio - primaryComparable.peRatio) / primaryComparable.peRatio
      : 0;

    const peerFilings = await getCompanyFilings(peerSymbol, 'ALL', 10);
    const peerFilingCount = filingsInWindow(peerFilings, 90);
    const disclosureDrift = primaryFilingCount > 0
      ? (peerFilingCount - primaryFilingCount) / primaryFilingCount
      : peerFilingCount > 0 ? 1 : 0;

    const driver = buildDriver(peerSymbol, priceDrift, valuationDrift, disclosureDrift);
    drivers.push(driver);
    alerts.push(...determineAlerts(peerSymbol, driver));

    series.push({
      timestamp: Date.now(),
      peerSymbol,
      priceDrift: roundTo(priceDrift, 4),
      valuationDrift: roundTo(valuationDrift, 4),
      disclosureDrift: roundTo(disclosureDrift, 4)
    });
  }

  const overallDriftScore = drivers.length
    ? roundTo(drivers.reduce((sum, driver) => sum + driver.driftScore, 0) / drivers.length, 3)
    : 0;

  return {
    primarySymbol: primarySymbol.toUpperCase(),
    generatedAt: Date.now(),
    overallDriftScore,
    drivers,
    series,
    alerts
  } satisfies PeerDriftReport;
}
