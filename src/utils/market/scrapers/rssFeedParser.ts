import { MarketNews } from '../../../types/market';
import { classifyArticle } from '../classifiers/articleClassifier';

export function parseRSSFeed(xml: string, sourceUrl: string): MarketNews[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const items = doc.querySelectorAll('item');
    const channelTitle = doc.querySelector('channel > title')?.textContent || getSourceName(sourceUrl);

    return Array.from(items)
      .map(item => {
        const pubDate = item.querySelector('pubDate')?.textContent;
        if (!pubDate) return null;

        const article: MarketNews = {
          category: 'market',
          datetime: new Date(pubDate).getTime() / 1000,
          headline: item.querySelector('title')?.textContent || '',
          id: item.querySelector('guid')?.textContent || Math.random().toString(),
          image: extractImage(item),
          source: channelTitle,
          summary: cleanDescription(item.querySelector('description')?.textContent || ''),
          url: item.querySelector('link')?.textContent || '',
          related: extractTickers(item) || ''
        };

        return classifyArticle(article);
      })
      .filter((article): article is MarketNews => 
        article !== null && 
        article.datetime > 0 && 
        article.headline.length > 0
      );
  } catch (error) {
    console.warn('Error parsing RSS feed:', error);
    return [];
  }
}

function getSourceName(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
  } catch {
    return 'News Source';
  }
}

function extractImage(item: Element): string {
  // Try different ways to find an image
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

function cleanDescription(description: string): string {
  // Remove HTML tags and limit length
  const text = description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > 300 ? text.substring(0, 297) + '...' : text;
}

function extractTickers(item: Element): string {
  // Try to find stock tickers in the content
  const content = item.querySelector('content\\:encoded, description')?.textContent || '';
  const tickerMatches = content.match(/\$([A-Z]{1,5})/g);
  if (tickerMatches) {
    return tickerMatches.map(t => t.substring(1)).join(', ');
  }
  return '';
}