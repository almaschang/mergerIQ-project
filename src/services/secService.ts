const SEC_API_KEY = '113348dc85f95032ed38197b0936dafd07a020a9a557aca050f4b72b0fd46d6c';

interface SECFiling {
  id: string;
  type: string;
  title: string;
  fileDate: string;
  filingUrl: string;
  description?: string;
}

export async function getSecFilings(symbol: string): Promise<SECFiling[]> {
  try {
    console.log(`Fetching SEC filings for ${symbol}`);
    
    // Using sec-api.io v1 endpoint
    const url = `https://api.sec-api.io/v1/filings?ticker=${symbol}&type=10-K,10-Q,8-K&limit=20`;
    console.log('Requesting URL:', url);

    const response = await fetch(url, {
      method: 'GET',  // Changed to GET request
      headers: {
        'Authorization': SEC_API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SEC API Error:', errorText);
      throw new Error(`Failed to fetch SEC filings: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('SEC API Response data:', data);

    if (!Array.isArray(data)) {
      console.log('No filings found in response');
      return [];
    }

    return data.map((filing: any) => ({
      id: filing.accessionNo || Math.random().toString(),
      type: filing.type || filing.formType || 'Unknown',
      title: filing.type || filing.formType || 'Unknown Filing',
      fileDate: new Date(filing.filedAt || filing.filingDate).toLocaleDateString(),
      filingUrl: filing.linkToFilingDetails || 
                `https://www.sec.gov/Archives/edgar/data/${filing.cik}/${filing.accessionNo.replace(/-/g, '')}/${filing.primaryDocument}`,
      description: filing.description || 
                  (filing.periodOfReport ? 
                  `Period ending ${new Date(filing.periodOfReport).toLocaleDateString()}` : 
                  `${filing.type || filing.formType} filing for ${symbol.toUpperCase()}`)
    }));
  } catch (error) {
    console.error('Error fetching SEC filings:', error);
    throw error;
  }
} 