import React from 'react';
import { useHistorySnapshots } from '../../hooks/useHistorySnapshots';

export default function IntelligenceHistory() {
  const { scenarios, drifts, disclosures } = useHistorySnapshots();

  return (
    <div className="bg-white dark:bg-dark-100 shadow rounded-lg p-6">
      <p className="text-xs uppercase tracking-wide text-gray-400">Recent Intelligence Snapshots</p>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
        <div>
          <p className="text-xs text-gray-400">Scenario Runs</p>
          {scenarios.length === 0 ? (
            <p>No history captured yet.</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {scenarios.slice(0, 3).map((item) => (
                <li key={item.id} className="border-b border-gray-200 dark:border-dark-200 pb-1">
                  <p className="text-gray-900 dark:text-white font-medium">{item.symbol} • {item.scenarioId}</p>
                  <p className="text-xs text-gray-500">Stress {item.systemStressScore.toFixed(1)} | Confidence {(item.blendedConfidence * 100).toFixed(0)}%</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-400">Peer Drift</p>
          {drifts.length === 0 ? (
            <p>No drift snapshots yet.</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {drifts.slice(0, 3).map((item) => (
                <li key={item.id} className="border-b border-gray-200 dark:border-dark-200 pb-1">
                  <p className="text-gray-900 dark:text-white font-medium">{item.primarySymbol}</p>
                  <p className="text-xs text-gray-500">Score {item.overallDriftScore.toFixed(2)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-400">Disclosure Simulations</p>
          {disclosures.length === 0 ? (
            <p>No simulations run yet.</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {disclosures.slice(0, 3).map((item) => (
                <li key={item.id} className="border-b border-gray-200 dark:border-dark-200 pb-1">
                  <p className="text-gray-900 dark:text-white font-medium">{item.symbol}</p>
                  <p className="text-xs text-gray-500">Compliance {(item.complianceScore * 100).toFixed(0)}% | Reg risk {(item.regulatorRisk * 100).toFixed(0)}%</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
