// Pool of FMP API keys
const API_KEYS = [
  'c4c1e79bf3f6bb102ae400072a048d27', // Original key
  'ZLMylX7Cnh2ADZoUuvA2oSenWelHTdWp',
  'AMQi9KIB9QeeEJTDuqWxUw1IrakZNn6F',
  '0Pcr2CTlmncSygMJNl9ckRA5aXrYOitn',
  'yrbJkxLi2vAZID1G2s4H5MHYVmHAtsf2',
  'hJlgBIDx2ACGmLBCxcRhZQSDVYqtlvha',
  'xMfUkVh9p6uyUf4kzZHoWhQXI6GJSqoE',
  '40H0J8cxSiMihxtmhwg3X12ogEg67gu1'
];

let currentKeyIndex = Math.floor(Math.random() * API_KEYS.length);
const usedKeys = new Set<string>();

export function getFmpApiKey(): string {
  // If all keys have been used, reset the used keys set
  if (usedKeys.size === API_KEYS.length) {
    usedKeys.clear();
  }

  // Get the next unused key
  let key = API_KEYS[currentKeyIndex];
  while (usedKeys.has(key)) {
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    key = API_KEYS[currentKeyIndex];
  }

  usedKeys.add(key);
  return key;
}

export async function fetchWithFmpApiKey(url: string, options: RequestInit = {}): Promise<Response> {
  const maxRetries = API_KEYS.length;
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    const apiKey = getFmpApiKey();
    const urlWithKey = url.includes('?') 
      ? `${url}&apikey=${apiKey}`
      : `${url}?apikey=${apiKey}`;

    try {
      const response = await fetch(urlWithKey, options);
      
      // If rate limited, try another key
      if (response.status === 429) {
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      // If it's a network error, don't retry with a different key
      if (error instanceof TypeError) {
        throw error;
      }
    }
  }

  throw lastError || new Error('All API keys exhausted');
}