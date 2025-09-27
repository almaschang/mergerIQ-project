export async function fetchArticleContent(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const html = await response.text();
    
    // Extract article content from HTML
    // This is a basic example - would need to be customized per news source
    const contentMatch = html.match(/<article[^>]*>(.*?)<\/article>/s);
    if (!contentMatch) return null;
    
    // Clean up HTML tags and normalize whitespace
    return contentMatch[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch (error) {
    console.error(`Error fetching article content: ${url}`, error);
    return null;
  }
}