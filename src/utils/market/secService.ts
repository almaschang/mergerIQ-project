import { SECFiling, FilingType } from '../../types/secFilings';
import { fetchSecFilings } from './sec/api';
import { formatFilingResponse } from './sec/formatters';

export async function getCompanyFilings(
  symbol: string,
  type?: FilingType,
  limit: number = 20
): Promise<SECFiling[]> {
  if (!symbol) {
    console.warn('No symbol provided for SEC filings');
    return [];
  }

  try {
    // First try with symbol
    const symbolData = await fetchSecFilings({
      ticker: symbol,
      formType: type
    }, limit);

    let filings = symbolData.filings;

    // If no results found with symbol, try with company name
    if (!filings.length) {
      // Get company profile to get the full company name
      const companyName = await getCompanyName(symbol);
      if (companyName) {
        const nameData = await fetchSecFilings({
          companyName: companyName,
          formType: type
        }, limit);
        filings = nameData.filings;
      }
    }
    
    if (!filings.length) {
      console.info(`No SEC filings found for ${symbol}`);
      return [];
    }

    return filings.map(filing => {
      try {
        return formatFilingResponse(filing);
      } catch (formatError) {
        console.warn(`Error formatting filing for ${symbol}:`, formatError);
        return null;
      }
    }).filter((filing): filing is SECFiling => filing !== null);
  } catch (error) {
    console.error('Error fetching SEC filings:', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}

async function getCompanyName(symbol: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`
    );
    const data = await response.json();
    return data.name || null;
  } catch (error) {
    console.warn('Error fetching company name:', error);
    return null;
  }
}