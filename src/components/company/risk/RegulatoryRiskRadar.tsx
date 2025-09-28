import React, { useState } from 'react';
import { AlertTriangle, BellRing, FileSignature, Loader2, Radar } from 'lucide-react';
import { useRegulatoryRisk } from '../../../hooks/useRegulatoryRisk';
import { RiskPriority } from '../../../types/risk';

interface RegulatoryRiskRadarProps {
  symbol: string;
}

function priorityBadge(priority: RiskPriority): string {
  if (priority === 'high') return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200';
  if (priority === 'medium') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200';
  return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200';
}

export default function RegulatoryRiskRadar({ symbol }: RegulatoryRiskRadarProps) {
  const { report, isLoading, isValidating, isError, generateAdvisory } = useRegulatoryRisk(symbol);
  const [advisory, setAdvisory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const response = await generateAdvisory();
    setAdvisory(response);
    setIsGenerating(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-8 text-center">
        <Loader2 className="h-6 w-6 mx-auto text-blue-500 animate-spin" />
        <p className="mt-3 text-sm text-gray-500">Scanning disclosure footprint...</p>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-6 text-red-600">
        <AlertTriangle className="h-6 w-6" />
        <p className="mt-2 text-sm">Unable to compute regulatory risk radar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-6">
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex items-center gap-3">
            <Radar className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-xs uppercase text-gray-400 tracking-wide">Regulatory Risk Index</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{report.overallRiskIndex.toFixed(1)} / 100</p>
              <p className="text-xs text-gray-400">Disclosure gap {report.disclosureGapIndex.toFixed(1)} • Sentiment skew {report.sentimentSkew.toFixed(1)}</p>
            </div>
          </div>
          {isValidating && (
            <span className="text-xs text-gray-400 flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> refreshing
            </span>
          )}
        </div>
      </div>

      {report.alerts.length > 0 && (
        <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <BellRing className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Priority Alerts</h3>
          </div>
          <div className="space-y-3">
            {report.alerts.map((alert) => (
              <div key={alert.id} className="border border-gray-200 dark:border-dark-200 rounded-md p-4">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${priorityBadge(alert.priority)}`}>
                    {alert.theme}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(alert.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">{alert.message}</p>
                {alert.url && (
                  <a
                    href={alert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-600"
                  >
                    View source
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Theme Breakdown</h3>
          <span className="text-xs text-gray-400">{report.themes.length} themes evaluated</span>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-200 text-sm">
            <thead className="bg-gray-50 dark:bg-dark-200">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wide">Theme</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wide">News Score</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wide">Filing Score</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wide">Delta</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wide">Mentions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-200">
              {report.themes.map((theme) => (
                <tr key={theme.theme}>
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${priorityBadge(theme.priority)}`}>
                        {theme.priority.toUpperCase()}
                      </span>
                      {theme.theme}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{theme.newsScore.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{theme.filingScore.toFixed(2)}</td>
                  <td className={`px-4 py-3 font-medium ${theme.delta > 0 ? 'text-rose-500' : 'text-green-600'}`}>
                    {theme.delta.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{theme.externalMentions}/{theme.internalMentions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSignature className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">AI Disclosure Advisory</p>
              <p className="text-xs text-gray-400">Translate signal into suggested SEC-ready messaging.</p>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-md hover:bg-purple-500 disabled:opacity-50"
          >
            {isGenerating ? 'Synthesizing...' : 'Generate Advisory'}
          </button>
        </div>
        {advisory && (
          <div className="mt-4 bg-gray-50 dark:bg-dark-200 rounded-md p-4 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">
            {advisory}
          </div>
        )}
      </div>
    </div>
  );
}
