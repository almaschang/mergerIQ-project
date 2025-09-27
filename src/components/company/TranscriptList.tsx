import React from 'react';
import { FileText } from 'lucide-react';
import { Transcript } from '../../types/transcripts';

interface TranscriptListProps {
  transcripts: Transcript[];
  onSelect: (id: string) => void;
  isLoading: boolean;
}

export default function TranscriptList({ transcripts, onSelect, isLoading }: TranscriptListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!transcripts.length) {
    return (
      <p className="text-gray-500 text-sm">No transcripts available.</p>
    );
  }

  return (
    <div className="space-y-4">
      {transcripts.map((transcript) => (
        <button
          key={transcript.id}
          onClick={() => onSelect(transcript.id)}
          className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start">
            <FileText className="h-5 w-5 text-gray-400 mt-1 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">{transcript.title}</h4>
              <p className="text-sm text-gray-500 mt-1">
                {transcript.quarter && transcript.year 
                  ? `Q${transcript.quarter} ${transcript.year} • `
                  : ''
                }
                {new Date(transcript.publishedOn).toLocaleDateString()}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}