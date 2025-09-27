import { MarketType, LocaleType } from '../../types/market';

export const MARKET_OPTIONS: { value: MarketType; label: string }[] = [
  { value: 'usa', label: 'USA (NASDAQ, NYSE, NYSE ARCA, OTC)' },
  { value: 'argentina', label: 'Argentina (BYMA, BCBA)' },
  { value: 'australia', label: 'Australia (ASX)' },
  // ... Add all markets from the list
  { value: 'forex', label: 'Forex' },
  { value: 'crypto', label: 'Cryptocurrencies' }
];

export const LOCALE_OPTIONS: { value: LocaleType; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'in', label: 'English (India)' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  // ... Add all locales from the list
  { value: 'he', label: 'עברית' }
];