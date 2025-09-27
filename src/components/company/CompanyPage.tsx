import SECFilingsTab from './SECFilingsTab';
import EarningsCallsTab from './EarningsCallsTab';

// Inside your component's JSX
<div className="grid grid-cols-1 gap-4">
  {/* ... other tabs/components */}
  <SECFilingsTab symbol={symbol} />
  <EarningsCallsTab symbol={symbol} />
</div> 