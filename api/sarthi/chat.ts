import type { IncomingMessage, ServerResponse } from 'http';
import { generateSarthiGeminiResponse, type StructuredSarthiContext } from '../../server/geminiService';
import { searchWeb, type WebSearchResult } from '../../server/services/webSearch';

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  let parsed: StructuredSarthiContext;
  try {
    if (req.body && typeof req.body === 'object') {
      parsed = req.body as StructuredSarthiContext;
    } else if (typeof req.body === 'string') {
      parsed = JSON.parse(req.body);
    } else {
      const raw = await new Promise<string>((resolve, reject) => {
        let data = '';
        req.on('data', chunk => {
          data += chunk;
          if (data.length > 512 * 1024) {
            req.destroy();
            reject(new Error('Payload too large'));
          }
        });
        req.on('end', () => resolve(data));
        req.on('error', reject);
      });
      parsed = JSON.parse(raw || '{}');
    }
  } catch (err: any) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, fallback: true, error: err?.message || 'Invalid request payload' }));
    return;
  }

  res.setHeader('Content-Type', 'application/json');

  try {
    let searchResults: WebSearchResult[] = [];
    if (parsed.shouldSearchWeb && parsed.userMessage) {
      try {
        searchResults = await searchWeb(parsed.userMessage, { maxResults: 5 });
      } catch (searchErr: any) {
        console.warn(`[Sarthi API] Web search error: ${searchErr.message}`);
      }
    }

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Sarthi Gemini API timeout (20s)')), 20000)
    );

    const geminiResult = await Promise.race([
      generateSarthiGeminiResponse(parsed, searchResults),
      timeoutPromise,
    ]);

    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      data: geminiResult,
    }));
  } catch (err: any) {
    res.statusCode = 200;
    res.end(JSON.stringify({
      success: false,
      fallback: true,
      error: err?.message || 'Gemini unavailable, local engine active',
    }));
  }
}
