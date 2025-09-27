import React from 'react';
import TranscriptList from './TranscriptList';
import TranscriptViewer from './TranscriptViewer';
import { TranscriptDetails } from '../../types/transcripts';

interface CompanyTranscriptsProps {
  transcripts: any[];
  selectedTranscript: TranscriptDetails | null;
  isLoading: boolean;
  onSelect: (id: string) => void;
  onClearSelection: () => void;
}

export default function CompanyTranscripts({
  transcripts,
  selectedTranscript,
  isLoading,
  onSelect,
  onClearSelection
}: CompanyTranscriptsProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      {selectedTranscript ? (
        <TranscriptViewer 
          transcript={selectedTranscript} 
          onBack={onClearSelection} 
        />
      ) : (
        <TranscriptList
          transcripts={transcripts}
          onSelect={onSelect}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}