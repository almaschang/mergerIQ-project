import { MarketNews } from '../../../types/market';
import { fetchMarketauxNews, fetchMarketauxAnalysis } from '../api/marketauxApi';
import { formatMarketauxArticle } from '../formatters/marketauxFormatter';

export async function fetchCompanyNews(symbol: string): Promise<MarketNews[]> {
  try {
    const [newsResponse, analysisResponse] = await Promise.all([
      fetchMarketauxNews(symbol),
      fetchMarketauxAnalysis(symbol)
    ]);

    const newsArticles = newsResponse.data?.map((article: any) => 
      formatMarketauxArticle(article, false)
    ) || [];

    const analysisArticles = analysisResponse.data?.map((article: any) => 
      formatMarketauxArticle(article, true)
    ) || [];

    return [...newsArticles, ...analysisArticles].sort((a, b) => b.datetime - a.datetime);
  } catch (error) {
    console.error('Error fetching company news:', error);
    return [];
  }
}