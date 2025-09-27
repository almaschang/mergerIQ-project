import { MarketNews } from '../../../types/market';
import { NEWS_SOURCES } from './newsSources';
import { parseRSSFeed } from './rssFeedParser';

export async function scrapeNews(category?: string): Promise<MarketNews[]> {
  try {
    // Determine which sources to scrape based on category
    let sourcesToScrape: string[] = [];
    
    if (category && category in NEWS_SOURCES.sectors) {
      sourcesToScrape = NEWS_SOURCES.sectors[category];
    } else if (category === 'analysis') {
      sourcesToScrape = NEWS_SOURCES.analysis;
    } else {
      sourcesToScrape = NEWS_SOURCES.general;
    }

    // Fetch and parse all feeds concurrently
    const articles = await Promise.all(
      sourcesToScrape.map(async (feed) => {
        try {
          const response = await fetch(feed);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const text = await response.text();
          return parseRSSFeed(text, feed);
        } catch (error) {
          console.warn(`Error fetching RSS feed ${feed}:`, error);
          return [];
        }
      })
    );

    // Combine all articles, remove duplicates, and sort by date
    return Array.from(
      new Map(
        articles
          .flat()
          .sort((a, b) => b.datetime - a.datetime)
          .map(article => [article.url, article])
      ).values()
    ).slice(0, 50); // Return top 50 most recent articles
  } catch (error) {
    console.warn('Error scraping news:', error);
    return [];
  }
}