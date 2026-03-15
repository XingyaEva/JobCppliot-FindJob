/**
 * Tavily Search API Client
 */

const TAVILY_API_URL = 'https://api.tavily.com/search';
const TAVILY_API_KEY = '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';

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface TavilyResponse {
  answer?: string;
  results: TavilySearchResult[];
  query: string;
}

export async function tavilySearch(query: string, options?: {
  maxResults?: number;
  searchDepth?: 'basic' | 'advanced';
  includeAnswer?: boolean;
}): Promise<TavilyResponse> {
  const response = await fetch(TAVILY_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query: query,
      search_depth: options?.searchDepth || 'advanced',
      max_results: options?.maxResults || 5,
      include_answer: options?.includeAnswer ?? true,
      include_raw_content: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily API error: ${response.status}`);
  }

  return response.json() as Promise<TavilyResponse>;
}

/**
 * Perform parallel searches with multiple queries
 */
export async function tavilyMultiSearch(queries: string[]): Promise<TavilySearchResult[]> {
  const results = await Promise.allSettled(
    queries.map(q => tavilySearch(q, { maxResults: 5, searchDepth: 'advanced' }))
  );

  const allResults: TavilySearchResult[] = [];
  const seenUrls = new Set<string>();

  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const r of result.value.results) {
        if (!seenUrls.has(r.url)) {
          seenUrls.add(r.url);
          allResults.push(r);
        }
      }
    }
  }

  return allResults;
}
