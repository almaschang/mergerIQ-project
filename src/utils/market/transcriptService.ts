import { Transcript, TranscriptDetails } from '../../types/transcripts';
import { API_CONFIG } from '../../config/api';

let currentKeyIndex = 0;

function getNextApiKey(): string {
  const key = API_CONFIG.SEEKING_ALPHA_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_CONFIG.SEEKING_ALPHA_API_KEYS.length;
  return key;
}

function getHeaders() {
  return {
    'x-rapidapi-host': 'seeking-alpha.p.rapidapi.com',
    'x-rapidapi-key': getNextApiKey()
  };
}

export async function getCompanyTranscripts(symbol: string): Promise<Transcript[]> {
  try {
    const response = await fetch(
      `${API_CONFIG.SEEKING_ALPHA_BASE_URL}/transcripts/v2/list?id=${symbol.toLowerCase()}&size=20&number=1`,
      { headers: getHeaders() }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return (data.data || []).map((item: any) => ({
      id: item.id,
      title: item.attributes?.title || '',
      publishedOn: item.attributes?.publishOn || '',
      symbol: symbol.toUpperCase(),
      quarter: item.attributes?.quarter,
      year: item.attributes?.year
    }));
  } catch (error) {
    console.warn(`Error fetching transcripts for ${symbol}:`, error);
    // Try another API key if we get a rate limit error
    if (error instanceof Error && error.message.includes('429')) {
      return getCompanyTranscripts(symbol);
    }
    return [];
  }
}

export async function getTranscriptDetails(id: string): Promise<TranscriptDetails | null> {
  try {
    const response = await fetch(
      `${API_CONFIG.SEEKING_ALPHA_BASE_URL}/transcripts/v2/get-details?id=${id}`,
      { headers: getHeaders() }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.data) return null;

    // Ensure we get the complete content
    const content = data.data.attributes?.content || '';
    const fullContent = content.replace(/\[\d+\]|\[continued\]/g, ''); // Clean up reference numbers and continued markers
    
    return {
      id: data.data.id,
      title: data.data.attributes?.title || '',
      publishedOn: data.data.attributes?.publishOn || '',
      content: fullContent,
      participants: (data.data.attributes?.participants || []).map((p: any) => ({
        name: p.name,
        title: p.title,
        type: p.type
      }))
    };
  } catch (error) {
    console.warn(`Error fetching transcript details for ${id}:`, error);
    // Try another API key if we get a rate limit error
    if (error instanceof Error && error.message.includes('429')) {
      return getTranscriptDetails(id);
    }
    return null;
  }
}