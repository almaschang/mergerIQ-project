import { useState } from 'react';
import useSWR from 'swr';
import { getCompanyTranscripts, getTranscriptDetails } from '../utils/market/transcriptService';
import { Transcript, TranscriptDetails } from '../types/transcripts';

export function useTranscripts(symbol: string) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: transcripts, error: transcriptsError } = useSWR(
    symbol ? ['transcripts', symbol] : null,
    () => getCompanyTranscripts(symbol),
    { revalidateOnFocus: false }
  );

  const { data: selectedTranscript, error: transcriptError } = useSWR(
    selectedId ? ['transcript', selectedId] : null,
    () => selectedId ? getTranscriptDetails(selectedId) : null,
    { revalidateOnFocus: false }
  );

  return {
    transcripts: transcripts || [],
    selectedTranscript,
    isLoading: !transcriptsError && !transcripts,
    isError: transcriptsError || transcriptError,
    selectTranscript: setSelectedId,
    clearSelection: () => setSelectedId(null)
  };
}