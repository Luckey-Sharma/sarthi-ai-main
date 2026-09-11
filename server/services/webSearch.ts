/**
 * Sarthi Web Search Service
 *
 * Performs REAL server-side web searches using multiple providers:
 *   1. Google Custom Search API (if GOOGLE_SEARCH_API_KEY + GOOGLE_SEARCH_CX configured)
 *   2. DuckDuckGo HTML Lite (zero-config fallback — no API key needed)
 *
 * Features:
 *   - Authoritative medical source ranking (WHO, MoHFW, NIMHANS, ICMR, CDC, NHS, etc.)
 *   - Blog/spam domain filtering
 *   - Safe search enforcement
 *   - Source trustworthiness scoring
 *
 * IMPORTANT: This service runs SERVER-SIDE ONLY. No API keys are exposed to the frontend.
 */

import fs from 'fs';

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  domain: string;
  publisher: string;
  authoritative: boolean;
  publishedDate?: string;
}

export interface WebSearchOptions {
  maxResults?: number;
  language?: string;
}

// ─── Authoritative Domain Registry ─────────────────────────────────────────────

const AUTHORITATIVE_DOMAINS: Record<string, string> = {
  'who.int': 'World Health Organization (WHO)',
  'mohfw.gov.in': 'Ministry of Health and Family Welfare (Govt of India)',
  'nhp.gov.in': 'National Health Portal (India)',
  'nha.gov.in': 'National Health Authority (India)',
  'icmr.gov.in': 'Indian Council of Medical Research (ICMR)',
  'nimhans.ac.in': 'NIMHANS Bengaluru',
  'aiims.edu': 'AIIMS New Delhi',
  'nhs.uk': 'National Health Service (NHS UK)',
  'cdc.gov': 'Centers for Disease Control and Prevention (CDC)',
  'nia.nih.gov': 'National Institute on Aging (NIH)',
  'nih.gov': 'National Institutes of Health (NIH)',
  'ncbi.nlm.nih.gov': 'PubMed / NCBI',
  'pubmed.ncbi.nlm.nih.gov': 'PubMed',
  'mayoclinic.org': 'Mayo Clinic',
  'hopkinsmedicine.org': 'Johns Hopkins Medicine',
  'health.harvard.edu': 'Harvard Health Publishing',
  'alz.org': "Alzheimer's Association",
  'alzheimers.org.uk': "Alzheimer's Society UK",
  'clevelandclinic.org': 'Cleveland Clinic',
  'medlineplus.gov': 'MedlinePlus (NIH)',
  'webmd.com': 'WebMD',
  'healthline.com': 'Healthline',
};

// Domains to filter out (low quality, user-generated, or spam)
const BLOCKED_DOMAINS = new Set([
  'blogspot.com', 'wordpress.com', 'tumblr.com',
  'reddit.com', 'quora.com', 'pinterest.com',
  'facebook.com', 'twitter.com', 'instagram.com',
  'tiktok.com', 'youtube.com', 'medium.com',
  'linkedin.com', 'amazon.com', 'flipkart.com',
]);

// ─── Environment Key Loader ────────────────────────────────────────────────────

function loadEnvKeys(): { googleSearchApiKey?: string; googleSearchCx?: string } {
  const result: { googleSearchApiKey?: string; googleSearchCx?: string } = {};

  // Check process.env first
  if (process.env.GOOGLE_SEARCH_API_KEY) {
    result.googleSearchApiKey = process.env.GOOGLE_SEARCH_API_KEY.trim();
  }
  if (process.env.GOOGLE_SEARCH_CX) {
    result.googleSearchCx = process.env.GOOGLE_SEARCH_CX.trim();
  }

  // Fall back to reading .env file if not in process.env
  if (!result.googleSearchApiKey || !result.googleSearchCx) {
    try {
      if (fs.existsSync('.env')) {
        const lines = fs.readFileSync('.env', 'utf8').split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('GOOGLE_SEARCH_API_KEY=') && !result.googleSearchApiKey) {
            const val = trimmed.substring('GOOGLE_SEARCH_API_KEY='.length).trim();
            if (val && !val.includes('your_')) {
              result.googleSearchApiKey = val;
            }
          }
          if (trimmed.startsWith('GOOGLE_SEARCH_CX=') && !result.googleSearchCx) {
            const val = trimmed.substring('GOOGLE_SEARCH_CX='.length).trim();
            if (val && !val.includes('your_')) {
              result.googleSearchCx = val;
            }
          }
        }
      }
    } catch {
      // Ignore read errors
    }
  }

  return result;
}

