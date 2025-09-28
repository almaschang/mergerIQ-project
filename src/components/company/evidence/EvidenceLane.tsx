import React, { useMemo } from 'react';
import { Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Clock, RefreshCcw, ShieldCheck } from 'lucide-react';
import { useEvidenceGraph } from '../../../hooks/useEvidenceGraph';
import { EvidenceNode } from '../../../types/evidence';

interface EvidenceLaneProps {
  symbol: string;
}

export default function EvidenceLane({ symbol }: EvidenceLaneProps) {
  const { graph, isLoading, isError, isValidating } = useEvidenceGraph(symbol);

  const nodeById = useMemo(() => {
    if (!graph) return new Map<string, EvidenceNode>();
    return new Map(graph.nodes.map((node) => [node.id, node]));
  }, [graph]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-8 text-center">
        <Clock className="h-6 w-6 mx-auto text-blue-500 animate-spin" />
        <p className="mt-3 text-sm text-gray-500">Building evidence lane...</p>
      </div>
    );
  }

  if (isError || !graph) {
    return (
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-6">
        <AlertTriangle className="h-6 w-6 text-red-500" />
        <p className="mt-2 text-sm text-red-600">Unable to construct evidence graph. Try again later.</p>
      </div>
    );
  }

  const renderEvidenceItems = (insightId: string, relation: 'supports' | 'contradicts') => {
    const edges = graph.edges
      .filter((edge) => edge.to === insightId && edge.relation === relation)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);

    if (!edges.length) {
      return (
        <p className="text-xs text-gray-400">No {relation === 'supports' ? 'supporting' : 'challenging'} evidence yet.</p>
      );
    }

    return (
      <ul className="space-y-2">
        {edges.map((edge) => {
          const evidence = nodeById.get(edge.from);
          if (!evidence) return null;
          return (
            <li key={edge.id} className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">{evidence.title}</p>
                <p className="text-xs text-gray-400">{new Date(evidence.timestamp).toLocaleString()}</p>
              </div>
              <span className={`text-xs font-medium ${relation === 'supports' ? 'text-green-600' : 'text-rose-500'}`}>
                {edge.weight.toFixed(2)}
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">Graph Confidence</p>
            <div className="flex items-center gap-3 mt-2">
              <ShieldCheck className="h-7 w-7 text-blue-500" />
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{Math.round(graph.overallConfidence * 100)}%</p>
                <p className="text-xs text-gray-400">Adjusted confidence across {graph.insights.length} AI insights</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {isValidating && (
              <>
                <RefreshCcw className="h-4 w-4 animate-spin" />
                <span>Refreshing evidence</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 items-start">
        <div className="space-y-4">
          {graph.insights.map((insight) => {
            const supportTotal = insight.supportScore;
            const challengeTotal = insight.challengeScore;
            const total = supportTotal + challengeTotal;
            const supportRatio = total ? (supportTotal / total) * 100 : 0;
            const challengeRatio = total ? (challengeTotal / total) * 100 : 0;
            const deltaPositive = insight.delta >= 0;

            return (
              <div key={insight.id} className="bg-white dark:bg-dark-100 rounded-lg shadow p-5 border border-gray-100 dark:border-dark-200">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                      {insight.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Base {Math.round(insight.baseConfidence * 100)}% ? {Math.round(insight.adjustedConfidence * 100)}%</p>
                  </div>
                  <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-md ${
                    deltaPositive ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200'
                    : 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-200'
                  }`}>
                    {deltaPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                    {(insight.delta * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="mt-4">
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-dark-200 overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${supportRatio}%` }}
                    />
                    <div
                      className="h-full bg-rose-500 transition-all"
                      style={{ width: `${challengeRatio}%`, marginLeft: `${supportRatio}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-300">
                      <Activity className="h-3 w-3" /> Support {supportTotal.toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1 text-rose-500">
                      <AlertTriangle className="h-3 w-3" /> Challenge {challengeTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Reinforcing Evidence</p>
                    <div className="mt-2 space-y-2">
                      {renderEvidenceItems(insight.id, 'supports')}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contradicting Evidence</p>
                    <div className="mt-2 space-y-2">
                      {renderEvidenceItems(insight.id, 'contradicts')}
                    </div>
                  </div>
                </div>

                {insight.deltas.length > 0 && (
                  <div className="mt-4 text-xs text-gray-400">
                    Last update: {new Date(insight.deltas[insight.deltas.length - 1].timestamp).toLocaleString()} • {insight.deltas.length} evidence updates tracked
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-5 max-h-[580px] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4" /> Evidence Timeline
            </h3>
            <span className="text-xs text-gray-400">{graph.timeline.length} events</span>
          </div>
          <div className="mt-4 relative">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200 dark:bg-dark-200" />
            <div className="space-y-5">
              {graph.timeline.map((event) => (
                <div key={event.id} className="relative pl-8">
                  <span className={`absolute left-1 top-1.5 h-3 w-3 rounded-full border-2 ${
                    event.relation === 'supports'
                      ? 'bg-green-500 border-green-200'
                      : event.relation === 'contradicts'
                      ? 'bg-rose-500 border-rose-200'
                      : 'bg-blue-500 border-blue-200'
                  }`} />
                  <p className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleString()}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug mt-1">
                    {event.label}
                  </p>
                  {event.source && (
                    <p className="text-xs text-gray-400 mt-1">{event.source}</p>
                  )}
                  {event.url && (
                    <a
                      href={event.url}
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
        </div>
      </div>
    </div>
  );
}
