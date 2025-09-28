import React, { useState } from 'react';
import { AlertTriangle, BellRing, FileSignature, Loader2, Radar, Edit3, Grid } from 'lucide-react';
import { useRegulatoryRisk } from '../../../hooks/useRegulatoryRisk';
import { useDisclosureSimulator } from '../../../hooks/useDisclosureSimulator';
import { useStakeholderMatrix } from '../../../hooks/useStakeholderMatrix';
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
  const { report: matrixReport, isLoading: matrixLoading } = useStakeholderMatrix(symbol);
  const { report: simulationReport, isSimulating, error: simulationError, simulate } = useDisclosureSimulator(symbol);

  const [advisory, setAdvisory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftText, setDraftText] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    const response = await generateAdvisory();
    setAdvisory(response);
    setIsGenerating(false);
  };

  const handleSimulate = async () => {
    await simulate({ text: draftText });
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
              <p className="text-xs text-gray-400">Disclosure gap {report.disclosureGapIndex.toFixed(1)} | Sentiment skew {report.sentimentSkew.toFixed(1)}</p>
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
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Edit3 className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Disclosure Simulator</p>
              <p className="text-xs text-gray-400">Draft messaging and evaluate compliance risk before publishing.</p>
            </div>
          </div>
          <button
            onClick={handleSimulate}
            disabled={isSimulating || !draftText.trim()}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-50"
          >
            {isSimulating ? 'Scoring...' : 'Simulate Disclosure'}
          </button>
        </div>
        <textarea
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          placeholder="Paste draft disclosure or earnings talking points here..."
          className="mt-4 w-full min-h-[140px] rounded-md border border-gray-200 dark:border-dark-200 bg-white dark:bg-dark-100 p-3 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {simulationError && (
          <p className="mt-2 text-xs text-red-500">{simulationError.message}</p>
        )}
        {simulationReport && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-700 dark:text-gray-200">
            <div className="rounded-md border border-gray-200 dark:border-dark-200 p-3">
              <p className="text-xs uppercase text-gray-400">Compliance Score</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{Math.round(simulationReport.score.complianceScore * 100)}%</p>
              <p className="text-xs text-gray-500">Risk delta {simulationReport.score.riskDelta.toFixed(2)}</p>
            </div>
            <div className="rounded-md border border-gray-200 dark:border-dark-200 p-3">
              <p className="text-xs uppercase text-gray-400">Sentiment Shift</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{Math.round(simulationReport.score.sentimentShift * 100)}%</p>
              <p className="text-xs text-gray-500">Regulator risk {Math.round(simulationReport.score.regulatorRisk * 100)}%</p>
            </div>
            <div className="rounded-md border border-gray-200 dark:border-dark-200 p-3">
              <p className="text-xs uppercase text-gray-400">Stakeholder Risks</p>
              <p className="text-xs text-gray-500">Investors {Math.round(simulationReport.score.investorRisk * 100)}% · Suppliers {Math.round(simulationReport.score.supplierRisk * 100)}% · Workforce {Math.round(simulationReport.score.workforceRisk * 100)}%</p>
            </div>
          </div>
        )}
        {simulationReport?.recommendations.length ? (
          <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p className="font-semibold text-gray-900 dark:text-white">Recommendations</p>
            {simulationReport.recommendations.map((rec) => (
              <div key={rec.id} className="border border-gray-200 dark:border-dark-200 rounded-md p-3">
                <p className="font-medium">{rec.message}</p>
                {rec.supportingEvidence && rec.supportingEvidence.length > 0 && (
                  <ul className="mt-2 text-xs text-gray-400 list-disc list-inside">
                    {rec.supportingEvidence.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Grid className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Stakeholder Response Matrix</p>
            <p className="text-xs text-gray-400">Anticipate reactions from key stakeholder groups.</p>
          </div>
        </div>
        {matrixLoading && (
          <p className="text-sm text-gray-500">Calculating stakeholder signals...</p>
        )}
        {!matrixLoading && matrixReport && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {matrixReport.signals.map((signal) => (
              <div key={signal.stakeholder} className="border border-gray-200 dark:border-dark-200 rounded-md p-4 text-sm">
                <div className="flex items-center justify-between">
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {signal.stakeholder.charAt(0).toUpperCase() + signal.stakeholder.slice(1)}
                  </p>
                  <span className="text-xs text-gray-500">Risk {(signal.risk * 100).toFixed(0)}% | Opportunity {(signal.opportunity * 100).toFixed(0)}%</span>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-300 text-xs">{signal.commentary}</p>
              </div>
            ))}
          </div>
        )}
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