// ─── Domain Utilities ──────────────────────────────────────────────────────────

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

function isBlockedDomain(domain: string): boolean {
  for (const blocked of BLOCKED_DOMAINS) {
    if (domain === blocked || domain.endsWith(`.${blocked}`)) {
      return true;
    }
  }
  return false;
}

function getPublisherInfo(domain: string): { publisher: string; authoritative: boolean } {
  // Check exact match
  if (AUTHORITATIVE_DOMAINS[domain]) {
    return { publisher: AUTHORITATIVE_DOMAINS[domain], authoritative: true };
  }

  // Check parent domain match (e.g., "news.nih.gov" matches "nih.gov")
  for (const [authDomain, publisher] of Object.entries(AUTHORITATIVE_DOMAINS)) {
    if (domain.endsWith(`.${authDomain}`)) {
      return { publisher, authoritative: true };
    }
  }

  // Check for university / gov domains (generally trustworthy)
  if (domain.endsWith('.edu') || domain.endsWith('.ac.in') || domain.endsWith('.gov') || domain.endsWith('.gov.in')) {
    return { publisher: domain, authoritative: true };
  }

  return { publisher: domain, authoritative: false };
}

// ─── Provider 1: Google Custom Search API ──────────────────────────────────────

async function searchGoogle(
  query: string,
  apiKey: string,
  cx: string,
  maxResults: number
): Promise<WebSearchResult[]> {
  const url = new URL('https://www.googleapis.com/customsearch/v1');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('cx', cx);
  url.searchParams.set('q', query);
  url.searchParams.set('num', String(Math.min(maxResults, 10)));
  url.searchParams.set('safe', 'active');

  console.log(`[WebSearch] Google Custom Search: "${query}"`);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(6000),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.error(`[WebSearch] Google API error ${response.status}: ${errorText.slice(0, 200)}`);
    throw new Error(`Google Search API returned ${response.status}`);
  }

  const data = (await response.json()) as any;
  const items: any[] = data.items || [];

  return items.map((item: any) => {
    const resultUrl = item.link || '';
    const domain = extractDomain(resultUrl);
    const { publisher, authoritative } = getPublisherInfo(domain);

    return {
      title: item.title || '',
      url: resultUrl,
      snippet: item.snippet || '',
      domain,
      publisher,
      authoritative,
      publishedDate: item.pagemap?.metatags?.[0]?.['article:published_time'] || undefined,
    };
  });
}

// ─── Provider 2: DuckDuckGo HTML Lite (Zero-Config Fallback) ───────────────────

async function searchDuckDuckGo(
  query: string,
  maxResults: number
): Promise<WebSearchResult[]> {
  console.log(`[WebSearch] DuckDuckGo Lite: "${query}"`);

  // DuckDuckGo Lite is a lightweight HTML interface
  const formBody = `q=${encodeURIComponent(query)}`;

  const response = await fetch('https://lite.duckduckgo.com/lite/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
    body: formBody,
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`DuckDuckGo returned ${response.status}`);
  }

  const html = await response.text();
  const results: WebSearchResult[] = [];

  // Extract result links: supports either order of href/class and single or double quotes
  // e.g. <a rel="nofollow" href="URL" class='result-link'>TITLE</a>
  const linkRegex = /<a[^>]+href=['"]([^'"]+)['"][^>]*class=['"]result-link['"][^>]*>([\s\S]*?)<\/a>|<a[^>]+class=['"]result-link['"][^>]*href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi;
  const snippetRegex = /<td[^>]*class=['"]result-snippet['"][^>]*>([\s\S]*?)<\/td>/gi;

  const links: { url: string; title: string }[] = [];
  let linkMatch: RegExpExecArray | null;
  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const url = (linkMatch[1] || linkMatch[3] || '').trim();
    const rawTitle = (linkMatch[2] || linkMatch[4] || '').replace(/<[^>]*>/g, '').trim();
    const title = rawTitle.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
    if (url && title && url.startsWith('http')) {
      links.push({ url, title });
    }
  }

  const snippets: string[] = [];
  let snippetMatch: RegExpExecArray | null;
  while ((snippetMatch = snippetRegex.exec(html)) !== null) {
    const text = snippetMatch[1].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").trim();
    snippets.push(text);
  }

  for (let i = 0; i < Math.min(links.length, maxResults); i++) {
    const { url, title } = links[i];
    const domain = extractDomain(url);
    if (isBlockedDomain(domain)) continue;

    const { publisher, authoritative } = getPublisherInfo(domain);
    results.push({
      title,
      url,
      snippet: snippets[i] || '',
      domain,
      publisher,
      authoritative,
    });
  }

  return results;
}

