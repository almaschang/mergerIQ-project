import { AI_CONFIG } from '../config';

export async function analyzeWithGPT(prompt: string): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: AI_CONFIG.MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: AI_CONFIG.MAX_TOKENS,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API error:', error);
    return '';
  }
}