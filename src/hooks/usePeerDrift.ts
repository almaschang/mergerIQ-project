import useSWR from 'swr';
import { analyzePeerDrift } from '../utils/intelligence/peerDriftAnalyzer';
import { recordDriftSnapshot } from '../utils/market/historyStore';
import { PeerDriftReport } from '../types/drift';

interface PeerDriftOptions {
  lookbackDays?: number;
}

export function usePeerDrift(primarySymbol: string | null, peerSymbols: string[], options: PeerDriftOptions = {}) {
  const { data, error, isValidating, mutate } = useSWR(
    primarySymbol ? ['peer-drift', primarySymbol, ...peerSymbols] : null,
    () => {
      if (!primarySymbol) return null;
      return analyzePeerDrift(primarySymbol, peerSymbols, options).then((report) => {
        if (report) {
          recordDriftSnapshot(report);
        }
        return report;
      });
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 10 * 60 * 1000
    }
  );

  return {
    report: (data as PeerDriftReport | null) ?? null,
    isLoading: !error && !data,
    isValidating,
    isError: error,
    refresh: mutate
  };
}

