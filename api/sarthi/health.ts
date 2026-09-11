import type { IncomingMessage, ServerResponse } from 'http';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const key = process.env.GEMINI_API_KEY?.trim();
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({
    status: 'ok',
    hasGeminiKey: !!key && !key.includes('your_gemini_api_key_here'),
    offlineFallbackReady: true,
    timestamp: new Date().toISOString(),
  }));
}
