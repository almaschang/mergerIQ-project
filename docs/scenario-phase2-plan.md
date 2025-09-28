# Scenario Arbitration & Peer Drift — Phase 2 Plan

## Objectives
- Add a multi-model arbitration layer to the scenario copilot that compares deterministic simulation, historical analogs, and AI narrative guidance before recommending actions.
- Introduce an explainable peer drift monitor that tracks how competitor fundamentals, disclosures, and sentiment diverge from the primary company and links drift to evidence.

## Existing Assets
- Scenario baselines + simulations (`scenarioSimulator.ts`, `useScenarioCopilot`).
- Evidence graph & intelligence report (Phase 1).
- Market data (quotes, key metrics, news), filings, transcripts.
- AI playbook generator (Deepseek R1) and insight system.

## New Data/Analytics Needs
1. **Multi-Model Scenario Arbitration**
   - Deterministic model (existing simulator output).
   - Historical analog engine: mine past scenarios with similar sector + shock to compute outcome envelopes.
   - Narrative assessor: evaluate AI playbook sentiment and alignment with metrics.
   - Arbitration logic selects/weights models, outputs rationale and confidence.
2. **Peer Drift Analytics**
   - Time-series capture for peers (market cap, price, revenue growth, valuation ratios).
   - Disclosure delta tracker: compare latest filings/transcripts vs. current company (tone, risk keywords).
   - Sentiment differential using existing news/transcript classifiers.
   - Drift scoring with thresholds for alerts.

## UX / Touchpoints
- **Scenario Copilot Panel**: add arbitration summary chip (model weighting, confidence) and toggle to inspect individual models.
- **Scenario detail modal**: show historical analog cases and narrative alignment insights.
- **Peer Drift Monitor**: new section in compare tab (or dedicated tab) with drift score timeline, top drivers, and linkage to evidence nodes.
- Alerts/Badges in Evidence Lane/Compare when drift crosses thresholds or arbitration signals disagreement.

## API & Module Work
- Extend `scenarioSimulator.ts` with support for historical analog lookups and blended results.
- New `scenarioArbitration.ts` utility (scoring, weighting, explanations).
- New `peerDriftAnalyzer.ts` leveraging market/fundamental/time-series data + evidence graph references.
- Hook updates: `useScenarioCopilot` to expose arbitration results; new `usePeerDrift` hook.
- UI components: arbitration summary cards, historical analog list, drift monitor charts/alerts.

## Deliverables
1. **Logic Layer**
   - Arbitration module returning blend, per-model scores, disagreements, and recommended playbooks.
   - Peer drift analytics producing current drift score, breakdown, and linkage to evidence nodes.
2. **Hooks/Services**
   - Updated copilot hook delivering `{ baselines, arbitration, playbook }` bundles.
   - Peer drift hook with drift timeline + alerts for compare tab.
3. **Frontend**
   - Scenario Copilot enhancements showing arbitration panel + analogs.
   - Peer Drift dashboard (cards, charts, alerts) integrated into compare flow and evidence lane badges.
4. **Docs & Instrumentation**
   - Update plan doc with architecture, risks, and follow-up tasks.

## Open Questions / Assumptions
- Historical data source: start with cached FMP fundamentals + price history via existing API keys; may need to store snapshots locally.
- Arbitration initially client-side; future work could offload to backend for heavy computations.
- Peer drift requires additional data fetch volume—need to monitor rate limits.
- Visual design iteration expected once prototype is functional.

## Next Steps
1. Build arbitration + drift analytics utilities with mocked historical datasets (fall back to limited lookback if API absent).
2. Update hooks/services to fetch required historical data and expose new intelligence.
3. Implement UI enhancements (Scenario Copilot, Peer Drift monitor) and wire to Evidence Lane warnings.
## Implementation Notes
- Scenario arbitration blends deterministic simulation, historical analog analysis, and resilience heuristics (`scenarioArbitration.ts`).
- Scenario copilot now returns arbitration output alongside simulations, with UI surfacing consensus confidence and model rationales.
- Peer drift analytics compute price, valuation, and disclosure deltas using FMP data and exposure through `usePeerDrift`.

## Known Gaps & Follow-up
- Historical analogs rely on short lookback price data; consider caching structured analog cases for richer context.
- Disclosure drift uses filing counts only—phase in qualitative tone analysis when evidence signals are ready.
- Arbitration currently executes client-side; monitor performance and prepare backend service for heavier workloads.
- Peer drift timeline records single snapshots; persist history to unlock trend visualizations in Phase 3.
