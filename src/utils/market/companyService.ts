import { CompanyProfile, CompanySearchResult } from '../../types/company';
import { API_CONFIG } from '../../config/api';

export async function searchCompanies(query: string): Promise<CompanySearchResult[]> {
  if (!query) return [];
  
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/search?q=${encodeURIComponent(query)}&token=${API_CONFIG.FINNHUB_API_KEY}`
    );
    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error('Error searching companies:', error);
    return [];
  }
}

export async function getCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/stock/profile2?symbol=${symbol}&token=${API_CONFIG.FINNHUB_API_KEY}`
    );
    const data = await response.json();
    return Object.keys(data).length ? data : null;
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return null;
  }
}

export async function getCompanyNews(symbol: string): Promise<any[]> {
  const today = new Date();
  const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3));
  
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/company-news?symbol=${symbol}&from=${threeMonthsAgo.toISOString().split('T')[0]}&to=${new Date().toISOString().split('T')[0]}&token=${API_CONFIG.FINNHUB_API_KEY}`
    );
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching company news:', error);
    return [];
  }
}