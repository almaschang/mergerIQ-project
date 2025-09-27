export function createSentimentPrompt(headlines: string[]): string {
  return `
Analyze the market sentiment from these headlines:
${headlines.join('\n')}

Return a JSON object with:
{
  "sentiment": "positive" | "negative" | "neutral",
  "confidence": number between 0-1,
  "score": number between -1 to 1,
  "reasoning": "brief explanation"
}`;
}