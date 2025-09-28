# Regulatory Disclosure Simulator & Stakeholder Matrix — Phase 3 Plan

## Objectives
- Build a disclosure sandbox that scores draft earnings-call talking points or 8-K summaries against regulatory expectations and historical disclosures.
- Deliver a stakeholder response matrix capturing how regulators, investors, suppliers, and employees might react based on evidence drift and sentiment differentials.

## Inputs Available
- SEC filings (FMP `sec_filings`), transcripts, news/sentiment classifiers, evidence coherence metrics (Phase 1), scenario outputs (Phase 2).
- AI summarization/playbook infrastructure for generating narratives.

## Data/Analytics Requirements
1. **Disclosure Simulator**
   - Baseline: latest SEC filings & transcript tone for a company.
   - Draft text input (user-provided) compared to baseline disclosure topics and regulatory risk radar alerts.
   - Metrics: disclosure compliance score, risk exposure change, stakeholder sentiment change.
2. **Stakeholder Matrix**
   - Channels: regulators, investors, suppliers/supply-chain, workforce.
   - Signals: evidence graph (coherence & contradictions), peer drift, scenario stress outputs, ESG/compliance alerts (from risk radar).
   - Output: per-stakeholder risk/opportunity score with recommended comms emphasis.

## UX Artifacts
- **Disclosure Simulator Panel**: text input area (or uploaded bullet list) with live scoring, citations, and recommended edits.
- **Stakeholder Matrix Dashboard**: grid of stakeholders with risk/opportunity indicators, evidence links, and suggested messaging bullet points.
- Integration hooks: highlight high-risk stakeholders in Evidence Lane and Scenario Copilot.

## Module & Hook Targets
- New analytics: `disclosureSimulator.ts`, `stakeholderMatrix.ts` inside `utils/intelligence`.
- Hook updates/new hooks: `useDisclosureSimulator`, `useStakeholderMatrix`.
- Components: disclosure simulator card in regulatory tab, stakeholder matrix section (maybe within compare or risk radar tab).

## Deliverables
1. **Analytics Layer**: text analysis against filings/transcripts, stakeholder scoring logic tying to evidence & drift.
2. **Hooks/Services**: fetch/compute methods returning scores, rationale, and suggested actions.
3. **Frontend**: simulator UI (with editable draft), stakeholder matrix visualization/alerts.
4. **Docs**: update plan doc with architecture and follow-up risks.

## Questions/Assumptions
- Draft text analysis can rely on keyword/topic matching + evidence graph; no new LLM call initially.
- Stakeholder scores will be heuristic but explainable; persistence still optional.
- Need to ensure API usage for additional data stays within rate limits.

## Next Steps
1. Implement analytics utilities and heuristics.
2. Expose via hooks and integrate into UI (risk tab + compare tab linkage).
3. Validate build and document outcomes.
\n## Implementation Notes\n- Disclosure simulator scores draft text using filings/transcripts tone deltas and risk radar outputs.\n- Stakeholder matrix blends peerd drift, scenario risk, and evidence coherence to rank regulatory/comms priorities.\n\n## Known Gaps\n- Requires better NLP for topic extraction; currently relies on keyword heuristics.\n- Stakeholder signals use cached data; persistence needed for historical comparisons.\n
