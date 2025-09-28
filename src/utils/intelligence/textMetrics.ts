import { EvidenceTone } from '../../types/evidence';

const POSITIVE_KEYWORDS = [
  'beat', 'growth', 'record', 'surge', 'strong', 'approval', 'upgrade',
  'gain', 'rise', 'positive', 'profit', 'expansion', 'resilient', 'tailwind',
  'outperform', 'accelerate', 'increase', 'improve'
];

const NEGATIVE_KEYWORDS = [
  'miss', 'decline', 'drop', 'regulatory', 'fine', 'penalty', 'investigation',
  'risk', 'lawsuit', 'probe', 'warning', 'downgrade', 'loss', 'negative',
  'bearish', 'cut', 'shortfall', 'headwind', 'delay', 'recall'
];

export function determineTone(text: string): EvidenceTone {
  const normalized = text.toLowerCase();
  let positive = 0;
  let negative = 0;

  for (const keyword of POSITIVE_KEYWORDS) {
    if (normalized.includes(keyword)) positive += 1;
  }

  for (const keyword of NEGATIVE_KEYWORDS) {
    if (normalized.includes(keyword)) negative += 1;
  }

  if (positive === negative) {
    return 'neutral';
  }

  return positive > negative ? 'positive' : 'negative';
}

export function computeFreshnessScore(timestamp: number): number {
  const now = Date.now();
  const diffHours = Math.abs(now - timestamp) / (1000 * 60 * 60);

  if (diffHours <= 12) return 1;
  if (diffHours <= 24) return 0.9;
  if (diffHours <= 72) return 0.75;
  if (diffHours <= 168) return 0.6;
  if (diffHours <= 720) return 0.4; // within 30 days
  return 0.2;
}

export function hoursSince(timestamp: number, reference: number = Date.now()): number {
  return Math.abs(reference - timestamp) / (1000 * 60 * 60);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function average(values: number[]): number {
  if (!values.length) return 0;
  const total = values.reduce((sum, current) => sum + current, 0);
  return total / values.length;
}
