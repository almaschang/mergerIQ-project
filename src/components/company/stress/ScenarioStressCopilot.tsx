import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, Loader2, ShieldAlert, Sparkles, Target } from 'lucide-react';
import { useScenarioCopilot } from '../../../hooks/useScenarioCopilot';
import { SCENARIO_DEFINITIONS } from '../../../utils/intelligence/scenarioSimulator';
import { ScenarioResult } from '../../../types/scenario';

interface ScenarioStressCopilotProps {
  symbol: string;
}

function formatDelta(value: number): string {
  const abs = Math.abs(value);
  const sign = value > 0 ? '+' : '';

  if (abs >= 1e9) {
    return `${sign}${(value / 1e9).toFixed(1)}B`;
  }
  if (abs >= 1e6) {
    return `${sign}${(value / 1e6).toFixed(1)}M`;
  }
  if (abs === 0) {
    return '0';
  }
  return `${sign}${value.toLocaleString()}`;
}

function formatPercent(n: number): string {
  return `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;
}

function severityColors(severity: 'low' | 'medium' | 'high'): string {
  if (severity === 'high') return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200';
  if (severity === 'medium') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200';
  return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200';
}

export default function ScenarioStressCopilot({ symbol }: ScenarioStressCopilotProps) {
  const { baselines, isLoading, isValidating, isError, runScenario, generatePlaybook } = useScenarioCopilot(symbol);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(SCENARIO_DEFINITIONS[0].id);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [playbook, setPlaybook] = useState<string>('');
  const [isGeneratingPlaybook, setIsGeneratingPlaybook] = useState(false);

  const baselineBySymbol = useMemo(() => new Map(baselines.map((item) => [item.symbol, item])), [baselines]);

  useEffect(() => {
    if (!baselines.length) return;
    const computed = runScenario(selectedScenarioId);
    setResult(computed);
    setPlaybook('');
  }, [baselines, runScenario, selectedScenarioId]);

  const handleScenarioChange = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
  };

  const handleGeneratePlaybook = async () => {
    if (!result) return;
    setIsGeneratingPlaybook(true);
    const response = await generatePlaybook(selectedScenarioId, result);
    setPlaybook(response);
    setIsGeneratingPlaybook(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-8 text-center">
        <Loader2 className="h-6 w-6 mx-auto text-blue-500 animate-spin" />
        <p className="mt-3 text-sm text-gray-500">Calibrating scenario baselines...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-6 text-red-600">
        <AlertTriangle className="h-6 w-6" />
        <p className="mt-2 text-sm">Unable to load stress testing data. Please try again.</p>
      </div>
    );
  }

  if (!baselines.length || !result) {
    return (
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-6 text-gray-500">
        <p>No financial baselines available for scenario simulation.</p>
      </div>
    );
  }

  const scenario = SCENARIO_DEFINITIONS.find((item) => item.id === selectedScenarioId)!;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-6">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-gray-400 tracking-wide">Scenario Stress Copilot</p>
            <div className="flex items-center gap-3 mt-2">
              <Target className="h-6 w-6 text-blue-500" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{scenario.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{scenario.description}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${severityColors(scenario.severity)}`}>
              {scenario.severity.toUpperCase()} STRESS • {scenario.stressHorizonDays}D horizon
            </span>
            {isValidating && (
              <span className="text-xs text-gray-400 flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" /> updating
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          {SCENARIO_DEFINITIONS.map((definition) => (
            <button
              key={definition.id}
              onClick={() => handleScenarioChange(definition.id)}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                selectedScenarioId === definition.id
                  ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-200'
                  : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-500'
              }`}
            >
              {definition.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-purple-500" />
            <div>
              <p className="text-xs uppercase text-gray-400 tracking-wide">System Stress Score</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{result.systemStressScore.toFixed(1)} / 100</p>
              <p className="text-xs text-gray-400">Primary ripple: {result.commentary}</p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400 tracking-wide">Shock Focus</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{scenario.tags?.join(' • ')}</p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-200 text-sm">
            <thead className="bg-gray-50 dark:bg-dark-200">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wide">Company</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wide">Revenue ?</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wide">Net Income ?</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wide">EBITDA ?</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wide">Price Impact</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wide">Liquidity Swing</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wide">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-200">
              {result.impacts.map((impact) => {
                const baseline = baselineBySymbol.get(impact.symbol);
                const revenuePct = baseline?.revenue ? (impact.revenueDelta / baseline.revenue) * 100 : 0;
                const incomePct = baseline?.netIncome ? (impact.netIncomeDelta / baseline.netIncome) * 100 : 0;
                const ebitdaPct = baseline?.ebitda ? (impact.ebitdaDelta / baseline.ebitda) * 100 : 0;

                return (
                  <tr key={impact.symbol} className={impact.isPrimary ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        {impact.isPrimary && <ShieldAlert className="h-4 w-4 text-blue-500" />}
                        {impact.symbol}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {formatDelta(impact.revenueDelta)}
                      {baseline?.revenue ? (
                        <span className="text-xs text-gray-400 ml-2">
                          ({formatPercent(revenuePct)})
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {formatDelta(impact.netIncomeDelta)}
                      {baseline?.netIncome ? (
                        <span className="text-xs text-gray-400 ml-2">
                          ({formatPercent(incomePct)})
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {formatDelta(impact.ebitdaDelta)}
                      {baseline?.ebitda ? (
                        <span className="text-xs text-gray-400 ml-2">
                          ({formatPercent(ebitdaPct)})
                        </span>
                      ) : null}
                    </td>
                    <td className={`px-4 py-3 font-medium ${impact.priceImpact < 0 ? 'text-rose-500' : 'text-green-600'}`}>
                      {formatPercent(impact.priceImpact)}
                    </td>
                    <td className={`px-4 py-3 font-medium ${impact.liquidityImpact < 0 ? 'text-rose-500' : 'text-green-600'}`}>
                      {formatPercent(impact.liquidityImpact)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 dark:bg-dark-200 rounded-full overflow-hidden">
                          <div
                            className={
                              impact.riskScore > 70
                                ? 'h-full bg-rose-500'
                                : impact.riskScore > 45
                                ? 'h-full bg-amber-500'
                                : 'h-full bg-green-500'
                            }
                            style={{ width: `${impact.riskScore}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{impact.riskScore.toFixed(1)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">AI Remediation Playbook</p>
              <p className="text-xs text-gray-400">Generate targeted mitigation steps anchored to this stress case.</p>
            </div>
          </div>
          <button
            onClick={handleGeneratePlaybook}
            disabled={isGeneratingPlaybook}
            className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-md hover:bg-purple-500 disabled:opacity-50"
          >
            {isGeneratingPlaybook ? 'Drafting...' : 'Generate Playbook'}
          </button>
        </div>

        {playbook && (
          <div className="mt-4 bg-gray-50 dark:bg-dark-200 rounded-md p-4 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">
            {playbook}
          </div>
        )}
      </div>
    </div>
  );
}
