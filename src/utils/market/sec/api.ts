import { SEC_CONFIG } from './config';
import { SECApiResponse, SECQueryParams } from './types';
import { buildSecQuery } from './queryBuilder';

export async function fetchSecFilings(params: SECQueryParams, limit: number = 20): Promise<SECApiResponse> {
  try {
    const query = buildSecQuery(params);
    
    if (!query) {
      return { total: 0, filings: [] };
    }

    const response = await fetch(`${SEC_CONFIG.BASE_URL}${SEC_CONFIG.ENDPOINTS.FILINGS}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SEC_CONFIG.API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: {
          query_string: {
            query,
            default_operator: 'AND'
          }
        },
        from: 0,
        size: limit,
        sort: [{ filedAt: { order: 'desc' } }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SEC API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data.filings)) {
      console.warn('Invalid SEC API response format:', data);
      return { total: 0, filings: [] };
    }

    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('SEC API request failed:', errorMessage);
    throw error;
  }
}