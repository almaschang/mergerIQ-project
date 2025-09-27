import { MarketNews } from '../../types/market';

export function formatNewsData(item: any): MarketNews {
  return {
    category: item.category || 'general',
    datetime: new Date(item.time_published).getTime() / 1000,
    headline: item.title,
    id: item.url.hashCode(), // Using URL as a basis for unique ID
    image: item.banner_image || '',
    related: item.ticker_sentiment?.[0]?.ticker || '',
    source: item.source,
    summary: item.summary,
    url: item.url
  };
}

// Helper method to generate numeric hash from string
declare global {
  interface String {
    hashCode(): number;
  }
}

String.prototype.hashCode = function(): number {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
};