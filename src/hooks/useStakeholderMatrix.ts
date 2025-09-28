import useSWR from 'swr';
import { analyzeStakeholderMatrix } from '../utils/intelligence/stakeholderMatrix';
import { StakeholderMatrixReport } from '../types/compliance';

export function useStakeholderMatrix(symbol: string | null) {
  const { data, error, isValidating, mutate } = useSWR(
    symbol ? ['stakeholder-matrix', symbol] : null,
    () => symbol ? analyzeStakeholderMatrix(symbol) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 15 * 60 * 1000
    }
  );

  return {
    report: (data as StakeholderMatrixReport | null) ?? null,
    isLoading: !error && !data,
    isValidating,
    isError: error,
    refresh: mutate
  };
}
