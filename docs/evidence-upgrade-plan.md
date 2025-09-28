# Evidence Intelligence Upgrade — Phase 1 Plan

## Objectives
- Extend the existing evidence graph into a coherence engine that reconciles market insights with filings, transcripts, and live news.
- Automate evidence refresh triggers when confidence drops or contradictions surface.
- Embed a fact-check copilot inside the company detail view that cites supporting/contradicting sources in real time.

## Current Inputs
- **News**: `getCompanyNews`, `fetchAggregatedNews`, MarketAux + Finnhub + Seeking Alpha.
- **Filings**: new FMP `sec_filings` integration in `getCompanyFilings`.
- **Transcripts**: Seeking Alpha transcripts via `getCompanyTranscripts`/`getTranscriptDetails`.
- **AI Insights**: `generateMarketInsightsWithAI`, `analyzeNewsSentimentWithAI`, existing `evidenceGraph` builder.

## Data Enhancements Needed
1. **Evidence Coherence Scores**
   - Compute support vs. contradiction deltas per insight across each source type.
   - Track freshness and reliability gradients already exposed by `EvidenceNode`.
   - Persist delta history for trend analysis (local cache or lightweight store).
2. **Contradiction Watchlist**
   - Flag evidence when tone flips or when sequential filings dispute prior guidance.
   - Map contradictions back to affected metrics (e.g., revenue guidance vs. transcript statements).
3. **Refresh Triggers**
   - Define rules (confidence drop > X, stale evidence > Y hours, missing filings) to call fetchers.
   - Queue background refresh requests (initially client-side orchestrated, later serverless).

## UX Touchpoints
- **Evidence Lane Dashboard**: add a “coherence bar” with breakdown per data source, contradiction alerts, and refresh buttons.
- **Insight Cards**: show citation chips with counts per source and quick links to fact-check popovers.
- **Timeline**: highlight contradictory events in red with recommended follow-up fetches.
- **Fact-Check Copilot Panel**: collapsible sidebar or drawer accessible from each insight/metric; displays claims, citations, freshness, and actions (e.g., "pull latest 8-K").

## APIs / Modules to Extend
- `src/utils/intelligence/evidenceGraph.ts`: add coherence metrics & contradiction detection helpers.
- `src/utils/intelligence/textMetrics.ts`: extend tone/freshness utilities with variance scoring.
- New `src/utils/intelligence/evidenceCoherence.ts`: orchestrate refresh rules & score aggregation.
- `src/hooks/useEvidenceGraph.ts`: expose coherence scores, auto-refresh state, and fact-check data.
- `src/components/company/evidence/EvidenceLane.tsx`: render new widgets and controls.
- New fact-check UI: `src/components/company/evidence/FactCheckDrawer.tsx` (draft name).

## Phase 1 Deliverables
1. **Backend/Logic**
   - Coherence scoring module with contradiction detection & refresh signal outputs.
   - Hook updates returning `{ graph, coherence, refreshQueue, factChecks }`.
2. **Frontend**
   - Enhanced Evidence Lane with coherence bar, contradiction badges, refresh control.
   - Fact-check drawer modal integrated with insight cards (includes citation list & timestamps).
3. **Automation**
   - Client-side scheduler that evaluates refresh rules on render and when new evidence arrives.
   - Logging/reporting surface for manual follow-up (console + optional UI toast).

## Open Questions / Assumptions
- Short-term caching can remain in SWR; no server persistence yet.
- Fact-check copilot responses rely on existing data—no new LLM calls in Phase 1.
- Need UX direction for notification style (inline badges vs. toast) — will propose during implementation.

## Next Steps
1. Implement coherence analytics utilities.
2. Update hooks & components to consume new data.
3. Iterate on UI/UX with design feedback once interactive prototype is ready.
## Implementation Notes
- Coherence analytics now surface source breakdowns, contradiction alerts, refresh recommendations, and fact-check bundles via `analyzeEvidenceCoherence`.
- Evidence Lane renders the new intelligence widgets, a fact-check drawer, and actionable refresh hints.

## Known Gaps & Phase 2 Prerequisites
- Evidence refresh is advisory only; a background job or serverless hook is needed for automated pulls when alerts fire.
- Fact-check drawer relies on existing data without LLM summaries; future work should incorporate narrative explanations and user feedback capture.
- No persistence layer yet-consider storing coherence history to unlock trend analysis and stakeholder drift scoring (Phase 2 input).
- UX polish pending (design review for coherence cards, responsiveness testing).
- Notifications are passive; integrate global alerting/toast system before expanding to scenario arbitration.

