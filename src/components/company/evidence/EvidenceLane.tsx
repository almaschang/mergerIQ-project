import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  RefreshCcw,
  ShieldCheck,
  RefreshCw,
  Info,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useEvidenceGraph } from '../../../hooks/useEvidenceGraph';
import {
  EvidenceNode,
  EvidenceFactCheckEntry,
  EvidenceFactCheckStatus,
  EvidenceSourceBreakdown,
  EvidenceContradictionAlert,
  EvidenceRefreshRecommendation
} from '../../../types/evidence';
import FactCheckDrawer from './FactCheckDrawer';

interface EvidenceLaneProps {
  symbol: string;
}

const FACT_CHECK_BADGE: Record<EvidenceFactCheckStatus, { label: string; className: string; icon: React.ReactNode }> = {
  supported: {
    label: 'Supported',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200',
    icon: <CheckCircle className="h-3 w-3 mr-1" />
  },
  contradicted: {
    label: 'Contradicted',
    className: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-200',
    icon: <AlertTriangle className="h-3 w-3 mr-1" />
  },
  'needs-review': {
    label: 'Needs Review',
    className: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-200',
    icon: <HelpCircle className="h-3 w-3 mr-1" />
  }
};

function CoherenceBreakdown({ breakdowns }: { breakdowns: EvidenceSourceBreakdown[] }) {
  if (!breakdowns.length) {
    return (
      <p className="text-xs text-gray-400">No evidence collected yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
      {breakdowns.map((item) => {
        const totalWeight = item.supportWeight + item.challengeWeight;
        const supportRatio = totalWeight ? (item.supportWeight / totalWeight) * 100 : 0;
        const challengeRatio = totalWeight ? (item.challengeWeight / totalWeight) * 100 : 0;
        const label = item.channel.charAt(0).toUpperCase() + item.channel.slice(1);

        return (
          <div key={item.channel} className="rounded-md border border-gray-200 dark:border-dark-200 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{supportRatio.toFixed(0)}% aligned</p>
            <div className="mt-3">
              <div className="h-2 rounded-full bg-gray-100 dark:bg-dark-200 overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${supportRatio}%` }} />
                <div
                  className="h-full bg-rose-500"
                  style={{ width: `${challengeRatio}%`, marginLeft: `${supportRatio}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Support {item.supportCount}</span>
                <span>Challenge {item.challengeCount}</span>
              </div>
              <div className="mt-1 text-xs text-gray-400">
                Freshness {(item.averageFreshness * 100).toFixed(0)}% | Reliability {(item.averageReliability * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RefreshRecommendations({ items }: { items: EvidenceRefreshRecommendation[] }) {
  if (!items.length) return null;

  return (
    <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-5">
      <div className="flex items-center gap-2 mb-4">
        <RefreshCw className="h-4 w-4 text-blue-500" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recommended Evidence Actions</h3>
      </div>
      <ul className="space-y-3 text-sm">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <span className={`mt-1 h-2.5 w-2.5 rounded-full ${
              item.priority === 'high' ? 'bg-rose-500' : item.priority === 'medium' ? 'bg-amber-400' : 'bg-gray-400'
            }`} />
            <div>
              <p className="text-gray-900 dark:text-gray-100 font-medium">{item.message}</p>
              <p className="text-xs text-gray-400">{item.channel.toUpperCase()} | {item.reason.replace('-', ' ')}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContradictionList({ alerts }: { alerts: EvidenceContradictionAlert[] }) {
  if (!alerts.length) return null;

  return (
    <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-4 w-4 text-rose-500" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Contradiction Watchlist</h3>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="border border-gray-200 dark:border-dark-200 rounded-md p-3 text-sm">
            <p className="text-gray-900 dark:text-gray-100 font-medium">{alert.message}</p>
            <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
              <span>{new Date(alert.timestamp).toLocaleString()}</span>
              <span className="uppercase">{alert.channel}</span>
            </div>
            {alert.url && (
              <a
                href={alert.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400"
              >
                Open source
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EvidenceLane({ symbol }: EvidenceLaneProps) {
  const { graph, intelligence, isLoading, isError, isValidating } = useEvidenceGraph(symbol);
  const [activeFactCheckId, setActiveFactCheckId] = useState<string | null>(null);

  const nodeById = useMemo(() => {
    if (!graph) return new Map<string, EvidenceNode>();
    return new Map(graph.nodes.map((node) => [node.id, node]));
  }, [graph]);

  const factCheckByInsight = useMemo(() => {
    if (!intelligence) return new Map<string, EvidenceFactCheckEntry>();
    return new Map(intelligence.factChecks.map((factCheck) => [factCheck.insightId, factCheck]));
  }, [intelligence]);

  const activeFactCheck = activeFactCheckId ? factCheckByInsight.get(activeFactCheckId) ?? null : null;

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

  const coherence = intelligence?.coherence;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">Evidence Alignment</p>
            <div className="flex items-center gap-3 mt-2">
              <ShieldCheck className="h-7 w-7 text-blue-500" />
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {Math.round((coherence?.overallScore ?? graph.overallConfidence) * 100)}%
                </p>
                <p className="text-xs text-gray-400">Alignment across {graph.insights.length} AI insights</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {isValidating && (
              <>
                <RefreshCcw className="h-4 w-4 animate-spin" />
                <span>Refreshing evidence</span>
              </>
            )}
            <span className="flex items-center gap-1 text-gray-500">
              <Info className="h-3.5 w-3.5" /> Updated {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
        {coherence && <CoherenceBreakdown breakdowns={coherence.breakdowns} />}
      </div>

      {intelligence && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RefreshRecommendations items={intelligence.refreshQueue} />
          <ContradictionList alerts={intelligence.contradictions} />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 items-start">
        <div className="space-y-4">
          {graph.insights.map((insight) => {
            const supportTotal = insight.supportScore;
            const challengeTotal = insight.challengeScore;
            const total = supportTotal + challengeTotal;
            const supportRatio = total ? (supportTotal / total) * 100 : 0;
            const challengeRatio = total ? (challengeTotal / total) * 100 : 0;
            const deltaPositive = insight.delta >= 0;
            const factCheck = factCheckByInsight.get(insight.id) || null;
            const badgeConfig = factCheck ? FACT_CHECK_BADGE[factCheck.status] : null;

            return (
              <div key={insight.id} className="bg-white dark:bg-dark-100 rounded-lg shadow p-5 border border-gray-100 dark:border-dark-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                      {insight.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Base {Math.round(insight.baseConfidence * 100)}% to {Math.round(insight.adjustedConfidence * 100)}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {badgeConfig && (
                      <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-md ${badgeConfig.className}`}>
                        {badgeConfig.icon}
                        {badgeConfig.label}
                      </span>
                    )}
                    <button
                      onClick={() => setActiveFactCheckId(insight.id)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Fact check
                    </button>
                    <span
                      className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-md ${
                        deltaPositive ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200'
                        : 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-200'
                      }`}
                    >
                      {deltaPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                      {(insight.delta * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-dark-200 overflow-hidden">
                    <div className="h-full bg-green-500 transition-all" style={{ width: `${supportRatio}%` }} />
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
                    Last update {new Date(insight.deltas[insight.deltas.length - 1].timestamp).toLocaleString()} — {insight.deltas.length} evidence updates tracked
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

      <FactCheckDrawer
        isOpen={Boolean(activeFactCheck && activeFactCheckId)}
        factCheck={activeFactCheck || null}
        onClose={() => setActiveFactCheckId(null)}
      />
    </div>
  );
}


