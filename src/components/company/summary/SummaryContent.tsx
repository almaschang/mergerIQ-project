import React from 'react';
import { Loader2 } from 'lucide-react';

interface SummaryContentProps {
  summary: string | null;
  isLoading: boolean;
}

export default function SummaryContent({ summary, isLoading }: SummaryContentProps) {
  if (isLoading) {
    return (
      <div className="mt-4 flex justify-center">
        <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mt-4 prose prose-sm max-w-none">
      <div className="text-gray-600 whitespace-pre-wrap">
        {summary}
      </div>
    </div>
  );
}