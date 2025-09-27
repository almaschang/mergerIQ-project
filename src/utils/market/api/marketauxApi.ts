import { API_CONFIG } from '../../../config/api';

const BASE_URL = 'https://api.marketaux.com/v1';

export async function fetchMarketauxNews(symbol: string) {
  const params = new URLSearchParams({
    symbols: symbol,
    filter_entities: 'true',
    language: 'en',
    api_token: API_CONFIG.MARKETAUX_API_KEY
  });

  const response = await fetch(`${BASE_URL}/news?${params}`);
  return response.json();
}

export async function fetchMarketauxAnalysis(symbol: string) {
  const params = new URLSearchParams({
    symbols: symbol,
    filter_entities: 'true',
    language: 'en',
    source_type: 'analysis',
    api_token: API_CONFIG.MARKETAUX_API_KEY
  });

  const response = await fetch(`${BASE_URL}/news?${params}`);
  return response.json();
}