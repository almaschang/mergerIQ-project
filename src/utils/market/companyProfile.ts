import { CompanyProfile } from '../../types/company';
import { API_CONFIG } from '../../config/api';

async function getFinnhubProfile(symbol: string): Promise<CompanyProfile | null> {
  try {
    const response = await fetch(
      `${API_CONFIG.FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${API_CONFIG.FINNHUB_API_KEY}`
    );
    const data = await response.json();
    return Object.keys(data).length ? data : null;
  } catch (error) {
    console.warn('Finnhub profile error:', error);
    return null;
  }
}

async function getAlphaVantageProfile(symbol: string): Promise<CompanyProfile | null> {
  try {
    const response = await fetch(
      `${API_CONFIG.ALPHA_VANTAGE_BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_CONFIG.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    if (data.Symbol) {
      return {
        country: data.Country || '',
        currency: 'USD',
        exchange: data.Exchange || '',
        ipo: data.IPODate || '',
        marketCapitalization: parseFloat(data.MarketCapitalization) / 1000000,
        name: data.Name,
        phone: data.Phone || '',
        shareOutstanding: parseFloat(data.SharesOutstanding),
        ticker: data.Symbol,
        weburl: '',
        logo: '',
        industry: data.Industry || ''
      };
    }
    return null;
  } catch (error) {
    console.warn('Alpha Vantage profile error:', error);
    return null;
  }
}

export async function getCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
  try {
    // Try Finnhub first
    const finnhubProfile = await getFinnhubProfile(symbol);
    if (finnhubProfile) {
      return finnhubProfile;
    }

    // Fallback to Alpha Vantage
    const alphaVantageProfile = await getAlphaVantageProfile(symbol);
    if (alphaVantageProfile) {
      return alphaVantageProfile;
    }

    return null;
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return null;
  }
}