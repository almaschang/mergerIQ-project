import React from 'react';
import { ArrowLeft, Users, ExternalLink } from 'lucide-react';
import { TranscriptDetails } from '../../types/transcripts';

interface TranscriptViewerProps {
  transcript: TranscriptDetails;
  onBack: () => void;
}

export default function TranscriptViewer({ transcript, onBack }: TranscriptViewerProps) {
  return (
    <div className="bg-white rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Transcripts
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{transcript.title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(transcript.publishedOn).toLocaleDateString()}
            </p>
          </div>
          <a
            href={`https://seekingalpha.com/article/${transcript.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            View on Seeking Alpha
            <ExternalLink className="h-4 w-4 ml-1" />
          </a>
        </div>
      </div>

      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center mb-4">
          <Users className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Participants</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transcript.participants.map((participant, index) => (
            <div key={index} className="text-sm">
              <p className="font-medium text-gray-900">{participant.name}</p>
              <p className="text-gray-500">{participant.title}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: transcript.content }} 
        />
      </div>
    </div>
  );
}