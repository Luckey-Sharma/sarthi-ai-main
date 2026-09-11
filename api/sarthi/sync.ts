import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  let payload: any;
  try {
    if (req.body && typeof req.body === 'object') {
      payload = req.body;
    } else if (typeof req.body === 'string') {
      payload = JSON.parse(req.body);
    } else {
      const raw = await new Promise<string>((resolve, reject) => {
        let data = '';
        req.on('data', chunk => {
          data += chunk;
          if (data.length > 1024 * 1024) {
            req.destroy();
            reject(new Error('Payload too large'));
          }
        });
        req.on('end', () => resolve(data));
        req.on('error', reject);
      });
      payload = JSON.parse(raw || '{}');
    }
  } catch (err: any) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: err?.message || 'Invalid sync payload' }));
    return;
  }

  const items = Array.isArray(payload?.items) ? payload.items : [];
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    success: true,
    syncedCount: items.length,
    timestamp: new Date().toISOString(),
    status: 'Synced',
  }));
}