// ─── Main Search Function ──────────────────────────────────────────────────────

/**
 * Performs a real web search using available providers.
 *
 * Priority:
 *   1. Google Custom Search API (if configured via GOOGLE_SEARCH_API_KEY + GOOGLE_SEARCH_CX)
 *   2. DuckDuckGo HTML Lite (zero-config fallback)
 *
 * Results are filtered, ranked (authoritative first), and limited.
 */
export async function searchWeb(
  query: string,
  options: WebSearchOptions = {}
): Promise<WebSearchResult[]> {
  const maxResults = options.maxResults || 6;

  if (!query || query.trim().length === 0) {
    return [];
  }

  // Enhance query for better medical/health results
  const enhancedQuery = enhanceHealthQuery(query);

  let rawResults: WebSearchResult[] = [];

  // Try Provider 1: Google Custom Search
  const { googleSearchApiKey, googleSearchCx } = loadEnvKeys();
  if (googleSearchApiKey && googleSearchCx) {
    try {
      rawResults = await searchGoogle(enhancedQuery, googleSearchApiKey, googleSearchCx, maxResults + 4);
      console.log(`[WebSearch] Google returned ${rawResults.length} results`);
    } catch (err: any) {
      console.warn(`[WebSearch] Google Custom Search failed: ${err.message}. Falling back to DuckDuckGo.`);
      rawResults = [];
    }
  }

  // Try Provider 2: DuckDuckGo (fallback or if Google not configured)
  if (rawResults.length === 0) {
    try {
      rawResults = await searchDuckDuckGo(enhancedQuery, maxResults + 4);
      console.log(`[WebSearch] DuckDuckGo returned ${rawResults.length} results`);
    } catch (err: any) {
      console.warn(`[WebSearch] DuckDuckGo failed: ${err.message}`);
      rawResults = [];
    }
  }

  if (rawResults.length === 0) {
    console.log('[WebSearch] All providers returned 0 results.');
    return [];
  }

  // Filter and rank results
  const filtered = rawResults
    .filter(r => r.url && r.title && !isBlockedDomain(r.domain))
    .filter((r, idx, arr) => arr.findIndex(x => x.url === r.url) === idx); // deduplicate

  // Sort: authoritative first, then by order
  const ranked = filtered.sort((a, b) => {
    if (a.authoritative && !b.authoritative) return -1;
    if (!a.authoritative && b.authoritative) return 1;
    return 0;
  });

  const finalResults = ranked.slice(0, maxResults);
  console.log(`[WebSearch] Returning ${finalResults.length} results (${finalResults.filter(r => r.authoritative).length} authoritative)`);

  return finalResults;
}

/**
 * Enhances health-related queries for better search results.
 * Adds context keywords to improve relevance for medical/health searches.
 */
function enhanceHealthQuery(query: string): string {
  const lower = query.toLowerCase();

  // Don't modify if query already has specific qualifiers
  if (lower.includes('site:') || lower.includes('filetype:')) {
    return query;
  }

  // Add "elderly" or "older adults" context for dementia/cognitive queries
  if (
    (lower.includes('dementia') || lower.includes('alzheimer') || lower.includes('cognitive')) &&
    !lower.includes('elderly') && !lower.includes('older adult') && !lower.includes('senior')
  ) {
    return `${query} elderly care`;
  }

  // For very short or vague queries, add health context
  if (query.split(/\s+/).length <= 3 && !lower.includes('health') && !lower.includes('medical')) {
    // Check if it's likely a health query
    const healthTerms = ['symptom', 'treatment', 'cause', 'prevention', 'vitamin', 'deficiency', 'disease', 'condition', 'guideline'];
    if (healthTerms.some(t => lower.includes(t))) {
      return `${query} health information`;
    }
  }

  return query;
}

// ─── Exports ───────────────────────────────────────────────────────────────────

export const webSearchService = {
  searchWeb,
};

export default webSearchService;
