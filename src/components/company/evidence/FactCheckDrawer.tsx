import React from 'react';
import { X, CheckCircle, AlertTriangle, HelpCircle, ExternalLink } from 'lucide-react';
import { EvidenceFactCheckEntry } from '../../../types/evidence';

interface FactCheckDrawerProps {
  isOpen: boolean;
  factCheck: EvidenceFactCheckEntry | null;
  onClose: () => void;
}

const STATUS_CONFIG: Record<EvidenceFactCheckEntry['status'], { label: string; icon: React.ReactNode; color: string }> = {
  supported: {
    label: 'Supported',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-green-600 dark:text-green-400'
  },
  contradicted: {
    label: 'Contradicted',
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-red-600 dark:text-red-400'
  },
  'needs-review': {
    label: 'Needs Review',
    icon: <HelpCircle className="h-4 w-4" />,
    color: 'text-amber-600 dark:text-amber-400'
  }
};

export default function FactCheckDrawer({ isOpen, factCheck, onClose }: FactCheckDrawerProps) {
  if (!isOpen || !factCheck) return null;

  const statusConfig = STATUS_CONFIG[factCheck.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <aside className="relative w-full max-w-md h-full bg-white dark:bg-dark-50 shadow-xl overflow-y-auto">
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-dark-200">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Fact Check</p>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{factCheck.claim}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" aria-label="Close fact check panel">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="px-6 py-4 space-y-6">
          <div className={`flex items-center gap-2 text-sm font-medium ${statusConfig.color}`}>
            {statusConfig.icon}
            <span>{statusConfig.label}</span>
            <span className="text-gray-400 dark:text-gray-500 text-xs">Confidence {Math.round(factCheck.confidence * 100)}%</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Last updated {new Date(factCheck.updatedAt).toLocaleString()}</p>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Citations</h3>
            <div className="space-y-3">
              {factCheck.sources.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No supporting evidence collected yet.</p>
              ) : (
                factCheck.sources.map((source) => (
                  <div key={source.id} className="border border-gray-200 dark:border-dark-200 rounded-md p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{source.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {source.relation === 'supports' ? 'Supports claim' : source.relation === 'contradicts' ? 'Contradicts claim' : 'Context'}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400 flex flex-col items-end">
                        <span>Freshness {(source.freshness * 100).toFixed(0)}%</span>
                        <span>Reliability {(source.reliability * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{new Date(source.timestamp).toLocaleString()}</span>
                      {source.url && (
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          View source
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
