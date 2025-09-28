import { useState, useCallback } from 'react';
import { getHistorySnapshots, ScenarioSnapshot, DriftSnapshot, DisclosureSnapshot } from '../utils/market/historyStore';

interface HistoryState {
  scenarios: ScenarioSnapshot[];
  drifts: DriftSnapshot[];
  disclosures: DisclosureSnapshot[];
}

export function useHistorySnapshots() {
  const [state, setState] = useState<HistoryState>(getHistorySnapshots());

  const refresh = useCallback(() => {
    setState(getHistorySnapshots());
  }, []);

  return {
    ...state,
    refresh
  };
}
