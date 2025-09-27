export function createInsightPrompt(
  companyName: string,
  industry: string,
  marketCap: number,
  sentiment: string,
  headlines: string[]
): string {
  return `
Analyze this company and provide market insights:
Company: ${companyName}
Industry: ${industry}
Market Cap: $${marketCap}M
Recent Sentiment: ${sentiment}

Recent Headlines:
${headlines.join('\n')}

Return a JSON array of insights:
[{
  "type": "trend" | "risk" | "opportunity",
  "description": "brief insight",
  "confidence": number between 0-1
}]
Limit to 3 most important insights.`;
}