export async function generateDeepseekResponse(prompt: string) {
  console.log('Sending request with prompt:', prompt);
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "deepseek-ai/deepseek-r1",
        messages: [
          { 
            role: "system", 
            content: "You are a helpful AI assistant for a financial market analysis platform. Provide concise, professional responses focused on market analysis and investment insights."
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        temperature: 0.7,
        top_p: 0.7,
        max_tokens: 4096,
        stream: false,
        n: 1
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText
      });
      throw new Error(`API request failed: ${response.statusText} (${response.status})`);
    }

    const data = await response.json();
    console.log('API Response data:', data);

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid response format:', data);
      throw new Error('No response content');
    }

    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('Detailed error:', {
      message: error.message,
      name: error.name,
      cause: error.cause,
      stack: error.stack,
      raw: error
    });
    
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Unable to connect to the AI service. Please check your connection and try again.');
    }
    
    throw error;
  }
} 