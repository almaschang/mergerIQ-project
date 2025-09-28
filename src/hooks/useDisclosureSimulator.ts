import { useState, useCallback } from 'react';
import { DisclosureSimulationInput, DisclosureSimulationReport } from '../types/compliance';
import { simulateDisclosure } from '../utils/intelligence/disclosureSimulator';
import { recordDisclosureSnapshot } from '../utils/market/historyStore';

export function useDisclosureSimulator(symbol: string | null) {
  const [report, setReport] = useState<DisclosureSimulationReport | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const simulate = useCallback(async (input: DisclosureSimulationInput) => {
    if (!symbol) {
      setError(new Error('No symbol selected'));
      return null;
    }
    setIsSimulating(true);
    setError(null);
    try {
      const result = await simulateDisclosure(symbol, input);
      setReport(result);
      recordDisclosureSnapshot(symbol, result);
      return result;
    } catch (err) {
      const normalized = err instanceof Error ? err : new Error('Simulation failed');
      setError(normalized);
      return null;
    } finally {
      setIsSimulating(false);
    }
  }, [symbol]);

  return {
    report,
    isSimulating,
    error,
    simulate
  };
}

