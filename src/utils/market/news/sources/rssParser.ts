import { MarketNews } from '../../../../types/market';

export async function parseRSSFeed(feedUrl: string): Promise<MarketNews[]> {
  try {
    const response = await fetch(feedUrl);
    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    const items = xml.querySelectorAll('item');

    return Array.from(items).map(item => {
      const pubDate = item.querySelector('pubDate')?.textContent;
      const title = item.querySelector('title')?.textContent;
      const link = item.querySelector('link')?.textContent;
      const description = item.querySelector('description')?.textContent;

      if (!pubDate || !title || !link) return null;

      return {
        id: link,
        category: 'market',
        datetime: new Date(pubDate).getTime() / 1000,
        headline: title,
        image: extractImage(item),
        source: extractSource(feedUrl),
        summary: cleanDescription(description || ''),
        url: link,
        related: extractTickers(description || '')
      };
    }).filter((item): item is MarketNews => item !== null);
  } catch (error) {
    console.error(`Error parsing RSS feed ${feedUrl}:`, error);
    return [];
  }
}

function extractImage(item: Element): string {
  const mediaContent = item.querySelector('media\\:content, content');
  if (mediaContent?.getAttribute('url')) {
    return mediaContent.getAttribute('url') || '';
  }

  const enclosure = item.querySelector('enclosure');
  if (enclosure?.getAttribute('url')) {
    return enclosure.getAttribute('url') || '';
  }

  const description = item.querySelector('description')?.textContent || '';
  const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch ? imgMatch[1] : '';
}

function extractSource(feedUrl: string): string {
  try {
    const url = new URL(feedUrl);
    return url.hostname.replace('www.', '').split('.')[0];
  } catch {
    return 'Unknown';
  }
}

function cleanDescription(description: string): string {
  return description
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 300);
}

function extractTickers(text: string): string {
  const tickerPattern = /\$([A-Z]{1,5})/g;
  const matches = text.match(tickerPattern);
  return matches ? matches.map(t => t.substring(1)).join(', ') : '';
}