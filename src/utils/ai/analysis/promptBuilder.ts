import { NewsAnalysisInput } from './types';

export function buildAnalysisPrompt(input: NewsAnalysisInput): string {
  return `
Analyze the following CURRENT news about ${input.companyName} (${input.ticker}):

${input.articles.map((article, index) => `
${index + 1}. ${article.headline}
   Published: ${article.date}
   Source: ${article.source}
   Summary: ${article.summary}
`).join('\n')}

Provide a concise analysis that:
1. Summarizes the key current developments
2. Evaluates the immediate market impact
3. Identifies potential risks and opportunities
4. Assesses the current market sentiment

Focus ONLY on the information from these specific articles.
Do not include historical context or information not present in these articles.
Format the response in markdown with clear sections and bullet points.`;
}