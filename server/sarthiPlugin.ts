import type { Plugin, ViteDevServer, PreviewServer } from 'vite';
import { IncomingMessage, ServerResponse } from 'http';
import { generateSarthiGeminiResponse, StructuredSarthiContext } from './geminiService';
import { searchWeb, WebSearchResult } from './services/webSearch';
import fs from 'fs';

function loadEnvKey(): string | undefined {
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY.trim();
  }
  try {
    if (fs.existsSync('.env')) {
      const lines = fs.readFileSync('.env', 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('GEMINI_API_KEY=')) {
          const val = trimmed.substring('GEMINI_API_KEY='.length).trim();
          if (val && !val.includes('your_gemini_api_key_here')) {
            process.env.GEMINI_API_KEY = val;
            return val;
          }
        }
      }
    }
  } catch {
    // Ignore
  }
  return undefined;
}

export function sarthiServerPlugin(): Plugin {
  return {
    name: 'vite-plugin-sarthi-server',
    configureServer(server: ViteDevServer) {
      registerSarthiMiddleware(server.middlewares);
    },
    configurePreviewServer(server: PreviewServer) {
      registerSarthiMiddleware(server.middlewares);
    },
  };
}

function registerSarthiMiddleware(middlewares: any) {
  loadEnvKey();

  middlewares.use('/api/sarthi/health', (_req: IncomingMessage, res: ServerResponse) => {
    const key = loadEnvKey();
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({
      status: 'ok',
      hasGeminiKey: !!key,
      offlineFallbackReady: true,
      timestamp: new Date().toISOString(),
    }));
  });

  middlewares.use('/api/sarthi/chat', async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    // Accumulate body
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      // Guard against oversized payload (max 512KB)
      if (body.length > 512 * 1024) {
        res.statusCode = 413;
        res.end(JSON.stringify({ error: 'Payload too large' }));
        req.destroy();
      }
    });

    req.on('end', async () => {
      res.setHeader('Content-Type', 'application/json');

      try {
        const parsed = JSON.parse(body || '{}') as StructuredSarthiContext;

        let searchResults: WebSearchResult[] = [];
        if (parsed.shouldSearchWeb && parsed.userMessage) {
          console.log(`[Sarthi Plugin] Performing web search for: "${parsed.userMessage}"`);
          try {
            searchResults = await searchWeb(parsed.userMessage, { maxResults: 5 });
            console.log(`[Sarthi Plugin] Retrieved ${searchResults.length} web search results`);
          } catch (searchErr: any) {
            console.warn(`[Sarthi Plugin] Web search error: ${searchErr.message}. Continuing with internal knowledge.`);
          }
        }

        // 12-second total timeout promise
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Sarthi Gemini API timeout (12s)')), 12000)
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
        // Safe offline / error response allowing client to fallback to deterministic engine
        res.statusCode = 200;
        res.end(JSON.stringify({
          success: false,
          fallback: true,
          error: err?.message || 'Gemini unavailable, local engine active',
        }));
      }
    });
  });

  middlewares.use('/api/sarthi/sync', async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        res.statusCode = 413;
        res.end(JSON.stringify({ error: 'Sync payload too large' }));
        req.destroy();
      }
    });

    req.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      try {
        const payload = JSON.parse(body || '{}');
        const items = Array.isArray(payload.items) ? payload.items : [];
        console.log(`[Sarthi Sync] Received ${items.length} offline queued items at ${new Date().toISOString()}`);

        res.statusCode = 200;
        res.end(JSON.stringify({
          success: true,
          syncedCount: items.length,
          timestamp: new Date().toISOString(),
          status: 'Synced',
        }));
      } catch (err: any) {
        res.statusCode = 400;
        res.end(JSON.stringify({
          success: false,
          error: err?.message || 'Invalid sync payload',
        }));
      }
    });
  });
}

export default sarthiServerPlugin;
