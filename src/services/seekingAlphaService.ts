const SA_API_KEY = '4853441032msh766c10534d41ca3p13844fjsn395b43efd665';

interface EarningsCall {
  id: string;
  title: string;
  date: string;
  quarter: string;
  year: string;
  url: string;
  description?: string;
}

export async function getEarningsCalls(symbol: string): Promise<EarningsCall[]> {
  try {
    console.log(`Fetching earnings calls for ${symbol}`);
    
    const response = await fetch(
      `https://seeking-alpha.p.rapidapi.com/transcripts/v2/list?id=${symbol.toLowerCase()}&size=20&number=1`,
      {
        headers: {
          'x-rapidapi-host': 'seeking-alpha.p.rapidapi.com',
          'x-rapidapi-key': SA_API_KEY
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return (data.data || []).map((item: any) => ({
      id: item.id,
      title: item.attributes?.title || '',
      date: new Date(item.attributes?.publishOn || '').toLocaleDateString(),
      quarter: item.attributes?.quarter || '',
      year: item.attributes?.year || '',
      url: `https://seekingalpha.com/article/${item.id}`,
      description: item.attributes?.description || ''
    }));
  } catch (error) {
    console.error('Error fetching earnings calls:', error);
    throw error;
  }
}