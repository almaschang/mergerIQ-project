# Action Marketplace & Feedback Loop — Phase 4 Plan

## Objectives
- Package AI-generated playbooks and mitigation actions into shareable "action modules" with versioning, ownership, and adoption tracking.
- Build a feedback loop that captures user execution status, ties outcomes to market metrics, and refines future recommendations.

## Dependencies
- Scenario playbooks (Phase 2), disclosure recommendations (Phase 3), evidence intelligence (Phase 1).
- Need a persistence layer (local JSON mock now; upgrade to backend later).

## Data/Analytics Needs
1. **Action Module Schema**
   - Fields: id, title, description, source (scenario/disclosure), recommended steps, owners, status (open/in-progress/done), timestamps, evidence references.
   - Metrics: adoption count, success flag, outcome delta (price/metric change).
2. **Feedback Loop**
   - Capture user updates (completed, skipped, blocked), optional notes.
   - Evaluate outcomes by comparing pre/post metrics (price, drift, risk index).
   - Score module effectiveness and feed back into scenario/disclosure suggestions.

## UX Concepts
- **Action Library Panel**: list of modules grouped by scenario/stakeholder with filters (status, confidence).
- **Module Detail Drawer**: step list, evidence links, actions to mark status, add notes.
- **Analytics View**: adoption trend, outcome success rate, heatmap across stakeholders.

## Implementation Plan
1. **Data Layer**
   - Create `actionModules.ts` utility for in-memory storage (mock persistence) with CRUD operations.
   - Build evaluators to compute outcome deltas using price/drift metrics.
2. **Hooks/Context**
   - `useActionMarketplace` hook: fetch modules, create, update status, compute analytics.
   - Optional context provider for cross-component access.
3. **UI**
   - Action marketplace card in dashboard or dedicated tab.
   - Module detail drawer; inline buttons on scenario/disclosure panels to publish new modules.
4. **Docs & Monitoring**
   - Extend plan doc with architecture, persistence strategy, future multi-user considerations.

## Assumptions
- For now modules stored client-side; future integration with backend/DB required for multi-user environments.
- Outcome evaluation limited to price/drift/risk indices captured at module completion time.
- Collaboration notifications (e.g., Slack/email) deferred to post-plan stage.

## Next Steps
1. Build action module data utilities and feedback scoring.
2. Wire hooks/context for marketplace management.
3. Implement UI panels/drawers and integrate with existing scenario/disclosure flows.
## Implementation Notes
- Action modules now have in-memory CRUD/feedback with analytics (`src/utils/market/actionModules.ts`, `src/hooks/useActionMarketplace.ts`).
- Dashboard features an Action Marketplace panel for creating, tracking, and closing modules (`src/components/market/ActionMarketplace.tsx`).
- Disclosure simulator and stakeholder matrix integrate into the regulatory radar for holistic compliance workflows.

## Known Gaps
- Persistence is temporary; migrate to a backend store for multi-user collaboration.
- Outcome scoring limited to simple deltas—expand metrics and attribution in future iterations.
- No alerting/notification channel yet for module updates.
